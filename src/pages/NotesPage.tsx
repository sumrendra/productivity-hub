import { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Grid, Heading, Text, Flex, Stack, Input as ChakraInput } from '@chakra-ui/react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Calendar,
  FileText,
  Download,
  LayoutGrid,
  List,
  Tag as TagIcon,
  Folder,
  Copy,
  Archive,
  Pin,
} from 'lucide-react';
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
  Menu,
  SaveStatusIndicator,
} from '@components/common';
import { useAutoSave } from '@hooks/useAutoSave';
import type { Note } from '@/types';

// Note templates
const NOTE_TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank Note',
    icon: FileText,
    content: '',
  },
  {
    id: 'meeting',
    name: 'Meeting Notes',
    icon: Calendar,
    content: `# Meeting Notes

**Date:** ${new Date().toLocaleDateString()}
**Attendees:** 

## Agenda
- 

## Discussion Points
- 

## Action Items
- [ ] 

## Next Steps
- `,
  },
  {
    id: 'todo',
    name: 'To-Do List',
    icon: TagIcon,
    content: `# To-Do List

## Today
- [ ] 
- [ ] 

## This Week
- [ ] 
- [ ] 

## Later
- [ ] 
- [ ] `,
  },
  {
    id: 'project',
    name: 'Project Plan',
    icon: Folder,
    content: `# Project Plan

## Overview
Brief description of the project

## Goals
- 
- 

## Milestones
1. 
2. 
3. 

## Resources
- 

## Timeline
Start Date: 
End Date: `,
  },
];

const CATEGORIES = ['Personal', 'Work', 'Ideas', 'Study', 'Projects', 'Other'];
const COLORS = [
  { name: 'default', value: 'gray' },
  { name: 'red', value: 'red' },
  { name: 'orange', value: 'yellow' },
  { name: 'green', value: 'green' },
  { name: 'blue', value: 'blue' },
  { name: 'purple', value: 'purple' },
];

type ViewMode = 'grid' | 'list';
type SortOption = 'recent' | 'oldest' | 'title' | 'modified';

interface EnhancedNote extends Note {
  category?: string;
  tags?: string[];
  isPinned?: boolean;
  color?: string;
}

