import { tva } from '@gluestack-ui/nativewind-utils/tva';

export const cardStyle = tva({
  base: 'bg-foreground rounded-2xl border border-border overflow-hidden',

  variants: {
    variant: {
      // Card padrão — fundo claro com borda sutil
      elevated: 'bg-foreground shadow-soft',

      // Card com destaque mais forte
      hard: 'bg-foreground shadow-hard',

      // Card apenas com borda, sem sombra
      outlined: 'bg-background border border-border shadow-none',

      // Card com fundo mutado (formulários, seções internas)
      muted: 'bg-forms-background border-0 shadow-none',

      // Card de destaque com cor primária
      primary: 'bg-primary border-0 shadow-soft',

      // Card de feedback
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