// services/branchService.js
const axios = require('axios');

const client = axios.create({
  baseURL: process.env.BRANCH_SERVICE_BASE_URL, // e.g. http://branch-service:8080
  timeout: 2500,
});

async function resolveBranch(userId) {
  if (userId == null) throw new Error('user_id is required to resolve branch');
  try {
    const { data } = await client.get('/api/branches/resolve', { params: { userId } });
    // Accept both camelCase and snake_case just in case
    const branchId = data?.branchId ?? data?.branch_id;
    if (typeof branchId !== 'number') {
      throw new Error(`Branch service returned invalid payload: ${JSON.stringify(data)}`);
    }
    return branchId;
  } catch (err) {
    // Normalize error
    const msg = err?.response?.data ?? err.message;
    throw new Error(`Failed to resolve branch for user_id=${userId}: ${msg}`);
  }
}

module.exports = { resolveBranch };
