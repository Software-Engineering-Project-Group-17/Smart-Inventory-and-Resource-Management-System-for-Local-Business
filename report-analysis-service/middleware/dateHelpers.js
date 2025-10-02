// utils/dateHelpers.js
const getDateRange = (period) => {
  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(startDate.getDate() - 90);
      break;
    case '1m':
    case '3m':
    case '6m':
    case '12m': {
      const months = parseInt(period, 10); // "3m" -> 3
      startDate.setMonth(startDate.getMonth() - months);
      break;
    }
    case '1y':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate.setDate(startDate.getDate() - 30);
  }

  return { startDate, endDate };
};

const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  switch (format) {
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'MM/DD':
      return `${month}/${day}`;
    case 'Mon':
      return d.toLocaleString('en', { month: 'short' });
    default:
      return d.toISOString();
  }
};

export { getDateRange, formatDate };
export default { getDateRange, formatDate };
