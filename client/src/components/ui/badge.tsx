import * as React from "react";
import { Chip, ChipProps } from "@mui/material";
import { styled } from "@mui/material/styles";

export interface BadgeProps extends Omit<ChipProps, 'variant'> {
  variant?: "primary" | "secondary" | "success" | "error" | "warning" | "info";
  children?: React.ReactNode;
}

// Create custom styled Chip components for each variant
const PrimaryChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.dark,
  fontWeight: 500,
  fontSize: "0.75rem",
  height: "1.5rem",
  borderRadius: "1rem",
}));

const SecondaryChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.light,
  color: theme.palette.secondary.dark,
  fontWeight: 500,
  fontSize: "0.75rem",
  height: "1.5rem",
  borderRadius: "1rem",
}));

const SuccessChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.success.light,
  color: theme.palette.success.dark,
  fontWeight: 500,
  fontSize: "0.75rem",
  height: "1.5rem",
  borderRadius: "1rem",
}));

const ErrorChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.error.light,
  color: theme.palette.error.dark,
  fontWeight: 500,
  fontSize: "0.75rem",
  height: "1.5rem",
  borderRadius: "1rem",
}));

const WarningChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.warning.light,
  color: theme.palette.warning.dark,
  fontWeight: 500,
  fontSize: "0.75rem",
  height: "1.5rem",
  borderRadius: "1rem",
}));

const InfoChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.info.light,
  color: theme.palette.info.dark,
  fontWeight: 500,
  fontSize: "0.75rem",
  height: "1.5rem",
  borderRadius: "1rem",
}));

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ children, variant = "primary", ...props }, ref) => {
    // Choose the right component based on variant
    const ChipComponent = {
      primary: PrimaryChip,
      secondary: SecondaryChip,
      success: SuccessChip,
      error: ErrorChip,
      warning: WarningChip,
      info: InfoChip,
    }[variant];

    return (
      <ChipComponent
        ref={ref}
        label={children}
        size="small"
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge };