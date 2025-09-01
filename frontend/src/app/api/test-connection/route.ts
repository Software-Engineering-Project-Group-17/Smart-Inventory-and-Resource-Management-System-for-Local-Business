import { NextResponse } from "next/server";
import { testConnection } from "@/lib/database/connection";

export async function GET() {
  const result = await testConnection();

  if (result.success) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json(result, { status: 500 });
  }
}
