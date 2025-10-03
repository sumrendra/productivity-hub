import { useState, useEffect, useMemo } from 'react';
import { Box, Grid, Heading, Text, Flex, Stack, Input as ChakraInput } from '@chakra-ui/react';
import { Plus, Search, Edit2, Trash2, DollarSign, TrendingUp, TrendingDown, Wallet, Calendar } from 'lucide-react';
import { useFinanceStore } from '@store/financeStore';
import { expensesApi } from '@services/api';
import {
  Card,
  CardBody,
  Button,
  Badge,
  LoadingSpinner,
  EmptyState,
  Modal,
  ModalBody,
  ModalFooter,
  Input,
  Alert,
  Tooltip,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@components/common';
import type { Expense } from '@/types';

const CATEGORIES = [
  'Food',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Bills',
  'Healthcare',
  'Education',
  'Other',
];

type BadgeColorScheme = 'gray' | 'red' | 'green' | 'blue' | 'yellow' | 'purple' | 'brand';

const CATEGORY_COLORS: Record<string, BadgeColorScheme> = {
  Food: 'green',
  Transportation: 'blue',
  Entertainment: 'purple',
  Shopping: 'yellow',
  Bills: 'red',
  Healthcare: 'brand',
  Education: 'blue',
  Other: 'gray',
};

const FinancePage = () => {
  const { expenses, setExpenses, isLoading, setLoading } = useFinanceStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await expensesApi.getAll();
      setExpenses(data);
    } catch (error) {
      console.error('Failed to load expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async () => {
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      const newExpense = await expensesApi.create({
        ...formData,
        amount: parseFloat(formData.amount),
      });
      setExpenses([...expenses, newExpense]);
      setIsCreateModalOpen(false);
      setFormData({
        description: '',
        amount: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
      });
      setError('');
    } catch (error) {
      console.error('Failed to create expense:', error);
      setError('Failed to create expense. Please try again.');
    }
  };

  const handleUpdateExpense = async () => {
    if (!selectedExpense || !formData.description.trim()) {
      setError('Description is required');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      const updatedExpense = await expensesApi.update(selectedExpense.id, {
        ...formData,
        amount: parseFloat(formData.amount),
      });
      setExpenses(expenses.map((e) => (e.id === selectedExpense.id ? updatedExpense : e)));
      setIsEditModalOpen(false);
      setSelectedExpense(null);
      setFormData({
        description: '',
        amount: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
      });
      setError('');
    } catch (error) {
      console.error('Failed to update expense:', error);
      setError('Failed to update expense. Please try again.');
    }
  };

  const handleDeleteExpense = async () => {
    if (!selectedExpense) return;

    try {
      await expensesApi.delete(selectedExpense.id);
      setExpenses(expenses.filter((e) => e.id !== selectedExpense.id));
      setIsDeleteModalOpen(false);
      setSelectedExpense(null);
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  };

  const openEditModal = (expense: Expense) => {
    setSelectedExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category || 'Food',
      date: expense.date?.split('T')[0] || new Date().toISOString().split('T')[0],
    });
    setIsEditModalOpen(true);
    setError('');
  };

  const openDeleteModal = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDeleteModalOpen(true);
  };

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense: Expense) => {
      const matchesSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
      const matchesMonth = selectedMonth === 'all' || expense.date?.startsWith(selectedMonth);
      return matchesSearch && matchesCategory && matchesMonth;
    });
  }, [expenses, searchQuery, selectedCategory, selectedMonth]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredExpenses.reduce((sum: number, e: Expense) => sum + e.amount, 0);
    const categoryTotals = filteredExpenses.reduce((acc: Record<string, number>, e: Expense) => {
      const category = e.category || 'Other';
      acc[category] = (acc[category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(categoryTotals).sort((a, b) => (b[1] as number) - (a[1] as number))[0];
    const avgExpense = filteredExpenses.length > 0 ? total / filteredExpenses.length : 0;

    // Get current and previous month totals for trend
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1);
    const previousMonth = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;

    const currentMonthTotal = expenses
      .filter((e: Expense) => e.date?.startsWith(currentMonth))
      .reduce((sum: number, e: Expense) => sum + e.amount, 0);
    const previousMonthTotal = expenses
      .filter((e: Expense) => e.date?.startsWith(previousMonth))
      .reduce((sum: number, e: Expense) => sum + e.amount, 0);

    const trend = previousMonthTotal > 0
      ? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100
      : 0;

    return {
      total,
      count: filteredExpenses.length,
      topCategory: topCategory ? topCategory[0] : 'N/A',
      topCategoryAmount: topCategory ? topCategory[1] : 0,
      avgExpense,
      categoryTotals,
      trend,
      currentMonthTotal,
    };
  }, [filteredExpenses, expenses]);

  // Get unique months from expenses
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    expenses.forEach((e: Expense) => {
      if (e.date) {
        const month = e.date.substring(0, 7); // YYYY-MM
        months.add(month);
      }
    });
    return Array.from(months).sort().reverse();
  }, [expenses]);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="400px">
        <LoadingSpinner size="lg" label="Loading expenses..." />
      </Flex>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <Box>
          <Heading size="2xl" mb={2}>
            Finance
          </Heading>
          <Text color="gray.600" _dark={{ color: 'gray.400' }}>
            Track your expenses and manage your budget
          </Text>
        </Box>
        <Button
          leftIcon={<Plus size={20} />}
          colorScheme="brand"
          size="md"
          onClick={() => {
            setFormData({
              description: '',
              amount: '',
              category: 'Food',
              date: new Date().toISOString().split('T')[0],
            });
            setError('');
            setIsCreateModalOpen(true);
          }}
        >
          Add Expense
        </Button>
      </Flex>

      {/* Stats Cards */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4} mb={6}>
        <Card variant="subtle">
          <CardBody>
            <Flex align="center" gap={3}>
              <DollarSign size={24} color="var(--chakra-colors-green-500)" />
              <Box>
                <Text fontSize="2xl" fontWeight="bold">
                  ${stats.total.toFixed(2)}
                </Text>
                <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                  Total Expenses
                </Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>
        <Card variant="subtle">
          <CardBody>
            <Flex align="center" gap={3}>
              <Wallet size={24} color="var(--chakra-colors-blue-500)" />
              <Box>
                <Text fontSize="2xl" fontWeight="bold">
                  {stats.count}
                </Text>
                <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                  Transactions
                </Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>
        <Card variant="subtle">
          <CardBody>
            <Flex align="center" gap={3}>
              <TrendingUp size={24} color="var(--chakra-colors-purple-500)" />
              <Box>
                <Text fontSize="2xl" fontWeight="bold">
                  ${stats.avgExpense.toFixed(2)}
                </Text>
                <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                  Avg per Transaction
                </Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>
        <Card variant="subtle">
          <CardBody>
            <Flex align="center" gap={3}>
              {stats.trend >= 0 ? (
                <TrendingUp size={24} color="var(--chakra-colors-red-500)" />
              ) : (
                <TrendingDown size={24} color="var(--chakra-colors-green-500)" />
              )}
              <Box>
                <Flex align="center" gap={2}>
                  <Text fontSize="2xl" fontWeight="bold">
                    {Math.abs(stats.trend).toFixed(1)}%
                  </Text>
                  <Badge colorScheme={stats.trend >= 0 ? 'red' : 'green'}>
                    {stats.trend >= 0 ? 'Up' : 'Down'}
                  </Badge>
                </Flex>
                <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                  vs Last Month
                </Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>
      </Grid>

      {/* Filters */}
      <Card variant="elevated" mb={6}>
        <CardBody>
          <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
            {/* Search */}
            <Flex align="center" gap={2}>
              <Search size={20} color="gray.500" />
              <ChakraInput
                placeholder="Search expenses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                border="none"
                _focus={{ outline: 'none' }}
                fontSize="md"
              />
            </Flex>
            {/* Category Filter */}
            <Box flex="1">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  fontSize: '1rem',
                  borderRadius: '0.375rem',
                  border: '1px solid',
                  borderColor: 'var(--chakra-colors-gray-300)',
                  backgroundColor: 'var(--chakra-colors-white)',
                  cursor: 'pointer',
                }}
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </Box>
            {/* Month Filter */}
            <Flex align="center" gap={2} flex="1">
              <Calendar size={20} color="gray.500" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  fontSize: '1rem',
                  borderRadius: '0.375rem',
                  border: '1px solid',
                  borderColor: 'var(--chakra-colors-gray-300)',
                  backgroundColor: 'var(--chakra-colors-white)',
                  cursor: 'pointer',
                }}
              >
                <option value="all">All Months</option>
                {availableMonths.map((month) => (
                  <option key={month} value={month}>
                    {new Date(month + '-01').toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </option>
                ))}
              </select>
            </Flex>
          </Grid>
        </CardBody>
      </Card>

      {/* Category Breakdown */}
      {Object.keys(stats.categoryTotals).length > 0 && (
        <Card variant="elevated" mb={6}>
          <CardBody>
            <Heading size="md" mb={4}>
              Spending by Category
            </Heading>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4}>
              {Object.entries(stats.categoryTotals)
                .sort((a, b) => (b[1] as number) - (a[1] as number))
                .map(([category, amount]) => {
                  const numAmount = amount as number;
                  return (
                    <Card key={category} variant="subtle">
                      <CardBody>
                        <Flex justify="space-between" align="center">
                          <Box>
                            <Badge colorScheme={CATEGORY_COLORS[category] || 'gray'} mb={1}>
                              {category}
                            </Badge>
                            <Text fontSize="xl" fontWeight="bold">
                              ${numAmount.toFixed(2)}
                            </Text>
                            <Text fontSize="xs" color="gray.600" _dark={{ color: 'gray.400' }}>
                              {((numAmount / stats.total) * 100).toFixed(1)}% of total
                            </Text>
                          </Box>
                        </Flex>
                      </CardBody>
                    </Card>
                  );
                })}
            </Grid>
          </CardBody>
        </Card>
      )}

      {/* Expenses List */}
      <Card variant="elevated">
        <CardBody>
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="md">Recent Expenses</Heading>
            {filteredExpenses.length > 0 && (
              <Badge colorScheme="brand">{filteredExpenses.length} expenses</Badge>
            )}
          </Flex>

          {filteredExpenses.length === 0 ? (
            <Box>
              <EmptyState
                icon={<DollarSign size={64} />}
                title={searchQuery || selectedCategory !== 'all' || selectedMonth !== 'all' ? 'No expenses found' : 'No expenses yet'}
                description={
                  searchQuery || selectedCategory !== 'all' || selectedMonth !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Add your first expense to start tracking'
                }
              />
              {!searchQuery && selectedCategory === 'all' && selectedMonth === 'all' && (
                <Flex justify="center" mt={4}>
                  <Button
                    leftIcon={<Plus size={20} />}
                    colorScheme="brand"
                    size="lg"
                    onClick={() => {
                      setFormData({
                        description: '',
                        amount: '',
                        category: 'Food',
                        date: new Date().toISOString().split('T')[0],
                      });
                      setError('');
                      setIsCreateModalOpen(true);
                    }}
                  >
                    Add Expense
                  </Button>
                </Flex>
              )}
            </Box>
          ) : (
            <Tabs defaultIndex={0}>
              <TabList>
                <Tab>All ({filteredExpenses.length})</Tab>
                {CATEGORIES.map((cat) => {
                  const count = filteredExpenses.filter((e: Expense) => e.category === cat).length;
                  return count > 0 ? (
                    <Tab key={cat}>
                      {cat} ({count})
                    </Tab>
                  ) : null;
                }).filter(Boolean)}
              </TabList>
              <TabPanels>
                <TabPanel>
                  <ExpenseList
                    expenses={filteredExpenses}
                    onEdit={openEditModal}
                    onDelete={openDeleteModal}
                  />
                </TabPanel>
                {CATEGORIES.map((cat) => {
                  const categoryExpenses = filteredExpenses.filter((e: Expense) => e.category === cat);
                  return categoryExpenses.length > 0 ? (
                    <TabPanel key={cat}>
                      <ExpenseList
                        expenses={categoryExpenses}
                        onEdit={openEditModal}
                        onDelete={openDeleteModal}
                      />
                    </TabPanel>
                  ) : null;
                }).filter(Boolean)}
              </TabPanels>
            </Tabs>
          )}
        </CardBody>
      </Card>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setFormData({
            description: '',
            amount: '',
            category: 'Food',
            date: new Date().toISOString().split('T')[0],
          });
          setError('');
        }}
        title="Add New Expense"
        size="lg"
      >
        <ModalBody>
          <Stack gap={4}>
            {error && (
              <Alert variant="error" closable onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            <Input
              label="Description"
              placeholder="Enter expense description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
            <Input
              label="Amount"
              type="number"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Category
              </Text>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  fontSize: '1rem',
                  borderRadius: '0.375rem',
                  border: '1px solid',
                  borderColor: 'var(--chakra-colors-gray-300)',
                  backgroundColor: 'var(--chakra-colors-white)',
                  cursor: 'pointer',
                }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </Box>
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setIsCreateModalOpen(false);
              setFormData({
                description: '',
                amount: '',
                category: 'Food',
                date: new Date().toISOString().split('T')[0],
              });
              setError('');
            }}
          >
            Cancel
          </Button>
          <Button colorScheme="brand" onClick={handleCreateExpense}>
            Add Expense
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedExpense(null);
          setFormData({
            description: '',
            amount: '',
            category: 'Food',
            date: new Date().toISOString().split('T')[0],
          });
          setError('');
        }}
        title="Edit Expense"
        size="lg"
      >
        <ModalBody>
          <Stack gap={4}>
            {error && (
              <Alert variant="error" closable onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            <Input
              label="Description"
              placeholder="Enter expense description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
            <Input
              label="Amount"
              type="number"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Category
              </Text>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  fontSize: '1rem',
                  borderRadius: '0.375rem',
                  border: '1px solid',
                  borderColor: 'var(--chakra-colors-gray-300)',
                  backgroundColor: 'var(--chakra-colors-white)',
                  cursor: 'pointer',
                }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </Box>
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setIsEditModalOpen(false);
              setSelectedExpense(null);
              setFormData({
                description: '',
                amount: '',
                category: 'Food',
                date: new Date().toISOString().split('T')[0],
              });
              setError('');
            }}
          >
            Cancel
          </Button>
          <Button colorScheme="brand" onClick={handleUpdateExpense}>
            Save Changes
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedExpense(null);
        }}
        title="Delete Expense"
        size="md"
      >
        <ModalBody>
          <Alert variant="warning" title="Are you sure?">
            This will permanently delete the expense "{selectedExpense?.description}" ($
            {selectedExpense?.amount.toFixed(2)}). This action cannot be undone.
          </Alert>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setIsDeleteModalOpen(false);
              setSelectedExpense(null);
            }}
          >
            Cancel
          </Button>
          <Button colorScheme="red" onClick={handleDeleteExpense}>
            Delete Expense
          </Button>
        </ModalFooter>
      </Modal>
    </Box>
  );
};

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

