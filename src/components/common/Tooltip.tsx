import { useState, useRef, useEffect, cloneElement, isValidElement } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

const MotionBox = motion.create(Box);

/**
 * Tooltip placement options
 */
export type TooltipPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

/**
 * Tooltip component props
 */
export interface TooltipProps {
  /**
   * Tooltip label/content
   */
  label: string;
  
  /**
   * Tooltip placement
   * @default 'top'
   */
  placement?: TooltipPlacement;
  
  /**
   * Element to attach tooltip to
   */
  children: React.ReactElement;
  
  /**
   * Show arrow pointing to element
   * @default true
   */
  hasArrow?: boolean;
  
  /**
   * Delay before showing (ms)
   * @default 300
   */
  openDelay?: number;
  
  /**
   * Delay before hiding (ms)
   * @default 0
   */
  closeDelay?: number;
  
  /**
   * Disable the tooltip
   */
  isDisabled?: boolean;
  
  /**
   * Color scheme
   * @default 'gray'
   */
  colorScheme?: 'gray' | 'brand' | 'red' | 'green' | 'blue';
}

/**
 * Tooltip Component
 * 
 * A tooltip component that shows additional information on hover or focus.
 * Fully accessible with proper ARIA attributes.
 * 
 * @example
 * ```tsx
 * <Tooltip label="Click to save your changes">
 *   <Button>Save</Button>
 * </Tooltip>
 * 
 * <Tooltip label="Required field" placement="right" colorScheme="red">
 *   <Input />
 * </Tooltip>
 * ```
 */
