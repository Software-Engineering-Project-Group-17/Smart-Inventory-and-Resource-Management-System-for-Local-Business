import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/database/connection";
import { requireAuth } from "@/lib/requireAuth";
import { ROLES } from "@/lib/roles";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, [
      ROLES.OWNER,
      ROLES.BRANCH_MANAGER,
      ROLES.STAFF,
    ]);

    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        {
          success: false,
          error: authResult.error || "Authentication failed",
          code: "AUTH_FAILED",
        },
        { status: 401 }
      );
    }

    const user = authResult.user!;
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get("id");

    if (supplierId) {
      // Get specific supplier details with orders
      const supplierResult = await sql`
        SELECT 
          s.id,
          s.supplier_name,
          s.supplier_email,
          s.supplier_tel,
          s.address,
          s.created_at,
          u.name as user_name,
          u.email as user_email
        FROM supplier s
        LEFT JOIN app_user u ON s.user_id = u.user_id
        WHERE s.id = ${supplierId}
      `;

      if (supplierResult.length === 0) {
        return NextResponse.json(
          { success: false, error: "Supplier not found" },
          { status: 404 }
        );
      }

      const supplier = supplierResult[0];

      // Get supplier orders based on user role
      let ordersQuery;
      if (user.role === ROLES.OWNER) {
        // OWNER can see all orders for this supplier
        ordersQuery = sql`
          SELECT 
            so.id,
            so.order_status,
            so.payment_status,
            so.total_amount,
            so.created_at,
            so.estimated_delivery_date,
            so.actual_delivery_date,
            so.supplier_notes,
            so.paid_at,
            rr.id as request_id,
            rr.title as request_title,
            rr.priority,
            b.name as branch_name,
            b.location as branch_location,
            b.id as branch_id,
            COUNT(soi.id) as items_count
          FROM supplier_order so
          LEFT JOIN restock_request rr ON so.restock_request_id = rr.id
          LEFT JOIN branches b ON rr.branch_id = b.id
          LEFT JOIN supplier_order_item soi ON so.id = soi.supplier_order_id
          WHERE so.supplier_id = ${supplierId}
          GROUP BY so.id, so.order_status, so.payment_status, so.total_amount, 
                   so.created_at, so.estimated_delivery_date, so.actual_delivery_date,
                   so.supplier_notes, so.paid_at, rr.id, rr.title, rr.priority,
                   b.name, b.location, b.id
          ORDER BY so.created_at DESC
        `;
      } else {
        // BRANCH_MANAGER can only see orders for their branch
        ordersQuery = sql`
          SELECT 
            so.id,
            so.order_status,
            so.payment_status,
            so.total_amount,
            so.created_at,
            so.estimated_delivery_date,
            so.actual_delivery_date,
            so.supplier_notes,
            so.paid_at,
            rr.id as request_id,
            rr.title as request_title,
            rr.priority,
            b.name as branch_name,
            b.location as branch_location,
            b.id as branch_id,
            COUNT(soi.id) as items_count
          FROM supplier_order so
          LEFT JOIN restock_request rr ON so.restock_request_id = rr.id
          LEFT JOIN branches b ON rr.branch_id = b.id
          LEFT JOIN supplier_order_item soi ON so.id = soi.supplier_order_id
          WHERE so.supplier_id = ${supplierId} AND b.id = ${user.branchId}
          GROUP BY so.id, so.order_status, so.payment_status, so.total_amount, 
                   so.created_at, so.estimated_delivery_date, so.actual_delivery_date,
                   so.supplier_notes, so.paid_at, rr.id, rr.title, rr.priority,
                   b.name, b.location, b.id
          ORDER BY so.created_at DESC
        `;
      }

      const ordersResult = await ordersQuery;

      // Calculate statistics
      const orders = ordersResult;
      const totalOrders = orders.length;
      const paidOrders = orders.filter(
        (order: any) => order.payment_status === "paid"
      );
      const totalPaidOrders = paidOrders.length;
      const totalPaidAmount = paidOrders.reduce(
        (sum: number, order: any) => sum + parseFloat(order.total_amount || 0),
        0
      );
      const pendingOrders = orders.filter(
        (order: any) => order.payment_status === "unpaid"
      ).length;

      // Get branch-specific statistics if branch manager
      let branchStats = null;
      if (user.role === ROLES.BRANCH_MANAGER) {
        const branchOrdersForThisSupplier = orders.filter(
          (order: any) => order.branch_id === user.branchId
        );
        const branchPaidOrders = branchOrdersForThisSupplier.filter(
          (order: any) => order.payment_status === "paid"
        );

        branchStats = {
          totalOrders: branchOrdersForThisSupplier.length,
          paidOrders: branchPaidOrders.length,
          totalPaidAmount: branchPaidOrders.reduce(
            (sum: number, order: any) =>
              sum + parseFloat(order.total_amount || 0),
            0
          ),
          pendingOrders: branchOrdersForThisSupplier.filter(
            (order: any) => order.payment_status === "unpaid"
          ).length,
        };
      }

      return NextResponse.json({
        success: true,
        data: {
          supplier,
          orders,
          statistics: {
            totalOrders,
            paidOrders: totalPaidOrders,
            totalPaidAmount,
            pendingOrders,
          },
          branchStats,
        },
      });
    } else {
      // Get all suppliers with basic info
      let suppliersQuery;
      if (user.role === ROLES.OWNER) {
        // OWNER can see all suppliers in the database
        suppliersQuery = sql`
          SELECT 
            s.id,
            s.supplier_name,
            s.supplier_email,
            s.supplier_tel,
            s.created_at,
            COUNT(DISTINCT so.id) as total_orders,
            COUNT(DISTINCT CASE WHEN so.payment_status = 'paid' THEN so.id END) as paid_orders,
            SUM(CASE WHEN so.payment_status = 'paid' THEN so.total_amount ELSE 0 END) as total_paid_amount
          FROM supplier s
          LEFT JOIN supplier_order so ON s.id = so.supplier_id
          GROUP BY s.id, s.supplier_name, s.supplier_email, s.supplier_tel, s.created_at
          ORDER BY s.supplier_name
        `;
      } else {
        // BRANCH_MANAGER can see all suppliers but with branch-specific order statistics
        suppliersQuery = sql`
          SELECT 
            s.id,
            s.supplier_name,
            s.supplier_email,
            s.supplier_tel,
            s.created_at,
            COUNT(DISTINCT CASE WHEN rr.branch_id = ${user.branchId} THEN so.id END) as total_orders,
            COUNT(DISTINCT CASE WHEN so.payment_status = 'paid' AND rr.branch_id = ${user.branchId} THEN so.id END) as paid_orders,
            SUM(CASE WHEN so.payment_status = 'paid' AND rr.branch_id = ${user.branchId} THEN so.total_amount ELSE 0 END) as total_paid_amount
          FROM supplier s
          LEFT JOIN supplier_order so ON s.id = so.supplier_id
          LEFT JOIN restock_request rr ON so.restock_request_id = rr.id
          GROUP BY s.id, s.supplier_name, s.supplier_email, s.supplier_tel, s.created_at
          ORDER BY s.supplier_name
        `;
      }

      const suppliersResult = await suppliersQuery;

      return NextResponse.json({
        success: true,
        data: {
          suppliers: suppliersResult,
        },
      });
    }
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch suppliers" },
      { status: 500 }
    );
  }
}
