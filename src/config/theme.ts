import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

// Chakra UI v3 Theme Configuration
// Based on Phase 2.2 Design System specifications

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: '#E6F2FF' },
          100: { value: '#B3D9FF' },
          200: { value: '#80C0FF' },
          300: { value: '#4DA7FF' },
          400: { value: '#1A8EFF' },
          500: { value: '#0066FF' }, // Primary
          600: { value: '#0052CC' },
          700: { value: '#003D99' },
          800: { value: '#002966' },
          900: { value: '#001433' },
        },
        purple: {
          50: { value: '#F5F3FF' },
          100: { value: '#EDE9FE' },
          200: { value: '#DDD6FE' },
          300: { value: '#C4B5FD' },
          400: { value: '#A78BFA' },
          500: { value: '#7C3AED' }, // Secondary
          600: { value: '#6D28D9' },
          700: { value: '#5B21B6' },
          800: { value: '#4C1D95' },
          900: { value: '#3B0764' },
        },
        success: {
          50: { value: '#ECFDF5' },
          100: { value: '#D1FAE5' },
          200: { value: '#A7F3D0' },
          300: { value: '#6EE7B7' },
          400: { value: '#34D399' },
          500: { value: '#10B981' },
          600: { value: '#059669' },
          700: { value: '#047857' },
          800: { value: '#065F46' },
          900: { value: '#064E3B' },
        },
        warning: {
          50: { value: '#FFFBEB' },
          100: { value: '#FEF3C7' },
          200: { value: '#FDE68A' },
          300: { value: '#FCD34D' },
          400: { value: '#FBBF24' },
          500: { value: '#F59E0B' },
          600: { value: '#D97706' },
          700: { value: '#B45309' },
          800: { value: '#92400E' },
          900: { value: '#78350F' },
        },
        error: {
          50: { value: '#FEF2F2' },
          100: { value: '#FEE2E2' },
          200: { value: '#FECACA' },
          300: { value: '#FCA5A5' },
          400: { value: '#F87171' },
          500: { value: '#EF4444' },
          600: { value: '#DC2626' },
          700: { value: '#B91C1C' },
          800: { value: '#991B1B' },
          900: { value: '#7F1D1D' },
        },
      },
      fonts: {
        heading: { value: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" },
        body: { value: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" },
        mono: { value: "JetBrains Mono, Menlo, Monaco, Consolas, 'Courier New', monospace" },
      },
      fontSizes: {
        xs: { value: '0.75rem' }, // 12px
        sm: { value: '0.875rem' }, // 14px
        md: { value: '1rem' }, // 16px
        lg: { value: '1.125rem' }, // 18px
        xl: { value: '1.25rem' }, // 20px
        '2xl': { value: '1.5rem' }, // 24px
        '3xl': { value: '2rem' }, // 32px
        '4xl': { value: '2.5rem' }, // 40px
        '5xl': { value: '3rem' }, // 48px
        '6xl': { value: '4rem' }, // 64px
      },
      fontWeights: {
        normal: { value: 400 },
        medium: { value: 500 },
        semibold: { value: 600 },
        bold: { value: 700 },
      },
      lineHeights: {
        tight: { value: 1.2 },
        normal: { value: 1.5 },
        relaxed: { value: 1.75 },
      },
      radii: {
        none: { value: '0' },
        sm: { value: '0.25rem' }, // 4px
        base: { value: '0.375rem' }, // 6px
        md: { value: '0.5rem' }, // 8px
        lg: { value: '0.75rem' }, // 12px
        xl: { value: '1rem' }, // 16px
        '2xl': { value: '1.5rem' }, // 24px
        '3xl': { value: '2rem' }, // 32px
        full: { value: '9999px' },
      },
      shadows: {
        xs: { value: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
        sm: { value: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' },
        md: { value: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' },
        lg: { value: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' },
        xl: { value: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' },
        '2xl': { value: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' },
        inner: { value: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)' },
        outline: { value: '0 0 0 3px rgba(0, 102, 255, 0.5)' },
      },
      spacing: {
        px: { value: '1px' },
        0.5: { value: '0.125rem' }, // 2px
        1: { value: '0.25rem' }, // 4px
        1.5: { value: '0.375rem' }, // 6px
        2: { value: '0.5rem' }, // 8px
        2.5: { value: '0.625rem' }, // 10px
        3: { value: '0.75rem' }, // 12px
        3.5: { value: '0.875rem' }, // 14px
        4: { value: '1rem' }, // 16px
        5: { value: '1.25rem' }, // 20px
        6: { value: '1.5rem' }, // 24px
        7: { value: '1.75rem' }, // 28px
        8: { value: '2rem' }, // 32px
        10: { value: '2.5rem' }, // 40px
        12: { value: '3rem' }, // 48px
        16: { value: '4rem' }, // 64px
        20: { value: '5rem' }, // 80px
        24: { value: '6rem' }, // 96px
      },
      durations: {
        'ultra-fast': { value: '50ms' },
        faster: { value: '100ms' },
        fast: { value: '150ms' },
        normal: { value: '200ms' },
        slow: { value: '300ms' },
        slower: { value: '500ms' },
        'ultra-slow': { value: '1000ms' },
      },
    },
    semanticTokens: {
      colors: {
        primary: {
          solid: { value: { base: '{colors.brand.500}', _dark: '{colors.brand.400}' } },
          contrast: { value: 'white' },
        },
        secondary: {
          solid: { value: { base: '{colors.purple.500}', _dark: '{colors.purple.400}' } },
          contrast: { value: 'white' },
        },
        bg: {
          canvas: { value: { base: 'gray.50', _dark: 'gray.900' } },
          surface: { value: { base: 'white', _dark: 'gray.800' } },
          subtle: { value: { base: 'gray.100', _dark: 'gray.700' } },
          muted: { value: { base: 'gray.200', _dark: 'gray.600' } },
        },
        fg: {
          default: { value: { base: 'gray.900', _dark: 'white' } },
          muted: { value: { base: 'gray.600', _dark: 'gray.400' } },
          subtle: { value: { base: 'gray.500', _dark: 'gray.500' } },
        },
        border: {
          default: { value: { base: 'gray.200', _dark: 'gray.700' } },
          emphasized: { value: { base: 'gray.300', _dark: 'gray.600' } },
        },
      },
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },
  globalCss: {
    'html, body': {
      height: '100%',
      margin: 0,
      padding: 0,
    },
    body: {
      fontFamily: 'body',
      bg: 'bg.canvas',
      color: 'fg.default',
      lineHeight: 'normal',
    },
    '*::placeholder': {
      color: 'fg.subtle',
    },
    '*, *::before, *::after': {
      borderColor: 'border.default',
    },
  },
});

export const system = createSystem(defaultConfig, config);
export default system;
