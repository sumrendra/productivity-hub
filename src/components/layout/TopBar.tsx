import {
  Box,
  Flex,
  Stack,
  IconButton,
  Input,
  Group,
  Badge,
  Text,
} from '@chakra-ui/react';
import { AvatarRoot, AvatarFallback } from '@chakra-ui/react/avatar';
import { motion } from 'framer-motion';
import {
  Menu as MenuIcon,
  Search,
  Bell,
  Command,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { ColorModeButton } from '../ui/color-mode';

interface TopBarProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

const MotionBox = motion.create(Box);

// Get page name from path
const getPageName = (pathname: string): string => {
  const routes: Record<string, string> = {
    '/': 'Dashboard',
    '/notes': 'Notes',
    '/links': 'Links',
    '/tasks': 'Projects',
    '/finance': 'Finance',
    '/settings': 'Settings',
  };
  return routes[pathname] || 'Page';
};

const TopBar = ({ onMenuClick }: TopBarProps) => {
  const location = useLocation();
  const currentPage = getPageName(location.pathname);

  return (
    <MotionBox
      as="header"
      h="60px"
      bg={{ base: 'white', _dark: 'gray.800' }}
      borderBottom="1px"
      borderColor={{ base: 'gray.200', _dark: 'gray.700' }}
      position="sticky"
      top={0}
      zIndex={10}
      boxShadow="sm"
      initial={{ y: -60 }}
      animate={{ y: 0 }}
    >
      <Flex h="full" px={4} align="center" justify="space-between">
        {/* Left Section: Menu Button + Current Page */}
        <Stack direction="row" gap={4} align="center">
          <IconButton
            aria-label="Toggle sidebar"
            variant="ghost"
            onClick={onMenuClick}
            _hover={{
              bg: { base: 'gray.100', _dark: 'gray.700' },
              transform: 'scale(1.05)',
            }}
          >
            <MenuIcon size={20} />
          </IconButton>

          <Text 
            display={{ base: 'none', md: 'block' }}
            fontWeight="semibold"
            fontSize="lg"
          >
            {currentPage}
          </Text>
        </Stack>

        {/* Center Section: Search (hidden on mobile) */}
        <Box display={{ base: 'none', lg: 'block' }} flex={1} maxW="600px" mx={8}>
          <Group>
            <Input
              placeholder="Search... (⌘K)"
              borderRadius="lg"
              bg={{ base: 'gray.50', _dark: 'gray.700' }}
              border="1px"
              borderColor="transparent"
              _hover={{
                borderColor: 'brand.300',
              }}
              _focus={{
                borderColor: 'brand.500',
                boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
              }}
            />
            <Box position="absolute" left={3} top="50%" transform="translateY(-50%)">
              <Search size={18} />
            </Box>
          </Group>
        </Box>

        {/* Right Section: Actions + User Menu */}
        <Stack direction="row" gap={2} align="center">
          {/* Command Palette Button */}
          <IconButton
            aria-label="Command palette"
            variant="ghost"
            display={{ base: 'none', md: 'flex' }}
            _hover={{
              bg: { base: 'gray.100', _dark: 'gray.700' },
            }}
          >
            <Command size={18} />
          </IconButton>

          {/* Theme Toggle */}
          <ColorModeButton />

          {/* Notifications */}
          <Box position="relative">
            <IconButton
              aria-label="Notifications"
              variant="ghost"
              _hover={{
                bg: { base: 'gray.100', _dark: 'gray.700' },
              }}
            >
              <Bell size={18} />
            </IconButton>
            <Badge
              position="absolute"
              top="6px"
              right="6px"
              colorScheme="red"
              borderRadius="full"
              boxSize="8px"
              p={0}
            />
          </Box>

          {/* User Avatar */}
          <AvatarRoot
            size="sm"
            cursor="pointer"
            _hover={{
              transform: 'scale(1.05)',
            }}
          >
            <AvatarFallback bg="brand.500" color="white">
              UN
            </AvatarFallback>
          </AvatarRoot>
        </Stack>
      </Flex>
    </MotionBox>
  );
};

export default TopBar;
