import { useState } from 'react';
import { Box, Grid, Heading, Text, Flex, Stack } from '@chakra-ui/react';
import { User, Bell, Lock, Palette, Database } from 'lucide-react';
import {
  Card,
  CardBody,
  Button,
  Input,
  Badge,
  Alert,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@components/common';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    // Simulate save
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <Box>
      {/* Header */}
      <Box mb={6}>
        <Heading size="2xl" mb={2}>
          Settings
        </Heading>
        <Text color="gray.600" _dark={{ color: 'gray.400' }}>
          Manage your account settings and preferences
        </Text>
      </Box>

      {saveSuccess && (
        <Alert variant="success" closable onClose={() => setSaveSuccess(false)} title="Settings saved!">
          Your changes have been saved successfully.
        </Alert>
      )}

      <Card variant="elevated" mt={6}>
        <CardBody>
          <Tabs defaultIndex={activeTab} onChange={setActiveTab}>
            <TabList>
              <Tab>
                <Flex align="center" gap={2}>
                  <User size={16} />
                  Profile
                </Flex>
              </Tab>
              <Tab>
                <Flex align="center" gap={2}>
                  <Bell size={16} />
                  Notifications
                </Flex>
              </Tab>
              <Tab>
                <Flex align="center" gap={2}>
                  <Lock size={16} />
                  Security
                </Flex>
              </Tab>
              <Tab>
                <Flex align="center" gap={2}>
                  <Palette size={16} />
                  Appearance
                </Flex>
              </Tab>
              <Tab>
                <Flex align="center" gap={2}>
                  <Database size={16} />
                  Data
                </Flex>
              </Tab>
            </TabList>

            <TabPanels>
              {/* Profile Settings */}
              <TabPanel>
                <Stack gap={6}>
                  <Box>
                    <Heading size="md" mb={4}>
                      Profile Information
                    </Heading>
                    <Stack gap={4}>
                      <Input label="Full Name" placeholder="John Doe" defaultValue="John Doe" />
                      <Input
                        label="Email"
                        type="email"
                        placeholder="john@example.com"
                        defaultValue="john@example.com"
                      />
                      <Input label="Job Title" placeholder="Product Manager" />
                      <Input label="Company" placeholder="Acme Inc." />
                    </Stack>
                  </Box>

                  <Box>
                    <Heading size="sm" mb={3}>
                      Bio
                    </Heading>
                    <textarea
                      placeholder="Tell us about yourself..."
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--chakra-colors-gray-300)',
                        fontSize: '1rem',
                      }}
                    />
                  </Box>

                  <Flex justify="flex-end" gap={3}>
                    <Button variant="ghost">Cancel</Button>
                    <Button colorScheme="brand" onClick={handleSave}>
                      Save Changes
                    </Button>
                  </Flex>
                </Stack>
              </TabPanel>

              {/* Notifications */}
              <TabPanel>
                <Stack gap={6}>
                  <Box>
                    <Heading size="md" mb={4}>
                      Notification Preferences
                    </Heading>
                    <Stack gap={4}>
                      <Card variant="subtle">
                        <CardBody>
                          <Flex justify="space-between" align="center">
                            <Box>
                              <Text fontWeight="semibold" mb={1}>
                                Email Notifications
                              </Text>
                              <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                                Receive email updates about your activity
                              </Text>
                            </Box>
                            <Badge colorScheme="green">Enabled</Badge>
                          </Flex>
                        </CardBody>
                      </Card>

                      <Card variant="subtle">
                        <CardBody>
                          <Flex justify="space-between" align="center">
                            <Box>
                              <Text fontWeight="semibold" mb={1}>
                                Task Reminders
                              </Text>
                              <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                                Get notified about upcoming tasks
                              </Text>
                            </Box>
                            <Badge colorScheme="green">Enabled</Badge>
                          </Flex>
                        </CardBody>
                      </Card>

                      <Card variant="subtle">
                        <CardBody>
                          <Flex justify="space-between" align="center">
                            <Box>
                              <Text fontWeight="semibold" mb={1}>
                                Budget Alerts
                              </Text>
                              <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                                Alerts when approaching spending limits
                              </Text>
                            </Box>
                            <Badge colorScheme="gray">Disabled</Badge>
                          </Flex>
                        </CardBody>
                      </Card>
                    </Stack>
                  </Box>

                  <Flex justify="flex-end" gap={3}>
                    <Button variant="ghost">Cancel</Button>
                    <Button colorScheme="brand" onClick={handleSave}>
                      Save Preferences
                    </Button>
                  </Flex>
                </Stack>
              </TabPanel>

              {/* Security */}
              <TabPanel>
                <Stack gap={6}>
                  <Box>
                    <Heading size="md" mb={4}>
                      Password & Security
                    </Heading>
                    <Stack gap={4}>
                      <Input label="Current Password" type="password" placeholder="••••••••" />
                      <Input
                        label="New Password"
                        type="password"
                        placeholder="••••••••"
                        helperText="Must be at least 8 characters"
                      />
                      <Input label="Confirm New Password" type="password" placeholder="••••••••" />
                    </Stack>
                  </Box>

                  <Box>
                    <Heading size="sm" mb={3}>
                      Two-Factor Authentication
                    </Heading>
                    <Card variant="subtle">
                      <CardBody>
                        <Flex justify="space-between" align="center">
                          <Box>
                            <Text fontWeight="semibold" mb={1}>
                              2FA Status
                            </Text>
                            <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                              Add an extra layer of security to your account
                            </Text>
                          </Box>
                          <Badge colorScheme="red">Not Enabled</Badge>
                        </Flex>
                      </CardBody>
                    </Card>
                  </Box>

                  <Flex justify="flex-end" gap={3}>
                    <Button variant="ghost">Cancel</Button>
                    <Button colorScheme="brand" onClick={handleSave}>
                      Update Password
                    </Button>
                  </Flex>
                </Stack>
              </TabPanel>

              {/* Appearance */}
              <TabPanel>
                <Stack gap={6}>
                  <Box>
                    <Heading size="md" mb={4}>
                      Theme & Display
                    </Heading>
                    <Stack gap={4}>
                      <Box>
                        <Text fontWeight="semibold" mb={3}>
                          Theme Mode
                        </Text>
                        <Grid templateColumns="repeat(3, 1fr)" gap={3}>
                          <Card variant="outlined" style={{ cursor: 'pointer' }}>
                            <CardBody>
                              <Text textAlign="center">☀️</Text>
                              <Text textAlign="center" fontSize="sm" mt={2}>
                                Light
                              </Text>
                            </CardBody>
                          </Card>
                          <Card variant="elevated" style={{ cursor: 'pointer' }}>
                            <CardBody>
                              <Text textAlign="center">🌙</Text>
                              <Text textAlign="center" fontSize="sm" mt={2}>
                                Dark
                              </Text>
                            </CardBody>
                          </Card>
                          <Card variant="outlined" style={{ cursor: 'pointer' }}>
                            <CardBody>
                              <Text textAlign="center">💻</Text>
                              <Text textAlign="center" fontSize="sm" mt={2}>
                                System
                              </Text>
                            </CardBody>
                          </Card>
                        </Grid>
                      </Box>

                      <Box>
                        <Text fontWeight="semibold" mb={3}>
                          Color Scheme
                        </Text>
                        <Flex gap={3} flexWrap="wrap">
                          {['blue', 'purple', 'green', 'red', 'orange'].map((color) => (
                            <Box
                              key={color}
                              w="50px"
                              h="50px"
                              borderRadius="md"
                              bg={`${color}.500`}
                              cursor="pointer"
                              _hover={{ transform: 'scale(1.1)' }}
                              transition="all 0.2s"
                            />
                          ))}
                        </Flex>
                      </Box>
                    </Stack>
                  </Box>

                  <Flex justify="flex-end" gap={3}>
                    <Button variant="ghost">Reset</Button>
                    <Button colorScheme="brand" onClick={handleSave}>
                      Apply Theme
                    </Button>
                  </Flex>
                </Stack>
              </TabPanel>

              {/* Data & Privacy */}
              <TabPanel>
                <Stack gap={6}>
                  <Box>
                    <Heading size="md" mb={4}>
                      Data Management
                    </Heading>
                    <Stack gap={4}>
                      <Card variant="subtle">
                        <CardBody>
                          <Flex justify="space-between" align="center">
                            <Box flex="1">
                              <Text fontWeight="semibold" mb={1}>
                                Export Data
                              </Text>
                              <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                                Download all your data in JSON format
                              </Text>
                            </Box>
                            <Button variant="outline" colorScheme="blue">
                              Export
                            </Button>
                          </Flex>
                        </CardBody>
                      </Card>

                      <Card variant="subtle">
                        <CardBody>
                          <Flex justify="space-between" align="center">
                            <Box flex="1">
                              <Text fontWeight="semibold" mb={1}>
                                Import Data
                              </Text>
                              <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                                Import data from a JSON file
                              </Text>
                            </Box>
                            <Button variant="outline" colorScheme="green">
                              Import
                            </Button>
                          </Flex>
                        </CardBody>
                      </Card>

                      <Card variant="outlined">
                        <CardBody>
                          <Alert variant="warning" title="Danger Zone">
                            <Stack gap={3} mt={3}>
                              <Flex justify="space-between" align="center">
                                <Box flex="1">
                                  <Text fontWeight="semibold" mb={1}>
                                    Clear All Data
                                  </Text>
                                  <Text fontSize="sm">
                                    Permanently delete all your data
                                  </Text>
                                </Box>
                                <Button variant="outline" colorScheme="red" size="sm">
                                  Clear Data
                                </Button>
                              </Flex>
                            </Stack>
                          </Alert>
                        </CardBody>
                      </Card>
                    </Stack>
                  </Box>
                </Stack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>
    </Box>
  );
};

export default SettingsPage;
