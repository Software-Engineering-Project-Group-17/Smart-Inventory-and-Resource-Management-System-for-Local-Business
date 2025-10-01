// controllers/salesController.js
import { query } from '../utils/db.js'; // ESM import

// --- Overview ---
const getOverview = async (req, res) => {
  try {
    const { branchId } = req.query;
    const period = req.query.period || '30d';
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sql = `
      SELECT 
        COALESCE(SUM(total_amount), 0) AS total_sales,
        COUNT(*) AS total_orders,
        AVG(total_amount) AS avg_order_value,
        COUNT(DISTINCT customer_id) AS unique_customers
      FROM customer_order
      WHERE created_at >= $1
      ${branchId ? 'AND branch_id = $2' : ''}
      AND order_status != 'cancelled'
    `;
    
    const params = branchId ? [startDate, branchId] : [startDate];
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

// --- Daily Sales ---
const getDailySales = async (req, res) => {
  try {
    const { branchId } = req.query;
    const daysRaw = req.query.days ?? 30;
    const days = Math.max(1, Math.min(parseInt(daysRaw, 10) || 30, 365)); // clamp 1..365
    
    const sql = `
      WITH date_series AS (
        SELECT (date_trunc('day', CURRENT_DATE) - (n || ' days')::interval)::date AS date
        FROM generate_series(0, $${branchId ? 2 : 1}) AS n
      )
      SELECT 
        to_char(ds.date, 'MM/DD') AS date,
        COALESCE(SUM(co.total_amount), 0) AS sales,
        COUNT(co.id) AS orders,
        COALESCE(AVG(co.total_amount), 0) AS avg_order_value
      FROM date_series ds
      LEFT JOIN customer_order co 
        ON DATE(co.created_at) = ds.date
        ${branchId ? 'AND co.branch_id = $1' : ''}
        AND co.order_status != 'cancelled'
      GROUP BY ds.date
      ORDER BY ds.date
    `;
    
    const params = branchId ? [branchId, days] : [days];
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

// --- Sales by Category ---
const getSalesByCategory = async (req, res) => {
  try {
    const { branchId } = req.query;
    const period = req.query.period || '30d';
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sql = `
      SELECT 
        c.category_name AS category,
        COALESCE(SUM(oi.total_price), 0) AS sales,
        COUNT(DISTINCT co.id) AS orders,
        0 AS growth
      FROM category c
      LEFT JOIN inventory_item ii ON c.id = ii.category_id
      LEFT JOIN order_item oi ON ii.inventory_id = oi.inventory_id
      LEFT JOIN customer_order co ON oi.order_id = co.id
        AND co.created_at >= $1
        ${branchId ? 'AND co.branch_id = $2' : ''}
        AND co.order_status != 'cancelled'
      GROUP BY c.id, c.category_name
      HAVING COALESCE(SUM(oi.total_price), 0) > 0
      ORDER BY sales DESC
    `;
    
    const params = branchId ? [startDate, branchId] : [startDate];
    const result = await query(sql, params);
    
    res.json(result.rows.map(row => ({
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

// --- Sales by Channel ---
const getSalesByChannel = async (req, res) => {
  try {
    const { branchId } = req.query;

    const sql = `
      SELECT 
        COALESCE(SUM(total_amount), 0) AS total_amount
      FROM customer_order
      WHERE order_status != 'cancelled'
      ${branchId ? 'AND branch_id = $1' : ''}
    `;
    
    const params = branchId ? [branchId] : [];
    const result = await query(sql, params);
    const totalAmount = parseFloat(result.rows[0]?.total_amount || 0);

    res.json([
      { name: 'Online', value: 60, amount: totalAmount * 0.6, color: '#3674B5' },
      { name: 'In-Store', value: 35, amount: totalAmount * 0.35, color: '#10B981' },
      { name: 'Phone Orders', value: 5, amount: totalAmount * 0.05, color: '#F59E0B' }
    ]);

  } catch (error) {
    console.error('Error in getSalesByChannel:', error);
    res.status(500).json({ error: 'Failed to fetch sales by channel' });
  }
};

// --- Top Performers ---
const getTopPerformers = async (req, res) => {
  try {
    const { branchId } = req.query;
    const limitRaw = req.query.limit ?? 5;
    const limit = Math.max(1, Math.min(parseInt(limitRaw, 10) || 5, 100));

    const sql = `
      SELECT 
        s.first_name || ' ' || s.last_name AS name,
        COALESCE(SUM(co.total_amount), 0) AS sales,
        COUNT(co.id) AS orders,
        30000 AS target,
        (COALESCE(SUM(co.total_amount), 0) / 30000 * 100) AS performance
      FROM staff s
      LEFT JOIN customer_order co ON co.branch_id = s.branch_id
        AND co.order_status = 'completed'
        AND co.created_at >= date_trunc('month', CURRENT_DATE)
      WHERE s.is_active = true
      ${branchId ? 'AND s.branch_id = $1' : ''}
      GROUP BY s.id, s.first_name, s.last_name
      HAVING COALESCE(SUM(co.total_amount), 0) > 0
      ORDER BY sales DESC
      LIMIT $${branchId ? 2 : 1}
    `;
    
    const params = branchId ? [branchId, limit] : [limit];
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

// --- Hourly Pattern ---
const getHourlyPattern = async (req, res) => {
  try {
    const { branchId } = req.query;
    const daysRaw = req.query.days ?? 7;
    const days = Math.max(1, Math.min(parseInt(daysRaw, 10) || 7, 60));

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sql = `
      SELECT 
        EXTRACT(HOUR FROM created_at) AS hour,
        COALESCE(SUM(total_amount), 0) AS sales,
        COUNT(*) AS orders
      FROM customer_order
      WHERE created_at >= $1
      ${branchId ? 'AND branch_id = $2' : ''}
      AND order_status != 'cancelled'
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY hour
    `;
    
    const params = branchId ? [startDate, branchId] : [startDate];
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

// --- Sales Metrics ---
const getSalesMetrics = async (req, res) => {
  try {
    const { branchId } = req.query;

    const sql = `
      WITH current_period AS (
        SELECT 
          COALESCE(SUM(total_amount), 0) AS total_sales,
          COUNT(*) AS total_orders,
          AVG(total_amount) AS avg_order_value
        FROM customer_order
        WHERE created_at >= date_trunc('week', CURRENT_DATE)
        ${branchId ? 'AND branch_id = $1' : ''}
        AND order_status != 'cancelled'
      ),
      previous_period AS (
        SELECT 
          COALESCE(SUM(total_amount), 0) AS prev_sales
        FROM customer_order
        WHERE created_at >= date_trunc('week', CURRENT_DATE - interval '1 week')
        AND created_at < date_trunc('week', CURRENT_DATE)
        ${branchId ? 'AND branch_id = $1' : ''}
        AND order_status != 'cancelled'
      )
      SELECT 
        cp.total_sales,
        cp.total_orders,
        cp.avg_order_value,
        CASE WHEN pp.prev_sales > 0 
          THEN ((cp.total_sales - pp.prev_sales) / pp.prev_sales * 100)
          ELSE 0 
        END AS weekly_growth,
        3.2 AS conversion_rate
      FROM current_period cp, previous_period pp
    `;
    
    const params = branchId ? [branchId] : [];
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

// --- Sales Goals ---
const getSalesGoals = async (req, res) => {
  try {
    const { branchId } = req.query;

    const sql = `
      SELECT COALESCE(SUM(total_amount), 0) AS achieved
      FROM customer_order
      WHERE created_at >= date_trunc('month', CURRENT_DATE)
      ${branchId ? 'AND branch_id = $1' : ''}
      AND order_status != 'cancelled'
    `;
    
    const params = branchId ? [branchId] : [];
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
  getDailySales,
  getSalesByCategory,
  getSalesByChannel,
  getTopPerformers,
  getHourlyPattern,
  getSalesMetrics,
  getSalesGoals
};
