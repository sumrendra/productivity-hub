import { useState, useEffect } from 'react';
import { Box, Grid, Heading, Text, Flex, Stack, Input as ChakraInput } from '@chakra-ui/react';
import { Plus, Search, Edit2, Trash2, CheckCircle2, Clock, AlertCircle, ListTodo } from 'lucide-react';
import { useTasksStore } from '@store/tasksStore';
import { tasksApi } from '@services/api';
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
  Textarea,
  Alert,
  Tooltip,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@components/common';
import type { Task } from '@/types';

type TaskStatus = 'todo' | 'in-progress' | 'completed';

const TasksPage = () => {
  const { tasks, setTasks, isLoading, setLoading } = useTasksStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', status: 'todo' as TaskStatus });
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await tasksApi.getAll();
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      const newTask = await tasksApi.create(formData);
      setTasks([...tasks, newTask]);
      setIsCreateModalOpen(false);
      setFormData({ title: '', description: '', status: 'todo' });
      setError('');
    } catch (error) {
      console.error('Failed to create task:', error);
      setError('Failed to create task. Please try again.');
    }
  };

  const handleUpdateTask = async () => {
    if (!selectedTask || !formData.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      const updatedTask = await tasksApi.update(selectedTask.id, formData);
      setTasks(tasks.map((t) => (t.id === selectedTask.id ? updatedTask : t)));
      setIsEditModalOpen(false);
      setSelectedTask(null);
      setFormData({ title: '', description: '', status: 'todo' });
      setError('');
    } catch (error) {
      console.error('Failed to update task:', error);
      setError('Failed to update task. Please try again.');
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;

    try {
      await tasksApi.delete(selectedTask.id);
      setTasks(tasks.filter((t) => t.id !== selectedTask.id));
      setIsDeleteModalOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    try {
      const updatedTask = await tasksApi.update(task.id, { ...task, status: newStatus });
      setTasks(tasks.map((t) => (t.id === task.id ? updatedTask : t)));
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setFormData({ title: task.title, description: task.description || '', status: task.status as TaskStatus });
    setIsEditModalOpen(true);
    setError('');
  };

  const openDeleteModal = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteModalOpen(true);
  };

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const todoTasks = filteredTasks.filter((t) => t.status === 'todo');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'in-progress');
  const completedTasks = filteredTasks.filter((t) => t.status === 'completed');

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="400px">
        <LoadingSpinner size="lg" label="Loading tasks..." />
      </Flex>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <Box>
          <Heading size="2xl" mb={2}>
            Tasks
          </Heading>
          <Text color="gray.600" _dark={{ color: 'gray.400' }}>
            Organize and track your projects with a Kanban board
          </Text>
        </Box>
        <Flex gap={3}>
          <Button
            variant={viewMode === 'board' ? 'solid' : 'outline'}
            colorScheme="brand"
            size="md"
            onClick={() => setViewMode('board')}
          >
            Board View
          </Button>
          <Button
            variant={viewMode === 'list' ? 'solid' : 'outline'}
            colorScheme="brand"
            size="md"
            onClick={() => setViewMode('list')}
          >
            List View
          </Button>
          <Button
            leftIcon={<Plus size={20} />}
            colorScheme="brand"
            size="md"
            onClick={() => {
              setFormData({ title: '', description: '', status: 'todo' });
              setError('');
              setIsCreateModalOpen(true);
            }}
          >
            New Task
          </Button>
        </Flex>
      </Flex>

      {/* Stats */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4} mb={6}>
        <Card variant="subtle">
          <CardBody>
            <Flex align="center" gap={3}>
              <ListTodo size={24} color="var(--chakra-colors-blue-500)" />
              <Box>
                <Text fontSize="2xl" fontWeight="bold">
                  {tasks.length}
                </Text>
                <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                  Total Tasks
                </Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>
        <Card variant="subtle">
          <CardBody>
            <Flex align="center" gap={3}>
              <AlertCircle size={24} color="var(--chakra-colors-red-500)" />
              <Box>
                <Text fontSize="2xl" fontWeight="bold">
                  {todoTasks.length}
                </Text>
                <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                  To Do
                </Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>
        <Card variant="subtle">
          <CardBody>
            <Flex align="center" gap={3}>
              <Clock size={24} color="var(--chakra-colors-yellow-500)" />
              <Box>
                <Text fontSize="2xl" fontWeight="bold">
                  {inProgressTasks.length}
                </Text>
                <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                  In Progress
                </Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>
        <Card variant="subtle">
          <CardBody>
            <Flex align="center" gap={3}>
              <CheckCircle2 size={24} color="var(--chakra-colors-green-500)" />
              <Box>
                <Text fontSize="2xl" fontWeight="bold">
                  {completedTasks.length}
                </Text>
                <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                  Completed
                </Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>
      </Grid>

      {/* Search Bar */}
      <Card variant="elevated" mb={6}>
        <CardBody>
          <Flex align="center" gap={3}>
            <Search size={20} color="gray.500" />
            <ChakraInput
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              border="none"
              _focus={{ outline: 'none' }}
              fontSize="md"
            />
            {searchQuery && (
              <Badge colorScheme="brand">{filteredTasks.length} found</Badge>
            )}
          </Flex>
        </CardBody>
      </Card>

      {/* Board View */}
      {viewMode === 'board' ? (
        filteredTasks.length === 0 ? (
          <Box>
            <EmptyState
              icon={<ListTodo size={64} />}
              title={searchQuery ? 'No tasks found' : 'No tasks yet'}
              description={
                searchQuery
                  ? 'Try adjusting your search query'
                  : 'Create your first task to get started'
              }
            />
            {!searchQuery && (
              <Flex justify="center" mt={4}>
                <Button
                  leftIcon={<Plus size={20} />}
                  colorScheme="brand"
                  size="lg"
                  onClick={() => {
                    setFormData({ title: '', description: '', status: 'todo' });
                    setError('');
                    setIsCreateModalOpen(true);
                  }}
                >
                  Create Task
                </Button>
              </Flex>
            )}
          </Box>
        ) : (
          <Grid templateColumns={{ base: '1fr', lg: 'repeat(3, 1fr)' }} gap={6}>
            <TaskColumn
              title="To Do"
              tasks={todoTasks}
              status="todo"
              colorScheme="red"
              onEdit={openEditModal}
              onDelete={openDeleteModal}
              onStatusChange={handleStatusChange}
            />
            <TaskColumn
              title="In Progress"
              tasks={inProgressTasks}
              status="in-progress"
              colorScheme="yellow"
              onEdit={openEditModal}
              onDelete={openDeleteModal}
              onStatusChange={handleStatusChange}
            />
            <TaskColumn
              title="Completed"
              tasks={completedTasks}
              status="completed"
              colorScheme="green"
              onEdit={openEditModal}
              onDelete={openDeleteModal}
              onStatusChange={handleStatusChange}
            />
          </Grid>
        )
      ) : (
        /* List View */
        <Tabs defaultIndex={0}>
          <TabList>
            <Tab>All ({filteredTasks.length})</Tab>
            <Tab>To Do ({todoTasks.length})</Tab>
            <Tab>In Progress ({inProgressTasks.length})</Tab>
            <Tab>Completed ({completedTasks.length})</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <TaskList
                tasks={filteredTasks}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
                onStatusChange={handleStatusChange}
              />
            </TabPanel>
            <TabPanel>
              <TaskList
                tasks={todoTasks}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
                onStatusChange={handleStatusChange}
              />
            </TabPanel>
            <TabPanel>
              <TaskList
                tasks={inProgressTasks}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
                onStatusChange={handleStatusChange}
              />
            </TabPanel>
            <TabPanel>
              <TaskList
                tasks={completedTasks}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
                onStatusChange={handleStatusChange}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setFormData({ title: '', description: '', status: 'todo' });
          setError('');
        }}
        title="Create New Task"
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
              label="Title"
              placeholder="Enter task title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Textarea
              label="Description (Optional)"
              placeholder="Add task description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setIsCreateModalOpen(false);
              setFormData({ title: '', description: '', status: 'todo' });
              setError('');
            }}
          >
            Cancel
          </Button>
          <Button colorScheme="brand" onClick={handleCreateTask}>
            Create Task
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTask(null);
          setFormData({ title: '', description: '', status: 'todo' });
          setError('');
        }}
        title="Edit Task"
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
              label="Title"
              placeholder="Enter task title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Textarea
              label="Description (Optional)"
              placeholder="Add task description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setIsEditModalOpen(false);
              setSelectedTask(null);
              setFormData({ title: '', description: '', status: 'todo' });
              setError('');
            }}
          >
            Cancel
          </Button>
          <Button colorScheme="brand" onClick={handleUpdateTask}>
            Save Changes
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedTask(null);
        }}
        title="Delete Task"
        size="md"
      >
        <ModalBody>
          <Alert variant="warning" title="Are you sure?">
            This will permanently delete the task "{selectedTask?.title}". This action cannot be undone.
          </Alert>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setIsDeleteModalOpen(false);
              setSelectedTask(null);
            }}
          >
            Cancel
          </Button>
          <Button colorScheme="red" onClick={handleDeleteTask}>
            Delete Task
          </Button>
        </ModalFooter>
      </Modal>
    </Box>
  );
};

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  status: TaskStatus;
  colorScheme: 'gray' | 'red' | 'green' | 'blue' | 'yellow' | 'purple' | 'brand';
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}

