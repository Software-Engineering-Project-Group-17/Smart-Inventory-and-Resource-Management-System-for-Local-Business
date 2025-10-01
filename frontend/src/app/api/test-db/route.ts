import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET() {
  try {
    // Check if DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: false,
        error: 'DATABASE_URL environment variable is not set'
      }, { status: 500 });
    }

    const sql = neon(process.env.DATABASE_URL);
    
    // Test basic database connection
    const result = await sql`SELECT 1 as test`;
    
    if (result.length > 0) {
      // Test if tables exist
      const tableCheck = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('users', 'staff', 'branches')
        ORDER BY table_name
      `;

      return NextResponse.json({
        success: true,
        message: 'Database connection successful',
        tables: tableCheck.map(row => row.table_name),
        hasRequiredTables: {
          users: tableCheck.some(row => row.table_name === 'users'),
          staff: tableCheck.some(row => row.table_name === 'staff'),
          branches: tableCheck.some(row => row.table_name === 'branches')
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Database query failed'
      }, { status: 500 });
    }
    
  } catch (error) {
    const errorObj = error as any;
    console.error('Database test error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      details: errorObj?.message,
      stack: process.env.NODE_ENV === 'development' ? errorObj?.stack : undefined
    }, { status: 500 });
  }
}