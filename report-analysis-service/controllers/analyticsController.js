import { query } from '../utils/db.js';

const clampInt = (val, def, min, max) => {
  const n = parseInt(val ?? def, 10);
  return Math.max(min, Math.min(Number.isFinite(n) ? n : def, max));
};

const parsePeriodDays = (period = '30d') => {
  switch (period) {
    case '7d':  return 7;
    case '30d':
    case '1m':  return 30;
    case '90d':
    case '3m':  return 90;
    case '6m':  return 180;
    case '1y':  return 365;
    default:    return clampInt(period, 30, 1, 365);
  }
};

const branchFilter = (hasBranch, idx) => (hasBranch ? `AND branch_id = $${idx}` : '');

/**
 * GET /analytics/overview
 * Summary cards for the dashboard
 * Query: branchId?, period? (supports 7d|30d|90d|1m|3m|6m|1y|<number_of_days>)
 */
const getOverview = async (req, res) => {
  try {
    const { branchId } = req.query;
    const period = req.query.period || '30d';
    const days = parsePeriodDays(period);

    const start = new Date();
    start.setDate(start.getDate() - days);

    // Core KPIs
    const sql = `
      WITH core AS (
        SELECT
          COALESCE(SUM(total_amount), 0)                   AS total_revenue,
          COUNT(*)                                         AS total_orders,
          COALESCE(AVG(total_amount), 0)                   AS avg_order_value,
          COUNT(DISTINCT customer_id)                      AS unique_customers
        FROM customer_order
        WHERE created_at >= $1
          ${branchFilter(!!branchId, 2)}
          AND order_status != 'cancelled'
      ),
      today_vs_yday AS (
        SELECT
          COALESCE(SUM(CASE WHEN DATE(created_at) = CURRENT_DATE THEN total_amount END), 0) AS today_revenue,
          COALESCE(SUM(CASE WHEN DATE(created_at) = CURRENT_DATE - INTERVAL '1 day' THEN total_amount END), 0) AS yday_revenue
        FROM customer_order
        WHERE created_at >= CURRENT_DATE - INTERVAL '1 day'
          ${branchFilter(!!branchId, 2)}
          AND order_status != 'cancelled'
      ),
      top_category AS (
        SELECT c.category_name, COALESCE(SUM(oi.total_price),0) AS sales
        FROM order_item oi
        JOIN inventory_item ii ON oi.inventory_id = ii.inventory_id
        JOIN category c ON ii.category_id = c.id
        JOIN customer_order co ON co.id = oi.order_id
        WHERE co.created_at >= $1
          ${branchFilter(!!branchId, 2).replaceAll('branch_id', 'co.branch_id')}
          AND co.order_status != 'cancelled'
        GROUP BY c.category_name
        ORDER BY sales DESC
        LIMIT 1
      )
      SELECT
        core.*,
        t.today_revenue,
        t.yday_revenue,
        (SELECT category_name FROM top_category) AS top_category
      FROM core, today_vs_yday t;
    `;

    const params = branchId ? [start, branchId] : [start];
    const { rows } = await query(sql, params);
    const r = rows[0] || {};

    const dayChange = parseFloat(r.yday_revenue || 0) > 0
      ? ((parseFloat(r.today_revenue || 0) - parseFloat(r.yday_revenue || 0)) / parseFloat(r.yday_revenue || 1)) * 100
      : 0;

    // ---- Order Status Distribution (percentages) ----
    const statusSql = `
      SELECT co.order_status AS status, COUNT(*)::int AS count
      FROM customer_order co
      WHERE co.created_at >= $1
        ${branchFilter(!!branchId, 2).replaceAll('branch_id', 'co.branch_id')}
        AND co.order_status != 'cancelled'
      GROUP BY co.order_status
      ORDER BY count DESC
    `;
    const statusParams = branchId ? [start, branchId] : [start];
    const { rows: statusRows } = await query(statusSql, statusParams);

    const totalStatus = statusRows.reduce((s, x) => s + Number(x.count || 0), 0);
    const orderStatus =
      totalStatus > 0
        ? statusRows.map((x) => ({
            name: x.status,
            value: Number(((x.count * 100) / totalStatus).toFixed(1)),
          }))
        : [];

    res.json({
      period,
      totalRevenue: parseFloat(r.total_revenue || 0),
      totalOrders: parseInt(r.total_orders || 0, 10),
      avgOrderValue: parseFloat(r.avg_order_value || 0),
      uniqueCustomers: parseInt(r.unique_customers || 0, 10),
      todayRevenue: parseFloat(r.today_revenue || 0),
      yesterdayRevenue: parseFloat(r.yday_revenue || 0),
      dayOverDayChange: parseFloat(dayChange.toFixed(1)),
      topCategory: r.top_category || null,
      orderStatus,
    });
  } catch (err) {
    console.error('analytics.getOverview error:', err);
    res.status(500).json({ error: 'Failed to fetch overview' });
  }
};

