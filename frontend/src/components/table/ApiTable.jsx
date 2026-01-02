import React from "react";
import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Tooltip,
} from "@mui/material";

function ApiTable({ rows, loading }) {
  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 3,
        border: "1px solid #e2e2e2ff",
        maxHeight: 520,
      }}
    >
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            {[
              "Name",
              "Prompt",
              "Variables",
              "Created",
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
              <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                <CircularProgress />
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">
                  No APIs found
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id} hover>
                {/* Name */}
                <TableCell>
                  <Typography fontWeight={500}>{row.name}</Typography>
                </TableCell>

                {/* Prompt */}
                <TableCell sx={{ maxWidth: 450 }}>
                  <Tooltip title={row.prompt_template}>
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{ cursor: "help" }}
                    >
                      {row.prompt_template}
                    </Typography>
                  </Tooltip>
                </TableCell>

                {/* Variables */}
                <TableCell>
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
                </TableCell>

                {/* Created */}
                <TableCell>
                  {new Date(row.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default ApiTable;
