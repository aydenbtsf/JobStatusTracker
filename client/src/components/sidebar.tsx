import { Link, useLocation } from "wouter";
import { Home, ClipboardList, CloudLightning, Settings } from "lucide-react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  styled
} from "@mui/material";

const DRAWER_WIDTH = 240;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: DRAWER_WIDTH,
    boxSizing: 'border-box',
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.primary.contrastText,
  },
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 2),
  height: 64,
  backgroundColor: theme.palette.primary.main,
}));

const Logo = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: theme.palette.primary.contrastText,
}));

const SidebarNavItem = ({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) => {
  const [location] = useLocation();
  const isActive = location === href;
  const theme = useTheme();

  return (
    <ListItem disablePadding>
      <ListItemButton
        component={Link}
        href={href}
        selected={isActive}
        sx={{
          borderRadius: 1,
          my: 0.5,
          color: isActive ? 'white' : 'rgba(255, 255, 255, 0.8)',
          backgroundColor: isActive ? `${theme.palette.primary.main} !important` : 'transparent',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          },
        }}
      >
        <ListItemIcon sx={{ 
          minWidth: 40, 
          color: isActive ? 'white' : 'rgba(255, 255, 255, 0.8)',
        }}>
          {icon}
        </ListItemIcon>
        <ListItemText 
          primary={children} 
          primaryTypographyProps={{ 
            fontWeight: isActive ? 500 : 400,
            fontSize: '0.875rem',
          }} 
        />
      </ListItemButton>
    </ListItem>
  );
};

export function Sidebar() {
  return (
    <StyledDrawer
      variant="permanent"
      sx={{
        display: { xs: 'none', sm: 'block' },
      }}
    >
      <LogoContainer>
        <Logo variant="h6">Job Tracker</Logo>
      </LogoContainer>
      <Box sx={{ p: 2, overflow: 'auto' }}>
        <List sx={{ p: 0 }}>
          <SidebarNavItem 
            href="/" 
            icon={<Home size={20} />}
          >
            Dashboard
          </SidebarNavItem>
          <SidebarNavItem 
            href="/jobs" 
            icon={<ClipboardList size={20} />}
          >
            Jobs
          </SidebarNavItem>
          <SidebarNavItem 
            href="/forecasts" 
            icon={<CloudLightning size={20} />}
          >
            Forecasts
          </SidebarNavItem>
          <SidebarNavItem 
            href="/settings" 
            icon={<Settings size={20} />}
          >
            Settings
          </SidebarNavItem>
        </List>
      </Box>
    </StyledDrawer>
  );
}