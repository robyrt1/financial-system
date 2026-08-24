export interface ValidationRule {
  id: string;
  label: string;
  isValid: boolean;
}

export interface ValidationStrength {
  percentage: number;
  label: string;
  colorClass: string;
  barClass: string;
  subtitle?: string;
}

export interface ValidationRulesProps {
  rules?: ValidationRule[];
  strength?: ValidationStrength;
  className?: string;
}
