import React from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  LinearProgress,
  CircularProgress,
  Tooltip,
  IconButton,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

function ApiKeyCard({ rows, loading }) {
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
        <Typography color="text.secondary">
          No API keys found
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {rows.map((row) => {
        const usagePercent =
          (row.used_calls / row.total_calls) * 100;

        return (
          <Card
            key={row.id}
            variant="outlined"
            sx={{ borderRadius: 3 }}
          >
            <CardContent
              sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
            >
              {/* Header: Name + Status */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography fontWeight={600} variant="subtitle1">
                  {row.name}
                </Typography>

                <Chip
                  label={row.is_active ? "Active" : "Inactive"}
                  color={row.is_active ? "success" : "default"}
                  size="small"
                />
              </Box>

              {/* API Key */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography fontFamily="monospace" fontSize={13}>
                  {row.apikey.slice(0, 6)}****{row.apikey.slice(-4)}
                </Typography>

                <Tooltip title="Copy API key">
                  <IconButton
                    size="small"
                    onClick={() =>
                      navigator.clipboard.writeText(row.apikey)
                    }
                  >
                    <ContentCopyIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Usage */}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Usage: {row.used_calls} / {row.total_calls}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={usagePercent}
                  sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
                />
              </Box>

              {/* Remaining */}
              <Typography
                fontWeight={500}
                color={
                  row.remaining_calls < 100
                    ? "error.main"
                    : "success.main"
                }
              >
                Remaining: {row.remaining_calls}
              </Typography>

              {/* Dates */}
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="caption" color="text.secondary">
                  Created:{" "}
                  {new Date(row.created_at).toLocaleDateString()}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Last used:{" "}
                  {row.last_used_at
                    ? new Date(row.last_used_at).toLocaleDateString()
                    : "Never"}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}

export default ApiKeyCard;
