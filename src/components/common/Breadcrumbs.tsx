import { Fragment } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Breadcrumb item data
 */
export interface BreadcrumbItem {
  /**
   * Label to display
   */
  label: string;
  
  /**
   * Link href (optional for current page)
   */
  href?: string;
  
  /**
   * Custom icon
   */
  icon?: React.ReactNode;
}

/**
 * Breadcrumbs component props
 */
export interface BreadcrumbsProps {
  /**
   * Breadcrumb items
   */
  items: BreadcrumbItem[];
  
  /**
   * Separator icon/element
   */
  separator?: React.ReactNode;
  
  /**
   * Maximum items to show before collapsing
   * @default undefined (show all)
   */
  maxItems?: number;
  
  /**
   * Size of breadcrumbs
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Custom click handler for breadcrumb items
   */
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
}

/**
 * Breadcrumbs Component
 * 
 * Navigation breadcrumbs to show current page location in hierarchy.
 * Supports collapsing for long paths and custom separators.
 * 
 * @example
 * ```tsx
 * <Breadcrumbs
 *   items={[
 *     { label: 'Home', href: '/' },
 *     { label: 'Products', href: '/products' },
 *     { label: 'Electronics', href: '/products/electronics' },
 *     { label: 'Laptop' }
 *   ]}
 * />
 * 
 * <Breadcrumbs
 *   items={items}
 *   maxItems={3}
 *   size="sm"
 * />
 * ```
 */
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  separator = <ChevronRight size={16} />,
  maxItems,
  size = 'md',
  onItemClick,
}) => {
  // Size styles
  const sizeStyles = {
    sm: {
      fontSize: 'xs',
      gap: 1,
    },
    md: {
      fontSize: 'sm',
      gap: 2,
    },
    lg: {
      fontSize: 'md',
      gap: 2,
    },
  };

  const styles = sizeStyles[size];

  // Handle collapsing for long breadcrumb trails
  const getDisplayItems = (): BreadcrumbItem[] => {
    if (!maxItems || items.length <= maxItems) {
      return items;
    }

    // Show first item, ellipsis, and last (maxItems - 1) items
    const firstItem = items[0];
    const lastItems = items.slice(-(maxItems - 1));

    return [
      firstItem,
      { label: '...', href: undefined },
      ...lastItems,
    ];
  };

  const displayItems = getDisplayItems();

  const handleItemClick = (item: BreadcrumbItem, index: number, e: React.MouseEvent) => {
    if (onItemClick) {
      e.preventDefault();
      onItemClick(item, index);
    }
  };

  return (
    <Box
      as="nav"
      aria-label="Breadcrumb"
      fontSize={styles.fontSize}
    >
      <Flex
        as="ol"
        align="center"
        gap={styles.gap}
        flexWrap="wrap"
        listStyleType="none"
        m={0}
        p={0}
      >
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isEllipsis = item.label === '...';

          return (
            <Fragment key={`${item.label}-${index}`}>
              <Flex
                as="li"
                align="center"
                gap={2}
              >
                {/* Icon */}
                {item.icon && (
                  <Box
                    color={isLast ? 'gray.700' : 'gray.500'}
                    _dark={{
                      color: isLast ? 'gray.300' : 'gray.500',
                    }}
                    display="inline-flex"
                  >
                    {item.icon}
                  </Box>
                )}

                {/* Breadcrumb item */}
                {isEllipsis ? (
                  <Text
                    color="gray.500"
                    _dark={{ color: 'gray.500' }}
                    cursor="default"
                    userSelect="none"
                  >
                    {item.label}
                  </Text>
                ) : item.href && !isLast ? (
                  <Link
                    to={item.href}
                    onClick={(e) => handleItemClick(item, index, e)}
                    style={{ textDecoration: 'none' }}
                  >
                    <Text
                      color="gray.600"
                      fontWeight="medium"
                      transition="color 0.2s"
                      _hover={{
                        color: 'brand.500',
                        textDecoration: 'underline',
                      }}
                      _dark={{
                        color: 'gray.400',
                        _hover: {
                          color: 'brand.400',
                        },
                      }}
                    >
                      {item.label}
                    </Text>
                  </Link>
                ) : (
                  <Text
                    color="gray.900"
                    fontWeight="semibold"
                    aria-current={isLast ? 'page' : undefined}
                    _dark={{
                      color: 'gray.100',
                    }}
                  >
                    {item.label}
                  </Text>
                )}
              </Flex>

              {/* Separator */}
              {!isLast && (
                <Box
                  as="li"
                  display="inline-flex"
                  alignItems="center"
                  color="gray.400"
                  _dark={{
                    color: 'gray.600',
                  }}
                  aria-hidden="true"
                >
                  {separator}
                </Box>
              )}
            </Fragment>
          );
        })}
      </Flex>
    </Box>
  );
};
