import * as React from "react";
import { FormLabel, FormLabelProps } from "@mui/material";
import { styled } from "@mui/material/styles";

export interface LabelProps extends FormLabelProps {
  htmlFor?: string;
}

const StyledLabel = styled(FormLabel)({
  fontSize: "0.875rem",
  fontWeight: 500,
  marginBottom: "0.5rem",
  display: "block",
});

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <StyledLabel ref={ref} className={className} {...props}>
        {children}
      </StyledLabel>
    );
  }
);

Label.displayName = "Label";

export { Label };