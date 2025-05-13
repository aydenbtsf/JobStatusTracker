import { Link, useLocation } from "wouter";
import { JobStatus } from "@shared/schema";
import { 
  Box, 
  Tabs, 
  Tab, 
  styled, 
  Chip,
  Typography
} from "@mui/material";

interface StatusCount {
  status: JobStatus | "all";
  count: number;
  label: string;
}

interface StatusTabsProps {
  counts: StatusCount[];
}

// Styled Tab component with custom underline and hover effects
const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '0.875rem',
  minWidth: 0,
  marginRight: theme.spacing(3),
  color: theme.palette.text.secondary,
  '&.Mui-selected': {
    color: theme.palette.primary.main,
  },
  '&:hover': {
    color: theme.palette.text.primary,
    opacity: 1,
  },
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

  // Determine which tab is active based on URL
  const getActiveTab = () => {
    if (location === "/" || !location.includes("status")) {
      return 0; // 'All' tab
    }
    
    const statusIndex = counts.findIndex(item => 
      location.includes(`status=${item.status}`) && item.status !== "all"
    );
    
    return statusIndex !== -1 ? statusIndex : 0;
  };

  // Generate URL for each tab
  const getTabLink = (status: StatusCount["status"]) => {
    if (status === "all") return "/";
    return `/?status=${status}`;
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
      <Tabs 
        value={getActiveTab()} 
        indicatorColor="primary"
        textColor="primary"
        aria-label="job status tabs"
      >
        {counts.map((item, index) => (
          <Tab
            key={item.status}
            component={Link}
            to={getTabLink(item.status)}
            value={index}
            label={
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
            }
          />
        ))}
      </Tabs>
    </Box>
  );
}