export const Tooltip: React.FC<TooltipProps> = ({
  label,
  placement = 'top',
  children,
  hasArrow = true,
  openDelay = 300,
  closeDelay = 0,
  isDisabled = false,
  colorScheme = 'gray',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const openTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const closeTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Calculate tooltip position
  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const offset = 8; // Gap between element and tooltip
    const arrowSize = hasArrow ? 6 : 0;

    let top = 0;
    let left = 0;

    // Calculate based on placement
    switch (placement) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - offset - arrowSize;
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        break;
      case 'top-start':
        top = triggerRect.top - tooltipRect.height - offset - arrowSize;
        left = triggerRect.left;
        break;
      case 'top-end':
        top = triggerRect.top - tooltipRect.height - offset - arrowSize;
        left = triggerRect.right - tooltipRect.width;
        break;
      case 'bottom':
        top = triggerRect.bottom + offset + arrowSize;
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        break;
      case 'bottom-start':
        top = triggerRect.bottom + offset + arrowSize;
        left = triggerRect.left;
        break;
      case 'bottom-end':
        top = triggerRect.bottom + offset + arrowSize;
        left = triggerRect.right - tooltipRect.width;
        break;
      case 'left':
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.left - tooltipRect.width - offset - arrowSize;
        break;
      case 'left-start':
        top = triggerRect.top;
        left = triggerRect.left - tooltipRect.width - offset - arrowSize;
        break;
      case 'left-end':
        top = triggerRect.bottom - tooltipRect.height;
        left = triggerRect.left - tooltipRect.width - offset - arrowSize;
        break;
      case 'right':
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.right + offset + arrowSize;
        break;
      case 'right-start':
        top = triggerRect.top;
        left = triggerRect.right + offset + arrowSize;
        break;
      case 'right-end':
        top = triggerRect.bottom - tooltipRect.height;
        left = triggerRect.right + offset + arrowSize;
        break;
    }

    // Keep tooltip in viewport
    const viewportPadding = 8;
    if (left < viewportPadding) left = viewportPadding;
    if (left + tooltipRect.width > window.innerWidth - viewportPadding) {
      left = window.innerWidth - tooltipRect.width - viewportPadding;
    }
    if (top < viewportPadding) top = viewportPadding;

    setTooltipPosition({ top, left });
  };

  const handleOpen = () => {
    if (isDisabled) return;
    
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }

    openTimeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, openDelay);
  };

  const handleClose = () => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
    }

    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, closeDelay);
  };

  // Recalculate position when tooltip opens
  useEffect(() => {
    if (isOpen) {
      calculatePosition();
      window.addEventListener('scroll', calculatePosition, true);
      window.addEventListener('resize', calculatePosition);

      return () => {
        window.removeEventListener('scroll', calculatePosition, true);
        window.removeEventListener('resize', calculatePosition);
      };
    }
  }, [isOpen]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  // Color scheme configurations
  const colorSchemes = {
    gray: {
      bg: 'gray.700',
      color: 'white',
      darkBg: 'gray.900',
    },
    brand: {
      bg: 'brand.500',
      color: 'white',
      darkBg: 'brand.600',
    },
    red: {
      bg: 'red.500',
      color: 'white',
      darkBg: 'red.600',
    },
    green: {
      bg: 'green.500',
      color: 'white',
      darkBg: 'green.600',
    },
    blue: {
      bg: 'blue.500',
      color: 'white',
      darkBg: 'blue.600',
    },
  };

  const colors = colorSchemes[colorScheme];

  // Get arrow position
  const getArrowStyles = () => {
    const arrowSize = 6;
    const styles: any = {
      position: 'absolute',
      width: 0,
      height: 0,
      borderStyle: 'solid',
    };

    if (placement.startsWith('top')) {
      styles.bottom = -arrowSize;
      styles.left = '50%';
      styles.transform = 'translateX(-50%)';
      styles.borderWidth = `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`;
      styles.borderColor = `${colors.bg} transparent transparent transparent`;
    } else if (placement.startsWith('bottom')) {
      styles.top = -arrowSize;
      styles.left = '50%';
      styles.transform = 'translateX(-50%)';
      styles.borderWidth = `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`;
      styles.borderColor = `transparent transparent ${colors.bg} transparent`;
    } else if (placement.startsWith('left')) {
      styles.right = -arrowSize;
      styles.top = '50%';
      styles.transform = 'translateY(-50%)';
      styles.borderWidth = `${arrowSize}px 0 ${arrowSize}px ${arrowSize}px`;
      styles.borderColor = `transparent transparent transparent ${colors.bg}`;
    } else if (placement.startsWith('right')) {
      styles.left = -arrowSize;
      styles.top = '50%';
      styles.transform = 'translateY(-50%)';
      styles.borderWidth = `${arrowSize}px ${arrowSize}px ${arrowSize}px 0`;
      styles.borderColor = `transparent ${colors.bg} transparent transparent`;
    }

    return styles;
  };

  // Clone child and add event handlers
  const clonedChild = isValidElement(children)
    ? cloneElement(children, {
        ref: triggerRef,
        onMouseEnter: handleOpen,
        onMouseLeave: handleClose,
        onFocus: handleOpen,
        onBlur: handleClose,
        'aria-describedby': isOpen ? 'tooltip' : undefined,
      } as any)
    : children;

  const tooltipContent = (
    <AnimatePresence>
      {isOpen && (
        <MotionBox
          ref={tooltipRef}
          id="tooltip"
          role="tooltip"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          position="fixed"
          top={tooltipPosition.top}
          left={tooltipPosition.left}
          zIndex={1500}
          pointerEvents="none"
        >
          <Box
            bg={colors.bg}
            color={colors.color}
            px={3}
            py={2}
            borderRadius="md"
            fontSize="sm"
            fontWeight="medium"
            maxW="320px"
            boxShadow="lg"
            position="relative"
            _dark={{
              bg: colors.darkBg,
            }}
          >
            <Text>{label}</Text>
            
            {/* Arrow */}
            {hasArrow && <Box as="span" css={getArrowStyles()} />}
          </Box>
        </MotionBox>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {clonedChild}
      {typeof document !== 'undefined' && createPortal(tooltipContent, document.body)}
    </>
  );
};
