import { forwardRef, useEffect, useRef, useState } from 'react';
import { Box, Textarea as ChakraTextarea, Text, Flex } from '@chakra-ui/react';
import type { TextareaProps as ChakraTextareaProps } from '@chakra-ui/react';

/**
 * Textarea component props
 */
export interface TextareaProps extends Omit<ChakraTextareaProps, 'size'> {
  /**
   * Textarea size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Label for the textarea
   */
  label?: string;
  
  /**
   * Helper text shown below the textarea
   */
  helperText?: string;
  
  /**
   * Error message - shows error state
   */
  error?: string;
  
  /**
   * Make the textarea required
   */
  required?: boolean;
  
  /**
   * Maximum character count
   */
  maxLength?: number;
  
  /**
   * Show character count
   */
  showCount?: boolean;
  
  /**
   * Auto-resize textarea based on content
   */
  autoResize?: boolean;
}

/**
 * Textarea Component
 * 
 * A multi-line text input with auto-resize, character count, and error states.
 * Fully accessible with proper ARIA attributes.
 * 
 * @example
 * ```tsx
 * <Textarea
 *   label="Description"
 *   placeholder="Enter description"
 *   maxLength={500}
 *   showCount
 *   autoResize
 * />
 * 
 * <Textarea
 *   label="Notes"
 *   error="Notes are required"
 *   required
 * />
 * ```
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      size = 'md',
      label,
      helperText,
      error,
      required = false,
      maxLength,
      showCount = false,
      autoResize = false,
      id,
      value,
      onChange,
      ...props
    },
    forwardedRef
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const [charCount, setCharCount] = useState(0);

    // Combine refs
    const ref = forwardedRef || internalRef;

    // Size mappings
    const sizeStyles = {
      sm: {
        fontSize: 'sm',
        px: 3,
        py: 2,
        minH: 20,
      },
      md: {
        fontSize: 'md',
        px: 4,
        py: 2.5,
        minH: 24,
      },
      lg: {
        fontSize: 'lg',
        px: 5,
        py: 3,
        minH: 32,
      },
    };

    // Auto-resize effect
    useEffect(() => {
      if (autoResize && internalRef.current) {
        const textarea = internalRef.current;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, [value, autoResize]);

    // Update character count
    useEffect(() => {
      if (showCount && typeof value === 'string') {
        setCharCount(value.length);
      }
    }, [value, showCount]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (showCount) {
        setCharCount(e.target.value.length);
      }
      
      if (autoResize) {
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
      }
      
      onChange?.(e);
    };

    return (
      <Box w="full">
        {/* Label */}
        {label && (
          <Flex justify="space-between" align="center" mb={1.5}>
            <label htmlFor={textareaId}>
              <Text
                fontSize={size === 'sm' ? 'sm' : 'md'}
                fontWeight="medium"
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
            
            {/* Character count in label area */}
            {showCount && maxLength && (
              <Text
                fontSize="xs"
                color={charCount > maxLength ? 'red.600' : 'gray.500'}
                _dark={{
                  color: charCount > maxLength ? 'red.400' : 'gray.400',
                }}
              >
                {charCount}/{maxLength}
              </Text>
            )}
          </Flex>
        )}

        {/* Textarea */}
        <ChakraTextarea
          ref={ref as any}
          id={textareaId}
          value={value}
          onChange={handleChange}
          maxLength={maxLength}
          aria-invalid={hasError}
          aria-describedby={
            hasError
              ? `${textareaId}-error`
              : helperText
              ? `${textareaId}-helper`
              : undefined
          }
          borderRadius="lg"
          borderWidth="1px"
          borderColor={hasError ? 'red.500' : 'gray.300'}
          bg="white"
          transition="all 0.2s"
          resize={autoResize ? 'none' : 'vertical'}
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

        {/* Helper text, error, or character count */}
        <Flex justify="space-between" align="center" mt={1.5}>
          {(helperText || error) && (
            <Text
              id={hasError ? `${textareaId}-error` : `${textareaId}-helper`}
              fontSize="sm"
              color={hasError ? 'red.600' : 'gray.600'}
              _dark={{
                color: hasError ? 'red.400' : 'gray.400',
              }}
            >
              {error || helperText}
            </Text>
          )}
          
          {/* Character count at bottom (if no label) */}
          {showCount && maxLength && !label && (
            <Text
              fontSize="xs"
              color={charCount > maxLength ? 'red.600' : 'gray.500'}
              ml="auto"
              _dark={{
                color: charCount > maxLength ? 'red.400' : 'gray.400',
              }}
            >
              {charCount}/{maxLength}
            </Text>
          )}
        </Flex>
      </Box>
    );
  }
);

Textarea.displayName = 'Textarea';
