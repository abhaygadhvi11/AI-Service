const express = require("express");
const pool = require("../config/database");
const router = express.Router();

function extractVariables(prompt) {
  const regex = /{{\s*([\w]+)\s*}}/g;
  const variables = new Set();
  let match;
  while ((match = regex.exec(prompt)) !== null) {
    variables.add(match[1]);
  }
  return Array.from(variables);
}

router.post("/generate", async (req, res) => {
  try {
    const { name, prompt_template } = req.body;

    const variables = extractVariables(prompt_template);

    const result = await pool.query(
      `INSERT INTO custom_apis (name, prompt_template, variables)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, prompt_template, JSON.stringify(variables)]
    );

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error("Error inserting custom API:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create API"
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM custom_apis ORDER BY created_at DESC`);
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error("Error fetching custom APIs:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch APIs"
    });
  }
});

module.exports = router;
