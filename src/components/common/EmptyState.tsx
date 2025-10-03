import { ReactNode } from 'react';
import { Box, Text, Button, Stack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { scaleVariants } from '../../config/animations';

const MotionBox = motion.create(Box);

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * EmptyState Component
 * 
 * Displays a friendly message when there's no data to show.
 * Includes optional icon, title, description, and call-to-action buttons.
 * 
 * @example
 * <EmptyState
 *   icon={<FileIcon size={48} />}
 *   title="No notes yet"
 *   description="Create your first note to get started"
 *   action={{ label: "Create Note", onClick: handleCreate }}
 * />
 */
export const EmptyState = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
}: EmptyStateProps) => {
  return (
    <MotionBox
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={12}
      px={6}
      textAlign="center"
      initial="hidden"
      animate="visible"
      variants={scaleVariants}
    >
      {icon && (
        <Box
          mb={4}
          color={{ base: 'gray.400', _dark: 'gray.600' }}
          opacity={0.8}
        >
          {icon}
        </Box>
      )}

      <Text
        fontSize="xl"
        fontWeight="semibold"
        color={{ base: 'gray.900', _dark: 'white' }}
        mb={2}
      >
        {title}
      </Text>

      {description && (
        <Text
          fontSize="md"
          color={{ base: 'gray.600', _dark: 'gray.400' }}
          mb={6}
          maxW="md"
        >
          {description}
        </Text>
      )}

      {(action || secondaryAction) && (
        <Stack direction={{ base: 'column', sm: 'row' }} gap={3}>
          {action && (
            <Button
              colorScheme="brand"
              size="md"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outline"
              size="md"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </Stack>
      )}
    </MotionBox>
  );
};

export default EmptyState;
