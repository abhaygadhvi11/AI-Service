import React from "react";
import {
  Box,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  LinearProgress,
  Tooltip,
  IconButton,
  Paper,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

function ApiKeyTable({ rows, loading }) {
  return (
    <TableContainer
      component={Paper}
      sx={{ maxHeight: 520, borderRadius: 3, border: "1px solid #e2e2e2ff" }}
    >
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            {[
              "Name",
              "API Key",
              "Usage",
              "Remaining",
              "Status",
              "Created",
              "Last Used",
            ].map((head) => (
              <TableCell
                key={head}
                sx={{
                  fontWeight: 600,
                  backgroundColor: "#e5eeffff",
                }}
              >
                {head}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                <CircularProgress />
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">
                  No API keys found
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => {
              const usagePercent =
                (row.used_calls / row.total_calls) * 100;

              return (
                <TableRow key={row.id} hover>
                  {/* Name */}
                  <TableCell>
                    <Typography fontWeight={500}>{row.name}</Typography>
                  </TableCell>

                  {/* API Key */}
                  <TableCell>
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
                  </TableCell>

                  {/* Usage */}
                  <TableCell sx={{ minWidth: 160 }}>
                    <Typography variant="caption" color="text.secondary">
                      {row.used_calls} / {row.total_calls}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={usagePercent}
                      sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
                    />
                  </TableCell>

                  {/* Remaining */}
                  <TableCell>
                    <Typography
                      fontWeight={500}
                      color={
                        row.remaining_calls < 100
                          ? "error.main"
                          : "success.main"
                      }
                    >
                      {row.remaining_calls}
                    </Typography>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Chip
                      label={row.is_active ? "Active" : "Inactive"}
                      color={row.is_active ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>

                  {/* Created */}
                  <TableCell>
                    {new Date(row.created_at).toLocaleDateString()}
                  </TableCell>

                  {/* Last Used */}
                  <TableCell>
                    {row.last_used_at ? (
                      new Date(row.last_used_at).toLocaleDateString()
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Never
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default ApiKeyTable;
