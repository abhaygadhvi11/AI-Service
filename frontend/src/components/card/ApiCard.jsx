import React from "react";
import {
  Box,
  Chip,
  Card,
  CardContent,
  CircularProgress,
  Tooltip,
  Typography,
} from "@mui/material";

function ApiCard({ rows, loading }) {
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography color="text.secondary">No APIs found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {rows.map((row) => (
        <Card
          key={row.id}
          variant="outlined"
          sx={{ borderRadius: 3 }}
        >
          <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            
            {/* Name */}
            <Typography fontWeight={600} variant="subtitle1">
              {row.name}
            </Typography>

            {/* Variables */}
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {row.variables.map((v) => (
                <Chip
                  key={v}
                  label={v}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>

            {/* Prompt */}
            <Tooltip title={row.prompt_template}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  cursor: "help",
                }}
              >
                {row.prompt_template}
              </Typography>
            </Tooltip>

            {/* Created Date */}
            <Typography variant="caption" color="text.secondary">
              Created: {new Date(row.created_at).toLocaleDateString()}
            </Typography>

          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

export default ApiCard;