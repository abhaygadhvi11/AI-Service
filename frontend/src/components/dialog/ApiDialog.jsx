import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Chip,
  Box,
  Typography,
} from "@mui/material";

const extractVariables = (prompt) => {
  const regex = /{{\s*([\w]+)\s*}}/g;
  const vars = new Set();
  let match;

  while ((match = regex.exec(prompt)) !== null) {
    vars.add(match[1]);
  }

  return Array.from(vars);
};

function ApiDialog({ open, onClose, onSubmit, form, setForm }) {
  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const variables = extractVariables(form.prompt_template);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Create New API</DialogTitle>

      <DialogContent sx={{ mt: 1 }}>
        <TextField
          label="API Name"
          fullWidth
          margin="normal"
          value={form.name}
          onChange={handleChange("name")}
        />
        
        <TextField
          label="Prompt Template"
          fullWidth
          multiline
          minRows={6}
          margin="normal"
          value={form.prompt_template}
          onChange={handleChange("prompt_template")}
          placeholder="Generate item for {{category}} under {{price}}"
        />

        {variables.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">
              Variables
            </Typography>

            <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
              {variables.map((v) => (
                <Chip key={v} label={`${v}`} size="small" />
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={
            !form.name ||
            !form.prompt_template
          }
        >
          Create API
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ApiDialog;
