import * as React from "react";
import { Button as MuiButton, ButtonProps as MuiButtonProps, IconButton } from "@mui/material";

// Extended ButtonProps that includes shadcn-specific variants and sizes
export interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'size'> {
  asChild?: boolean;
  variant?: "text" | "contained" | "outlined" | "ghost" | "outline";
  size?: "small" | "medium" | "large" | "sm" | "lg" | "icon";
}

// Button component that supports both Material UI and shadcn variants
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, asChild, variant = "contained", size = "medium", ...props }, ref) => {
    // Map shadcn variants to Material UI variants
    let muiVariant: "text" | "contained" | "outlined" | undefined = "contained";
    
    if (variant === "text" || variant === "ghost") {
      muiVariant = "text";
    } else if (variant === "outlined" || variant === "outline") {
      muiVariant = "outlined";
    } else if (variant === "contained") {
      muiVariant = "contained";
    }

    // Map shadcn sizes to Material UI sizes
    let muiSize: "small" | "medium" | "large" | undefined = "medium";
    
    if (size === "small" || size === "sm") {
      muiSize = "small";
    } else if (size === "large" || size === "lg") {
      muiSize = "large";
    }

    // Special case for icon buttons
    if (size === "icon") {
      return (
        <IconButton ref={ref as any} size="medium" {...props}>
          {children}
        </IconButton>
      );
    }

    // If asChild is true, we need to clone the children and add our props
    if (asChild) {
      const child = React.Children.only(children) as React.ReactElement;
      return React.cloneElement(child, {
        ref,
        ...props,
      });
    }

    return (
      <MuiButton 
        ref={ref} 
        variant={muiVariant}
        size={muiSize}
        {...props}
      >
        {children}
      </MuiButton>
    );
  }
);

Button.displayName = "Button";

export { Button };