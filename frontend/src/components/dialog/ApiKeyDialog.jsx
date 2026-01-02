import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

function ApiKeyDialog({
  open,
  onClose,
  form,
  setForm,
  onSubmit,
  loading = false,
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create New API Key</DialogTitle>

      <DialogContent>
        <TextField
          label="Name"
          fullWidth
          margin="normal"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <TextField
          label="Total Calls"
          type="number"
          fullWidth
          margin="normal"
          value={form.total_calls}
          onChange={(e) =>
            setForm({ ...form, total_calls: e.target.value })
          }
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={!form.name || !form.total_calls || loading}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ApiKeyDialog;
