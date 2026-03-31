import { tva } from '@gluestack-ui/nativewind-utils/tva';
export const cardStyle = tva({
  base: 'bg-foreground rounded-2xl border border-border overflow-hidden',
  variants: {
    variant: {
      elevated: 'bg-foreground shadow-soft',
      hard: 'bg-foreground shadow-hard',
      outlined: 'bg-background border border-border shadow-none',
      muted: 'bg-forms-background border-0 shadow-none',
      primary: 'bg-primary border-0 shadow-soft',
      success: 'bg-success border-0 shadow-none',
      error: 'bg-error border-0 shadow-none',
      warning: 'bg-warning border-0 shadow-none',
    },
    size: {
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
    },
  },
  defaultVariants: {
    variant: 'elevated',
    size: 'md',
  },
});