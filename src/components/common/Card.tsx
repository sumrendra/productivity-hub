import { ReactNode } from 'react';
import { Box, BoxProps } from '@chakra-ui/react';

export interface CardProps extends BoxProps {
  children: ReactNode;
  variant?: 'elevated' | 'outlined' | 'subtle';
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

/**
 * Card Component
 * 
 * A versatile card component for displaying content in a contained, elevated surface.
 * 
 * @example
 * <Card variant="elevated">
 *   <CardHeader title="Card Title" />
 *   <CardBody>Content goes here</CardBody>
 * </Card>
 */
export const Card = ({
  children,
  variant = 'elevated',
  hoverable = false,
  clickable = false,
  onClick,
  ...props
}: CardProps) => {
  const baseStyles: BoxProps = {
    borderRadius: 'lg',
    overflow: 'hidden',
  };

  const variantStyles: Record<string, BoxProps> = {
    elevated: {
      bg: { base: 'white', _dark: 'gray.800' },
      boxShadow: 'sm',
      border: 'none',
    },
    outlined: {
      bg: { base: 'white', _dark: 'gray.800' },
      border: '1px solid',
      borderColor: { base: 'gray.200', _dark: 'gray.700' },
      boxShadow: 'none',
    },
    subtle: {
      bg: { base: 'gray.50', _dark: 'gray.900' },
      border: 'none',
      boxShadow: 'none',
    },
  };

  const hoverStyles = (hoverable || clickable) ? {
    _hover: {
      boxShadow: 'md',
      transform: 'translateY(-2px)',
    },
  } : {};

  const clickableStyles = clickable ? {
    cursor: 'pointer',
    _active: {
      transform: 'translateY(0)',
    },
  } : {};

  const combinedStyles = {
    ...baseStyles,
    ...variantStyles[variant],
    ...hoverStyles,
    ...clickableStyles,
    ...props,
  };

  return (
    <Box
      {...combinedStyles}
      onClick={onClick}
    >
      {children}
    </Box>
  );
};

// Card sub-components for better composition
export interface CardHeaderProps extends BoxProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export const CardHeader = ({ title, subtitle, action, ...props }: CardHeaderProps) => (
  <Box
    p={4}
    borderBottom="1px"
    borderColor={{ base: 'gray.200', _dark: 'gray.700' }}
    display="flex"
    alignItems="center"
    justifyContent="space-between"
    {...props}
  >
    <Box>
      <Box
        fontSize="lg"
        fontWeight="semibold"
        color={{ base: 'gray.900', _dark: 'white' }}
      >
        {title}
      </Box>
      {subtitle && (
        <Box
          fontSize="sm"
          color={{ base: 'gray.600', _dark: 'gray.400' }}
          mt={1}
        >
          {subtitle}
        </Box>
      )}
    </Box>
    {action && <Box>{action}</Box>}
  </Box>
);

export interface CardBodyProps extends BoxProps {
  children: ReactNode;
}

export const CardBody = ({ children, ...props }: CardBodyProps) => (
  <Box p={4} {...props}>
    {children}
  </Box>
);

export interface CardFooterProps extends BoxProps {
  children: ReactNode;
}

export const CardFooter = ({ children, ...props }: CardFooterProps) => (
  <Box
    p={4}
    borderTop="1px"
    borderColor={{ base: 'gray.200', _dark: 'gray.700' }}
    bg={{ base: 'gray.50', _dark: 'gray.900' }}
    {...props}
  >
    {children}
  </Box>
);

export default Card;