const TaskColumn = ({ title, tasks, colorScheme, onEdit, onDelete, onStatusChange }: TaskColumnProps) => {
  return (
    <Box>
      <Flex align="center" justify="space-between" mb={4}>
        <Flex align="center" gap={2}>
          <Heading size="md">{title}</Heading>
          <Badge colorScheme={colorScheme}>{tasks.length}</Badge>
        </Flex>
      </Flex>
      <Stack gap={3}>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
          />
        ))}
        {tasks.length === 0 && (
          <Card variant="subtle">
            <CardBody>
              <Text color="gray.500" textAlign="center" fontSize="sm">
                No tasks
              </Text>
            </CardBody>
          </Card>
        )}
      </Stack>
    </Box>
  );
};

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) => {
  const truncateDescription = (text: string | undefined, maxLength: number = 100) => {
    if (!text) return 'No description';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card variant="elevated" _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }} transition="all 0.2s">
      <CardBody>
        <Stack gap={3}>
          <Flex justify="space-between" align="start">
            <Text fontWeight="semibold" fontSize="md" flex="1">
              {task.title}
            </Text>
            <Flex gap={1}>
              <Tooltip label="Edit task">
                <Button size="sm" variant="ghost" onClick={() => onEdit(task)}>
                  <Edit2 size={14} />
                </Button>
              </Tooltip>
              <Tooltip label="Delete task">
                <Button size="sm" variant="ghost" colorScheme="red" onClick={() => onDelete(task)}>
                  <Trash2 size={14} />
                </Button>
              </Tooltip>
            </Flex>
          </Flex>
          <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
            {truncateDescription(task.description)}
          </Text>
          <Flex gap={2} flexWrap="wrap">
            {task.status !== 'todo' && (
              <Button size="sm" variant="outline" colorScheme="red" onClick={() => onStatusChange(task, 'todo')}>
                Move to To Do
              </Button>
            )}
            {task.status !== 'in-progress' && (
              <Button size="sm" variant="outline" colorScheme="yellow" onClick={() => onStatusChange(task, 'in-progress')}>
                Move to In Progress
              </Button>
            )}
            {task.status !== 'completed' && (
              <Button size="sm" variant="outline" colorScheme="green" onClick={() => onStatusChange(task, 'completed')}>
                Mark Complete
              </Button>
            )}
          </Flex>
        </Stack>
      </CardBody>
    </Card>
  );
};

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}

const TaskList = ({ tasks, onEdit, onDelete, onStatusChange }: TaskListProps) => {
  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={<ListTodo size={48} />}
        title="No tasks"
        description="No tasks in this category"
      />
    );
  }

  return (
    <Stack gap={3}>
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} />
      ))}
    </Stack>
  );
};

export default TasksPage;
