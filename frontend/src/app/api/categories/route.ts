import { NextRequest, NextResponse } from "next/server";
import AWS from "aws-sdk";
import { neon } from "@neondatabase/serverless";
import { requireAuth, createAuthResponse } from "@/lib/requireAuth";

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
  // Require authentication - Allow OWNER, BRANCH_MANAGER, and STAFF to view categories
  const authResult = await requireAuth(request, [
    "OWNER",
    "BRANCH_MANAGER",
    "STAFF",
  ]);
  const authResponse = createAuthResponse(authResult);
  if (authResponse) return authResponse;

  try {
    const result = await sql`
      SELECT 
        id,
        category_name,
        category_img_url
      FROM category 
      ORDER BY category_name ASC
    `;

    return NextResponse.json({
      success: true,
      categories: result,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Require authentication - Only OWNER and BRANCH_MANAGER can create categories
  const authResult = await requireAuth(request, ["OWNER", "BRANCH_MANAGER"]);
  const authResponse = createAuthResponse(authResult);
  if (authResponse) return authResponse;

  try {
    const formData = await request.formData();
    const categoryName = formData.get("categoryName") as string;
    const imageFile = formData.get("image") as File | null;

    // Validate required fields
    if (!categoryName || categoryName.trim().length === 0) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    // Check if category name already exists
    const existingCategory = await sql`
      SELECT id FROM category WHERE LOWER(category_name) = LOWER(${categoryName.trim()})
    `;

    if (existingCategory.length > 0) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 409 }
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
        const fileName = `categories/${Date.now()}-${Math.random()
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

    // Insert category into database
    const insertResult = await sql`
      INSERT INTO category (category_name, category_img_url) 
      VALUES (${categoryName.trim()}, ${imageUrl}) 
      RETURNING id, category_name, category_img_url
    `;

    const newCategory = insertResult[0];

    return NextResponse.json({
      success: true,
      message: "Category created successfully",
      category: {
        id: newCategory.id,
        category_name: newCategory.category_name,
        category_img_url: newCategory.category_img_url,
      },
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category. Please try again." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const authResult = await requireAuth(request, ["OWNER", "BRANCH_MANAGER"]);
  const authResponse = createAuthResponse(authResult);
  if (authResponse) return authResponse;
  try {
    const formData = await request.formData();
    const categoryId = formData.get("categoryId") as string;
    const categoryName = formData.get("categoryName") as string;
    const imageFile = formData.get("image") as File | null;
    const removeImage = formData.get("removeImage") === "true";

    if (!categoryId || !categoryName || categoryName.trim().length === 0) {
      return NextResponse.json(
        { error: "Category ID and name are required" },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await sql`
      SELECT id, category_img_url FROM category WHERE id = ${categoryId}
    `;

    if (existingCategory.length === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if new name conflicts with existing categories (excluding current category)
    const nameConflict = await sql`
      SELECT id FROM category 
      WHERE LOWER(category_name) = LOWER(${categoryName.trim()}) 
      AND id != ${categoryId}
    `;

    if (nameConflict.length > 0) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 409 }
      );
    }

    let imageUrl = existingCategory[0].category_img_url;

    // Handle image removal
    if (removeImage && imageUrl) {
      try {
        // Extract key from S3 URL
        const urlParts = imageUrl.split("/");
        const key = urlParts.slice(-2).join("/"); // Get "categories/filename"

        await s3
          .deleteObject({
            Bucket: BUCKET_NAME!,
            Key: key,
          })
          .promise();

        imageUrl = null;
      } catch (deleteError) {
        console.error("Error deleting old image from S3:", deleteError);
        // Continue with update even if delete fails
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
        const fileName = `categories/${Date.now()}-${Math.random()
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

    // Update category in database
    const updateResult = await sql`
      UPDATE category 
      SET category_name = ${categoryName.trim()}, 
          category_img_url = ${imageUrl} 
      WHERE id = ${categoryId} 
      RETURNING id, category_name, category_img_url
    `;

    const updatedCategory = updateResult[0];

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const authResult = await requireAuth(request, ["OWNER", "BRANCH_MANAGER"]);
  const authResponse = createAuthResponse(authResult);
  if (authResponse) return authResponse;
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("id");

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    // Check if category exists and get image URL
    const existingCategory = await sql`
      SELECT id, category_img_url FROM category WHERE id = ${categoryId}
    `;

    if (existingCategory.length === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if category is being used by inventory items
    const inventoryCount = await sql`
      SELECT COUNT(*) as count FROM inventory_item WHERE category_id = ${categoryId}
    `;

    if (parseInt(inventoryCount[0].count) > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete category. It is being used by inventory items.",
        },
        { status: 409 }
      );
    }

    const imageUrl = existingCategory[0].category_img_url;

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
        // Continue with category deletion even if image delete fails
      }
    }

    // Delete category from database
    await sql`DELETE FROM category WHERE id = ${categoryId}`;

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category. Please try again." },
      { status: 500 }
    );
  }
}
