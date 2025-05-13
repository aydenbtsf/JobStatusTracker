import * as React from "react";
import { Chip } from "@mui/material";
import { styled } from "@mui/material/styles";

export interface BadgeProps {
  variant?: "primary" | "secondary" | "success" | "error" | "warning" | "info";
  children?: React.ReactNode;
  className?: string;
}

// Create a simple Chip component with our custom styling
const StyledChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== "badgeVariant",
})<{ badgeVariant?: string }>(({ theme, badgeVariant = "primary" }) => {
  // Choose the appropriate colors based on the variant
  let backgroundColor;
  let color;

  switch (badgeVariant) {
    case "primary":
      backgroundColor = theme.palette.primary.light;
      color = theme.palette.primary.dark;
      break;
    case "secondary":
      backgroundColor = theme.palette.secondary.light;
      color = theme.palette.secondary.dark;
      break;
    case "success":
      backgroundColor = theme.palette.success.light;
      color = theme.palette.success.dark;
      break;
    case "error":
      backgroundColor = theme.palette.error.light;
      color = theme.palette.error.dark;
      break;
    case "warning":
      backgroundColor = theme.palette.warning.light;
      color = theme.palette.warning.dark;
      break;
    case "info":
      backgroundColor = theme.palette.info.light;
      color = theme.palette.info.dark;
      break;
    default:
      backgroundColor = theme.palette.primary.light;
      color = theme.palette.primary.dark;
  }

  return {
    backgroundColor,
    color,
    fontWeight: 500,
    fontSize: "0.75rem",
    height: "1.5rem",
    borderRadius: "1rem",
  };
});

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ children, className, variant = "primary", ...props }, ref) => {
    return (
      <StyledChip
        ref={ref}
        label={children}
        size="small"
        badgeVariant={variant}
        className={className}
        variant="filled"
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge };