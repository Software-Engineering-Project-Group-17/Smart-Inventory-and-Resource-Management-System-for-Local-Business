// controllers/salesController.js
import { query } from '../utils/db.js'; // ESM import

// --- Overview (supports branchId, period, categoryId) ---
const getOverview = async (req, res) => {
  try {
    const { branchId, categoryId } = req.query;
    const period = req.query.period || '30d';
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const params = [startDate];
    let where = `co.created_at >= $1 AND co.order_status != 'cancelled'`;

    if (branchId) {
      params.push(branchId);
      where += ` AND co.branch_id = $${params.length}`;
    }

    // If filtering by category, compute totals from order_item rows
    let selectSales = `COALESCE(SUM(co.total_amount), 0)`;
    let selectAvg = `CASE WHEN COUNT(*) > 0 THEN AVG(co.total_amount) ELSE 0 END`;
    let selectOrders = `COUNT(*)`;
    let joinItems = ``;

    if (categoryId) {
      params.push(Number(categoryId));
      joinItems = `
        JOIN order_item oi ON oi.order_id = co.id
        JOIN inventory_item ii ON ii.inventory_id = oi.inventory_id
        JOIN category c ON c.id = ii.category_id AND c.id = $${params.length}
      `;
      selectSales = `COALESCE(SUM(oi.total_price), 0)`;
      // average per order (distinct orders)
      selectAvg = `CASE WHEN COUNT(DISTINCT co.id) > 0 
                    THEN (COALESCE(SUM(oi.total_price),0)::numeric / COUNT(DISTINCT co.id)) 
                    ELSE 0 END`;
      selectOrders = `COUNT(DISTINCT co.id)`;
    }

    const sql = `
      SELECT 
        ${selectSales} AS total_sales,
        ${selectOrders} AS total_orders,
        ${selectAvg} AS avg_order_value,
        COUNT(DISTINCT co.customer_id) AS unique_customers
      FROM customer_order co
      ${joinItems}
      WHERE ${where}
    `;

    const result = await query(sql, params);
    const row = result.rows[0] || {};
    
    res.json({
      totalSales: parseFloat(row.total_sales || 0),
      totalOrders: parseInt(row.total_orders || 0, 10),
      avgOrderValue: parseFloat(row.avg_order_value || 0),
      uniqueCustomers: parseInt(row.unique_customers || 0, 10),
      period
    });

  } catch (error) {
    console.error('Error in sales overview:', error);
    res.status(500).json({ error: 'Failed to fetch sales overview' });
  }
};

// --- Daily Sales (supports branchId, period OR days, categoryId) ---
const getDailySales = async (req, res) => {
  try {
    const { branchId, categoryId } = req.query;

    // accept either explicit days or a period string
    const period = req.query.period;
    const daysRaw = req.query.days;
    const days =
      period === '7d' ? 7 :
      period === '30d' ? 30 :
      period === '90d' ? 90 :
      Math.max(1, Math.min(parseInt(daysRaw, 10) || 30, 365));

    // $1 = days for generate_series
    const params = [days];

    // Build WHERE clause and dynamic joins if categoryId present
    let where = `co.order_status != 'cancelled'`;
    let from = `
      FROM customer_order co
    `;
    if (categoryId) {
      params.push(Number(categoryId));
      from += `
        JOIN order_item oi ON oi.order_id = co.id
        JOIN inventory_item ii ON ii.inventory_id = oi.inventory_id
        JOIN category c ON c.id = ii.category_id AND c.id = $${params.length}
      `;
    }
    if (branchId) {
      params.push(branchId);
      where += ` AND co.branch_id = $${params.length}`;
    }

    const sql = `
      WITH date_series AS (
        SELECT (date_trunc('day', CURRENT_DATE) - (n || ' days')::interval)::date AS date
        FROM generate_series(0, $1) AS n
      ),
      agg AS (
        SELECT 
          DATE(co.created_at) AS date,
          ${categoryId ? 'COALESCE(SUM(oi.total_price), 0)' : 'COALESCE(SUM(co.total_amount), 0)'} AS sales,
          COUNT(DISTINCT co.id) AS orders
        ${from}
        WHERE ${where}
        GROUP BY DATE(co.created_at)
      )
      SELECT 
        to_char(ds.date, 'MM/DD') AS date,
        COALESCE(a.sales, 0) AS sales,
        COALESCE(a.orders, 0) AS orders,
        CASE WHEN COALESCE(a.orders,0) > 0 THEN (a.sales::numeric / a.orders) ELSE 0 END AS avg_order_value
      FROM date_series ds
      LEFT JOIN agg a ON a.date = ds.date
      ORDER BY ds.date
    `;

    const result = await query(sql, params);

    res.json(result.rows.map(row => ({
      date: row.date,
      sales: parseFloat(row.sales),
      orders: parseInt(row.orders, 10),
      avgOrderValue: parseFloat(row.avg_order_value)
    })));

  } catch (error) {
    console.error('Error in getDailySales:', error);
    res.status(500).json({ error: 'Failed to fetch daily sales' });
  }
};

