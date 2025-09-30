// controllers/reportController.js
// Final production-ready report controller with enhanced error handling and validation
// Matches database schema from complete.sql and supplier_management_schema.sql

import { query } from "../utils/db.js";

// ----- Helper Functions -----

const parseRange = (start, end, col) => {
  const parts = [];
  const vals = [];
  if (start && start.trim()) { 
    vals.push(start); 
    parts.push(`${col} >= $${vals.length}`); 
  }
  if (end && end.trim()) { 
    vals.push(end); 
    parts.push(`${col} <= $${vals.length}`); 
  }
  return { where: parts.length ? parts.join(" AND ") : "", vals };
};

const validateFilters = (filters) => {
  const { start, end, branch, status } = filters;
  const errors = [];

  // Validate date format if provided
  if (start && !/^\d{4}-\d{2}-\d{2}$/.test(start)) {
    errors.push("Invalid start date format. Use YYYY-MM-DD");
  }
  if (end && !/^\d{4}-\d{2}-\d{2}$/.test(end)) {
    errors.push("Invalid end date format. Use YYYY-MM-DD");
  }

  // Validate date range
  if (start && end && new Date(start) > new Date(end)) {
    errors.push("Start date must be before end date");
  }

  // Validate branch (if provided, should be numeric or string)
  if (branch && branch.trim() && isNaN(Number(branch)) && typeof branch !== 'string') {
    errors.push("Invalid branch format");
  }

  return errors;
};

const handleControllerError = (error, res, reportType) => {
  console.error(`Error in ${reportType} report:`, error);
  
  if (error.code === '42P01') {
    return res.status(500).json({
      success: false,
      error: "Database table or view not found. Please check database schema.",
      code: "SCHEMA_ERROR"
    });
  }

  if (error.code === '42703') {
    return res.status(500).json({
      success: false,
      error: "Database column not found. Schema may be outdated.",
      code: "COLUMN_ERROR"
    });
  }

  return res.status(500).json({
    success: false,
    error: "Failed to generate report. Please try again later.",
    code: "INTERNAL_ERROR",
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

// =============== 1) INVENTORY – LOW STOCK =================
export async function inventoryLowStock(req, res) {
  try {
    const { start, end, branch, status } = req.query;
    
    // Validate input
    const validationErrors = validateFilters({ start, end, branch, status });
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        errors: validationErrors
      });
    }

    const where = [];
    const vals = [];
    let paramCount = 0;

    if (branch && branch.trim()) { 
      paramCount++;
      vals.push(branch.trim()); 
      where.push(`ii.branch_id = $${paramCount}`); 
    }

    // Date range for updated_at if provided
    const dr = parseRange(start, end, "ii.updated_at");
    if (dr.where) {
      dr.vals.forEach(val => {
        paramCount++;
        vals.push(val);
        where.push(dr.where.replace(/\$\d+/g, () => `$${paramCount}`));
      });
    }

    const sql = `
      SELECT 
        ii.inventory_id,
        ii.inventory_name,
        ii.quantity,
        ii.low_stock_threshold,
        ROUND(ii.unit_price::numeric, 2) as unit_price,
        ii.branch_id,
        c.category_name,
        b.name as branch_name,
        (ii.low_stock_threshold - ii.quantity) as shortage_amount
      FROM inventory_item ii
      LEFT JOIN category c ON c.id = ii.category_id
      LEFT JOIN branches b ON b.id = ii.branch_id
      WHERE ii.quantity <= ii.low_stock_threshold
      ${where.length ? "AND " + where.join(" AND ") : ""}
      ORDER BY (ii.low_stock_threshold - ii.quantity) DESC, ii.inventory_name ASC
    `;

    const { rows } = await query(sql, vals);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length,
      filters: { start, end, branch, status }
    });

  } catch (error) {
    handleControllerError(error, res, 'inventory-low-stock');
  }
}

