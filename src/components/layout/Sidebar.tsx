import { 
  Box, 
  Stack,
  Text, 
  Flex,
  Badge,
} from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  Link as LinkIcon, 
  CheckSquare, 
  DollarSign,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

const MotionBox = motion.create(Box);

interface NavItem {
  name: string;
  icon: any;
  path: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Notes', icon: FileText, path: '/notes' },
  { name: 'Links', icon: LinkIcon, path: '/links' },
  { name: 'Projects', icon: CheckSquare, path: '/tasks' },
  { name: 'Finance', icon: DollarSign, path: '/finance' },
  { name: 'Settings', icon: Settings, path: '/settings' },
];

interface NavItemComponentProps {
  item: NavItem;
  isActive: boolean;
  isOpen: boolean;
}

const NavItemComponent = ({ item, isActive, isOpen }: NavItemComponentProps) => {
  const Icon = item.icon;

  return (
    <Link to={item.path} style={{ width: '100%', textDecoration: 'none' }}>
      <MotionBox
        as="button"
        w="100%"
        px={4}
        py={3}
        borderRadius="lg"
        bg={isActive ? { base: 'brand.50', _dark: 'brand.900' } : 'transparent'}
        color={isActive ? { base: 'brand.600', _dark: 'brand.200' } : 'inherit'}
        fontWeight={isActive ? 'semibold' : 'medium'}
        fontSize="sm"
        _hover={{
          bg: isActive ? { base: 'brand.50', _dark: 'brand.900' } : { base: 'gray.100', _dark: 'gray.700' },
          transform: 'translateX(4px)',
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        textAlign="left"
        display="flex"
        alignItems="center"
        gap={3}
      >
        <Icon size={20} />
        {isOpen && (
          <Text flex="1">{item.name}</Text>
        )}
        {item.badge && isOpen && (
          <Badge colorScheme="brand" borderRadius="full" px={2}>
            {item.badge}
          </Badge>
        )}
      </MotionBox>
    </Link>
  );
};

const SidebarContent = ({ isOpen }: { isOpen: boolean }) => {
  const location = useLocation();

  return (
    <Box
      w={isOpen ? '280px' : '60px'}
      h="full"
      bg={{ base: 'white', _dark: 'gray.800' }}
      borderRight="1px"
      borderColor={{ base: 'gray.200', _dark: 'gray.700' }}
      position="fixed"
      left={0}
      top="60px" // TopBar height
      style={{
        transition: 'width 0.3s ease',
      }}
      overflowY="auto"
      overflowX="hidden"
    >
      <Stack gap={2} p={4}>
        {/* Logo / Branding */}
        <Flex
          mb={4}
          justifyContent={isOpen ? 'flex-start' : 'center'}
          alignItems="center"
          px={isOpen ? 2 : 0}
        >
          <MotionBox
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <Text
              fontSize={isOpen ? 'xl' : 'md'}
              fontWeight="bold"
              bgGradient="linear(to-r, brand.500, purple.500)"
              bgClip="text"
            >
              {isOpen ? 'ProductivePro' : 'PP'}
            </Text>
          </MotionBox>
        </Flex>

        {/* Navigation Items */}
        {navItems.map((item) => (
          <NavItemComponent
            key={item.path}
            item={item}
            isActive={location.pathname === item.path}
            isOpen={isOpen}
          />
        ))}
      </Stack>
    </Box>
  );
};

const Sidebar = ({ isOpen }: SidebarProps) => {
  // For now, just render desktop version
  // Mobile drawer will be added later
  return <SidebarContent isOpen={isOpen} />;
};

export default Sidebar;
