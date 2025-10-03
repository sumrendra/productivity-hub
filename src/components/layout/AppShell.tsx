import { ReactNode, useState } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { fadeVariants } from '../../config/animations';

interface AppShellProps {
  children: ReactNode;
}

const MotionBox = motion.create(Box);

const AppShell = ({ children }: AppShellProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isMobile = false; // TODO: Add responsive detection

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  return (
    <Flex h="100vh" overflow="hidden" direction="column">
      {/* Top Bar */}
      <TopBar onMenuClick={handleSidebarToggle} isSidebarOpen={isSidebarOpen} />

      {/* Main Content Area */}
      <Flex flex="1" overflow="hidden">
        {/* Sidebar */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={handleSidebarClose}
          isMobile={isMobile}
        />

        {/* Content Area */}
        <MotionBox
          flex="1"
          overflow="auto"
          bg={{ base: 'gray.50', _dark: 'gray.900' }}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={fadeVariants}
          ml={isMobile ? 0 : (isSidebarOpen ? '280px' : '0px')}
          style={{
            transition: 'margin-left 0.3s ease',
          }}
        >
          <Box maxW="1400px" mx="auto" p={{ base: 4, md: 6, lg: 8 }}>
            {children}
          </Box>
        </MotionBox>
      </Flex>
    </Flex>
  );
};

export default AppShell;
