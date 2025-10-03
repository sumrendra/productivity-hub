import { useState, useRef, useEffect, cloneElement, isValidElement } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

const MotionBox = motion.create(Box);

/**
 * Menu item data
 */
export interface MenuItem {
  /**
   * Item label
   */
  label: string;
  
  /**
   * Item value/key
   */
  value: string;
  
  /**
   * Icon for the item
   */
  icon?: React.ReactNode;
  
  /**
   * Disabled state
   */
  disabled?: boolean;
  
  /**
   * Show divider after this item
   */
  divider?: boolean;
  
  /**
   * Color scheme for dangerous actions
   */
  colorScheme?: 'default' | 'danger';
}

/**
 * Menu component props
 */
export interface MenuProps {
  /**
   * Menu items
   */
  items: MenuItem[];
  
  /**
   * Trigger element
   */
  children: React.ReactElement;
  
  /**
   * Callback when item is selected
   */
  onSelect?: (item: MenuItem) => void;
  
  /**
   * Selected value (for controlled mode)
   */
  value?: string;
  
  /**
   * Menu placement
   * @default 'bottom-start'
   */
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  
  /**
   * Close on select
   * @default true
   */
  closeOnSelect?: boolean;
}

/**
 * Menu Component
 * 
 * A dropdown menu component with keyboard navigation and animations.
 * 
 * @example
 * ```tsx
 * <Menu
 *   items={[
 *     { label: 'Edit', value: 'edit', icon: <EditIcon /> },
 *     { label: 'Delete', value: 'delete', icon: <TrashIcon />, colorScheme: 'danger' }
 *   ]}
 *   onSelect={(item) => console.log(item)}
 * >
 *   <Button>Actions</Button>
 * </Menu>
 * ```
 */
export const Menu: React.FC<MenuProps> = ({
  items,
  children,
  onSelect,
  value,
  placement = 'bottom-start',
  closeOnSelect = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const triggerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Calculate menu position
  const calculatePosition = () => {
    if (!triggerRef.current || !menuRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();
    const offset = 4;

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'bottom-start':
        top = triggerRect.bottom + offset;
        left = triggerRect.left;
        break;
      case 'bottom-end':
        top = triggerRect.bottom + offset;
        left = triggerRect.right - menuRect.width;
        break;
      case 'top-start':
        top = triggerRect.top - menuRect.height - offset;
        left = triggerRect.left;
        break;
      case 'top-end':
        top = triggerRect.top - menuRect.height - offset;
        left = triggerRect.right - menuRect.width;
        break;
    }

    // Keep menu in viewport
    const viewportPadding = 8;
    if (left < viewportPadding) left = viewportPadding;
    if (left + menuRect.width > window.innerWidth - viewportPadding) {
      left = window.innerWidth - menuRect.width - viewportPadding;
    }
    if (top < viewportPadding) top = viewportPadding;
    if (top + menuRect.height > window.innerHeight - viewportPadding) {
      top = window.innerHeight - menuRect.height - viewportPadding;
    }

    setMenuPosition({ top, left });
  };

  // Toggle menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
    setFocusedIndex(-1);
  };

  // Close menu
  const closeMenu = () => {
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  // Handle item click
  const handleItemClick = (item: MenuItem) => {
    if (item.disabled) return;
    
    onSelect?.(item);
    
    if (closeOnSelect) {
      closeMenu();
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return;

    const enabledItems = items.filter((item) => !item.disabled);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => {
          const nextIndex = prev + 1;
          return nextIndex >= enabledItems.length ? 0 : nextIndex;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => {
          const prevIndex = prev - 1;
          return prevIndex < 0 ? enabledItems.length - 1 : prevIndex;
        });
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < enabledItems.length) {
          handleItemClick(enabledItems[focusedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        closeMenu();
        triggerRef.current?.focus();
        break;
    }
  };

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, focusedIndex]);

  // Recalculate position when menu opens
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

  // Clone trigger element
  const clonedTrigger = isValidElement(children)
    ? cloneElement(children, {
        ref: triggerRef,
        onClick: toggleMenu,
        'aria-haspopup': 'true',
        'aria-expanded': isOpen,
      } as any)
    : children;

  const menuContent = (
    <AnimatePresence>
      {isOpen && (
        <MotionBox
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
          position="fixed"
          top={menuPosition.top}
          left={menuPosition.left}
          zIndex={1500}
          minW="200px"
          bg="white"
          borderRadius="lg"
          boxShadow="xl"
          borderWidth="1px"
          borderColor="gray.200"
          py={1}
          _dark={{
            bg: 'gray.800',
            borderColor: 'gray.700',
          }}
          role="menu"
        >
          {items.map((item, index) => {
            const isFocused = index === focusedIndex;
            const isSelected = value === item.value;
            const isDanger = item.colorScheme === 'danger';

            return (
              <Box key={item.value}>
                <Flex
                  as="button"
                  role="menuitem"
                  w="full"
                  align="center"
                  gap={3}
                  px={3}
                  py={2}
                  cursor={item.disabled ? 'not-allowed' : 'pointer'}
                  opacity={item.disabled ? 0.5 : 1}
                  bg={isFocused ? (isDanger ? 'red.50' : 'gray.50') : 'transparent'}
                  color={isDanger ? 'red.600' : 'gray.700'}
                  fontSize="sm"
                  fontWeight="medium"
                  textAlign="left"
                  transition="all 0.15s"
                  _hover={
                    !item.disabled
                      ? {
                          bg: isDanger ? 'red.50' : 'gray.100',
                        }
                      : undefined
                  }
                  _dark={{
                    color: isDanger ? 'red.400' : 'gray.200',
                    bg: isFocused ? (isDanger ? 'red.900' : 'gray.700') : 'transparent',
                    _hover: !item.disabled
                      ? {
                          bg: isDanger ? 'red.900' : 'gray.700',
                        }
                      : undefined,
                  }}
                  onClick={() => handleItemClick(item)}
                  _disabled={item.disabled ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                >
                  {/* Icon */}
                  {item.icon && (
                    <Box display="inline-flex" flexShrink={0}>
                      {item.icon}
                    </Box>
                  )}

                  {/* Label */}
                  <Text flex="1">{item.label}</Text>

                  {/* Check mark for selected item */}
                  {isSelected && (
                    <Box display="inline-flex" flexShrink={0}>
                      <Check size={16} />
                    </Box>
                  )}
                </Flex>

                {/* Divider */}
                {item.divider && (
                  <Box
                    h="1px"
                    bg="gray.200"
                    my={1}
                    _dark={{
                      bg: 'gray.700',
                    }}
                  />
                )}
              </Box>
            );
          })}
        </MotionBox>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {clonedTrigger}
      {typeof document !== 'undefined' && createPortal(menuContent, document.body)}
    </>
  );
};