// --- Sales by Category (supports branchId, period, categoryId filter) ---
const getSalesByCategory = async (req, res) => {
  try {
    const { branchId, categoryId } = req.query;
    const period = req.query.period || '30d';
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const params = [startDate];
    let extra = `AND co.order_status != 'cancelled'`;
    if (branchId) {
      params.push(branchId);
      extra += ` AND co.branch_id = $${params.length}`;
    }
    if (categoryId) {
      params.push(Number(categoryId));
      extra += ` AND c.id = $${params.length}`;
    }

    const sql = `
      SELECT 
        c.id AS category_id,
        c.category_name AS category,
        COALESCE(SUM(oi.total_price), 0) AS sales,
        COUNT(DISTINCT co.id) AS orders,
        0 AS growth
      FROM category c
      LEFT JOIN inventory_item ii ON c.id = ii.category_id
      LEFT JOIN order_item oi ON ii.inventory_id = oi.inventory_id
      LEFT JOIN customer_order co ON oi.order_id = co.id
        AND co.created_at >= $1
        ${extra}
      GROUP BY c.id, c.category_name
      HAVING COALESCE(SUM(oi.total_price), 0) > 0
      ORDER BY sales DESC
    `;

    const result = await query(sql, params);
    res.json(result.rows.map(row => ({
      id: parseInt(row.category_id, 10),
      category: row.category,
      sales: parseFloat(row.sales),
      orders: parseInt(row.orders, 10),
      growth: parseFloat(row.growth)
    })));

  } catch (error) {
    console.error('Error in getSalesByCategory:', error);
    res.status(500).json({ error: 'Failed to fetch sales by category' });
  }
};

// --- Sales by Channel (supports branchId, categoryId) ---
const getSalesByChannel = async (req, res) => {
  try {
    const { branchId, categoryId } = req.query;

    const params = [];
    let where = `co.order_status != 'cancelled'`;
    let from = `FROM customer_order co`;
    if (branchId) {
      params.push(branchId);
      where += ` AND co.branch_id = $${params.length}`;
    }
    if (categoryId) {
      params.push(Number(categoryId));
      from += `
        JOIN order_item oi ON oi.order_id = co.id
        JOIN inventory_item ii ON ii.inventory_id = oi.inventory_id
        JOIN category c ON c.id = ii.category_id AND c.id = $${params.length}
      `;
    }

    const sql = `
      SELECT 
        ${categoryId ? 'COALESCE(SUM(oi.total_price), 0)' : 'COALESCE(SUM(co.total_amount), 0)'} AS total_amount
      ${from}
      WHERE ${where}
    `;

    const result = await query(sql, params);
    const totalAmount = parseFloat(result.rows[0]?.total_amount || 0);

    // Keep fixed shares for now, but scale amounts to the filtered total
    res.json([
      { name: 'Online',       value: 60, amount: totalAmount * 0.6,  color: '#3674B5' },
      { name: 'In-Store',     value: 35, amount: totalAmount * 0.35, color: '#10B981' },
      { name: 'Phone Orders', value: 5,  amount: totalAmount * 0.05, color: '#F59E0B' }
    ]);

  } catch (error) {
    console.error('Error in getSalesByChannel:', error);
    res.status(500).json({ error: 'Failed to fetch sales by channel' });
  }
};

