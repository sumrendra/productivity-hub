import { useState, useEffect } from 'react';
import { Box, Grid, Heading, Text, Flex, Stack, Input as ChakraInput } from '@chakra-ui/react';
import { Plus, Search, Edit2, Trash2, ExternalLink, Link as LinkIcon, Tag } from 'lucide-react';
import { useLinksStore } from '@store/linksStore';
import { linksApi } from '@services/api';
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
import type { Link } from '@/types';

const LinksPage = () => {
  const { links, setLinks, isLoading, setLoading } = useLinksStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const [formData, setFormData] = useState({ title: '', url: '', description: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    try {
      setLoading(true);
      const data = await linksApi.getAll();
      setLinks(data);
    } catch (error) {
      console.error('Failed to load links:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleCreateLink = async () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.url.trim()) {
      setError('URL is required');
      return;
    }
    if (!validateUrl(formData.url)) {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    try {
      const newLink = await linksApi.create(formData);
      setLinks([...links, newLink]);
      setIsCreateModalOpen(false);
      setFormData({ title: '', url: '', description: '' });
      setError('');
    } catch (error) {
      console.error('Failed to create link:', error);
      setError('Failed to create link. Please try again.');
    }
  };

  const handleUpdateLink = async () => {
    if (!selectedLink || !formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.url.trim()) {
      setError('URL is required');
      return;
    }
    if (!validateUrl(formData.url)) {
      setError('Please enter a valid URL');
      return;
    }

    try {
      const updatedLink = await linksApi.update(selectedLink.id, formData);
      setLinks(links.map((l) => (l.id === selectedLink.id ? updatedLink : l)));
      setIsEditModalOpen(false);
      setSelectedLink(null);
      setFormData({ title: '', url: '', description: '' });
      setError('');
    } catch (error) {
      console.error('Failed to update link:', error);
      setError('Failed to update link. Please try again.');
    }
  };

  const handleDeleteLink = async () => {
    if (!selectedLink) return;

    try {
      await linksApi.delete(selectedLink.id);
      setLinks(links.filter((l) => l.id !== selectedLink.id));
      setIsDeleteModalOpen(false);
      setSelectedLink(null);
    } catch (error) {
      console.error('Failed to delete link:', error);
    }
  };

  const openEditModal = (link: Link) => {
    setSelectedLink(link);
    setFormData({ title: link.title, url: link.url, description: link.description || '' });
    setIsEditModalOpen(true);
    setError('');
  };

  const openDeleteModal = (link: Link) => {
    setSelectedLink(link);
    setIsDeleteModalOpen(true);
  };

  const filteredLinks = links.filter(
    (link) =>
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (link.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="400px">
        <LoadingSpinner size="lg" label="Loading links..." />
      </Flex>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <Box>
          <Heading size="2xl" mb={2}>
            Links
          </Heading>
          <Text color="gray.600" _dark={{ color: 'gray.400' }}>
            Save and organize your favorite bookmarks
          </Text>
        </Box>
        <Button
          leftIcon={<Plus size={20} />}
          colorScheme="brand"
          size="lg"
          onClick={() => {
            setFormData({ title: '', url: '', description: '' });
            setError('');
            setIsCreateModalOpen(true);
          }}
        >
          Add Link
        </Button>
      </Flex>

      {/* Stats */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4} mb={6}>
        <Card variant="subtle">
          <CardBody>
            <Flex align="center" gap={3}>
              <LinkIcon size={24} color="var(--chakra-colors-purple-500)" />
              <Box>
                <Text fontSize="2xl" fontWeight="bold">
                  {links.length}
                </Text>
                <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                  Total Links
                </Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>
        <Card variant="subtle">
          <CardBody>
            <Flex align="center" gap={3}>
              <Tag size={24} color="var(--chakra-colors-blue-500)" />
              <Box>
                <Text fontSize="2xl" fontWeight="bold">
                  {new Set(links.map(l => new URL(l.url).hostname)).size}
                </Text>
                <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                  Unique Domains
                </Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>
        <Card variant="subtle">
          <CardBody>
            <Flex align="center" gap={3}>
              <Search size={24} color="var(--chakra-colors-green-500)" />
              <Box>
                <Text fontSize="2xl" fontWeight="bold">
                  {filteredLinks.length}
                </Text>
                <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                  {searchQuery ? 'Search Results' : 'Showing'}
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
              placeholder="Search links by title, URL, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              border="none"
              _focus={{ outline: 'none' }}
              fontSize="md"
            />
            {searchQuery && (
              <Badge colorScheme="purple">{filteredLinks.length} found</Badge>
            )}
          </Flex>
        </CardBody>
      </Card>

      {/* Links Grid */}
      {filteredLinks.length === 0 ? (
        <Box>
          <EmptyState
            icon={<LinkIcon size={64} />}
            title={searchQuery ? 'No links found' : 'No links yet'}
            description={
              searchQuery
                ? 'Try adjusting your search query'
                : 'Start saving your favorite websites and resources'
            }
          />
          {!searchQuery && (
            <Flex justify="center" mt={4}>
              <Button
                leftIcon={<Plus size={20} />}
                colorScheme="brand"
                size="lg"
                onClick={() => {
                  setFormData({ title: '', url: '', description: '' });
                  setError('');
                  setIsCreateModalOpen(true);
                }}
              >
                Add Link
              </Button>
            </Flex>
          )}
        </Box>
      ) : (
        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
          gap={6}
        >
          {filteredLinks.map((link) => (
            <LinkCard
              key={link.id}
              link={link}
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
          setFormData({ title: '', url: '', description: '' });
          setError('');
        }}
        title="Add New Link"
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
              placeholder="Enter link title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Input
              label="URL"
              placeholder="https://example.com"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              required
              helperText="Enter a complete URL including https://"
            />
            <Textarea
              label="Description (Optional)"
              placeholder="Add a description for this link..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setIsCreateModalOpen(false);
              setFormData({ title: '', url: '', description: '' });
              setError('');
            }}
          >
            Cancel
          </Button>
          <Button colorScheme="brand" onClick={handleCreateLink}>
            Add Link
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedLink(null);
          setFormData({ title: '', url: '', description: '' });
          setError('');
        }}
        title="Edit Link"
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
              placeholder="Enter link title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Input
              label="URL"
              placeholder="https://example.com"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              required
            />
            <Textarea
              label="Description (Optional)"
              placeholder="Add a description for this link..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setIsEditModalOpen(false);
              setSelectedLink(null);
              setFormData({ title: '', url: '', description: '' });
              setError('');
            }}
          >
            Cancel
          </Button>
          <Button colorScheme="brand" onClick={handleUpdateLink}>
            Save Changes
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedLink(null);
        }}
        title="Delete Link"
        size="md"
      >
        <ModalBody>
          <Alert variant="warning" title="Are you sure?">
            This will permanently delete the link "{selectedLink?.title}". This action cannot be undone.
          </Alert>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setIsDeleteModalOpen(false);
              setSelectedLink(null);
            }}
          >
            Cancel
          </Button>
          <Button colorScheme="red" onClick={handleDeleteLink}>
            Delete Link
          </Button>
        </ModalFooter>
      </Modal>
    </Box>
  );
};

