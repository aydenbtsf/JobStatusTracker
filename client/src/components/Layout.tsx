import { ReactNode } from "react";
import { Box, AppBar, Toolbar, Typography, IconButton, useMediaQuery, useTheme } from "@mui/material";
import { RefreshCw, Bell } from "lucide-react";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export default function Layout({ children, title, onRefresh, isLoading = false }: LayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const drawerWidth = 240;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: "background.default",
        }}
      >
        <AppBar 
          position="static" 
          elevation={0} 
          color="default"
          sx={{ 
            bgcolor: 'background.paper', 
            borderBottom: '1px solid', 
            borderColor: 'divider'
          }}
        >
          <Toolbar>
            {/* Mobile sidebar toggle already included in the Sidebar component */}
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                flexGrow: 1, 
                color: 'text.primary',
                fontWeight: 'medium',
                ml: isMobile ? 0 : 1
              }}
            >
              {title || "Job Tracking System"}
            </Typography>
            
            {onRefresh && (
              <IconButton 
                onClick={onRefresh} 
                disabled={isLoading}
                title="Refresh data"
                color="primary"
                sx={{ ml: 1 }}
              >
                <RefreshCw size={20} />
              </IconButton>
            )}
            
            <IconButton 
              color="primary"
              title="Notifications"
              sx={{ ml: 1 }}
            >
              <Bell size={20} />
            </IconButton>
          </Toolbar>
        </AppBar>
        
        {/* Page content */}
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}