/**
 * GET /analytics/quick-stats
 * Lightweight KPIs for small tiles
 * Query: branchId?, period?
 */
const getQuickStats = async (req, res) => {
  try {
    const { branchId } = req.query;
    const period = req.query.period || '30d';
    const days = parsePeriodDays(period);

    const start = new Date();
    start.setDate(start.getDate() - days);

    const sql = `
      WITH kpi AS (
        SELECT
          COALESCE(SUM(total_amount), 0) AS revenue,
          COUNT(*)                       AS orders,
          COALESCE(AVG(total_amount), 0) AS aov
        FROM customer_order
        WHERE created_at >= $1
          ${branchFilter(!!branchId, 2)}
          AND order_status != 'cancelled'
      ),
      mtd AS (
        SELECT COALESCE(SUM(total_amount), 0) AS revenue_mtd
        FROM customer_order
        WHERE created_at >= date_trunc('month', CURRENT_DATE)
          ${branchFilter(!!branchId, 2)}
          AND order_status != 'cancelled'
      )
      SELECT kpi.*, mtd.revenue_mtd
      FROM kpi, mtd;
    `;
    const params = branchId ? [start, branchId] : [start];
    const { rows } = await query(sql, params);
    const r = rows[0] || {};

    res.json({
      period,
      revenue: parseFloat(r.revenue || 0),
      orders: parseInt(r.orders || 0, 10),
      avgOrderValue: parseFloat(r.aov || 0),
      monthToDateRevenue: parseFloat(r.revenue_mtd || 0)
    });
  } catch (err) {
    console.error('analytics.getQuickStats error:', err);
    res.status(500).json({ error: 'Failed to fetch quick stats' });
  }
};

/**
 * GET /analytics/quick-insights
 * Short human-readable insights for a banner/list
 * Query: branchId?, period?
 */
const getQuickInsights = async (req, res) => {
  try {
    const rawBranch = req.query.branchId;
    const branchId = rawBranch != null && rawBranch !== '' && !Number.isNaN(parseInt(rawBranch, 10))
      ? parseInt(rawBranch, 10)
      : null;

    const period = req.query.period || '30d';
    const days = parsePeriodDays(period);

    const start = new Date();
    start.setDate(start.getDate() - days);

    const prevStart = new Date(start);
    prevStart.setDate(prevStart.getDate() - days);

    // Always pass [start, branchId|null, prevStart] and type the optional filter
    const sql = `
      WITH rev AS (
        SELECT COALESCE(SUM(total_amount), 0) AS revenue
        FROM customer_order co
        WHERE co.created_at >= $1
          AND ($2::int IS NULL OR co.branch_id = $2::int)
          AND co.order_status != 'cancelled'
      ),
      yrev AS (
        SELECT COALESCE(SUM(total_amount), 0) AS revenue
        FROM customer_order co
        WHERE co.created_at >= $3
          AND co.created_at <  $1
          AND ($2::int IS NULL OR co.branch_id = $2::int)
          AND co.order_status != 'cancelled'
      ),
      lowstock AS (
        SELECT COUNT(*) AS low_count
        FROM inventory_item
        WHERE ($2::int IS NULL OR branch_id = $2::int)
      ),
      topcat AS (
        SELECT c.category_name, COALESCE(SUM(oi.total_price),0) AS sales
        FROM order_item oi
        JOIN inventory_item ii ON oi.inventory_id = ii.inventory_id
        JOIN category c ON ii.category_id = c.id
        JOIN customer_order co ON co.id = oi.order_id
        WHERE co.created_at >= $1
          AND ($2::int IS NULL OR co.branch_id = $2::int)
          AND co.order_status != 'cancelled'
        GROUP BY c.category_name
        ORDER BY sales DESC
        LIMIT 1
      )
      SELECT 
        (SELECT revenue FROM rev)  AS cur_rev,
        (SELECT revenue FROM yrev) AS prev_rev,
        (SELECT low_count FROM lowstock) AS low_stock_items,
        (SELECT category_name FROM topcat) AS top_category;
    `;

    const params = [start, branchId, prevStart];
    const { rows } = await query(sql, params);
    const r = rows[0] || {};

    const growth = (parseFloat(r.prev_rev || 0) > 0)
      ? ((parseFloat(r.cur_rev || 0) - parseFloat(r.prev_rev || 0)) / parseFloat(r.prev_rev || 1)) * 100
      : 0;

    const insights = [
      {
        type: growth >= 0 ? 'positive' : 'warning',
        text: `${growth >= 0 ? 'Revenue rose' : 'Revenue fell'} ${Math.abs(growth).toFixed(1)}% vs previous period`
      },
      r.top_category ? { type: 'info', text: `Top category: ${r.top_category}` } : null,
      (Number.isFinite(parseInt(r.low_stock_items, 10)) && parseInt(r.low_stock_items, 10) > 0)
        ? { type: 'alert', text: `${parseInt(r.low_stock_items, 10)} item(s) are at or below low-stock threshold` }
        : null
    ].filter(Boolean);

    res.json(insights);
  } catch (err) {
    console.error('analytics.getQuickInsights error:', err);
    res.status(500).json({ error: 'Failed to fetch quick insights' });
  }
};

/**
 * GET /analytics/revenue-trend
 * Time-series revenue
 * Query: branchId?, days? (default 30)
 */
const getRevenueTrend = async (req, res) => {
  try {
    const { branchId } = req.query;
    const days = clampInt(req.query.days, 30, 1, 365);

    const sql = `
      WITH ds AS (
        SELECT (date_trunc('day', CURRENT_DATE) - (n || ' days')::interval)::date AS d
        FROM generate_series(0, $${branchId ? 2 : 1}) AS n
      )
      SELECT 
        to_char(ds.d, 'MM/DD') AS date,
        COALESCE(SUM(co.total_amount), 0) AS revenue
      FROM ds
      LEFT JOIN customer_order co
        ON DATE(co.created_at) = ds.d
        ${branchFilter(!!branchId, 1 + (branchId ? 1 : 0)).replaceAll('branch_id','co.branch_id')}
        AND co.order_status != 'cancelled'
      GROUP BY ds.d
      ORDER BY ds.d;
    `;
    const params = branchId ? [branchId, days] : [days];
    const { rows } = await query(sql, params);
    res.json(rows.map(r => ({ date: r.date, revenue: parseFloat(r.revenue) })));
  } catch (err) {
    console.error('analytics.getRevenueTrend error:', err);
    res.status(500).json({ error: 'Failed to fetch revenue trend' });
  }
};

/**
 * GET /analytics/order-trend
 * Time-series order counts
 * Query: branchId?, days? (default 30)
 */
const getOrderTrend = async (req, res) => {
  try {
    const { branchId } = req.query;
    const days = clampInt(req.query.days, 30, 1, 365);

    const sql = `
      WITH ds AS (
        SELECT (date_trunc('day', CURRENT_DATE) - (n || ' days')::interval)::date AS d
        FROM generate_series(0, $${branchId ? 2 : 1}) AS n
      )
      SELECT 
        to_char(ds.d, 'MM/DD') AS date,
        COUNT(co.id) AS orders
      FROM ds
      LEFT JOIN customer_order co
        ON DATE(co.created_at) = ds.d
        ${branchFilter(!!branchId, 1 + (branchId ? 1 : 0)).replaceAll('branch_id','co.branch_id')}
        AND co.order_status != 'cancelled'
      GROUP BY ds.d
      ORDER BY ds.d;
    `;
    const params = branchId ? [branchId, days] : [days];
    const { rows } = await query(sql, params);
    res.json(rows.map(r => ({ date: r.date, orders: parseInt(r.orders || 0, 10) })));
  } catch (err) {
    console.error('analytics.getOrderTrend error:', err);
    res.status(500).json({ error: 'Failed to fetch order trend' });
  }
};

/**
 * GET /analytics/performance-summary
 * Aggregated KPIs + growth rates
 * Query: branchId?
 */
