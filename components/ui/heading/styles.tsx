import { tva } from '@gluestack-ui/nativewind-utils/tva';
export const headingStyle = tva({
  base: 'text-primary-text font-bold tracking-tight',
  variants: {
    size: {
      '5xl': 'text-5xl',
      '4xl': 'text-4xl',
      '3xl': 'text-3xl',
      '2xl': 'text-2xl',
      xl: 'text-xl',
      lg: 'text-lg',
      md: 'text-base',
      sm: 'text-sm',
      xs: 'text-xs',
    },
    bold: {
      true: 'font-bold',
    },
    italic: {
      true: 'italic',
    },
    underline: {
      true: 'underline',
    },
    strikeThrough: {
      true: 'line-through',
    },
    isTruncated: {
      true: 'truncate',
    },
    sub: {
      true: 'text-secondary-text text-xs font-medium',
    },
    highlight: {
      true: 'bg-secondary text-background px-1 rounded-sm',
    },
  },
  defaultVariants: {
    size: 'lg',
    bold: true,
  },
});