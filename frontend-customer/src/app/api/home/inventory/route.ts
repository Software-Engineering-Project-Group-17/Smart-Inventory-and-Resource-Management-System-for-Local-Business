import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT inventory_id, inventory_name, quantity, category_id, low_stock_threshold, unit_price, branch_id, image_url 
       FROM inventory_item
       ORDER BY inventory_id DESC`
    );
    client.release();

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const inventory_name = formData.get("inventory_name") as string;
    const quantity = Number(formData.get("quantity"));
    const category_id = Number(formData.get("category_id"));
    const low_stock_threshold = Number(formData.get("low_stock_threshold"));
    const unit_price = Number(formData.get("unit_price"));
    const branch_id = Number(formData.get("branch_id"));
    const file = formData.get("image") as File | null;

    let image_url: string | null = null;

    if (file) {
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const fileKey = `inventory/${randomUUID()}-${file.name}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET!,
          Key: fileKey,
          Body: fileBuffer,
          ContentType: file.type,
        })
      );

      image_url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
    }

    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO inventory_item 
        (inventory_name, quantity, category_id, low_stock_threshold, unit_price, branch_id, image_url) 
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        inventory_name,
        quantity,
        category_id,
        low_stock_threshold,
        unit_price,
        branch_id,
        image_url,
      ]
    );
    client.release();

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to add inventory" },
      { status: 500 }
    );
  }
}
