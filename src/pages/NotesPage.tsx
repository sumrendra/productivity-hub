import { useState, useEffect } from 'react';
import { Box, Grid, Heading, Text, Flex, Stack, Input as ChakraInput } from '@chakra-ui/react';
import { Plus, Search, Edit2, Trash2, Calendar, FileText } from 'lucide-react';
import { useNotesStore } from '@store/notesStore';
import { notesApi } from '@services/api';
import {
  Card,
  CardHeader,
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
} from '@components/common';
import type { Note } from '@/types';

const NotesPage = () => {
  const { notes, setNotes, isLoading, setLoading } = useNotesStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await notesApi.getAll();
      setNotes(data);
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      const newNote = await notesApi.create(formData);
      setNotes([...notes, newNote]);
      setIsCreateModalOpen(false);
      setFormData({ title: '', content: '' });
      setError('');
    } catch (error) {
      console.error('Failed to create note:', error);
      setError('Failed to create note. Please try again.');
    }
  };

  const handleUpdateNote = async () => {
    if (!selectedNote || !formData.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      const updatedNote = await notesApi.update(selectedNote.id, formData);
      setNotes(notes.map((n) => (n.id === selectedNote.id ? updatedNote : n)));
      setIsEditModalOpen(false);
      setSelectedNote(null);
      setFormData({ title: '', content: '' });
      setError('');
    } catch (error) {
      console.error('Failed to update note:', error);
      setError('Failed to update note. Please try again.');
    }
  };

  const handleDeleteNote = async () => {
    if (!selectedNote) return;

    try {
      await notesApi.delete(selectedNote.id);
      setNotes(notes.filter((n) => n.id !== selectedNote.id));
      setIsDeleteModalOpen(false);
      setSelectedNote(null);
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const openEditModal = (note: Note) => {
    setSelectedNote(note);
    setFormData({ title: note.title, content: note.content });
    setIsEditModalOpen(true);
    setError('');
  };

  const openDeleteModal = (note: Note) => {
    setSelectedNote(note);
    setIsDeleteModalOpen(true);
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="400px">
        <LoadingSpinner size="lg" label="Loading notes..." />
      </Flex>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <Box>
          <Heading size="2xl" mb={2}>
            Notes
          </Heading>
          <Text color="gray.600" _dark={{ color: 'gray.400' }}>
            Create and manage your notes with rich text support
          </Text>
        </Box>
        <Button
          leftIcon={<Plus size={20} />}
          colorScheme="brand"
          size="lg"
          onClick={() => {
            setFormData({ title: '', content: '' });
            setError('');
            setIsCreateModalOpen(true);
          }}
        >
          Create Note
        </Button>
      </Flex>

      {/* Search Bar */}
      <Card variant="elevated" mb={6}>
        <CardBody>
          <Flex align="center" gap={3}>
            <Search size={20} color="gray.500" />
            <ChakraInput
              placeholder="Search notes by title or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              border="none"
              _focus={{ outline: 'none' }}
              fontSize="md"
            />
            {searchQuery && (
              <Badge colorScheme="brand">{filteredNotes.length} found</Badge>
            )}
          </Flex>
        </CardBody>
      </Card>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <Box>
          <EmptyState
            icon={<FileText size={64} />}
            title={searchQuery ? 'No notes found' : 'No notes yet'}
            description={
              searchQuery
                ? 'Try adjusting your search query'
                : 'Get started by creating your first note'
            }
          />
          {!searchQuery && (
            <Flex justify="center" mt={4}>
              <Button
                leftIcon={<Plus size={20} />}
                colorScheme="brand"
                size="lg"
                onClick={() => {
                  setFormData({ title: '', content: '' });
                  setError('');
                  setIsCreateModalOpen(true);
                }}
              >
                Create Note
              </Button>
            </Flex>
          )}
        </Box>
      ) : (
        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
          gap={6}
        >
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
            />
          ))}
        </Grid>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setFormData({ title: '', content: '' });
          setError('');
        }}
        title="Create New Note"
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
              placeholder="Enter note title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              error={error && !formData.title ? 'Title is required' : undefined}
            />
            <Textarea
              label="Content"
              placeholder="Write your note content here..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={8}
              autoResize
            />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setIsCreateModalOpen(false);
              setFormData({ title: '', content: '' });
              setError('');
            }}
          >
            Cancel
          </Button>
          <Button colorScheme="brand" onClick={handleCreateNote}>
            Create Note
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedNote(null);
          setFormData({ title: '', content: '' });
          setError('');
        }}
        title="Edit Note"
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
              placeholder="Enter note title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              error={error && !formData.title ? 'Title is required' : undefined}
            />
            <Textarea
              label="Content"
              placeholder="Write your note content here..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={8}
              autoResize
            />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setIsEditModalOpen(false);
              setSelectedNote(null);
              setFormData({ title: '', content: '' });
              setError('');
            }}
          >
            Cancel
          </Button>
          <Button colorScheme="brand" onClick={handleUpdateNote}>
            Save Changes
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedNote(null);
        }}
        title="Delete Note"
        size="md"
      >
        <ModalBody>
          <Alert variant="warning" title="Are you sure?">
            This will permanently delete the note "{selectedNote?.title}". This action cannot be
            undone.
          </Alert>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setIsDeleteModalOpen(false);
              setSelectedNote(null);
            }}
          >
            Cancel
          </Button>
          <Button colorScheme="red" onClick={handleDeleteNote}>
            Delete Note
          </Button>
        </ModalFooter>
      </Modal>
    </Box>
  );
};

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
}

const NoteCard = ({ note, onEdit, onDelete }: NoteCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <Card
      variant="elevated"
      _hover={{ transform: 'translateY(-4px)', shadow: 'xl' }}
      transition="all 0.2s"
    >
      <CardHeader title={note.title}>
        <Flex gap={2}>
          <Tooltip label="Edit note">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(note)}
              leftIcon={<Edit2 size={16} />}
            >
              Edit
            </Button>
          </Tooltip>
          <Tooltip label="Delete note">
            <Button
              size="sm"
              variant="ghost"
              colorScheme="red"
              onClick={() => onDelete(note)}
              leftIcon={<Trash2 size={16} />}
            >
              Delete
            </Button>
          </Tooltip>
        </Flex>
      </CardHeader>
      <CardBody>
        <Text
          fontSize="sm"
          color="gray.600"
          _dark={{ color: 'gray.400' }}
          mb={4}
          whiteSpace="pre-wrap"
        >
          {truncateContent(note.content)}
        </Text>
        <Flex align="center" gap={2} mt="auto">
          <Calendar size={14} />
          <Text fontSize="xs" color="gray.500" _dark={{ color: 'gray.500' }}>
            {note.createdAt ? formatDate(note.createdAt) : 'Just now'}
          </Text>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default NotesPage;