// --- Top Performers (supports branchId, categoryId, limit) ---
const getTopPerformers = async (req, res) => {
  try {
    const { branchId, categoryId } = req.query;
    const limitRaw = req.query.limit ?? 5;
    const limit = Math.max(1, Math.min(parseInt(limitRaw, 10) || 5, 100));

    const params = [];
    let where = `co.order_status = 'completed' AND co.created_at >= date_trunc('month', CURRENT_DATE)`;

    // Match staff to orders by branch (schema doesn't show salesperson_id)
    if (branchId) {
      params.push(branchId);
      where += ` AND co.branch_id = $${params.length}`;
    }
    if (categoryId) {
      params.push(Number(categoryId));
      where += ` AND c.id = $${params.length}`;
    }

    params.push(limit);

    const sql = `
      SELECT 
        s.first_name || ' ' || s.last_name AS name,
        COALESCE(SUM(oi.total_price), 0) AS sales,
        COUNT(DISTINCT co.id) AS orders,
        30000 AS target,
        CASE WHEN 30000 > 0 THEN COALESCE(SUM(oi.total_price), 0) / 30000 * 100 ELSE 0 END AS performance
      FROM staff s
      JOIN customer_order co ON co.branch_id = s.branch_id
      JOIN order_item oi ON oi.order_id = co.id
      JOIN inventory_item ii ON ii.inventory_id = oi.inventory_id
      JOIN category c ON c.id = ii.category_id
      WHERE ${where}
      AND s.is_active = true
      GROUP BY s.id, s.first_name, s.last_name
      HAVING COALESCE(SUM(oi.total_price), 0) > 0
      ORDER BY sales DESC
      LIMIT $${params.length}
    `;

    const result = await query(sql, params);
    
    res.json(result.rows.map(row => ({
      name: row.name,
      sales: parseFloat(row.sales),
      orders: parseInt(row.orders, 10),
      target: parseInt(row.target, 10),
      performance: parseFloat(row.performance)
    })));

  } catch (error) {
    console.error('Error in getTopPerformers:', error);
    res.status(500).json({ error: 'Failed to fetch top performers' });
  }
};

// --- Hourly Pattern (supports branchId, categoryId, days) ---
const getHourlyPattern = async (req, res) => {
  try {
    const { branchId, categoryId } = req.query;
    const daysRaw = req.query.days ?? 7;
    const days = Math.max(1, Math.min(parseInt(daysRaw, 10) || 7, 60));

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const params = [startDate];
    let where = `co.created_at >= $1 AND co.order_status != 'cancelled'`;
    if (branchId) {
      params.push(branchId);
      where += ` AND co.branch_id = $${params.length}`;
    }
    if (categoryId) {
      params.push(Number(categoryId));
      where += ` AND c.id = $${params.length}`;
    }

    const sql = `
      SELECT 
        EXTRACT(HOUR FROM co.created_at) AS hour,
        COALESCE(SUM(oi.total_price), 0) AS sales,
        COUNT(DISTINCT co.id) AS orders
      FROM customer_order co
      JOIN order_item oi ON oi.order_id = co.id
      JOIN inventory_item ii ON ii.inventory_id = oi.inventory_id
      JOIN category c ON c.id = ii.category_id
      WHERE ${where}
      GROUP BY EXTRACT(HOUR FROM co.created_at)
      ORDER BY hour
    `;

    const result = await query(sql, params);
    
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      sales: 0,
      orders: 0
    }));
    
    result.rows.forEach(row => {
      const hour = parseInt(row.hour, 10);
      hourlyData[hour] = {
        hour,
        sales: parseFloat(row.sales),
        orders: parseInt(row.orders, 10)
      };
    });
    
    res.json(hourlyData);

  } catch (error) {
    console.error('Error in getHourlyPattern:', error);
    res.status(500).json({ error: 'Failed to fetch hourly pattern' });
  }
};

