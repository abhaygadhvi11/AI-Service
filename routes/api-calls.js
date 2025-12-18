const express = require('express');
const pool = require('../config/database');
const { validateApiKey } = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

// Example protected API endpoint that tracks usage
router.post("/execute", validateApiKey, async (req, res) => {
  try {
    const startTime = Date.now();
    const { endpoint, title } = req.body;
    const apiKeyData = req.apiKeyData; 

    const geminiKey = process.env.GEMINI_API_KEY; 

    if (!geminiKey) {
      return res.status(500).json({ error: "Gemini API key missing in .env" });
    }

    if (!endpoint) {
      return res.status(400).json({ error: "endpoint parameter is required" });
    }

    // Check API quota
    if (apiKeyData.remaining_calls <= 0) {
      await logApiCall(
        apiKeyData.id,
        apiKeyData.apikey,
        endpoint,
        "POST",
        429,
        req.body,
        { error: "quota_exceeded" },
        "Quota exceeded",
        req.ip,
        req.get("user-agent"),
        0
      );

      return res.status(429).json({
        error: "Quota exceeded",
        remaining_calls: 0,
        total_calls: apiKeyData.total_calls,
        used_calls: apiKeyData.used_calls,
      });
    }

    const prompt = `
      Generate a clear, helpful, well-structured task description and instructions for completing the task.
      Task title: "${title}"

      Output should be:
      - 10 to 15 sentences
      - No bullet points
      - Professional tone
    `;
    let aiResponse = "";
    let statusCode = 200;
    let errorMsg = null;

    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const result = await model.generateContent(prompt);
      aiResponse = result.response.text();
    } catch (err) {
      statusCode = 500;
      errorMsg = err.message;
      aiResponse = null;
    }

    const executionTime = Date.now() - startTime;

    await logApiCall(
      apiKeyData.id,
      apiKeyData.apikey,
      endpoint,
      "POST",
      statusCode,
      req.body,
      { prompt, ai_response: aiResponse },
      errorMsg,
      req.ip,
      req.get("user-agent"),
      executionTime
    );

    // Update usage counters
    const updateQuery = `
      UPDATE api_keys
      SET used_calls = used_calls + 1,
          updated_at = CURRENT_TIMESTAMP,
          last_used_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING used_calls, (total_calls - used_calls) AS remaining_calls
    `;

    const updateResult = await pool.query(updateQuery, [apiKeyData.id]);

    return res.status(statusCode).json({
      predefined_prompt: prompt,
      ai_response: aiResponse,
      generated_description: aiResponse,
      execution_time_ms: executionTime,
      quota: {
        used: updateResult.rows[0].used_calls,
        remaining: updateResult.rows[0].remaining_calls,
        total: apiKeyData.total_calls,
      },
    });
  } catch (error) {
    console.error("Error executing API call:", error);
    res.status(500).json({ error: "Failed to execute API call" });
  }
});

