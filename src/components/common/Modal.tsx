import { useEffect } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

const MotionBox = motion.create(Box);

/**
 * Modal component props
 */
export interface ModalProps {
  /**
   * Whether the modal is open
   */
  isOpen: boolean;
  
  /**
   * Callback when modal should close
   */
  onClose: () => void;
  
  /**
   * Modal title
   */
  title?: string;
  
  /**
   * Modal size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  
  /**
   * Modal content
   */
  children: React.ReactNode;
  
  /**
   * Hide close button
   */
  hideCloseButton?: boolean;
  
  /**
   * Close on backdrop click
   * @default true
   */
  closeOnBackdropClick?: boolean;
  
  /**
   * Close on escape key
   * @default true
   */
  closeOnEscape?: boolean;
}

/**
 * ModalHeader component props
 */
export interface ModalHeaderProps {
  children: React.ReactNode;
}

/**
 * ModalBody component props
 */
export interface ModalBodyProps {
  children: React.ReactNode;
}

/**
 * ModalFooter component props
 */
export interface ModalFooterProps {
  children: React.ReactNode;
}

/**
 * Modal Component
 * 
 * A dialog overlay component with animations and keyboard handling.
 * Renders in a portal to avoid z-index issues.
 * 
 * @example
 * ```tsx
 * <Modal isOpen={isOpen} onClose={handleClose} title="Confirm Action" size="md">
 *   <ModalBody>
 *     Are you sure you want to proceed?
 *   </ModalBody>
 *   <ModalFooter>
 *     <Button onClick={handleClose}>Cancel</Button>
 *     <Button colorScheme="red" onClick={handleConfirm}>Confirm</Button>
 *   </ModalFooter>
 * </Modal>
 * ```
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  hideCloseButton = false,
  closeOnBackdropClick = true,
  closeOnEscape = true,
}) => {
  // Size mappings
  const sizeMap = {
    sm: '400px',
    md: '600px',
    lg: '800px',
    xl: '1200px',
    full: '100vw',
  };

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            position="fixed"
            inset="0"
            bg="blackAlpha.600"
            backdropFilter="blur(4px)"
            zIndex={1400}
            onClick={closeOnBackdropClick ? onClose : undefined}
          />

          {/* Modal */}
          <Box
            position="fixed"
            inset="0"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={1400}
            p={4}
            pointerEvents="none"
          >
            <MotionBox
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              w="full"
              maxW={sizeMap[size]}
              maxH="90vh"
              bg="white"
              borderRadius="xl"
              boxShadow="2xl"
              display="flex"
              flexDirection="column"
              overflow="hidden"
              pointerEvents="auto"
              _dark={{
                bg: 'gray.800',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              {(title || !hideCloseButton) && (
                <Flex
                  align="center"
                  justify="space-between"
                  px={6}
                  py={4}
                  borderBottomWidth="1px"
                  borderColor="gray.200"
                  _dark={{
                    borderColor: 'gray.700',
                  }}
                >
                  {title && (
                    <Text
                      fontSize="lg"
                      fontWeight="semibold"
                      color="gray.900"
                      _dark={{ color: 'gray.100' }}
                    >
                      {title}
                    </Text>
                  )}

                  {!hideCloseButton && (
                    <Box
                      as="button"
                      onClick={onClose}
                      ml="auto"
                      p={1}
                      borderRadius="md"
                      color="gray.500"
                      transition="all 0.2s"
                      _hover={{
                        bg: 'gray.100',
                        color: 'gray.700',
                      }}
                      _dark={{
                        color: 'gray.400',
                        _hover: {
                          bg: 'gray.700',
                          color: 'gray.200',
                        },
                      }}
                      aria-label="Close modal"
                    >
                      <X size={20} />
                    </Box>
                  )}
                </Flex>
              )}

              {/* Content */}
              <Box
                flex="1"
                overflowY="auto"
                css={{
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    background: 'rgba(0,0,0,0.3)',
                  },
                }}
              >
                {children}
              </Box>
            </MotionBox>
          </Box>
        </>
      )}
    </AnimatePresence>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
};

/**
 * ModalHeader Component
 */
export const ModalHeader: React.FC<ModalHeaderProps> = ({ children }) => {
  return (
    <Box
      px={6}
      py={4}
      borderBottomWidth="1px"
      borderColor="gray.200"
      _dark={{
        borderColor: 'gray.700',
      }}
    >
      <Text
        fontSize="lg"
        fontWeight="semibold"
        color="gray.900"
        _dark={{ color: 'gray.100' }}
      >
        {children}
      </Text>
    </Box>
  );
};

/**
 * ModalBody Component
 */
export const ModalBody: React.FC<ModalBodyProps> = ({ children }) => {
  return (
    <Box px={6} py={4}>
      {children}
    </Box>
  );
};

/**
 * ModalFooter Component
 */
export const ModalFooter: React.FC<ModalFooterProps> = ({ children }) => {
  return (
    <Flex
      px={6}
      py={4}
      gap={3}
      justify="flex-end"
      borderTopWidth="1px"
      borderColor="gray.200"
      _dark={{
        borderColor: 'gray.700',
      }}
    >
      {children}
    </Flex>
  );
};
