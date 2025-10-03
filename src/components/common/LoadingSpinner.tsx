import { Box, Spinner, SpinnerProps, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { fadeVariants } from '../../config/animations';

const MotionBox = motion.create(Box);

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
  overlay?: boolean;
  fullPage?: boolean;
}

const sizeMap: Record<string, SpinnerProps['size']> = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
};

/**
 * LoadingSpinner Component
 * 
 * Displays a loading indicator for async operations.
 * Can be used inline, as an overlay, or full-page.
 * 
 * @example
 * // Inline spinner
 * <LoadingSpinner size="md" label="Loading..." />
 * 
 * // Overlay spinner
 * <LoadingSpinner overlay label="Saving..." />
 * 
 * // Full page spinner
 * <LoadingSpinner fullPage label="Loading application..." />
 */
export const LoadingSpinner = ({
  size = 'md',
  label,
  overlay = false,
  fullPage = false,
}: LoadingSpinnerProps) => {
  const content = (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={3}
    >
      <Spinner
        size={sizeMap[size]}
        colorPalette="brand"
      />
      {label && (
        <Text
          fontSize="sm"
          color={{ base: 'gray.600', _dark: 'gray.400' }}
          fontWeight="medium"
        >
          {label}
        </Text>
      )}
    </Box>
  );

  if (fullPage) {
    return (
      <MotionBox
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg={{ base: 'white', _dark: 'gray.900' }}
        zIndex={9999}
        initial="hidden"
        animate="visible"
        variants={fadeVariants}
      >
        {content}
      </MotionBox>
    );
  }

  if (overlay) {
    return (
      <MotionBox
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="blackAlpha.600"
        backdropFilter="blur(4px)"
        borderRadius="lg"
        zIndex={10}
        initial="hidden"
        animate="visible"
        variants={fadeVariants}
      >
        {content}
      </MotionBox>
    );
  }

  return (
    <MotionBox
      display="flex"
      alignItems="center"
      justifyContent="center"
      py={8}
      initial="hidden"
      animate="visible"
      variants={fadeVariants}
    >
      {content}
    </MotionBox>
  );
};

export default LoadingSpinner;