const NotesPage = () => {
  const { notes, setNotes, isLoading, setLoading } = useNotesStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<EnhancedNote | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Personal',
    tags: [] as string[],
    color: 'gray',
  });
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  // Auto-save hook for edit mode
  const { status: saveStatus, lastSaved, hasUnsavedChanges } = useAutoSave({
    data: formData,
    onSave: useCallback(async (data: typeof formData) => {
      if (isEditModalOpen && selectedNote) {
        await notesApi.update(selectedNote.id, data);
        const updatedNote = { ...selectedNote, ...data };
        setNotes(notes.map((n) => (n.id === selectedNote.id ? updatedNote : n)));
      }
    }, [isEditModalOpen, selectedNote, notes, setNotes]),
    delay: 2000,
    enabled: isEditModalOpen && !!selectedNote && formData.title.trim() !== '',
  });

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
      const newNote = await notesApi.create({
        ...formData,
        tags: formData.tags,
        category: formData.category,
      });
      setNotes([...notes, newNote]);
      setIsCreateModalOpen(false);
      setFormData({ title: '', content: '', category: 'Personal', tags: [], color: 'gray' });
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
      const updatedNote = await notesApi.update(selectedNote.id, {
        ...formData,
        tags: formData.tags,
        category: formData.category,
      });
      setNotes(notes.map((n) => (n.id === selectedNote.id ? updatedNote : n)));
      setIsEditModalOpen(false);
      setSelectedNote(null);
      setFormData({ title: '', content: '', category: 'Personal', tags: [], color: 'gray' });
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

  const handleTogglePin = (note: EnhancedNote) => {
    const updatedNote = { ...note, isPinned: !note.isPinned };
    setNotes(notes.map((n) => (n.id === note.id ? updatedNote : n)));
  };

  const handleDuplicateNote = async (note: EnhancedNote) => {
    try {
      const newNote = await notesApi.create({
        title: `${note.title} (Copy)`,
        content: note.content,
        category: note.category,
        tags: note.tags,
      });
      setNotes([...notes, newNote]);
    } catch (error) {
      console.error('Failed to duplicate note:', error);
    }
  };

  const handleExportNote = (note: EnhancedNote) => {
    const dataStr = JSON.stringify(note, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${note.title.replace(/\s+/g, '-')}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleExportAllNotes = () => {
    const dataStr = JSON.stringify(filteredAndSortedNotes, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `notes-export-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleSelectTemplate = (template: typeof NOTE_TEMPLATES[0]) => {
    setFormData({ ...formData, content: template.content });
    setShowTemplates(false);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((tag) => tag !== tagToRemove) });
  };

  const openEditModal = (note: EnhancedNote) => {
    setSelectedNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      category: note.category || 'Personal',
      tags: note.tags || [],
      color: note.color || 'gray',
    });
    setIsEditModalOpen(true);
    setError('');
  };

  const openDeleteModal = (note: EnhancedNote) => {
    setSelectedNote(note);
    setIsDeleteModalOpen(true);
  };

  // Filtering and sorting
  const filteredAndSortedNotes = useMemo(() => {
    let filtered = notes.filter((note: EnhancedNote) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (note.tags || []).some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    // Separate pinned and unpinned
    const pinned = filtered.filter((n: EnhancedNote) => n.isPinned);
    const unpinned = filtered.filter((n: EnhancedNote) => !n.isPinned);

    // Sort function
    const sortNotes = (notesToSort: Note[]) => {
      return [...notesToSort].sort((a, b) => {
        switch (sortBy) {
          case 'title':
            return a.title.localeCompare(b.title);
          case 'oldest':
            return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          case 'modified':
            return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
          case 'recent':
          default:
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
      });
    };

    return [...sortNotes(pinned), ...sortNotes(unpinned)];
  }, [notes, searchQuery, selectedCategory, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: notes.length,
      pinned: notes.filter((n: EnhancedNote) => n.isPinned).length,
      categories: [...new Set(notes.map((n: EnhancedNote) => n.category).filter(Boolean))].length,
      tags: [...new Set(notes.flatMap((n: EnhancedNote) => n.tags || []))].length,
    };
  }, [notes]);

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
            Create, organize, and manage your notes with advanced features
          </Text>
        </Box>
        <Flex gap={3}>
          <Menu
            items={[
              {
                label: 'Export All Notes',
                value: 'export-all',
                icon: <Download size={16} />,
              },
              {
                label: 'Export Filtered',
                value: 'export-filtered',
                icon: <Archive size={16} />,
              },
            ]}
            onSelect={(item) => {
              if (item.value === 'export-all') {
                handleExportAllNotes();
              } else if (item.value === 'export-filtered') {
                const dataStr = JSON.stringify(filteredAndSortedNotes, null, 2);
                const dataUri =
                  'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', 'filtered-notes.json');
                linkElement.click();
              }
            }}
          >
            <Button variant="outline" colorScheme="brand" leftIcon={<Download size={18} />}>
              Export
            </Button>
          </Menu>
          <Button
            leftIcon={<Plus size={20} />}
            colorScheme="brand"
            size="md"
            onClick={() => {
              setFormData({ title: '', content: '', category: 'Personal', tags: [], color: 'gray' });
              setError('');
              setShowTemplates(false);
              setIsCreateModalOpen(true);
            }}
          >
            Create Note
          </Button>
        </Flex>
      </Flex>

      {/* Statistics */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4} mb={6}>
        <Card variant="subtle">
          <CardBody>
            <Flex align="center" gap={3}>
              <FileText size={24} color="var(--chakra-colors-blue-500)" />
              <Box>
                <Text fontSize="2xl" fontWeight="bold">
                  {stats.total}
                </Text>
                <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                  Total Notes
                </Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>
        <Card variant="subtle">
          <CardBody>
            <Flex align="center" gap={3}>
              <Pin size={24} color="var(--chakra-colors-yellow-500)" />
              <Box>
                <Text fontSize="2xl" fontWeight="bold">
                  {stats.pinned}
                </Text>
                <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                  Pinned
                </Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>
        <Card variant="subtle">
          <CardBody>
            <Flex align="center" gap={3}>
              <Folder size={24} color="var(--chakra-colors-purple-500)" />
              <Box>
                <Text fontSize="2xl" fontWeight="bold">
                  {stats.categories}
                </Text>
                <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                  Categories
                </Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>
        <Card variant="subtle">
          <CardBody>
            <Flex align="center" gap={3}>
              <TagIcon size={24} color="var(--chakra-colors-green-500)" />
              <Box>
                <Text fontSize="2xl" fontWeight="bold">
                  {stats.tags}
                </Text>
                <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                  Tags
                </Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>
      </Grid>

      {/* Filters and Search */}
      <Card variant="elevated" mb={6}>
        <CardBody>
          <Flex gap={4} flexWrap="wrap">
            {/* Search */}
            <Box flex="1" minW="250px">
              <Flex align="center" gap={2}>
                <Search size={20} color="gray.500" />
                <ChakraInput
                  placeholder="Search notes, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  border="none"
                  _focus={{ outline: 'none' }}
                  fontSize="md"
                />
                {searchQuery && (
                  <Badge colorScheme="brand">{filteredAndSortedNotes.length} found</Badge>
                )}
              </Flex>
            </Box>

            {/* Category Filter */}
            <Box>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid var(--chakra-colors-gray-300)',
                  fontSize: '0.875rem',
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

            {/* Sort */}
            <Box>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid var(--chakra-colors-gray-300)',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                <option value="recent">Recently Created</option>
                <option value="oldest">Oldest First</option>
                <option value="modified">Recently Modified</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </Box>

            {/* View Mode Toggle */}
            <Flex gap={2}>
              <Tooltip label="Grid View">
                <Button
                  variant={viewMode === 'grid' ? 'solid' : 'ghost'}
                  colorScheme="brand"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid size={18} />
                </Button>
              </Tooltip>
              <Tooltip label="List View">
                <Button
                  variant={viewMode === 'list' ? 'solid' : 'ghost'}
                  colorScheme="brand"
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List size={18} />
                </Button>
              </Tooltip>
            </Flex>
          </Flex>
        </CardBody>
      </Card>

      {/* Notes Display */}
      {filteredAndSortedNotes.length === 0 ? (
        <Box>
          <EmptyState
            icon={<FileText size={64} />}
            title={searchQuery || selectedCategory !== 'all' ? 'No notes found' : 'No notes yet'}
            description={
              searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your filters or search query'
                : 'Get started by creating your first note'
            }
          />
          {!searchQuery && selectedCategory === 'all' && (
            <Flex justify="center" mt={4}>
              <Button
                leftIcon={<Plus size={20} />}
                colorScheme="brand"
                size="lg"
                onClick={() => {
                  setFormData({
                    title: '',
                    content: '',
                    category: 'Personal',
                    tags: [],
                    color: 'gray',
                  });
                  setError('');
                  setIsCreateModalOpen(true);
                }}
              >
                Create Note
              </Button>
            </Flex>
          )}
        </Box>
      ) : viewMode === 'grid' ? (
        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
          gap={6}
        >
          {filteredAndSortedNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note as EnhancedNote}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
              onPin={handleTogglePin}
              onDuplicate={handleDuplicateNote}
              onExport={handleExportNote}
            />
          ))}
        </Grid>
      ) : (
        <Stack gap={3}>
          {filteredAndSortedNotes.map((note) => (
            <NoteListItem
              key={note.id}
              note={note as EnhancedNote}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
              onPin={handleTogglePin}
              onDuplicate={handleDuplicateNote}
              onExport={handleExportNote}
            />
          ))}
        </Stack>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedNote(null);
          setFormData({ title: '', content: '', category: 'Personal', tags: [], color: 'gray' });
          setError('');
        }}
        title={isCreateModalOpen ? 'Create New Note' : 'Edit Note'}
        size="xl"
      >
        <ModalBody>
          <Stack gap={4}>
            {/* Save Status for Edit Mode */}
            {isEditModalOpen && (
              <Flex justify="flex-end">
                <SaveStatusIndicator
                  status={saveStatus}
                  lastSaved={lastSaved}
                  hasUnsavedChanges={hasUnsavedChanges}
                />
              </Flex>
            )}
            
            {error && (
              <Alert variant="error" closable onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {/* Templates */}
            {isCreateModalOpen && !showTemplates && (
              <Button
                variant="outline"
                colorScheme="purple"
                size="sm"
                onClick={() => setShowTemplates(true)}
                leftIcon={<FileText size={16} />}
              >
                Use Template
              </Button>
            )}

            {showTemplates && (
              <Box>
                <Text fontWeight="semibold" mb={2}>
                  Select Template:
                </Text>
                <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                  {NOTE_TEMPLATES.map((template) => {
                    const Icon = template.icon;
                    return (
                      <Card
                        key={template.id}
                        variant="outlined"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleSelectTemplate(template)}
                      >
                        <CardBody>
                          <Flex align="center" gap={2}>
                            <Icon size={20} />
                            <Text fontSize="sm" fontWeight="medium">
                              {template.name}
                            </Text>
                          </Flex>
                        </CardBody>
                      </Card>
                    );
                  })}
                </Grid>
              </Box>
            )}

            <Input
              label="Title"
              placeholder="Enter note title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <Box>
              <Flex justify="space-between" align="center" mb={2}>
                <Text fontSize="sm" fontWeight="medium">
                  Content
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {formData.content.length} characters • {formData.content.split(/\s+/).filter(Boolean).length} words
                  {formData.content.length > 0 && ` • ${Math.ceil(formData.content.split(/\s+/).filter(Boolean).length / 200)} min read`}
                </Text>
              </Flex>
              <Textarea
                placeholder="Write your note content here..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={12}
              />
            </Box>

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
                  borderRadius: '0.375rem',
                  border: '1px solid var(--chakra-colors-gray-300)',
                  fontSize: '1rem',
                }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Tags
              </Text>
              <Flex gap={2} mb={2} flexWrap="wrap">
                {formData.tags.map((tag) => (
                  <Badge key={tag} colorScheme="blue">
                    {tag}
                    <Box
                      as="span"
                      ml={1}
                      cursor="pointer"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      ×
                    </Box>
                  </Badge>
                ))}
              </Flex>
              <Flex gap={2}>
                <ChakraInput
                  placeholder="Add tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  size="sm"
                />
                <Button size="sm" onClick={handleAddTag}>
                  Add
                </Button>
              </Flex>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Color
              </Text>
              <Flex gap={2}>
                {COLORS.map((color) => (
                  <Box
                    key={color.value}
                    w="40px"
                    h="40px"
                    borderRadius="md"
                    bg={`${color.value}.500`}
                    cursor="pointer"
                    border={formData.color === color.value ? '3px solid' : '2px solid transparent'}
                    borderColor={formData.color === color.value ? 'brand.500' : 'transparent'}
                    _hover={{ transform: 'scale(1.1)' }}
                    transition="all 0.2s"
                    onClick={() => setFormData({ ...formData, color: color.value })}
                  />
                ))}
              </Flex>
            </Box>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setIsCreateModalOpen(false);
              setIsEditModalOpen(false);
              setSelectedNote(null);
              setFormData({ title: '', content: '', category: 'Personal', tags: [], color: 'gray' });
              setError('');
            }}
          >
            Cancel
          </Button>
          <Button
            colorScheme="brand"
            onClick={isCreateModalOpen ? handleCreateNote : handleUpdateNote}
          >
            {isCreateModalOpen ? 'Create Note' : 'Save Changes'}
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

// Note Card Component
interface NoteCardProps {
  note: EnhancedNote;
  onEdit: (note: EnhancedNote) => void;
  onDelete: (note: EnhancedNote) => void;
  onPin: (note: EnhancedNote) => void;
  onDuplicate: (note: EnhancedNote) => void;
  onExport: (note: EnhancedNote) => void;
}

const NoteCard = ({ note, onEdit, onDelete, onPin, onDuplicate, onExport }: NoteCardProps) => {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Just now';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const truncateContent = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <Card
      variant="elevated"
      _hover={{ transform: 'translateY(-4px)', shadow: 'xl' }}
      transition="all 0.2s"
      style={{
        borderTop: `4px solid var(--chakra-colors-${note.color || 'gray'}-500)`,
        position: 'relative',
      }}
    >
      {note.isPinned && (
        <Box position="absolute" top={2} right={2}>
          <Pin size={16} fill="currentColor" color="var(--chakra-colors-yellow-500)" />
        </Box>
      )}
      <CardHeader title={note.title}>
        <Menu
          items={[
            {
              label: 'Edit',
              value: 'edit',
              icon: <Edit2 size={16} />,
            },
            {
              label: note.isPinned ? 'Unpin' : 'Pin',
              value: 'pin',
              icon: <Pin size={16} />,
            },
            {
              label: 'Duplicate',
              value: 'duplicate',
              icon: <Copy size={16} />,
            },
            {
              label: 'Export',
              value: 'export',
              icon: <Download size={16} />,
            },
            {
              label: 'Delete',
              value: 'delete',
              icon: <Trash2 size={16} />,
              colorScheme: 'danger',
            },
          ]}
          onSelect={(item) => {
            if (item.value === 'edit') onEdit(note);
            else if (item.value === 'pin') onPin(note);
            else if (item.value === 'duplicate') onDuplicate(note);
            else if (item.value === 'export') onExport(note);
            else if (item.value === 'delete') onDelete(note);
          }}
        >
          <Button size="sm" variant="ghost">
            •••
          </Button>
        </Menu>
      </CardHeader>
      <CardBody>
        <Text
          fontSize="sm"
          color="gray.600"
          _dark={{ color: 'gray.400' }}
          mb={4}
          whiteSpace="pre-wrap"
          minH="60px"
        >
          {truncateContent(note.content)}
        </Text>

        {note.tags && note.tags.length > 0 && (
          <Flex gap={2} mb={3} flexWrap="wrap">
            {note.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} colorScheme="blue" fontSize="xs">
                {tag}
              </Badge>
            ))}
            {note.tags.length > 3 && (
              <Badge colorScheme="gray" fontSize="xs">
                +{note.tags.length - 3}
              </Badge>
            )}
          </Flex>
        )}

        <Flex justify="space-between" align="center">
          <Flex align="center" gap={2}>
            <Calendar size={14} />
            <Text fontSize="xs" color="gray.500" _dark={{ color: 'gray.500' }}>
              {formatDate(note.createdAt)}
            </Text>
          </Flex>
          {note.category && (
            <Badge colorScheme="purple" fontSize="xs">
              {note.category}
            </Badge>
          )}
        </Flex>
      </CardBody>
    </Card>
  );
};

// Note List Item Component
const NoteListItem = ({ note, onEdit, onDelete, onPin, onDuplicate, onExport }: NoteCardProps) => {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Just now';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card
      variant="elevated"
      _hover={{ shadow: 'md' }}
      transition="all 0.2s"
      style={{
        borderLeft: `4px solid var(--chakra-colors-${note.color || 'gray'}-500)`,
      }}
    >
      <CardBody>
        <Flex justify="space-between" align="start" gap={4}>
          <Box flex="1">
            <Flex align="center" gap={2} mb={2}>
              {note.isPinned && <Pin size={16} fill="currentColor" color="var(--chakra-colors-yellow-500)" />}
              <Text fontWeight="semibold" fontSize="lg">
                {note.title}
              </Text>
              {note.category && (
                <Badge colorScheme="purple" fontSize="xs">
                  {note.category}
                </Badge>
              )}
            </Flex>
            <Text
              fontSize="sm"
              color="gray.600"
              _dark={{ color: 'gray.400' }}
              mb={2}
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {note.content}
            </Text>
            <Flex gap={3} align="center" fontSize="xs" color="gray.500">
              <Flex align="center" gap={1}>
                <Calendar size={12} />
                {formatDate(note.createdAt)}
              </Flex>
              {note.tags && note.tags.length > 0 && (
                <Flex gap={1} flexWrap="wrap">
                  {note.tags.slice(0, 5).map((tag) => (
                    <Badge key={tag} colorScheme="blue" fontSize="xs">
                      {tag}
                    </Badge>
                  ))}
                </Flex>
              )}
            </Flex>
          </Box>
          <Menu
            items={[
              {
                label: 'Edit',
                value: 'edit',
                icon: <Edit2 size={16} />,
              },
              {
                label: note.isPinned ? 'Unpin' : 'Pin',
                value: 'pin',
                icon: <Pin size={16} />,
              },
              {
                label: 'Duplicate',
                value: 'duplicate',
                icon: <Copy size={16} />,
              },
              {
                label: 'Export',
                value: 'export',
                icon: <Download size={16} />,
              },
              {
                label: 'Delete',
                value: 'delete',
                icon: <Trash2 size={16} />,
                colorScheme: 'danger',
              },
            ]}
            onSelect={(item) => {
              if (item.value === 'edit') onEdit(note);
              else if (item.value === 'pin') onPin(note);
              else if (item.value === 'duplicate') onDuplicate(note);
              else if (item.value === 'export') onExport(note);
              else if (item.value === 'delete') onDelete(note);
            }}
          >
            <Button size="sm" variant="ghost">
              •••
            </Button>
          </Menu>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default NotesPage;