interface LinkCardProps {
  link: Link;
  onEdit: (link: Link) => void;
  onDelete: (link: Link) => void;
}

const LinkCard = ({ link, onEdit, onDelete }: LinkCardProps) => {
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'Invalid URL';
    }
  };

  const truncateDescription = (text: string | undefined, maxLength: number = 100) => {
    if (!text) return 'No description';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card
      variant="elevated"
      _hover={{ transform: 'translateY(-4px)', shadow: 'xl' }}
      transition="all 0.2s"
    >
      <CardHeader title={link.title}>
        <Flex gap={2}>
          <Tooltip label="Edit link">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(link)}
              leftIcon={<Edit2 size={16} />}
            >
              Edit
            </Button>
          </Tooltip>
          <Tooltip label="Delete link">
            <Button
              size="sm"
              variant="ghost"
              colorScheme="red"
              onClick={() => onDelete(link)}
              leftIcon={<Trash2 size={16} />}
            >
              Delete
            </Button>
          </Tooltip>
        </Flex>
      </CardHeader>
      <CardBody>
        <Stack gap={3}>
          <Text
            fontSize="sm"
            color="gray.600"
            _dark={{ color: 'gray.400' }}
            whiteSpace="pre-wrap"
          >
            {truncateDescription(link.description)}
          </Text>
          
          <Flex align="center" gap={2} mt="auto">
            <Badge colorScheme="purple" size="sm">
              {getDomain(link.url)}
            </Badge>
          </Flex>
          
          <Tooltip label="Open in new tab">
            <Box w="full">
              <Button
                onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
                size="sm"
                variant="outline"
                colorScheme="brand"
                rightIcon={<ExternalLink size={14} />}
                fullWidth
              >
                Visit Link
              </Button>
            </Box>
          </Tooltip>
        </Stack>
      </CardBody>
    </Card>
  );
};

export default LinksPage;
