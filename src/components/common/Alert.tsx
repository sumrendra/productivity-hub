import { Box, Flex, Text } from '@chakra-ui/react';
import { AlertCircle, CheckCircle2, Info, XCircle, X } from 'lucide-react';
import { motion } from 'framer-motion';

const MotionBox = motion.create(Box);

/**
 * Alert component props
 */
export interface AlertProps {
  /**
   * Alert variant
   * @default 'info'
   */
  variant?: 'info' | 'success' | 'warning' | 'error';
  
  /**
   * Alert title
   */
  title?: string;
  
  /**
   * Alert description/message
   */
  children: React.ReactNode;
  
  /**
   * Show close button
   */
  closable?: boolean;
  
  /**
   * Callback when alert is closed
   */
  onClose?: () => void;
  
  /**
   * Custom icon
   */
  icon?: React.ReactNode;
  
  /**
   * Hide default icon
   */
  hideIcon?: boolean;
}

/**
 * Alert Component
 * 
 * Inline notification component for displaying important messages.
 * Supports multiple variants with icons and optional close button.
 * 
 * @example
 * ```tsx
 * <Alert variant="success" title="Success!">
 *   Your changes have been saved.
 * </Alert>
 * 
 * <Alert variant="error" closable onClose={() => console.log('Closed')}>
 *   An error occurred while processing your request.
 * </Alert>
 * ```
 */
export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  closable = false,
  onClose,
  icon,
  hideIcon = false,
}) => {
  // Variant configurations
  const variants = {
    info: {
      bg: 'blue.50',
      borderColor: 'blue.200',
      iconColor: 'blue.500',
      textColor: 'blue.900',
      icon: <Info size={20} />,
      darkBg: 'blue.900',
      darkBorderColor: 'blue.700',
      darkIconColor: 'blue.400',
      darkTextColor: 'blue.100',
    },
    success: {
      bg: 'green.50',
      borderColor: 'green.200',
      iconColor: 'green.500',
      textColor: 'green.900',
      icon: <CheckCircle2 size={20} />,
      darkBg: 'green.900',
      darkBorderColor: 'green.700',
      darkIconColor: 'green.400',
      darkTextColor: 'green.100',
    },
    warning: {
      bg: 'yellow.50',
      borderColor: 'yellow.200',
      iconColor: 'yellow.500',
      textColor: 'yellow.900',
      icon: <AlertCircle size={20} />,
      darkBg: 'yellow.900',
      darkBorderColor: 'yellow.700',
      darkIconColor: 'yellow.400',
      darkTextColor: 'yellow.100',
    },
    error: {
      bg: 'red.50',
      borderColor: 'red.200',
      iconColor: 'red.500',
      textColor: 'red.900',
      icon: <XCircle size={20} />,
      darkBg: 'red.900',
      darkBorderColor: 'red.700',
      darkIconColor: 'red.400',
      darkTextColor: 'red.100',
    },
  };

  const config = variants[variant];

  return (
    <MotionBox
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      role="alert"
      bg={config.bg}
      borderWidth="1px"
      borderColor={config.borderColor}
      borderRadius="lg"
      p={4}
      _dark={{
        bg: config.darkBg,
        borderColor: config.darkBorderColor,
      }}
    >
      <Flex gap={3} align="flex-start">
        {/* Icon */}
        {!hideIcon && (
          <Box
            color={config.iconColor}
            flexShrink={0}
            mt={0.5}
            _dark={{
              color: config.darkIconColor,
            }}
          >
            {icon || config.icon}
          </Box>
        )}

        {/* Content */}
        <Box flex={1}>
          {title && (
            <Text
              fontWeight="semibold"
              fontSize="md"
              mb={1}
              color={config.textColor}
              _dark={{
                color: config.darkTextColor,
              }}
            >
              {title}
            </Text>
          )}
          <Text
            fontSize="sm"
            color={config.textColor}
            _dark={{
              color: config.darkTextColor,
            }}
          >
            {children}
          </Text>
        </Box>

        {/* Close button */}
        {closable && (
          <Box
            as="button"
            onClick={onClose}
            color={config.iconColor}
            flexShrink={0}
            cursor="pointer"
            opacity={0.7}
            transition="opacity 0.2s"
            _hover={{ opacity: 1 }}
            _dark={{
              color: config.darkIconColor,
            }}
            aria-label="Close alert"
          >
            <X size={18} />
          </Box>
        )}
      </Flex>
    </MotionBox>
  );
};