// =============== 2) ORDERS – SUMMARY ======================
export async function ordersSummary(req, res) {
  try {
    const { start, end, branch, status } = req.query;
    
    const validationErrors = validateFilters({ start, end, branch, status });
    if (validationErrors.length > 0) {
      return res.status(400).json({ success: false, errors: validationErrors });
    }

    const where = [];
    const vals = [];
    let paramCount = 0;

    if (branch && branch.trim()) { 
      paramCount++;
      vals.push(branch.trim()); 
      where.push(`co.branch_id = $${paramCount}`); 
    }
    if (status && status.trim()) { 
      paramCount++;
      vals.push(status.trim().toLowerCase()); 
      where.push(`co.order_status = $${paramCount}`); 
    }

    const dr = parseRange(start, end, "co.created_at");
    if (dr.where) {
      dr.vals.forEach(val => {
        paramCount++;
        vals.push(val);
        where.push(dr.where.replace(/\$\d+/g, () => `$${paramCount}`));
      });
    }

    const sql = `
      SELECT
        co.id as order_id,
        to_char(co.created_at, 'YYYY-MM-DD') AS order_date,
        COALESCE(c.customer_name, 'Guest') AS customer,
        COALESCE(item_counts.total_items, 0) AS total_items,
        ROUND(COALESCE(co.total_amount, 0)::numeric, 2) AS total_value,
        co.order_status AS status,
        co.payment_status,
        b.name as branch_name,
        co.shipping_address
      FROM customer_order co
      LEFT JOIN customer c ON c.id = co.customer_id
      LEFT JOIN branches b ON b.id = co.branch_id
      LEFT JOIN (
        SELECT oi.order_id, COUNT(*) as total_items
        FROM order_item oi
        GROUP BY oi.order_id
      ) item_counts ON item_counts.order_id = co.id
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY co.created_at DESC
      LIMIT 1000
    `;

    const { rows } = await query(sql, vals);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length,
      filters: { start, end, branch, status }
    });

  } catch (error) {
    handleControllerError(error, res, 'orders-summary');
  }
}

// =============== 3) CUSTOMER – ORDER HISTORY ==============
export async function customerHistory(req, res) {
  try {
    const { start, end, branch, status } = req.query;
    
    const validationErrors = validateFilters({ start, end, branch, status });
    if (validationErrors.length > 0) {
      return res.status(400).json({ success: false, errors: validationErrors });
    }

    const where = [];
    const vals = [];
    let paramCount = 0;

    if (branch && branch.trim()) { 
      paramCount++;
      vals.push(branch.trim()); 
      where.push(`co.branch_id = $${paramCount}`); 
    }
    if (status && status.trim()) { 
      paramCount++;
      vals.push(status.trim().toLowerCase()); 
      where.push(`co.order_status = $${paramCount}`); 
    }

    const dr = parseRange(start, end, "co.created_at");
    if (dr.where) {
      dr.vals.forEach(val => {
        paramCount++;
        vals.push(val);
        where.push(dr.where.replace(/\$\d+/g, () => `$${paramCount}`));
      });
    }

    const sql = `
      SELECT
        c.id as customer_id,
        c.customer_name,
        c.customer_email,
        co.id as order_id,
        to_char(co.created_at, 'YYYY-MM-DD') AS order_date,
        COALESCE(item_counts.qty, 0) AS qty,
        ROUND(COALESCE(co.total_amount, 0)::numeric, 2) AS amount,
        co.order_status,
        co.payment_status,
        b.name as branch_name
      FROM customer c
      INNER JOIN customer_order co ON c.id = co.customer_id
      LEFT JOIN branches b ON b.id = co.branch_id
      LEFT JOIN (
        SELECT oi.order_id, SUM(oi.quantity) as qty
        FROM order_item oi
        GROUP BY oi.order_id
      ) item_counts ON item_counts.order_id = co.id
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY co.created_at DESC
      LIMIT 1000
    `;

    const { rows } = await query(sql, vals);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length,
      filters: { start, end, branch, status }
    });

  } catch (error) {
    handleControllerError(error, res, 'customer-history');
  }
}

// =============== 4) RESOURCES – ASSIGNMENTS ===============
export async function resourcesAssignments(req, res) {
  try {
    const { start, end, branch, status } = req.query;
    
    const validationErrors = validateFilters({ start, end, branch, status });
    if (validationErrors.length > 0) {
      return res.status(400).json({ success: false, errors: validationErrors });
    }

    const where = [];
    const vals = [];
    let paramCount = 0;

    if (branch && branch.trim()) { 
      paramCount++;
      vals.push(branch.trim()); 
      where.push(`r.branch_id = $${paramCount}`); 
    }
    if (status && status.trim()) { 
      paramCount++;
      vals.push(status.trim().toLowerCase()); 
      where.push(`r.availability_status = $${paramCount}`); 
    }

    const dr = parseRange(start, end, "COALESCE(sra.assigned_at, r.created_at)");
    if (dr.where) {
      dr.vals.forEach(val => {
        paramCount++;
        vals.push(val);
        where.push(dr.where.replace(/\$\d+/g, () => `$${paramCount}`));
      });
    }

    const sql = `
      SELECT
        r.id as resource_id,
        r.name as resource_name,
        r.resource_number,
        r.resource_type,
        CASE 
          WHEN s.first_name IS NOT NULL THEN CONCAT_WS(' ', s.first_name, s.last_name)
          ELSE 'Unassigned'
        END as assigned_to,
        to_char(COALESCE(sra.start_date, r.created_at::date), 'YYYY-MM-DD') AS start_date,
        to_char(sra.end_date, 'YYYY-MM-DD') AS end_date,
        r.availability_status AS status,
        b.name as branch_name,
        sra.purpose,
        to_char(sra.assigned_at, 'YYYY-MM-DD HH24:MI') as assigned_at
      FROM resource r
      LEFT JOIN staff_resource_assignment sra ON r.id = sra.resource_id AND sra.is_active = true
      LEFT JOIN staff s ON sra.staff_id = s.id
      LEFT JOIN branches b ON r.branch_id = b.id
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY r.availability_status ASC, sra.assigned_at DESC NULLS LAST, r.name ASC
      LIMIT 1000
    `;

    const { rows } = await query(sql, vals);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length,
      filters: { start, end, branch, status }
    });

  } catch (error) {
    handleControllerError(error, res, 'resources-assignments');
  }
}

