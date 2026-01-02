import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Paper, Typography, Button } from "@mui/material";
import { useTheme, useMediaQuery } from "@mui/material";
import ApiTable from "../components/table/ApiTable.jsx";
import ApiDialog from "../components/dialog/ApiDialog.jsx";
import ApiCard from "../components/card/ApiCard.jsx";

const API_URL = import.meta.env.VITE_API_URL;

function Api() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const [form, setForm] = useState({
    name: "",
    endpoint: "",
    prompt_template: "",
  });

  const fetchApis = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/prompt`, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      setRows(res.data.data);
    } catch (err) {
      console.error("Failed to fetch APIs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApi = async () => {
    try {
      await axios.post(`${API_URL}/api/prompt/generate`, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        name: form.name,
        endpoint: form.endpoint,
        prompt_template: form.prompt_template,
      });

      setOpen(false);
      setForm({
        name: "",
        endpoint: "",
        prompt_template: "",
      });

      fetchApis();
    } catch (err) {
      console.error("Failed to create API", err);
    }
  };

  useEffect(() => {
    fetchApis();
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
          APIs ({rows.length})
        </Typography>

        <Button variant="contained" onClick={() => setOpen(true)}>
          Create
        </Button>
      </Box>

      {/* Table & Card */}
      {isMobile ? (
        <ApiCard rows={rows} loading={loading} />
      ) : (
        <ApiTable rows={rows} loading={loading} />
      )}

      <ApiDialog
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleCreateApi}
        form={form}
        setForm={setForm}
      />
    </Paper>
  );
}

export default Api;