router.post("/items", validateApiKey, async (req, res) => {
  const startTime = Date.now();

  try {
    const { itemName, description, spendCategory } = req.body;
    const apiKeyData = req.apiKeyData;
    const geminiKey = process.env.GEMINI_API_KEY_2;

    if (!geminiKey) {
      return res.status(500).json({ error: "Gemini API key missing in .env" });
    }

    if (!itemName || !spendCategory) {
      return res.status(400).json({
        error: "itemName and spendCategory are required",
      });
    }

    // Quota check
    if (apiKeyData.remaining_calls <= 0) {
      await logApiCall(
        apiKeyData.id,
        apiKeyData.apikey,
        "/items",
        "POST",
        429,
        req.body,
        { error: "quota_exceeded" },
        "Quota exceeded",
        req.ip,
        req.get("user-agent"),
        0
      );

      return res.status(429).json({
        error: "Quota exceeded",
        remaining_calls: 0,
        total_calls: apiKeyData.total_calls,
        used_calls: apiKeyData.used_calls,
      });
    }

    const prompt = `
      You are an expert product content generator.

      Input:
      - Item Name: "${itemName}"
      - Description (optional): "${description || "N/A"}"
      - Spend Category: "${spendCategory}"

      Generate a STRICTLY VALID JSON response in the following format only.
      Do NOT include markdown, explanations, or extra text.

      {
        "detailed_description": "6 to 8 professional sentences describing the item, its usage, benefits, and relevance to the spend category.",
        "specifications": [
          { "attribute": "Attribute name", "potential_values": ["Value 1", "Value 2"] }
        ]
      }

      Rules:
      - Description must be natural, professional, and procurement-friendly
      - Include 5 to 7 realistic specifications
      - Attribute names must be concise
      - Potential values must be realistic and commonly used
    `;

    let aiResponse = null;
    let parsedResponse = null;
    let statusCode = 200;
    let errorMsg = null;

    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const result = await model.generateContent(prompt);
      aiResponse = result.response.text();

      // Ensure valid JSON
      parsedResponse = JSON.parse(aiResponse);
    } catch (err) {
      statusCode = 500;
      errorMsg = err.message;
    }

    const executionTime = Date.now() - startTime;

    await logApiCall(
      apiKeyData.id,
      apiKeyData.apikey,
      "/items",
      "POST",
      statusCode,
      req.body,
      { prompt, ai_response: parsedResponse },
      errorMsg,
      req.ip,
      req.get("user-agent"),
      executionTime
    );

    // Update usage
    const updateQuery = `
      UPDATE api_keys
      SET used_calls = used_calls + 1,
          updated_at = CURRENT_TIMESTAMP,
          last_used_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING used_calls, (total_calls - used_calls) AS remaining_calls
    `;

    const updateResult = await pool.query(updateQuery, [apiKeyData.id]);

    return res.status(statusCode).json({
      item_name: itemName,
      spend_category: spendCategory,
      result: parsedResponse,
      execution_time_ms: executionTime,
      quota: {
        used: updateResult.rows[0].used_calls,
        remaining: updateResult.rows[0].remaining_calls,
        total: apiKeyData.total_calls,
      },
    });
  } catch (error) {
    console.error("Error in /items route:", error);
    return res.status(500).json({ error: "Failed to generate item details" });
  }
});

// Get API call logs for a specific key
router.get('/logs', validateApiKey, async (req, res) => {
  try {
    const { id } = req.apiKeyData;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        id,
        endpoint,
        method,
        status_code,
        execution_time_ms,
        ip_address,
        created_at
      FROM api_calls
      WHERE apikey_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = 'SELECT COUNT(*) FROM api_calls WHERE apikey_id = $1';

    const [logsResult, countResult] = await Promise.all([
      pool.query(query, [id, limit, offset]),
      pool.query(countQuery, [id])
    ]);

    res.json({
      logs: logsResult.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page,
        limit,
        pages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching API logs:', error);
    res.status(500).json({ error: 'Failed to fetch API logs' });
  }
});

// Get all API calls (admin endpoint - no key required for now)
router.get('/admin/all-calls', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        ac.id,
        ak.name,
        ak.apikey,
        ac.endpoint,
        ac.method,
        ac.status_code,
        ac.execution_time_ms,
        ac.created_at
      FROM api_calls ac
      JOIN api_keys ak ON ac.apikey_id = ak.id
      ORDER BY ac.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const countQuery = 'SELECT COUNT(*) FROM api_calls';

    const [callsResult, countResult] = await Promise.all([
      pool.query(query, [limit, offset]),
      pool.query(countQuery)
    ]);

    res.json({
      data: callsResult.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page,
        limit,
        pages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching all API calls:', error);
    res.status(500).json({ error: 'Failed to fetch API calls' });
  }
});

// Get API statistics
router.get('/admin/statistics', async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(DISTINCT apikey_id) as active_keys,
        COUNT(*) as total_calls,
        SUM(CASE WHEN status_code >= 200 AND status_code < 300 THEN 1 ELSE 0 END) as successful_calls,
        SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as failed_calls,
        AVG(execution_time_ms) as avg_execution_time,
        MAX(execution_time_ms) as max_execution_time,
        MIN(execution_time_ms) as min_execution_time
      FROM api_calls
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    `;

    const result = await pool.query(query);

    res.json({
      period: 'Last 24 hours',
      statistics: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Helper function to log API calls
async function logApiCall(apikey_id, api_key, endpoint, method, status_code, request_body, response_body, error_message, ip_address, user_agent, execution_time_ms) {
  try {
    const query = `
      INSERT INTO api_calls 
        (apikey_id, api_key, endpoint, method, status_code, request_body, response_body, error_message, ip_address, user_agent, execution_time_ms)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `;

    await pool.query(query, [
      apikey_id,
      api_key,
      endpoint,
      method,
      status_code,
      JSON.stringify(request_body),
      JSON.stringify(response_body),
      error_message,
      ip_address,
      user_agent,
      execution_time_ms
    ]);
  } catch (error) {
    console.error('Error logging API call:', error);
  }
}

module.exports = router;
