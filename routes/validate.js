const express = require("express");
const pool = require("../config/database");

const router = express.Router();

router.post("/", async (req, res) => {
  const start = Date.now();

  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  try {
    const apiKey = req.headers["x-api-key"];
    const endpoint = req.body.endpoint || req.originalUrl;
    const method = req.body.method || req.method;
    const requestBody = req.body.request_body || null;
    const statusCode = req.body.status_code || 200;
    const responseBody = req.body.response_body || { valid: true };

    if (!apiKey) {
      return res
        .status(400)
        .json({ valid: false, error: "API key is required" });
    }

    const result = await pool.query(
      `SELECT id, apikey, total_calls, used_calls, is_active
       FROM api_keys WHERE apikey = $1`,
      [apiKey]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ valid: false, error: "Invalid API key" });
    }

    const key = result.rows[0];

    if (!key.is_active) {
      return res.status(403).json({ valid: false, error: "API key disabled" });
    }

    await pool.query(
      `UPDATE api_keys SET used_calls = used_calls + 1 WHERE apikey = $1`,
      [apiKey]
    );

    const executionTime = Date.now() - start;

    await pool.query(
      `INSERT INTO api_calls (
        apikey_id,
        api_key,
        endpoint,
       method,
        status_code,
        request_body,
        response_body,
        error_message,
        ip_address,
        user_agent,
        execution_time_ms
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        key.id,
        apiKey,
        endpoint,
        method,
        statusCode,
        JSON.stringify(requestBody),
        JSON.stringify(responseBody),
        null,
        clientIp,
        req.get("user-agent"),
        executionTime,
      ]
    );

    res.json({
      valid: true,
      data: key,
    });
  } catch (error) {
    console.error("Validate API Key error:", error);

    res
      .status(500)
      .json({ valid: false, error: "Server error validating API key" });
  }
});

module.exports = router;
