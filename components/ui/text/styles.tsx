import { tva } from '@gluestack-ui/nativewind-utils/tva';
export const textStyle = tva({
  base: 'text-primary-text font-medium',
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
      '2xs': 'text-[10px]',
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
      true: 'text-secondary-text text-xs font-normal',
    },
    highlight: {
      true: 'bg-secondary text-background px-1 rounded-sm',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});