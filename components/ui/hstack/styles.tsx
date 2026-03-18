import { tva } from '@gluestack-ui/nativewind-utils/tva';

export const hstackStyle = tva({
  base: 'flex-row items-center',

  variants: {
    space: {
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
      '2xl': 'gap-10',
      '3xl': 'gap-12',
    },

    reversed: {
      true: 'flex-row-reverse',
    },
  },
});