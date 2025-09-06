import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { validateInput, sanitizeInput, type ValidationRule } from "@/utils/validation";

export interface ValidatedInputProps extends Omit<React.ComponentProps<"input">, 'onChange'> {
  validationRules?: ValidationRule;
  onValueChange?: (value: string, isValid: boolean) => void;
  showErrors?: boolean;
}

export const ValidatedInput = React.forwardRef<HTMLInputElement, ValidatedInputProps>(
  ({ className, validationRules, onValueChange, showErrors = true, ...props }, ref) => {
    const [errors, setErrors] = React.useState<string[]>([]);
    const [touched, setTouched] = React.useState(false);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const sanitizedValue = sanitizeInput(rawValue);
      
      // Update the input value to the sanitized version
      e.target.value = sanitizedValue;
      
      if (validationRules) {
        const validation = validateInput(sanitizedValue, validationRules);
        setErrors(validation.errors);
        onValueChange?.(sanitizedValue, validation.isValid);
      } else {
        onValueChange?.(sanitizedValue, true);
      }
    };
    
    const handleBlur = () => {
      setTouched(true);
    };
    
    const hasErrors = errors.length > 0 && touched && showErrors;
    
    return (
      <div className="space-y-1">
        <Input
          className={cn(
            className,
            hasErrors && "border-destructive focus-visible:ring-destructive"
          )}
          onChange={handleChange}
          onBlur={handleBlur}
          ref={ref}
          {...props}
        />
        {hasErrors && (
          <div className="space-y-1">
            {errors.map((error, index) => (
              <p key={index} className="text-xs text-destructive">
                {error}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  }
);

ValidatedInput.displayName = "ValidatedInput";