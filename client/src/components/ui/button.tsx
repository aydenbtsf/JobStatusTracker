import * as React from "react";
import { Button as MuiButton, ButtonProps as MuiButtonProps, IconButton } from "@mui/material";

export interface ButtonProps extends MuiButtonProps {
  asChild?: boolean;
}

// Button component that supports both standard Material UI variants
// as well as shadcn-style variants like 'ghost' and 'outline'
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, asChild, variant = "contained", size = "medium", ...props }, ref) => {
    // Map shadcn variants to Material UI variants
    let muiVariant = variant;
    if (variant === 'ghost') muiVariant = 'text';
    if (variant === 'outline') muiVariant = 'outlined';

    // Map shadcn sizes to Material UI sizes
    let muiSize = size;
    if (size === 'sm') muiSize = 'small';
    if (size === 'lg') muiSize = 'large';
    if (size === 'icon') {
      // Special case for icon buttons
      return (
        <IconButton ref={ref} size={muiSize === 'medium' ? 'medium' : 'small'} {...props}>
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
        variant={muiVariant as "text" | "contained" | "outlined" | undefined} 
        size={muiSize as "small" | "medium" | "large" | undefined} 
        {...props}
      >
        {children}
      </MuiButton>
    );
  }
);

Button.displayName = "Button";

export { Button };