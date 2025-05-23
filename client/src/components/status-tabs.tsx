import { Link, useRouter } from "@tanstack/react-router";
import { JobStatus } from "@/schema";
import { 
  Box, 
  Chip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

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
  display: 'flex',
  overflowX: 'auto',
}));

const TabBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ theme, active }) => ({
  padding: theme.spacing(1.5, 2),
  marginRight: theme.spacing(2),
  borderBottom: '2px solid',
  borderBottomColor: active ? theme.palette.primary.main : 'transparent',
  color: active ? theme.palette.primary.main : theme.palette.text.secondary,
  fontWeight: active ? 500 : 400,
  cursor: 'pointer',
  '&:hover': {
    color: theme.palette.primary.main,
    borderBottomColor: active ? theme.palette.primary.main : theme.palette.primary.light,
  },
  transition: 'all 0.2s',
}));

// Helper to get appropriate color based on status
function getStatusColor(status: StatusCount["status"]): "default" | "primary" | "secondary" | "success" | "error" | "warning" | "info" {
  switch (status) {
    case "pending": return "warning";
    case "processing": return "info";
    case "completed": return "success";
    case "failed": return "error";
    case "all": default: return "primary";
  }
}

export function StatusTabs({ counts }: StatusTabsProps) {
  const router = useRouter();
  const location = router.state.location.pathname + router.state.location.search;

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
      {counts.map((item) => (
        <Link to="/" search={status => item.status === "all" ? {} : { status: item.status }} key={item.status}>
          <TabBox active={isActive(item.status)}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography component="span" variant="body2">
                {item.label}
              </Typography>
              <Chip
                label={item.count}
                size="small"
                color={getStatusColor(item.status)}
                sx={{ ml: 1 }}
              />
            </Box>
          </TabBox>
        </Link>
      ))}
    </TabsContainer>
  );
}
