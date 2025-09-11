import { NextRequest, NextResponse } from "next/server";
import AWS from "aws-sdk";
import { neon } from "@neondatabase/serverless";
import { NotificationService } from "@/lib/notification-service";

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "us-east-1",
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET;

// Database connection using Neon
const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get("userEmail");

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }

    // Get user's branch_id from staff table
    const staffResult = await sql`
      SELECT s.branch_id, b.name as branch_name 
      FROM staff s 
      LEFT JOIN branches b ON s.branch_id = b.id
      WHERE s.email = ${userEmail} AND s.is_active = true
    `;

    if (staffResult.length === 0) {
      return NextResponse.json(
        { error: "Staff record not found for this user" },
        { status: 404 }
      );
    }

    const { branch_id } = staffResult[0];

    // Get inventory items for this branch
    const result = await sql`
      SELECT 
        ii.inventory_id,
        ii.inventory_name,
        ii.quantity,
        ii.category_id,
        ii.low_stock_threshold,
        ii.unit_price,
        ii.branch_id,
        ii.image_url,
        c.category_name
      FROM inventory_item ii
      LEFT JOIN category c ON ii.category_id = c.id
      WHERE ii.branch_id = ${branch_id}
      ORDER BY ii.inventory_name ASC
    `;

    return NextResponse.json({
      success: true,
      inventory: result,
      branch_id: branch_id,
    });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const inventoryName = formData.get("inventoryName") as string;
    const barcode = formData.get("barcode") as string;
    const quantity = parseInt(formData.get("quantity") as string);
    const categoryId = parseInt(formData.get("categoryId") as string);
    const lowStockThreshold = parseInt(
      formData.get("lowStockThreshold") as string
    );
    const unitPrice = parseFloat(formData.get("unitPrice") as string);
    const userEmail = formData.get("userEmail") as string;
    const imageFile = formData.get("image") as File | null;

    // Validate required fields
    if (
      !inventoryName ||
      !barcode ||
      !userEmail ||
      isNaN(quantity) ||
      isNaN(categoryId) ||
      isNaN(unitPrice)
    ) {
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    if (quantity < 0 || unitPrice < 0 || lowStockThreshold < 0) {
      return NextResponse.json(
        {
          error:
            "Quantity, unit price, and low stock threshold must be non-negative",
        },
        { status: 400 }
      );
    }

    // Get user's branch_id from staff table
    const staffResult = await sql`
      SELECT branch_id 
      FROM staff 
      WHERE email = ${userEmail} AND is_active = true
    `;

    if (staffResult.length === 0) {
      return NextResponse.json(
        { error: "Staff record not found for this user" },
        { status: 404 }
      );
    }

    const branchId = staffResult[0].branch_id;

    if (!branchId) {
      return NextResponse.json(
        { error: "User is not assigned to any branch" },
        { status: 400 }
      );
    }

    // Check if inventory item with same name already exists in this branch
    const existingItem = await sql`
      SELECT inventory_id 
      FROM inventory_item 
      WHERE LOWER(inventory_name) = LOWER(${inventoryName.trim()}) 
      AND branch_id = ${branchId}
    `;
    const existingBarcode = await sql`
      SELECT inventory_id 
      FROM inventory_item 
      WHERE LOWER(barcode) = LOWER(${barcode.trim()}) 
      
    `;

    if (existingItem.length > 0) {
      return NextResponse.json(
        {
          error:
            "An inventory item with this name already exists in your branch",
        },
        { status: 409 }
      );
    }
    if (existingBarcode.length > 0) {
      return NextResponse.json(
        {
          error:
            "An inventory item with this barcode already exists in your branch",
        },
        { status: 409 }
      );
    }

    // Verify category exists
    const categoryResult = await sql`
      SELECT id FROM category WHERE id = ${categoryId}
    `;

    if (categoryResult.length === 0) {
      return NextResponse.json(
        { error: "Selected category does not exist" },
        { status: 400 }
      );
    }

    let imageUrl = null;

    // Upload image to S3 if provided
    if (imageFile && imageFile.size > 0) {
      try {
        // Validate file type
        const allowedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
        if (!allowedTypes.includes(imageFile.type)) {
          return NextResponse.json(
            {
              error:
                "Invalid file type. Please upload an image file (JPEG, PNG, GIF, WebP)",
            },
            { status: 400 }
          );
        }

        // Validate file size (5MB limit)
        if (imageFile.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            {
              error:
                "File size too large. Please upload an image smaller than 5MB",
            },
            { status: 400 }
          );
        }

        const buffer = await imageFile.arrayBuffer();
        const fileExtension = imageFile.name.split(".").pop();
        const fileName = `inventory/${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${fileExtension}`;

        const uploadParams = {
          Bucket: BUCKET_NAME!,
          Key: fileName,
          Body: Buffer.from(buffer),
          ContentType: imageFile.type,
          ACL: "public-read",
        };

        const uploadResult = await s3.upload(uploadParams).promise();
        imageUrl = uploadResult.Location;

        console.log("Image uploaded successfully:", imageUrl);
      } catch (uploadError) {
        console.error("Error uploading image to S3:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload image. Please try again." },
          { status: 500 }
        );
      }
    }

    // Insert inventory item into database
    const insertResult = await sql`
      INSERT INTO inventory_item (
        inventory_name, 
        barcode,
        quantity, 
        category_id, 
        low_stock_threshold, 
        unit_price, 
        branch_id, 
        image_url
      ) 
      VALUES (
        ${inventoryName.trim()}, 
        ${barcode.trim()},
        ${quantity}, 
        ${categoryId}, 
        ${lowStockThreshold || 0}, 
        ${unitPrice}, 
        ${branchId}, 
        ${imageUrl}
      ) 
      RETURNING inventory_id, inventory_name, barcode, quantity, category_id, low_stock_threshold, unit_price, branch_id, image_url
    `;

    const newItem = insertResult[0];

    // Check for low stock notification on newly created item
    try {
      await NotificationService.checkAndCreateLowStockNotification(
        newItem.inventory_id
      );
    } catch (notificationError) {
      // Don't fail the creation if notifications fail
      console.error(
        "Error creating low stock notification:",
        notificationError
      );
    }

    // Get category name for response
    const categoryInfo = await sql`
      SELECT category_name FROM category WHERE id = ${categoryId}
    `;

    return NextResponse.json({
      success: true,
      message: "Inventory item created successfully",
      item: {
        ...newItem,
        category_name: categoryInfo[0]?.category_name || "Unknown",
      },
    });
  } catch (error) {
    console.error("Error creating inventory item:", error);
    return NextResponse.json(
      { error: "Failed to create inventory item. Please try again." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const inventoryId = formData.get("inventoryId") as string;
    const inventoryName = formData.get("inventoryName") as string;
    const barcode = formData.get("barcode") as string;
    const quantity = parseInt(formData.get("quantity") as string);
    const categoryId = parseInt(formData.get("categoryId") as string);
    const lowStockThreshold = parseInt(
      formData.get("lowStockThreshold") as string
    );
    const unitPrice = parseFloat(formData.get("unitPrice") as string);
    const userEmail = formData.get("userEmail") as string;
    const imageFile = formData.get("image") as File | null;
    const removeImage = formData.get("removeImage") === "true";

    if (
      !inventoryId ||
      !barcode ||
      !inventoryName ||
      !userEmail ||
      isNaN(quantity) ||
      isNaN(categoryId) ||
      isNaN(unitPrice)
    ) {
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    if (quantity < 0 || unitPrice < 0 || lowStockThreshold < 0) {
      return NextResponse.json(
        {
          error:
            "Quantity, unit price, and low stock threshold must be non-negative",
        },
        { status: 400 }
      );
    }

    // Get user's branch_id and verify ownership
    const staffResult = await sql`
      SELECT branch_id 
      FROM staff 
      WHERE email = ${userEmail} AND is_active = true
    `;

    if (staffResult.length === 0) {
      return NextResponse.json(
        { error: "Staff record not found for this user" },
        { status: 404 }
      );
    }

    const branchId = staffResult[0].branch_id;

    // Check if inventory item exists and belongs to user's branch
    const existingItem = await sql`
      SELECT inventory_id, image_url, branch_id 
      FROM inventory_item 
      WHERE inventory_id = ${inventoryId}
    `;

    if (existingItem.length === 0) {
      return NextResponse.json(
        { error: "Inventory item not found" },
        { status: 404 }
      );
    }

    if (existingItem[0].branch_id !== branchId) {
      return NextResponse.json(
        { error: "You can only update inventory items in your branch" },
        { status: 403 }
      );
    }

    // Check if new name conflicts with existing items (excluding current item)
    const nameConflict = await sql`
      SELECT inventory_id 
      FROM inventory_item 
      WHERE LOWER(inventory_name) = LOWER(${inventoryName.trim()}) 
      AND branch_id = ${branchId} 
      AND inventory_id != ${inventoryId}
    `;
    const barcodeConflict = await sql`
      SELECT inventory_id 
      FROM inventory_item 
      WHERE LOWER(barcode) = LOWER(${barcode.trim()}) 
      
    `;

    if (nameConflict.length > 0) {
      return NextResponse.json(
        {
          error:
            "An inventory item with this name already exists in your branch",
        },
        { status: 409 }
      );
    }
    if (barcodeConflict.length > 0) {
      return NextResponse.json(
        {
          error:
            "An inventory item with this barcode already exists in your branch",
        },
        { status: 409 }
      );
    }

    let imageUrl = existingItem[0].image_url;

    // Handle image removal
    if (removeImage && imageUrl) {
      try {
        const urlParts = imageUrl.split("/");
        const key = urlParts.slice(-2).join("/"); // Get "inventory/filename"

        await s3
          .deleteObject({
            Bucket: BUCKET_NAME!,
            Key: key,
          })
          .promise();

        imageUrl = null;
      } catch (deleteError) {
        console.error("Error deleting old image from S3:", deleteError);
      }
    }

    // Handle new image upload
    if (imageFile && imageFile.size > 0) {
      try {
        // Validate file type
        const allowedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
        if (!allowedTypes.includes(imageFile.type)) {
          return NextResponse.json(
            {
              error:
                "Invalid file type. Please upload an image file (JPEG, PNG, GIF, WebP)",
            },
            { status: 400 }
          );
        }

        // Validate file size (5MB limit)
        if (imageFile.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            {
              error:
                "File size too large. Please upload an image smaller than 5MB",
            },
            { status: 400 }
          );
        }

        // Delete old image if exists
        if (imageUrl) {
          try {
            const urlParts = imageUrl.split("/");
            const key = urlParts.slice(-2).join("/");

            await s3
              .deleteObject({
                Bucket: BUCKET_NAME!,
                Key: key,
              })
              .promise();
          } catch (deleteError) {
            console.error("Error deleting old image from S3:", deleteError);
          }
        }

        // Upload new image
        const buffer = await imageFile.arrayBuffer();
        const fileExtension = imageFile.name.split(".").pop();
        const fileName = `inventory/${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${fileExtension}`;

        const uploadParams = {
          Bucket: BUCKET_NAME!,
          Key: fileName,
          Body: Buffer.from(buffer),
          ContentType: imageFile.type,
          ACL: "public-read",
        };

        const uploadResult = await s3.upload(uploadParams).promise();
        imageUrl = uploadResult.Location;

        console.log("New image uploaded successfully:", imageUrl);
      } catch (uploadError) {
        console.error("Error uploading new image to S3:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload new image. Please try again." },
          { status: 500 }
        );
      }
    }

    // Get current quantity before update (for restock completion detection)
    const currentItem = await sql`
      SELECT quantity, inventory_name 
      FROM inventory_item 
      WHERE inventory_id = ${inventoryId}
    `;

    const previousQuantity = currentItem[0]?.quantity || 0;
    const wasRestocked = quantity > previousQuantity;

    // Update inventory item in database
    const updateResult = await sql`
      UPDATE inventory_item 
      SET 
        inventory_name = ${inventoryName.trim()}, 
        barcode = ${barcode.trim()},
        quantity = ${quantity}, 
        category_id = ${categoryId}, 
        low_stock_threshold = ${lowStockThreshold || 0}, 
        unit_price = ${unitPrice}, 
        image_url = ${imageUrl}
      WHERE inventory_id = ${inventoryId} 
      RETURNING inventory_id, inventory_name, quantity, category_id, low_stock_threshold, unit_price, branch_id, image_url
    `;

    const updatedItem = updateResult[0];

    // Handle notifications
    try {
      // Check for low stock notification (always check after update)
      await NotificationService.checkAndCreateLowStockNotification(inventoryId);

      // Create restock completion notification if quantity increased significantly
      if (wasRestocked && quantity - previousQuantity >= 5) {
        await NotificationService.createRestockCompletionNotification(
          inventoryId,
          previousQuantity,
          quantity
        );
      }
    } catch (notificationError) {
      // Don't fail the update if notifications fail
      console.error("Error creating notifications:", notificationError);
    }

    // Get category name for response
    const categoryInfo = await sql`
      SELECT category_name FROM category WHERE id = ${categoryId}
    `;

    return NextResponse.json({
      success: true,
      message: "Inventory item updated successfully",
      item: {
        ...updatedItem,
        category_name: categoryInfo[0]?.category_name || "Unknown",
      },
    });
  } catch (error) {
    console.error("Error updating inventory item:", error);
    return NextResponse.json(
      { error: "Failed to update inventory item. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const inventoryId = searchParams.get("id");
    const userEmail = searchParams.get("userEmail");

    if (!inventoryId || !userEmail) {
      return NextResponse.json(
        { error: "Inventory ID and user email are required" },
        { status: 400 }
      );
    }

    // Get user's branch_id
    const staffResult = await sql`
      SELECT branch_id 
      FROM staff 
      WHERE email = ${userEmail} AND is_active = true
    `;

    if (staffResult.length === 0) {
      return NextResponse.json(
        { error: "Staff record not found for this user" },
        { status: 404 }
      );
    }

    const branchId = staffResult[0].branch_id;

    // Check if inventory item exists and belongs to user's branch
    const existingItem = await sql`
      SELECT inventory_id, image_url, branch_id 
      FROM inventory_item 
      WHERE inventory_id = ${inventoryId}
    `;

    if (existingItem.length === 0) {
      return NextResponse.json(
        { error: "Inventory item not found" },
        { status: 404 }
      );
    }

    if (existingItem[0].branch_id !== branchId) {
      return NextResponse.json(
        { error: "You can only delete inventory items in your branch" },
        { status: 403 }
      );
    }

    const imageUrl = existingItem[0].image_url;

    // Delete image from S3 if exists
    if (imageUrl) {
      try {
        const urlParts = imageUrl.split("/");
        const key = urlParts.slice(-2).join("/");

        await s3
          .deleteObject({
            Bucket: BUCKET_NAME!,
            Key: key,
          })
          .promise();

        console.log("Image deleted from S3:", key);
      } catch (deleteError) {
        console.error("Error deleting image from S3:", deleteError);
      }
    }

    // Delete inventory item from database
    await sql`DELETE FROM inventory_item WHERE inventory_id = ${inventoryId}`;

    return NextResponse.json({
      success: true,
      message: "Inventory item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    return NextResponse.json(
      { error: "Failed to delete inventory item. Please try again." },
      { status: 500 }
    );
  }
}
