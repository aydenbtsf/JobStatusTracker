import { Link, useLocation } from "wouter";
import { JobStatus } from "@shared/schema";
import { 
  Box, 
  Tabs, 
  Tab, 
  styled, 
  Chip,
  Typography,
  ButtonBase
} from "@mui/material";

interface StatusCount {
  status: JobStatus | "all";
  count: number;
  label: string;
}

interface StatusTabsProps {
  counts: StatusCount[];
}

// Styled components
const TabsContainer = styled(Box)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(3),
}));

const TabsWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  overflowX: 'auto',
}));

const TabItem = styled(ButtonBase, {
  shouldForwardProp: (prop) => prop !== 'active'
})<{ active?: boolean }>(({ theme, active }) => ({
  padding: theme.spacing(1.5, 2),
  marginRight: theme.spacing(1),
  borderBottom: '2px solid',
  borderBottomColor: active ? theme.palette.primary.main : 'transparent',
  color: active ? theme.palette.primary.main : theme.palette.text.secondary,
  fontWeight: active ? 500 : 400,
  textTransform: 'none',
  '&:hover': {
    color: theme.palette.primary.main,
    borderBottomColor: active ? theme.palette.primary.main : theme.palette.primary.light,
    backgroundColor: 'transparent',
  },
  transition: 'all 0.2s',
}));

// Helper to get appropriate variant based on status
function getStatusColorVariant(status: StatusCount["status"]): "default" | "primary" | "secondary" | "success" | "error" | "warning" | "info" {
  switch (status) {
    case "pending": return "warning";
    case "processing": return "info";
    case "completed": return "success";
    case "failed": return "error";
    case "all": default: return "primary";
  }
}

export function StatusTabs({ counts }: StatusTabsProps) {
  const [location] = useLocation();

  // Generate URL for each tab
  const getTabLink = (status: StatusCount["status"]) => {
    if (status === "all") return "/";
    return `/?status=${status}`;
  };
  
  // Check if tab is active
  const isActive = (status: StatusCount["status"]) => {
    if (status === "all") {
      return location === "/" || !location.includes("status");
    }
    return location.includes(`status=${status}`);
  };

  return (
    <TabsContainer>
      <TabsWrapper>
        {counts.map((item) => (
          <TabItem
            key={item.status}
            component={Link}
            href={getTabLink(item.status)}
            active={isActive(item.status)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography component="span" variant="body2">
                {item.label}
              </Typography>
              <Chip
                label={item.count}
                size="small"
                color={getStatusColorVariant(item.status)}
                sx={{ ml: 1 }}
              />
            </Box>
          </TabItem>
        ))}
      </TabsWrapper>
    </TabsContainer>
  );
}