// =============== 5) INVENTORY – RESTOCK SUMMARY ===========
export async function restockSummary(req, res) {
  try {
    const { start, end, branch, status } = req.query;
    
    const validationErrors = validateFilters({ start, end, branch, status });
    if (validationErrors.length > 0) {
      return res.status(400).json({ success: false, errors: validationErrors });
    }

    const where = [];
    const vals = [];
    let paramCount = 0;

    if (branch && branch.trim()) { 
      paramCount++;
      vals.push(branch.trim()); 
      where.push(`rr.branch_id = $${paramCount}`); 
    }
    if (status && status.trim()) { 
      paramCount++;
      vals.push(status.trim().toLowerCase()); 
      where.push(`rr.status = $${paramCount}`); 
    }

    const dr = parseRange(start, end, "rr.created_at");
    if (dr.where) {
      dr.vals.forEach(val => {
        paramCount++;
        vals.push(val);
        where.push(dr.where.replace(/\$\d+/g, () => `$${paramCount}`));
      });
    }

    const sql = `
      SELECT
        ii.inventory_id,
        ii.inventory_name as item,
        to_char(MAX(so.actual_delivery_date), 'YYYY-MM-DD') as last_restock,
        COALESCE(SUM(soi.offered_quantity), 0) as restocked_qty,
        MAX(s.supplier_name) as supplier,
        to_char(MAX(so.estimated_delivery_date), 'YYYY-MM-DD') as next_restock_due,
        COUNT(DISTINCT rr.id) as restock_requests,
        rr.status as request_status,
        b.name as branch_name
      FROM restock_request rr
      LEFT JOIN restock_request_item rri ON rri.restock_request_id = rr.id
      LEFT JOIN inventory_item ii ON ii.inventory_id = rri.inventory_id
      LEFT JOIN supplier_order so ON so.restock_request_id = rr.id
      LEFT JOIN supplier_order_item soi ON soi.supplier_order_id = so.id AND soi.inventory_id = rri.inventory_id
      LEFT JOIN supplier s ON s.id = so.supplier_id
      LEFT JOIN branches b ON b.id = rr.branch_id
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      GROUP BY ii.inventory_id, ii.inventory_name, rr.status, b.name
      HAVING ii.inventory_id IS NOT NULL
      ORDER BY last_restock DESC NULLS LAST, ii.inventory_name ASC
      LIMIT 1000
    `;

    const { rows } = await query(sql, vals);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length,
      filters: { start, end, branch, status }
    });

  } catch (error) {
    handleControllerError(error, res, 'restock-summary');
  }
}

// =============== 6) SUPPLIER – ORDER DETAILS ==============
export async function supplierOrderDetails(req, res) {
  try {
    const { start, end, branch, status } = req.query;
    
    const validationErrors = validateFilters({ start, end, branch, status });
    if (validationErrors.length > 0) {
      return res.status(400).json({ success: false, errors: validationErrors });
    }

    const where = [];
    const vals = [];
    let paramCount = 0;

    if (branch && branch.trim()) { 
      paramCount++;
      vals.push(branch.trim()); 
      where.push(`rr.branch_id = $${paramCount}`); 
    }
    if (status && status.trim()) { 
      paramCount++;
      vals.push(status.trim().toLowerCase()); 
      where.push(`so.order_status = $${paramCount}`); 
    }

    const dr = parseRange(start, end, "so.created_at");
    if (dr.where) {
      dr.vals.forEach(val => {
        paramCount++;
        vals.push(val);
        where.push(dr.where.replace(/\$\d+/g, () => `$${paramCount}`));
      });
    }

    const sql = `
      SELECT
        s.id as supplier_id,
        s.supplier_name,
        s.supplier_email,
        s.supplier_tel,
        so.id as po_id,
        to_char(so.created_at, 'YYYY-MM-DD') AS po_date,
        COALESCE(item_counts.items, 0) AS items,
        ROUND(COALESCE(so.total_amount, 0)::numeric, 2) AS total_value,
        so.order_status AS status,
        so.payment_status,
        b.name as branch_name,
        rr.title as request_title,
        to_char(so.estimated_delivery_date, 'YYYY-MM-DD') as estimated_delivery,
        to_char(so.actual_delivery_date, 'YYYY-MM-DD') as actual_delivery
      FROM supplier_order so
      INNER JOIN restock_request rr ON so.restock_request_id = rr.id
      LEFT JOIN supplier s ON s.id = so.supplier_id
      LEFT JOIN branches b ON b.id = rr.branch_id
      LEFT JOIN (
        SELECT soi.supplier_order_id, COUNT(*) as items
        FROM supplier_order_item soi
        GROUP BY soi.supplier_order_id
      ) item_counts ON item_counts.supplier_order_id = so.id
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY so.created_at DESC
      LIMIT 1000
    `;

    const { rows } = await query(sql, vals);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length,
      filters: { start, end, branch, status }
    });

  } catch (error) {
    handleControllerError(error, res, 'supplier-order-details');
  }
}

