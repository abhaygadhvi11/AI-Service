import React from "react";
import {
  AppBar,
  Avatar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  VpnKey as ApiKeyIcon,
  Lightbulb as PromptIcon
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../assets/ai_service.svg";

const drawerWidth = 260;

function AppLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const drawer = (
    <Box>
      {/* Logo / App Name */}
      <Toolbar sx={{ px: 2 }}>
        <img src={Logo} alt="AI Service Logo" style={{ height: 60 }} />
      </Toolbar>

      <Divider />

      {/* Navigation */}
      <List sx={{ px: 1, py: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            selected={location.pathname === "/dashboard"}
            onClick={() => handleNavigate("/dashboard")}
            sx={{ borderRadius: 1 }}
          >
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding sx={{ mt: 0.5 }}>
          <ListItemButton
            selected={location.pathname === "/api"}
            onClick={() => handleNavigate("/api")}
            sx={{ borderRadius: 1 }}
          >
            <ListItemIcon>
              <PromptIcon />
            </ListItemIcon>
            <ListItemText primary="Prompts" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding sx={{ mt: 0.5 }}>
          <ListItemButton
            selected={location.pathname === "/api-keys"}
            onClick={() => handleNavigate("/api-keys")}
            sx={{ borderRadius: 1 }}
          >
            <ListItemIcon>
              <ApiKeyIcon />
            </ListItemIcon>
            <ListItemText primary="API Keys" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: "#fff",
          color: "text.primary",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", bgcolor: "#fff" }}>
          {/* Left side (hamburger / title later) */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>
          </Box>

          <Box sx={{ flexGrow: 1 }} />
          
          {/* Right side (User Avatar) */}
          <Box>
            <IconButton>
              <Avatar sx={{ width: 32, height: 32, bgcolor: "#1976d2", color: "#fff" }}>A</Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box component="nav" sx={{ width: { sm: drawerWidth } }}>
        {/* Mobile */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              borderRight: "1px solid",
              borderColor: "divider",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          bgcolor: "#f9fafb",
          minHeight: "100vh",
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}

export default AppLayout;

