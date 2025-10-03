import { Flex, Text } from '@chakra-ui/react';
import { Check, Loader, AlertCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import type { SaveStatus } from '@hooks/useAutoSave';
import { formatRelativeTime } from '@/utils/helpers';

const MotionFlex = motion.create(Flex);

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  lastSaved: Date | null;
  hasUnsavedChanges?: boolean;
}

/**
 * SaveStatusIndicator Component
 * 
 * Displays the current save status with appropriate icon and message
 */
const SaveStatusIndicator = ({ 
  status, 
  lastSaved, 
  hasUnsavedChanges = false 
}: SaveStatusIndicatorProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: <Loader size={14} className="animate-spin" />,
          text: 'Saving...',
          color: 'blue.500',
        };
      case 'saved':
        return {
          icon: <Check size={14} />,
          text: lastSaved ? `Saved ${formatRelativeTime(lastSaved)}` : 'Saved',
          color: 'green.500',
        };
      case 'error':
        return {
          icon: <AlertCircle size={14} />,
          text: 'Save failed',
          color: 'red.500',
        };
      default:
        if (hasUnsavedChanges) {
          return {
            icon: <Clock size={14} />,
            text: 'Unsaved changes',
            color: 'yellow.500',
          };
        }
        return null;
    }
  };

  const config = getStatusConfig();

  if (!config) return null;

  return (
    <MotionFlex
      align="center"
      gap={2}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <Flex
        color={config.color}
        style={{ animation: status === 'saving' ? 'spin 1s linear infinite' : undefined }}
      >
        {config.icon}
      </Flex>
      <Text fontSize="sm" color={config.color} fontWeight="medium">
        {config.text}
      </Text>
    </MotionFlex>
  );
};

export default SaveStatusIndicator;