// =============== 7) INVENTORY – RESTOCK TRACKING ==========
export async function inventoryRestockTracking(req, res) {
  try {
    const { start, end, branch } = req.query;
    
    const validationErrors = validateFilters({ start, end, branch });
    if (validationErrors.length > 0) {
      return res.status(400).json({ success: false, errors: validationErrors });
    }

    const where = [];
    const vals = [];
    let paramCount = 0;

    if (branch && branch.trim()) { 
      paramCount++;
      vals.push(branch.trim()); 
      where.push(`ii.branch_id = $${paramCount}`); 
    }

    const sql = `
      SELECT
        ii.inventory_id,
        ii.inventory_name AS item,
        ii.quantity AS current_qty,
        ii.low_stock_threshold,
        COALESCE(pending_orders.total_pending, 0) AS pending_qty,
        COALESCE(paid_orders.total_confirmed, 0) AS confirmed_incoming,
        to_char(MAX(so.actual_delivery_date), 'YYYY-MM-DD') AS last_restock,
        CASE 
          WHEN ii.quantity <= ii.low_stock_threshold THEN 'LOW_STOCK'
          WHEN COALESCE(paid_orders.total_confirmed, 0) > 0 THEN 'INCOMING'
          ELSE 'NORMAL'
        END as stock_status,
        b.name as branch_name,
        c.category_name
      FROM inventory_item ii
      LEFT JOIN branches b ON b.id = ii.branch_id
      LEFT JOIN category c ON c.id = ii.category_id
      LEFT JOIN restock_request_item rri ON ii.inventory_id = rri.inventory_id
      LEFT JOIN supplier_order_item soi ON soi.inventory_id = ii.inventory_id
      LEFT JOIN supplier_order so ON so.id = soi.supplier_order_id
      LEFT JOIN (
        SELECT 
          soi2.inventory_id,
          SUM(soi2.offered_quantity) as total_pending
        FROM supplier_order_item soi2
        INNER JOIN supplier_order so2 ON so2.id = soi2.supplier_order_id
        WHERE so2.order_status = 'pending' AND so2.payment_status = 'unpaid'
        GROUP BY soi2.inventory_id
      ) pending_orders ON pending_orders.inventory_id = ii.inventory_id
      LEFT JOIN (
        SELECT 
          soi3.inventory_id,
          SUM(soi3.offered_quantity) as total_confirmed
        FROM supplier_order_item soi3
        INNER JOIN supplier_order so3 ON so3.id = soi3.supplier_order_id
        WHERE so3.payment_status = 'paid'
        GROUP BY soi3.inventory_id
      ) paid_orders ON paid_orders.inventory_id = ii.inventory_id
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      GROUP BY ii.inventory_id, ii.inventory_name, ii.quantity, ii.low_stock_threshold, 
               b.name, c.category_name, pending_orders.total_pending, paid_orders.total_confirmed
      ORDER BY 
        CASE 
          WHEN ii.quantity <= ii.low_stock_threshold THEN 1
          WHEN COALESCE(paid_orders.total_confirmed, 0) > 0 THEN 2
          ELSE 3
        END,
        ii.inventory_name ASC
      LIMIT 1000
    `;

    const { rows } = await query(sql, vals);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length,
      filters: { start, end, branch }
    });

  } catch (error) {
    handleControllerError(error, res, 'inventory-restock-tracking');
  }
}

// =============== EXPORT ALL FUNCTIONS ====================
// export {
//   inventoryLowStock,
//   ordersSummary, 
//   customerHistory,
//   resourcesAssignments,
//   restockSummary,
//   supplierOrderDetails,
//   inventoryRestockTracking
// };