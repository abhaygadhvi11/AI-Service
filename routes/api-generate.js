const express = require("express");
const pool = require("../config/database");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, endpoint, prompt_template, variables } = req.body;

    const result = await pool.query(
      `INSERT INTO custom_apis (name, endpoint, prompt_template, variables)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, endpoint, prompt_template, JSON.stringify(variables)]
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

module.exports = router;
