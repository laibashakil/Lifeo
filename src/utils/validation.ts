// Input validation and sanitization utilities

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateInput(value: string, rules: ValidationRule): ValidationResult {
  const errors: string[] = [];
  
  // Required check
  if (rules.required && (!value || value.trim().length === 0)) {
    errors.push('This field is required');
    return { isValid: false, errors };
  }
  
  // Skip other validations if value is empty and not required
  if (!value || value.trim().length === 0) {
    return { isValid: true, errors: [] };
  }
  
  // Length validations
  if (rules.minLength && value.trim().length < rules.minLength) {
    errors.push(`Must be at least ${rules.minLength} characters long`);
  }
  
  if (rules.maxLength && value.trim().length > rules.maxLength) {
    errors.push(`Must be no more than ${rules.maxLength} characters long`);
  }
  
  // Pattern validation
  if (rules.pattern && !rules.pattern.test(value)) {
    errors.push('Contains invalid characters');
  }
  
  // Custom validation
  if (rules.custom) {
    const customError = rules.custom(value);
    if (customError) {
      errors.push(customError);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return input
    .trim()
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Escape potentially dangerous characters
    .replace(/[<>'"&]/g, (char) => {
      switch (char) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#x27;';
        case '&': return '&amp;';
        default: return char;
      }
    })
    // Limit to reasonable length
    .substring(0, 1000);
}

/**
 * Validation rules for different input types
 */
export const ValidationRules = {
  habitTitle: {
    required: true,
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_.,!?()]+$/,
  },
  goalTitle: {
    required: true,
    minLength: 1,
    maxLength: 200,
    pattern: /^[a-zA-Z0-9\s\-_.,!?()]+$/,
  },
  taskTitle: {
    required: true,
    minLength: 1,
    maxLength: 150,
    pattern: /^[a-zA-Z0-9\s\-_.,!?()]+$/,
  },
  notes: {
    required: false,
    maxLength: 500,
    pattern: /^[a-zA-Z0-9\s\-_.,!?()\n\r]*$/,
  },
  displayName: {
    required: false,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9\s\-_.']+$/,
  }
} as const;

/**
 * Rate limiting helper (simple client-side implementation)
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  isAllowed(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      return false;
    }
    
    // Record this attempt
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    
    return true;
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const globalRateLimiter = new RateLimiter();