// --- Sales Metrics (supports branchId, categoryId) ---
const getSalesMetrics = async (req, res) => {
  try {
    const { branchId, categoryId } = req.query;

    const params = [];
    let curWhere = `co.created_at >= date_trunc('week', CURRENT_DATE) AND co.order_status != 'cancelled'`;
    let prevWhere = `co.created_at >= date_trunc('week', CURRENT_DATE - interval '1 week')
                     AND co.created_at < date_trunc('week', CURRENT_DATE)
                     AND co.order_status != 'cancelled'`;

    if (branchId) {
      params.push(branchId);
      curWhere += ` AND co.branch_id = $${params.length}`;
      prevWhere += ` AND co.branch_id = $${params.length}`;
    }
    if (categoryId) {
      params.push(Number(categoryId));
      curWhere += ` AND c.id = $${params.length}`;
      prevWhere += ` AND c.id = $${params.length}`;
    }

    const sql = `
      WITH current_period AS (
        SELECT 
          COALESCE(SUM(oi.total_price), 0) AS total_sales,
          COUNT(DISTINCT co.id) AS total_orders
        FROM customer_order co
        JOIN order_item oi ON oi.order_id = co.id
        JOIN inventory_item ii ON ii.inventory_id = oi.inventory_id
        JOIN category c ON c.id = ii.category_id
        WHERE ${curWhere}
      ),
      previous_period AS (
        SELECT COALESCE(SUM(oi.total_price), 0) AS prev_sales
        FROM customer_order co
        JOIN order_item oi ON oi.order_id = co.id
        JOIN inventory_item ii ON ii.inventory_id = oi.inventory_id
        JOIN category c ON c.id = ii.category_id
        WHERE ${prevWhere}
      )
      SELECT 
        cp.total_sales,
        cp.total_orders,
        CASE WHEN cp.total_orders > 0 THEN (cp.total_sales::numeric / cp.total_orders) ELSE 0 END AS avg_order_value,
        CASE WHEN pp.prev_sales > 0 THEN ((cp.total_sales - pp.prev_sales) / pp.prev_sales * 100) ELSE 0 END AS weekly_growth,
        3.2 AS conversion_rate
      FROM current_period cp, previous_period pp
    `;

    const result = await query(sql, params);
    const row = result.rows[0] || {};
    
    res.json({
      totalSales: parseFloat(row.total_sales || 0),
      totalOrders: parseInt(row.total_orders || 0, 10),
      avgOrderValue: parseFloat(row.avg_order_value || 0),
      weeklyGrowth: parseFloat(row.weekly_growth || 0),
      conversionRate: parseFloat(row.conversion_rate || 0)
    });

  } catch (error) {
    console.error('Error in getSalesMetrics:', error);
    res.status(500).json({ error: 'Failed to fetch sales metrics' });
  }
};

// --- Sales Goals (supports branchId, categoryId) ---
const getSalesGoals = async (req, res) => {
  try {
    const { branchId, categoryId } = req.query;

    const params = [];
    let where = `co.created_at >= date_trunc('month', CURRENT_DATE) AND co.order_status != 'cancelled'`;
    let from = `FROM customer_order co`;
    if (branchId) {
      params.push(branchId);
      where += ` AND co.branch_id = $${params.length}`;
    }
    if (categoryId) {
      params.push(Number(categoryId));
      from += `
        JOIN order_item oi ON oi.order_id = co.id
        JOIN inventory_item ii ON ii.inventory_id = oi.inventory_id
        JOIN category c ON c.id = ii.category_id AND c.id = $${params.length}
      `;
    }

    const sql = `
      SELECT ${categoryId ? 'COALESCE(SUM(oi.total_price), 0)' : 'COALESCE(SUM(co.total_amount), 0)'} AS achieved
      ${from}
      WHERE ${where}
    `;

    const result = await query(sql, params);
    
    const target = 120000;
    const achieved = parseFloat(result.rows[0]?.achieved || 0);
    const achievementPercent = parseFloat(((achieved / target) * 100).toFixed(1));
    
    res.json({
      target,
      achieved,
      achievementPercent,
      remaining: target - achieved
    });

  } catch (error) {
    console.error('Error in getSalesGoals:', error);
    res.status(500).json({ error: 'Failed to fetch sales goals' });
  }
};

// Named + default exports (ESM)
export {
  getOverview,
  getDailySales,
  getSalesByCategory,
  getSalesByChannel,
  getTopPerformers,
  getHourlyPattern,
  getSalesMetrics,
  getSalesGoals
};

export default {
  getOverview,
  getDailySales,        // fixed typo
  getSalesByCategory,
  getSalesByChannel,
  getTopPerformers,
  getHourlyPattern,
  getSalesMetrics,
  getSalesGoals
};
