import { forwardRef } from 'react';
import { Button as ChakraButton } from '@chakra-ui/react';
import type { ButtonProps as ChakraButtonProps } from '@chakra-ui/react';
import { Loader2 } from 'lucide-react';

/**
 * Button component props
 * Extends Chakra UI Button with custom variants and features
 */
export interface ButtonProps extends Omit<ChakraButtonProps, 'size' | 'variant'> {
  /**
   * Button variant style
   * @default 'solid'
   */
  variant?: 'solid' | 'outline' | 'ghost' | 'link' | 'subtle';
  
  /**
   * Button size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Color scheme for the button
   * @default 'brand'
   */
  colorScheme?: 'brand' | 'gray' | 'red' | 'green' | 'blue' | 'yellow' | 'purple';
  
  /**
   * Loading state - shows spinner and disables button
   */
  isLoading?: boolean;
  
  /**
   * Loading text to show while loading
   */
  loadingText?: string;
  
  /**
   * Icon to show on the left
   */
  leftIcon?: React.ReactNode;
  
  /**
   * Icon to show on the right
   */
  rightIcon?: React.ReactNode;
  
  /**
   * Make button full width
   */
  fullWidth?: boolean;
}

/**
 * Button Component
 * 
 * A versatile button component with multiple variants, sizes, and states.
 * Supports icons, loading states, and full accessibility.
 * 
 * @example
 * ```tsx
 * <Button variant="solid" colorScheme="brand" size="md">
 *   Click me
 * </Button>
 * 
 * <Button variant="outline" leftIcon={<PlusIcon />} isLoading>
 *   Loading...
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'solid',
      size = 'md',
      colorScheme = 'brand',
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // Size mappings
    const sizeStyles = {
      sm: {
        fontSize: 'sm',
        px: 3,
        py: 1.5,
        h: 8,
        minW: 8,
      },
      md: {
        fontSize: 'md',
        px: 4,
        py: 2,
        h: 10,
        minW: 10,
      },
      lg: {
        fontSize: 'lg',
        px: 6,
        py: 2.5,
        h: 12,
        minW: 12,
      },
      xl: {
        fontSize: 'xl',
        px: 8,
        py: 3,
        h: 14,
        minW: 14,
      },
    };

    // Variant styles
    const variantStyles = {
      solid: {
        bg: `${colorScheme}.500`,
        color: 'white',
        _hover: {
          bg: `${colorScheme}.600`,
        },
        _active: {
          bg: `${colorScheme}.700`,
        },
        _dark: {
          bg: `${colorScheme}.600`,
          _hover: {
            bg: `${colorScheme}.500`,
          },
          _active: {
            bg: `${colorScheme}.400`,
          },
        },
      },
      outline: {
        borderWidth: '1px',
        borderColor: `${colorScheme}.500`,
        color: `${colorScheme}.500`,
        bg: 'transparent',
        _hover: {
          bg: `${colorScheme}.50`,
        },
        _active: {
          bg: `${colorScheme}.100`,
        },
        _dark: {
          borderColor: `${colorScheme}.400`,
          color: `${colorScheme}.400`,
          _hover: {
            bg: `${colorScheme}.900`,
          },
          _active: {
            bg: `${colorScheme}.800`,
          },
        },
      },
      ghost: {
        bg: 'transparent',
        color: `${colorScheme}.500`,
        _hover: {
          bg: `${colorScheme}.50`,
        },
        _active: {
          bg: `${colorScheme}.100`,
        },
        _dark: {
          color: `${colorScheme}.400`,
          _hover: {
            bg: `${colorScheme}.900`,
          },
          _active: {
            bg: `${colorScheme}.800`,
          },
        },
      },
      link: {
        bg: 'transparent',
        color: `${colorScheme}.500`,
        textDecoration: 'underline',
        _hover: {
          color: `${colorScheme}.600`,
        },
        _active: {
          color: `${colorScheme}.700`,
        },
        _dark: {
          color: `${colorScheme}.400`,
          _hover: {
            color: `${colorScheme}.300`,
          },
          _active: {
            color: `${colorScheme}.200`,
          },
        },
      },
      subtle: {
        bg: `${colorScheme}.100`,
        color: `${colorScheme}.700`,
        _hover: {
          bg: `${colorScheme}.200`,
        },
        _active: {
          bg: `${colorScheme}.300`,
        },
        _dark: {
          bg: `${colorScheme}.900`,
          color: `${colorScheme}.200`,
          _hover: {
            bg: `${colorScheme}.800`,
          },
          _active: {
            bg: `${colorScheme}.700`,
          },
        },
      },
    };

    return (
      <ChakraButton
        ref={ref}
        disabled={disabled || isLoading}
        w={fullWidth ? 'full' : undefined}
        fontWeight="medium"
        borderRadius="lg"
        transition="all 0.2s"
        {...sizeStyles[size]}
        {...variantStyles[variant]}
        {...props}
      >
        {/* Left icon or loading spinner */}
        {isLoading && !loadingText && (
          <Loader2
            style={{
              width: size === 'sm' ? '14px' : size === 'lg' ? '20px' : '16px',
              height: size === 'sm' ? '14px' : size === 'lg' ? '20px' : '16px',
              marginRight: '8px',
              animation: 'spin 1s linear infinite',
            }}
          />
        )}
        {!isLoading && leftIcon && (
          <span style={{ marginRight: '8px', display: 'inline-flex', alignItems: 'center' }}>
            {leftIcon}
          </span>
        )}

        {/* Button content */}
        {isLoading && loadingText ? loadingText : children}

        {/* Right icon */}
        {!isLoading && rightIcon && (
          <span style={{ marginLeft: '8px', display: 'inline-flex', alignItems: 'center' }}>
            {rightIcon}
          </span>
        )}
      </ChakraButton>
    );
  }
);

Button.displayName = 'Button';
