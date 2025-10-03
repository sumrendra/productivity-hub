import { useState, createContext, useContext } from 'react';
import { Box, Flex } from '@chakra-ui/react';

/**
 * Tabs context
 */
interface TabsContextValue {
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  variant: 'line' | 'enclosed' | 'soft-rounded';
  colorScheme: string;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tab components must be used within Tabs');
  }
  return context;
};

/**
 * Tabs component props
 */
export interface TabsProps {
  /**
   * Currently selected tab index
   */
  index?: number;
  
  /**
   * Default selected index
   */
  defaultIndex?: number;
  
  /**
   * Callback when tab changes
   */
  onChange?: (index: number) => void;
  
  /**
   * Tab variant
   * @default 'line'
   */
  variant?: 'line' | 'enclosed' | 'soft-rounded';
  
  /**
   * Color scheme
   * @default 'brand'
   */
  colorScheme?: 'brand' | 'gray' | 'red' | 'green' | 'blue' | 'purple';
  
  /**
   * Tabs orientation
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';
  
  /**
   * Tab children (TabList and TabPanels)
   */
  children: React.ReactNode;
}

/**
 * TabList component props
 */
export interface TabListProps {
  children: React.ReactNode;
}

/**
 * Tab component props
 */
export interface TabProps {
  children: React.ReactNode;
  isDisabled?: boolean;
}

/**
 * TabPanels component props
 */
export interface TabPanelsProps {
  children: React.ReactNode;
}

/**
 * TabPanel component props
 */
export interface TabPanelProps {
  children: React.ReactNode;
}

/**
 * Tabs Component
 * 
 * A tab navigation component with multiple variants and keyboard navigation.
 * 
 * @example
 * ```tsx
 * <Tabs defaultIndex={0} variant="line">
 *   <TabList>
 *     <Tab>Overview</Tab>
 *     <Tab>Details</Tab>
 *     <Tab>Settings</Tab>
 *   </TabList>
 *   <TabPanels>
 *     <TabPanel>Overview content</TabPanel>
 *     <TabPanel>Details content</TabPanel>
 *     <TabPanel>Settings content</TabPanel>
 *   </TabPanels>
 * </Tabs>
 * ```
 */
export const Tabs: React.FC<TabsProps> = ({
  index: controlledIndex,
  defaultIndex = 0,
  onChange,
  variant = 'line',
  colorScheme = 'brand',
  orientation = 'horizontal',
  children,
}) => {
  const [uncontrolledIndex, setUncontrolledIndex] = useState(defaultIndex);
  
  const isControlled = controlledIndex !== undefined;
  const selectedIndex = isControlled ? controlledIndex : uncontrolledIndex;

  const setSelectedIndex = (index: number) => {
    if (!isControlled) {
      setUncontrolledIndex(index);
    }
    onChange?.(index);
  };

  return (
    <TabsContext.Provider value={{ selectedIndex, setSelectedIndex, variant, colorScheme }}>
      <Box
        display="flex"
        flexDirection={orientation === 'vertical' ? 'row' : 'column'}
        gap={orientation === 'vertical' ? 4 : 0}
      >
        {children}
      </Box>
    </TabsContext.Provider>
  );
};

/**
 * TabList Component
 */
export const TabList: React.FC<TabListProps> = ({ children }) => {
  const { variant } = useTabsContext();

  return (
    <Flex
      role="tablist"
      gap={variant === 'line' ? 0 : 2}
      borderBottomWidth={variant === 'line' ? '2px' : '0'}
      borderColor="gray.200"
      _dark={{
        borderColor: 'gray.700',
      }}
    >
      {children}
    </Flex>
  );
};

/**
 * Tab Component
 */
