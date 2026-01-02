import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import ApiKeys from "./pages/ApiKeys";
import Api from "./pages/Api";

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/api-keys" element={<ApiKeys />} />
        <Route path="/api" element={<Api />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