const ExpenseList = ({ expenses, onEdit, onDelete }: ExpenseListProps) => {
  // Sort by date descending
  const sortedExpenses = [...expenses].sort((a, b) => {
    const dateA = new Date(a.date || 0).getTime();
    const dateB = new Date(b.date || 0).getTime();
    return dateB - dateA;
  });

  return (
    <Stack gap={3} mt={4}>
      {sortedExpenses.map((expense) => (
        <ExpenseCard key={expense.id} expense={expense} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </Stack>
  );
};

interface ExpenseCardProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

const ExpenseCard = ({ expense, onEdit, onDelete }: ExpenseCardProps) => {
  const formatDate = (date: string | undefined) => {
    if (!date) return 'No date';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const category = expense.category || 'Other';
  const categoryColor = CATEGORY_COLORS[category] || 'gray';

  return (
    <Card variant="subtle" _hover={{ transform: 'translateY(-2px)', shadow: 'md' }} transition="all 0.2s">
      <CardBody>
        <Flex justify="space-between" align="center" gap={4}>
          <Flex align="center" gap={3} flex="1">
            <Box
              w="8px"
              h="40px"
              borderRadius="full"
              bg={`${categoryColor}.500`}
            />
            <Box flex="1">
              <Text fontWeight="semibold" fontSize="md">
                {expense.description}
              </Text>
              <Flex gap={2} align="center" mt={1}>
                <Badge colorScheme={categoryColor}>
                  {category}
                </Badge>
                <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                  {formatDate(expense.date)}
                </Text>
              </Flex>
            </Box>
          </Flex>
          <Flex align="center" gap={3}>
            <Text fontSize="xl" fontWeight="bold" color="green.600" _dark={{ color: 'green.400' }}>
              ${expense.amount.toFixed(2)}
            </Text>
            <Flex gap={1}>
              <Tooltip label="Edit expense">
                <Button size="sm" variant="ghost" onClick={() => onEdit(expense)}>
                  <Edit2 size={14} />
                </Button>
              </Tooltip>
              <Tooltip label="Delete expense">
                <Button size="sm" variant="ghost" colorScheme="red" onClick={() => onDelete(expense)}>
                  <Trash2 size={14} />
                </Button>
              </Tooltip>
            </Flex>
          </Flex>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default FinancePage;
