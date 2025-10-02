// utils/queryHelpers.js
const buildWhereClause = (filters) => {
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      conditions.push(`${key} = $${paramIndex}`);
      params.push(value);
      paramIndex += 1;
    }
  });

  return {
    whereClause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    params
  };
};

const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, '');
  }
  return input;
};

export { buildWhereClause, sanitizeInput };
export default { buildWhereClause, sanitizeInput };
