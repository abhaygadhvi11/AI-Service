const pool = require('../config/database');

async function validateApiKey(req, res, next) {
  try {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;

    if (!apiKey) {
      return res.status(401).json({ 
        error: 'API key is required',
        hint: 'Provide API key via X-API-Key header or api_key query parameter'
      });
    }

    // Query the database for the API key
    const query = `
      SELECT 
        id, 
        apikey, 
        name,
        total_calls, 
        used_calls, 
        (total_calls - used_calls) as remaining_calls,
        is_active, 
        created_at, 
        last_used_at
      FROM api_keys
      WHERE apikey = $1
    `;

    const result = await pool.query(query, [apiKey]);

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: 'Invalid API key',
        reason: 'API key does not exist or has been revoked'
      });
    }

    const keyData = result.rows[0];

    // Check if key is active
    if (!keyData.is_active) {
      return res.status(403).json({ 
        error: 'API key is revoked or disabled',
        reason: 'This API key is no longer active'
      });
    }

    // Attach key data to request for later use
    req.apiKeyData = keyData;
    next();
  } catch (error) {
    console.error('Error validating API key:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
}

module.exports = { validateApiKey };
