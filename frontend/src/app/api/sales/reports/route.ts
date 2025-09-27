import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// Database connection using Neon
const sql = neon(process.env.DATABASE_URL!);

// GET - Get sales reports and analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get("userEmail");
    const reportType = searchParams.get("type") || "today"; // today, week, month, custom
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }

    // Get user's branch_id from staff table
    const staffResult = await sql`
      SELECT s.branch_id 
      FROM staff s 
      WHERE s.email = ${userEmail} AND s.is_active = true
    `;

    if (staffResult.length === 0) {
      return NextResponse.json(
        { error: "Staff record not found for this user" },
        { status: 404 }
      );
    }

    const { branch_id } = staffResult[0];

    // Get sales summary based on report type
    let salesSummary;
    let topItems;
    let recentOrders;
    let salesByCategory;

    switch (reportType) {
      case "today":
        salesSummary = await sql`
          SELECT 
            COUNT(co.id) as total_orders,
            COALESCE(SUM(co.total_amount), 0) as total_revenue,
            COALESCE(AVG(co.total_amount), 0) as average_order_value,
            COUNT(DISTINCT co.customer_id) as unique_customers
          FROM customer_order co
          WHERE co.branch_id = ${branch_id} 
            AND co.payment_status = 'paid'
            AND DATE(co.order_date) = CURRENT_DATE
        `;

        topItems = await sql`
          SELECT 
            ii.inventory_name as name,
            SUM(oi.quantity) as total_sold,
            SUM(oi.total_price) as total_revenue,
            AVG(oi.unit_price) as average_price
          FROM order_item oi
          JOIN inventory_item ii ON oi.inventory_id = ii.inventory_id
          JOIN customer_order co ON oi.order_id = co.id
          WHERE co.branch_id = ${branch_id} 
            AND co.payment_status = 'paid'
            AND DATE(co.order_date) = CURRENT_DATE
          GROUP BY ii.inventory_id, ii.inventory_name
          ORDER BY total_sold DESC
          LIMIT 10
        `;

        recentOrders = await sql`
          SELECT 
            co.id,
            co.total_amount,
            co.order_date,
            c.name as customer_name,
            c.phone as customer_phone,
            s.first_name || ' ' || s.last_name as staff_name
          FROM customer_order co
          LEFT JOIN customer c ON co.customer_id = c.id
          LEFT JOIN staff s ON co.staff_id = s.id
          WHERE co.branch_id = ${branch_id} 
            AND co.payment_status = 'paid'
            AND DATE(co.order_date) = CURRENT_DATE
          ORDER BY co.order_date DESC
          LIMIT 20
        `;

        salesByCategory = await sql`
          SELECT 
            cat.category_name as category,
            COUNT(oi.id) as items_sold,
            SUM(oi.total_price) as total_revenue
          FROM order_item oi
          JOIN inventory_item ii ON oi.inventory_id = ii.inventory_id
          JOIN category cat ON ii.category_id = cat.id
          JOIN customer_order co ON oi.order_id = co.id
          WHERE co.branch_id = ${branch_id} 
            AND co.payment_status = 'paid'
            AND DATE(co.order_date) = CURRENT_DATE
          GROUP BY cat.id, cat.category_name
          ORDER BY total_revenue DESC
        `;
        break;

      case "week":
        salesSummary = await sql`
          SELECT 
            COUNT(co.id) as total_orders,
            COALESCE(SUM(co.total_amount), 0) as total_revenue,
            COALESCE(AVG(co.total_amount), 0) as average_order_value,
            COUNT(DISTINCT co.customer_id) as unique_customers
          FROM customer_order co
          WHERE co.branch_id = ${branch_id} 
            AND co.payment_status = 'paid'
            AND co.order_date >= CURRENT_DATE - INTERVAL '7 days'
        `;

        topItems = await sql`
          SELECT 
            ii.inventory_name as name,
            SUM(oi.quantity) as total_sold,
            SUM(oi.total_price) as total_revenue,
            AVG(oi.unit_price) as average_price
          FROM order_item oi
          JOIN inventory_item ii ON oi.inventory_id = ii.inventory_id
          JOIN customer_order co ON oi.order_id = co.id
          WHERE co.branch_id = ${branch_id} 
            AND co.payment_status = 'paid'
            AND co.order_date >= CURRENT_DATE - INTERVAL '7 days'
          GROUP BY ii.inventory_id, ii.inventory_name
          ORDER BY total_sold DESC
          LIMIT 10
        `;

        recentOrders = await sql`
          SELECT 
            co.id,
            co.total_amount,
            co.order_date,
            c.name as customer_name,
            c.phone as customer_phone,
            s.first_name || ' ' || s.last_name as staff_name
          FROM customer_order co
          LEFT JOIN customer c ON co.customer_id = c.id
          LEFT JOIN staff s ON co.staff_id = s.id
          WHERE co.branch_id = ${branch_id} 
            AND co.payment_status = 'paid'
            AND co.order_date >= CURRENT_DATE - INTERVAL '7 days'
          ORDER BY co.order_date DESC
          LIMIT 20
        `;

        salesByCategory = await sql`
          SELECT 
            cat.category_name as category,
            COUNT(oi.id) as items_sold,
            SUM(oi.total_price) as total_revenue
          FROM order_item oi
          JOIN inventory_item ii ON oi.inventory_id = ii.inventory_id
          JOIN category cat ON ii.category_id = cat.id
          JOIN customer_order co ON oi.order_id = co.id
          WHERE co.branch_id = ${branch_id} 
            AND co.payment_status = 'paid'
            AND co.order_date >= CURRENT_DATE - INTERVAL '7 days'
          GROUP BY cat.id, cat.category_name
          ORDER BY total_revenue DESC
        `;
        break;

      case "month":
        salesSummary = await sql`
          SELECT 
            COUNT(co.id) as total_orders,
            COALESCE(SUM(co.total_amount), 0) as total_revenue,
            COALESCE(AVG(co.total_amount), 0) as average_order_value,
            COUNT(DISTINCT co.customer_id) as unique_customers
          FROM customer_order co
          WHERE co.branch_id = ${branch_id} 
            AND co.payment_status = 'paid'
            AND co.order_date >= CURRENT_DATE - INTERVAL '30 days'
        `;

        topItems = await sql`
          SELECT 
            ii.inventory_name as name,
            SUM(oi.quantity) as total_sold,
            SUM(oi.total_price) as total_revenue,
            AVG(oi.unit_price) as average_price
          FROM order_item oi
          JOIN inventory_item ii ON oi.inventory_id = ii.inventory_id
          JOIN customer_order co ON oi.order_id = co.id
          WHERE co.branch_id = ${branch_id} 
            AND co.payment_status = 'paid'
            AND co.order_date >= CURRENT_DATE - INTERVAL '30 days'
          GROUP BY ii.inventory_id, ii.inventory_name
          ORDER BY total_sold DESC
          LIMIT 10
        `;

        recentOrders = await sql`
          SELECT 
            co.id,
            co.total_amount,
            co.order_date,
            c.name as customer_name,
            c.phone as customer_phone,
            s.first_name || ' ' || s.last_name as staff_name
          FROM customer_order co
          LEFT JOIN customer c ON co.customer_id = c.id
          LEFT JOIN staff s ON co.staff_id = s.id
          WHERE co.branch_id = ${branch_id} 
            AND co.payment_status = 'paid'
            AND co.order_date >= CURRENT_DATE - INTERVAL '30 days'
          ORDER BY co.order_date DESC
          LIMIT 20
        `;

        salesByCategory = await sql`
          SELECT 
            cat.category_name as category,
            COUNT(oi.id) as items_sold,
            SUM(oi.total_price) as total_revenue
          FROM order_item oi
          JOIN inventory_item ii ON oi.inventory_id = ii.inventory_id
          JOIN category cat ON ii.category_id = cat.id
          JOIN customer_order co ON oi.order_id = co.id
          WHERE co.branch_id = ${branch_id} 
            AND co.payment_status = 'paid'
            AND co.order_date >= CURRENT_DATE - INTERVAL '30 days'
          GROUP BY cat.id, cat.category_name
          ORDER BY total_revenue DESC
        `;
        break;

      case "custom":
        if (!startDate || !endDate) {
          return NextResponse.json(
            { error: "Start date and end date are required for custom reports" },
            { status: 400 }
          );
        }

        salesSummary = await sql`
          SELECT 
            COUNT(co.id) as total_orders,
            COALESCE(SUM(co.total_amount), 0) as total_revenue,
            COALESCE(AVG(co.total_amount), 0) as average_order_value,
            COUNT(DISTINCT co.customer_id) as unique_customers
          FROM customer_order co
          WHERE co.branch_id = ${branch_id} 
            AND co.payment_status = 'paid'
            AND DATE(co.order_date) BETWEEN ${startDate} AND ${endDate}
        `;

        topItems = await sql`
          SELECT 
            ii.inventory_name as name,
            SUM(oi.quantity) as total_sold,
            SUM(oi.total_price) as total_revenue,
            AVG(oi.unit_price) as average_price
          FROM order_item oi
          JOIN inventory_item ii ON oi.inventory_id = ii.inventory_id
          JOIN customer_order co ON oi.order_id = co.id
          WHERE co.branch_id = ${branch_id} 
            AND co.payment_status = 'paid'
            AND DATE(co.order_date) BETWEEN ${startDate} AND ${endDate}
          GROUP BY ii.inventory_id, ii.inventory_name
          ORDER BY total_sold DESC
          LIMIT 10
        `;

        recentOrders = await sql`
          SELECT 
            co.id,
            co.total_amount,
            co.order_date,
            c.name as customer_name,
            c.phone as customer_phone,
            s.first_name || ' ' || s.last_name as staff_name
          FROM customer_order co
          LEFT JOIN customer c ON co.customer_id = c.id
          LEFT JOIN staff s ON co.staff_id = s.id
          WHERE co.branch_id = ${branch_id} 
            AND co.payment_status = 'paid'
            AND DATE(co.order_date) BETWEEN ${startDate} AND ${endDate}
          ORDER BY co.order_date DESC
          LIMIT 20
        `;

        salesByCategory = await sql`
          SELECT 
            cat.category_name as category,
            COUNT(oi.id) as items_sold,
            SUM(oi.total_price) as total_revenue
          FROM order_item oi
          JOIN inventory_item ii ON oi.inventory_id = ii.inventory_id
          JOIN category cat ON ii.category_id = cat.id
          JOIN customer_order co ON oi.order_id = co.id
          WHERE co.branch_id = ${branch_id} 
            AND co.payment_status = 'paid'
            AND DATE(co.order_date) BETWEEN ${startDate} AND ${endDate}
          GROUP BY cat.id, cat.category_name
          ORDER BY total_revenue DESC
        `;
        break;

      default:
        return NextResponse.json(
          { error: "Invalid report type" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalOrders: parseInt(salesSummary[0]?.total_orders) || 0,
          totalRevenue: parseFloat(salesSummary[0]?.total_revenue) || 0,
          averageOrderValue: parseFloat(salesSummary[0]?.average_order_value) || 0,
          uniqueCustomers: parseInt(salesSummary[0]?.unique_customers) || 0
        },
        topItems: topItems.map(item => ({
          name: item.name,
          totalSold: parseInt(item.total_sold),
          totalRevenue: parseFloat(item.total_revenue),
          averagePrice: parseFloat(item.average_price)
        })),
        recentOrders: recentOrders.map(order => ({
          id: order.id,
          totalAmount: parseFloat(order.total_amount),
          orderDate: order.order_date,
          customerName: order.customer_name || "Walk-in Customer",
          customerPhone: order.customer_phone,
          staffName: order.staff_name
        })),
        salesByCategory: salesByCategory.map(cat => ({
          category: cat.category,
          itemsSold: parseInt(cat.items_sold),
          totalRevenue: parseFloat(cat.total_revenue)
        }))
      }
    });

  } catch (error) {
    console.error("Error fetching sales report:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales report" },
      { status: 500 }
    );
  }
}
