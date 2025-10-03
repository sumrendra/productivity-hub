import { Box } from '@chakra-ui/react';
import type { BoxProps } from '@chakra-ui/react';

/**
 * Badge component props
 */
export interface BadgeProps extends Omit<BoxProps, 'size'> {
  /**
   * Badge variant
   * @default 'subtle'
   */
  variant?: 'solid' | 'subtle' | 'outline';
  
  /**
   * Color scheme
   * @default 'gray'
   */
  colorScheme?: 'gray' | 'red' | 'green' | 'blue' | 'yellow' | 'purple' | 'brand';
  
  /**
   * Badge size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Badge content
   */
  children: React.ReactNode;
  
  /**
   * Show dot indicator
   */
  dot?: boolean;
}

/**
 * Badge Component
 * 
 * Small label component for counts, status indicators, and tags.
 * Supports multiple variants, colors, and sizes.
 * 
 * @example
 * ```tsx
 * <Badge colorScheme="green" variant="solid">
 *   Active
 * </Badge>
 * 
 * <Badge colorScheme="red" variant="subtle" dot>
 *   Error
 * </Badge>
 * 
 * <Badge colorScheme="blue" variant="outline" size="sm">
 *   Beta
 * </Badge>
 * ```
 */
export const Badge: React.FC<BadgeProps> = ({
  variant = 'subtle',
  colorScheme = 'gray',
  size = 'md',
  children,
  dot = false,
  ...props
}) => {
  // Size styles
  const sizeStyles = {
    sm: {
      fontSize: 'xs',
      px: 1.5,
      py: 0.5,
      h: 5,
    },
    md: {
      fontSize: 'xs',
      px: 2,
      py: 1,
      h: 6,
    },
    lg: {
      fontSize: 'sm',
      px: 2.5,
      py: 1,
      h: 7,
    },
  };

  // Variant styles
  const variantStyles = {
    solid: {
      bg: `${colorScheme}.500`,
      color: 'white',
      _dark: {
        bg: `${colorScheme}.600`,
      },
    },
    subtle: {
      bg: `${colorScheme}.100`,
      color: `${colorScheme}.700`,
      _dark: {
        bg: `${colorScheme}.900`,
        color: `${colorScheme}.200`,
      },
    },
    outline: {
      borderWidth: '1px',
      borderColor: `${colorScheme}.500`,
      color: `${colorScheme}.500`,
      bg: 'transparent',
      _dark: {
        borderColor: `${colorScheme}.400`,
        color: `${colorScheme}.400`,
      },
    },
  };

  return (
    <Box
      display="inline-flex"
      alignItems="center"
      gap={dot ? 1 : 0}
      fontWeight="medium"
      borderRadius="md"
      textTransform="uppercase"
      letterSpacing="wide"
      whiteSpace="nowrap"
      {...sizeStyles[size]}
      {...variantStyles[variant]}
      {...props}
    >
      {/* Dot indicator */}
      {dot && (
        <Box
          w={2}
          h={2}
          borderRadius="full"
          bg={
            variant === 'solid'
              ? 'white'
              : variant === 'outline'
              ? `${colorScheme}.500`
              : `${colorScheme}.500`
          }
          flexShrink={0}
          _dark={{
            bg:
              variant === 'solid'
                ? 'white'
                : variant === 'outline'
                ? `${colorScheme}.400`
                : `${colorScheme}.400`,
          }}
        />
      )}
      {children}
    </Box>
  );
};
