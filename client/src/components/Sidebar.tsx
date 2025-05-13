import { Link, useRouter } from "@tanstack/react-router";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  IconButton,
} from "@mui/material";
import {
  LayoutDashboard,
  Waves,
  Menu as MenuIcon,
  ChevronLeft,
  Settings,
  HelpCircle,
} from "lucide-react";
import { useState, useEffect } from "react";

// Define the drawer width
const drawerWidth = 240;

export default function Sidebar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = useState(!isMobile);
  const router = useRouter();
  const currentPath = router.state.location.pathname;

  // Close drawer on mobile when location changes
  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    }
  }, [currentPath, isMobile]);

  // Update open state when screen size changes
  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  const menuItems = [
    { text: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/" },
  ];

  const drawer = (
    <>
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: [1],
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{ 
            fontWeight: "bold", 
            color: "primary.main", 
            display: "flex", 
            alignItems: "center" 
          }}
        >
          <Waves size={24} style={{ marginRight: 8 }} />
          Job Tracker
        </Typography>
        {isMobile && (
          <IconButton onClick={() => setOpen(false)}>
            <ChevronLeft />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List component="nav">
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              preload="intent"
              selected={currentPath === item.path}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "rgba(37, 99, 235, 0.08)",
                  borderRight: "3px solid",
                  borderColor: "primary.main",
                },
                "&.Mui-selected:hover": {
                  backgroundColor: "rgba(37, 99, 235, 0.12)",
                },
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: currentPath === item.path ? "primary.main" : "inherit",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
        <Divider sx={{ my: 1 }} />
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Settings size={20} />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <HelpCircle size={20} />
            </ListItemIcon>
            <ListItemText primary="Help & Support" />
          </ListItemButton>
        </ListItem>
      </List>
    </>
  );

  return (
    <>
      {/* App Bar Menu icon for mobile */}
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={() => setOpen(true)}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Sidebar drawer - different props for mobile vs desktop */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          zIndex: theme.zIndex.appBar - 1, // Ensure it sits below the AppBar
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            border: 'none',
            borderRight: '1px solid',
            borderColor: 'divider',
            position: 'fixed',
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}