export const Tab: React.FC<TabProps> = ({ children, isDisabled = false }) => {
  const { selectedIndex, setSelectedIndex, variant, colorScheme } = useTabsContext();
  const [tabIndex, setTabIndex] = useState(0);

  // Get tab index from parent
  const getTabIndex = () => {
    const tabList = document.querySelectorAll('[role="tab"]');
    for (let i = 0; i < tabList.length; i++) {
      if (tabList[i] === document.activeElement) {
        return i;
      }
    }
    return 0;
  };

  const isSelected = selectedIndex === tabIndex;

  // Variant styles
  const variantStyles = {
    line: {
      base: {
        pb: 3,
        mb: '-2px',
        borderBottomWidth: '2px',
        borderColor: isSelected ? `${colorScheme}.500` : 'transparent',
        color: isSelected ? `${colorScheme}.500` : 'gray.600',
        _hover: {
          color: isSelected ? `${colorScheme}.600` : 'gray.700',
          borderColor: isSelected ? `${colorScheme}.600` : 'gray.300',
        },
        _dark: {
          color: isSelected ? `${colorScheme}.400` : 'gray.400',
          _hover: {
            color: isSelected ? `${colorScheme}.300` : 'gray.300',
            borderColor: isSelected ? `${colorScheme}.300` : 'gray.600',
          },
        },
      },
    },
    enclosed: {
      base: {
        borderWidth: '1px',
        borderColor: isSelected ? 'gray.200' : 'transparent',
        borderBottomColor: isSelected ? 'white' : 'transparent',
        bg: isSelected ? 'white' : 'transparent',
        mb: '-1px',
        color: isSelected ? `${colorScheme}.500` : 'gray.600',
        _hover: {
          bg: isSelected ? 'white' : 'gray.50',
        },
        _dark: {
          borderColor: isSelected ? 'gray.700' : 'transparent',
          borderBottomColor: isSelected ? 'gray.800' : 'transparent',
          bg: isSelected ? 'gray.800' : 'transparent',
          color: isSelected ? `${colorScheme}.400` : 'gray.400',
          _hover: {
            bg: isSelected ? 'gray.800' : 'gray.900',
          },
        },
      },
    },
    'soft-rounded': {
      base: {
        borderRadius: 'md',
        bg: isSelected ? `${colorScheme}.100` : 'transparent',
        color: isSelected ? `${colorScheme}.700` : 'gray.600',
        _hover: {
          bg: isSelected ? `${colorScheme}.200` : 'gray.100',
        },
        _dark: {
          bg: isSelected ? `${colorScheme}.900` : 'transparent',
          color: isSelected ? `${colorScheme}.200` : 'gray.400',
          _hover: {
            bg: isSelected ? `${colorScheme}.800` : 'gray.800',
          },
        },
      },
    },
  };

  const handleClick = () => {
    if (!isDisabled) {
      const index = getTabIndex();
      setTabIndex(index);
      setSelectedIndex(index);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isDisabled) return;

    const tabs = Array.from(document.querySelectorAll('[role="tab"]:not([disabled])'));
    const currentIndex = tabs.indexOf(e.currentTarget);

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % tabs.length;
      (tabs[nextIndex] as HTMLElement).focus();
      setSelectedIndex(nextIndex);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      (tabs[prevIndex] as HTMLElement).focus();
      setSelectedIndex(prevIndex);
    }
  };

  return (
    <Box
      as="button"
      role="tab"
      aria-selected={isSelected}
      aria-disabled={isDisabled}
      _disabled={isDisabled ? { cursor: 'not-allowed', opacity: 0.4 } : undefined}
      tabIndex={isSelected ? 0 : -1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      px={4}
      py={2}
      fontSize="sm"
      fontWeight="medium"
      transition="all 0.2s"
      cursor={isDisabled ? 'not-allowed' : 'pointer'}
      opacity={isDisabled ? 0.4 : 1}
      outline="none"
      _focus={{
        boxShadow: 'outline',
      }}
      {...variantStyles[variant].base}
    >
      {children}
    </Box>
  );
};

/**
 * TabPanels Component
 */
export const TabPanels: React.FC<TabPanelsProps> = ({ children }) => {
  return <Box mt={4}>{children}</Box>;
};

/**
 * TabPanel Component
 */
export const TabPanel: React.FC<TabPanelProps> = ({ children }) => {
  const { selectedIndex } = useTabsContext();
  const panels = Array.isArray(children) ? children : [children];
  
  return (
    <Box role="tabpanel">
      {panels[selectedIndex]}
    </Box>
  );
};
