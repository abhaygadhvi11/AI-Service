const express = require('express');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const pool = require('../config/database');

const router = express.Router();

// Generate new API key
router.post('/generate', async (req, res) => {
  try {
    const { total_calls, name } = req.body;

    if (!total_calls || total_calls <= 0) {
      return res.status(400).json({ error: 'total_calls must be a positive number' });
    }

    const apiKey = crypto.randomBytes(32).toString('hex');
    
    const query = `
      INSERT INTO api_keys (apikey, name, total_calls, used_calls, is_active, created_by)
      VALUES ($1, $2, $3, 0, true, $4)
      RETURNING id, apikey, name, total_calls, used_calls, is_active, created_at
    `;

    const result = await pool.query(query, [apiKey, name || 'Unnamed Key', total_calls, 'system']);
    
    res.status(200).json({
      message: 'API Key generated successfully',
      key: result.rows[0],
      warning: 'Save your API key securely. You won\'t be able to see it again!'
    });
  } catch (error) {
    console.error('Error generating API key:', error);
    res.status(500).json({ error: 'Failed to generate API key' });
  }
});

// Get all API keys (with pagination)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

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
        updated_at, 
        last_used_at
      FROM api_keys
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const countQuery = 'SELECT COUNT(*) FROM api_keys';
    
    const [result, countResult] = await Promise.all([
      pool.query(query, [limit, offset]),
      pool.query(countQuery)
    ]);

    res.json({
      data: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page,
        limit,
        pages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    res.status(500).json({ error: 'Failed to fetch API keys' });
  }
});

// Get single API key details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

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
        updated_at, 
        last_used_at
      FROM api_keys
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'API key not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching API key:', error);
    res.status(500).json({ error: 'Failed to fetch API key' });
  }
});

// Get API key usage statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;

    const keyQuery = `
      SELECT id, apikey, name, total_calls, used_calls, 
             (total_calls - used_calls) as remaining_calls
      FROM api_keys
      WHERE id = $1
    `;

    const callsQuery = `
      SELECT 
        COUNT(*) as total_calls,
        SUM(CASE WHEN status_code >= 200 AND status_code < 300 THEN 1 ELSE 0 END) as successful_calls,
        SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as failed_calls,
        COUNT(DISTINCT endpoint) as unique_endpoints,
        AVG(execution_time_ms) as avg_execution_time
      FROM api_calls
      WHERE apikey_id = $1
    `;

    const [keyResult, callsResult] = await Promise.all([
      pool.query(keyQuery, [id]),
      pool.query(callsQuery, [id])
    ]);

    if (keyResult.rows.length === 0) {
      return res.status(404).json({ error: 'API key not found' });
    }

    res.json({
      key_info: keyResult.rows[0],
      statistics: callsResult.rows[0]
    });
  } catch (error) {
    console.error('Error fetching API key stats:', error);
    res.status(500).json({ error: 'Failed to fetch API key statistics' });
  }
});

// Revoke/Disable API key
router.patch('/:id/revoke', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE api_keys
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, name, is_active, updated_at
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'API key not found' });
    }

    res.json({ message: 'API key revoked successfully', key: result.rows[0] });
  } catch (error) {
    console.error('Error revoking API key:', error);
    res.status(500).json({ error: 'Failed to revoke API key' });
  }
});

// Reactivate/Un-revoke API key
router.patch('/:id/reactivate', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE api_keys
      SET is_active = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, name, is_active, updated_at
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'API key not found' });
    }

    res.json({ message: 'API key reactivated successfully', key: result.rows[0] });
  } catch (error) {
    console.error('Error reactivating API key:', error);
    res.status(500).json({ error: 'Failed to reactivate API key' });
  }
});

// Delete API key
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM api_keys WHERE id = $1 RETURNING id, name';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'API key not found' });
    }

    res.json({ message: 'API key deleted successfully', key: result.rows[0] });
  } catch (error) {
    console.error('Error deleting API key:', error);
    res.status(500).json({ error: 'Failed to delete API key' });
  }
});

module.exports = router;
