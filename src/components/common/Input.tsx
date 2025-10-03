import { forwardRef } from 'react';
import { Box, Input as ChakraInput, Text } from '@chakra-ui/react';
import type { InputProps as ChakraInputProps } from '@chakra-ui/react';

/**
 * Input component props
 */
export interface InputProps extends Omit<ChakraInputProps, 'size'> {
  /**
   * Input size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Label for the input
   */
  label?: string;
  
  /**
   * Helper text shown below the input
   */
  helperText?: string;
  
  /**
   * Error message - shows error state
   */
  error?: string;
  
  /**
   * Icon to show on the left
   */
  leftIcon?: React.ReactNode;
  
  /**
   * Icon to show on the right
   */
  rightIcon?: React.ReactNode;
  
  /**
   * Make the input required
   */
  required?: boolean;
}

/**
 * Input Component
 * 
 * A text input component with label, helper text, error states, and icon support.
 * Fully accessible with proper ARIA attributes.
 * 
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 *   helperText="We'll never share your email"
 *   required
 * />
 * 
 * <Input
 *   label="Search"
 *   leftIcon={<SearchIcon />}
 *   error="Search query is too short"
 * />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'md',
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      required = false,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);

    // Size mappings
    const sizeStyles = {
      sm: {
        fontSize: 'sm',
        px: 3,
        py: 2,
        h: 8,
      },
      md: {
        fontSize: 'md',
        px: 4,
        py: 2.5,
        h: 10,
      },
      lg: {
        fontSize: 'lg',
        px: 5,
        py: 3,
        h: 12,
      },
    };

    return (
      <Box w="full">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontSize: size === 'sm' ? '0.875rem' : '1rem',
              fontWeight: 500,
              marginBottom: '0.375rem',
              display: 'block',
            }}
          >
            <Text
              color="gray.700"
              _dark={{ color: 'gray.300' }}
            >
              {label}
              {required && (
                <Text as="span" color="red.500" ml={1}>
                  *
                </Text>
              )}
            </Text>
          </label>
        )}

        {/* Input wrapper for icons */}
        <Box position="relative" w="full">
          {/* Left icon */}
          {leftIcon && (
            <Box
              position="absolute"
              left={3}
              top="50%"
              transform="translateY(-50%)"
              display="flex"
              alignItems="center"
              color="gray.400"
              _dark={{ color: 'gray.500' }}
              pointerEvents="none"
              zIndex={1}
            >
              {leftIcon}
            </Box>
          )}

          {/* Input */}
          <ChakraInput
            ref={ref}
            id={inputId}
            aria-invalid={hasError}
            aria-describedby={
              hasError
                ? `${inputId}-error`
                : helperText
                ? `${inputId}-helper`
                : undefined
            }
            pl={leftIcon ? 10 : undefined}
            pr={rightIcon ? 10 : undefined}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={hasError ? 'red.500' : 'gray.300'}
            bg="white"
            transition="all 0.2s"
            _hover={{
              borderColor: hasError ? 'red.600' : 'gray.400',
            }}
            _focus={{
              borderColor: hasError ? 'red.500' : 'brand.500',
              boxShadow: hasError
                ? '0 0 0 1px var(--chakra-colors-red-500)'
                : '0 0 0 1px var(--chakra-colors-brand-500)',
              outline: 'none',
            }}
            _dark={{
              bg: 'gray.800',
              borderColor: hasError ? 'red.500' : 'gray.600',
              _hover: {
                borderColor: hasError ? 'red.400' : 'gray.500',
              },
              _focus: {
                borderColor: hasError ? 'red.500' : 'brand.400',
                boxShadow: hasError
                  ? '0 0 0 1px var(--chakra-colors-red-500)'
                  : '0 0 0 1px var(--chakra-colors-brand-400)',
              },
            }}
            {...sizeStyles[size]}
            {...props}
          />

          {/* Right icon */}
          {rightIcon && (
            <Box
              position="absolute"
              right={3}
              top="50%"
              transform="translateY(-50%)"
              display="flex"
              alignItems="center"
              color="gray.400"
              _dark={{ color: 'gray.500' }}
              pointerEvents="none"
              zIndex={1}
            >
              {rightIcon}
            </Box>
          )}
        </Box>

        {/* Helper text or error */}
        {(helperText || error) && (
          <Text
            id={hasError ? `${inputId}-error` : `${inputId}-helper`}
            fontSize="sm"
            mt={1.5}
            color={hasError ? 'red.600' : 'gray.600'}
            _dark={{
              color: hasError ? 'red.400' : 'gray.400',
            }}
          >
            {error || helperText}
          </Text>
        )}
      </Box>
    );
  }
);

Input.displayName = 'Input';
