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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const limit = searchParams.get("limit");

    const client = await pool.connect();

    let query = `
      SELECT 
        ii.inventory_id,
        ii.inventory_name,
        ii.unit_price,
        ii.image_url,
        ii.quantity,
        c.category_name
      FROM inventory_item ii
      LEFT JOIN category c ON ii.category_id = c.id
      WHERE 1=1
    `;

    const queryParams: any[] = [];
    let paramIndex = 1;

    // Add category filter if provided
    if (categoryId && categoryId !== "all") {
      query += ` AND ii.category_id = $${paramIndex}`;
      queryParams.push(parseInt(categoryId));
      paramIndex++;
    }

    // Add order and limit
    query += ` ORDER BY ii.inventory_id DESC`;

    if (limit) {
      query += ` LIMIT $${paramIndex}`;
      queryParams.push(parseInt(limit));
    }

    const result = await client.query(query, queryParams);
    client.release();

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
