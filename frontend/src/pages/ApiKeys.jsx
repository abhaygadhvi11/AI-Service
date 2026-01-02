import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Paper, Typography, Button } from "@mui/material";
import ApiKeyTable from "../components/table/ApiKeyTable.jsx";
import ApiKeyDialog from "../components/dialog/ApiKeyDialog.jsx";
import ApiKeyCard from "../components/card/ApiKeyCard.jsx";
import { useMediaQuery, useTheme } from "@mui/material";

const API_URL = import.meta.env.VITE_API_URL;

function ApiKeys() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", total_calls: 100 });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const fetchApiKeys = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/keys`, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      setRows(res.data.data);
      setTotal(res.data.pagination.total);
    } catch (err) {
      console.error("Failed to fetch API keys", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    try {
      await axios.post(`${API_URL}/api/keys/generate`, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        name: form.name,
        total_calls: Number(form.total_calls),
      });
      setOpen(false);
      setForm({ name: "", total_calls: 100 });
      fetchApiKeys();
    } catch (err) {
      console.error("Failed to create API key", err);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  return (
    <Paper sx={{ p: 2, borderRadius: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          API Keys ({total})
        </Typography>

        <Button variant="contained" onClick={() => setOpen(true)}>
          Create
        </Button>
      </Box>

      {/* Table & Card */}
      {isMobile ? (
        <ApiKeyCard rows={rows} loading={loading} />
      ) : (
        <ApiKeyTable rows={rows} loading={loading} />
      )}

      {/* Dialog */}
      <ApiKeyDialog
        open={open}
        onClose={() => setOpen(false)}
        form={form}
        setForm={setForm}
        onSubmit={handleCreateKey}
        loading={loading}
      />
    </Paper>
  );
}

export default ApiKeys;