const getPerformanceSummary = async (req, res) => {
  try {
    const { branchId } = req.query;

    const sql = `
      WITH this_week AS (
        SELECT 
          COALESCE(SUM(total_amount),0) AS sales,
          COUNT(*)                      AS orders,
          COALESCE(AVG(total_amount),0) AS aov
        FROM customer_order
        WHERE created_at >= date_trunc('week', CURRENT_DATE)
          ${branchFilter(!!branchId, 1)}
          AND order_status != 'cancelled'
      ),
      prev_week AS (
        SELECT COALESCE(SUM(total_amount),0) AS sales
        FROM customer_order
        WHERE created_at >= date_trunc('week', CURRENT_DATE - interval '1 week')
          AND created_at <  date_trunc('week', CURRENT_DATE)
          ${branchFilter(!!branchId, 1)}
          AND order_status != 'cancelled'
      ),
      mtd AS (
        SELECT COALESCE(SUM(total_amount),0) AS sales_mtd
        FROM customer_order
        WHERE created_at >= date_trunc('month', CURRENT_DATE)
          ${branchFilter(!!branchId, 1)}
          AND order_status != 'cancelled'
      )
      SELECT 
        tw.sales, tw.orders, tw.aov,
        pw.sales AS prev_sales,
        mtd.sales_mtd
      FROM this_week tw, prev_week pw, mtd;
    `;
    const params = branchId ? [branchId] : [];
    const { rows } = await query(sql, params);
    const r = rows[0] || {};
    const weeklyGrowth = parseFloat(r.prev_sales || 0) > 0
      ? ((parseFloat(r.sales || 0) - parseFloat(r.prev_sales || 0)) / parseFloat(r.prev_sales || 1)) * 100
      : 0;

    res.json({
      salesThisWeek: parseFloat(r.sales || 0),
      ordersThisWeek: parseInt(r.orders || 0, 10),
      avgOrderValueThisWeek: parseFloat(r.aov || 0),
      weeklyGrowth: parseFloat(weeklyGrowth.toFixed(1)),
      monthToDateSales: parseFloat(r.sales_mtd || 0)
    });
  } catch (err) {
    console.error('analytics.getPerformanceSummary error:', err);
    res.status(500).json({ error: 'Failed to fetch performance summary' });
  }
};

/**
 * GET /analytics/business-alerts
 * Operational alerts (low stock, sales dips, spikes)
 * Query: branchId?, lookbackDays? (default 14)
 */
const getBusinessAlerts = async (req, res) => {
  try {
    const rawBranch = req.query.branchId;
    const branchId = rawBranch != null && rawBranch !== '' && !Number.isNaN(parseInt(rawBranch, 10))
      ? parseInt(rawBranch, 10)
      : null;

    const lookbackDays = clampInt(req.query.lookbackDays, 14, 1, 60);

    const start = new Date();
    start.setDate(start.getDate() - lookbackDays);

    const prevStart = new Date(start);
    prevStart.setDate(prevStart.getDate() - lookbackDays);

    // Always pass [start, branchId|null, prevStart] and type the optional filter
    const sql = `
      WITH sales_window AS (
        SELECT COALESCE(SUM(total_amount),0) AS revenue
        FROM customer_order co
        WHERE co.created_at >= $1
          AND ($2::int IS NULL OR co.branch_id = $2::int)
          AND co.order_status != 'cancelled'
      ),
      prev_window AS (
        SELECT COALESCE(SUM(total_amount),0) AS revenue
        FROM customer_order co
        WHERE co.created_at >= $3
          AND co.created_at <  $1
          AND ($2::int IS NULL OR co.branch_id = $2::int)
          AND co.order_status != 'cancelled'
      ),
      low_stock AS (
        SELECT COUNT(*) AS low_cnt
        FROM inventory_item
        WHERE ($2::int IS NULL OR branch_id = $2::int)
          AND quantity <= low_stock_threshold
      )
      SELECT 
        sw.revenue       AS cur_rev,
        pw.revenue       AS prev_rev,
        ls.low_cnt       AS low_stock_items
      FROM sales_window sw, prev_window pw, low_stock ls;
    `;

    const params = [start, branchId, prevStart];
    const { rows } = await query(sql, params);
    const r = rows[0] || {};

    const alerts = [];

    if (parseFloat(r.prev_rev || 0) > 0) {
      const diffPct = ((parseFloat(r.cur_rev || 0) - parseFloat(r.prev_rev || 0)) / parseFloat(r.prev_rev || 1)) * 100;
      if (diffPct <= -10) {
        alerts.push({ type: 'revenue-drop', severity: 'high', message: `Revenue down ${Math.abs(diffPct).toFixed(1)}% vs prior window` });
      } else if (diffPct <= -5) {
        alerts.push({ type: 'revenue-drop', severity: 'medium', message: `Revenue dipped ${Math.abs(diffPct).toFixed(1)}% vs prior window` });
      } else if (diffPct >= 15) {
        alerts.push({ type: 'revenue-spike', severity: 'info', message: `Revenue up ${diffPct.toFixed(1)}% vs prior window` });
      }
    }

    const lowCnt = parseInt(r.low_stock_items || 0, 10);
    if (lowCnt > 0) {
      alerts.push({
        type: 'low-stock',
        severity: lowCnt >= 10 ? 'high' : 'medium',
        message: `${lowCnt} item(s) at or below low-stock threshold`
      });
    }

    res.json(alerts);
  } catch (err) {
    console.error('analytics.getBusinessAlerts error:', err);
    res.status(500).json({ error: 'Failed to fetch business alerts' });
  }
};

export default {
  getOverview,
  getQuickStats,
  getQuickInsights,
  getRevenueTrend,
  getOrderTrend,
  getPerformanceSummary,
  getBusinessAlerts
};
