import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Modal, ModalBody, ModalFooter } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { Alert } from './Alert';

const meta = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Modal
export const Basic: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Modal Title">
          <ModalBody>
            <p>This is a basic modal with a title and body content.</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button colorScheme="brand" onClick={() => setIsOpen(false)}>
              Confirm
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );
  },
};

// Form Modal
export const FormModal: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Create Item</Button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create New Item" size="lg">
          <ModalBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Input label="Name" placeholder="Enter item name" required />
              <Input label="Email" type="email" placeholder="your@email.com" required />
              <Input
                label="Description"
                placeholder="Optional description"
                helperText="Provide additional details"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button colorScheme="brand" onClick={() => setIsOpen(false)}>
              Create
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );
  },
};

// Confirmation Modal
export const ConfirmationModal: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button colorScheme="red" onClick={() => setIsOpen(true)}>
          Delete Item
        </Button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Confirm Deletion" size="md">
          <ModalBody>
            <Alert variant="warning" title="Are you sure?">
              This action cannot be undone. This will permanently delete your item and remove all
              associated data.
            </Alert>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={() => setIsOpen(false)}>
              Delete
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );
  },
};

// Small Modal
export const SmallModal: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Small Modal</Button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Small Modal" size="sm">
          <ModalBody>
            <p>This is a small modal with minimal content.</p>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setIsOpen(false)}>Close</Button>
          </ModalFooter>
        </Modal>
      </>
    );
  },
};

// Large Modal
export const LargeModal: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Large Modal</Button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Large Modal" size="lg">
          <ModalBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <p>
                This is a large modal that can contain more content. Perfect for forms with multiple
                fields or detailed information.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Input label="Field 1" placeholder="Enter value" />
                <Input label="Field 2" placeholder="Enter value" />
                <Input label="Field 3" placeholder="Enter value" />
                <Input label="Field 4" placeholder="Enter value" />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button colorScheme="brand" onClick={() => setIsOpen(false)}>
              Save
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );
  },
};

// Extra Large Modal
export const ExtraLargeModal: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Extra Large Modal</Button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Extra Large Modal" size="xl">
          <ModalBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <p>
                This is an extra large modal suitable for complex interfaces, multi-column layouts,
                or rich content.
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1rem',
                }}
              >
                <Input label="First Name" placeholder="John" />
                <Input label="Last Name" placeholder="Doe" />
                <Input label="Email" type="email" placeholder="john@example.com" />
                <Input label="Phone" type="tel" placeholder="+1 (555) 123-4567" />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button colorScheme="brand" onClick={() => setIsOpen(false)}>
              Save
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );
  },
};

// Modal Without Footer
export const NoFooter: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Info Modal">
          <ModalBody>
            <p>This modal doesn't have a footer. You can close it using the X button or by clicking outside.</p>
          </ModalBody>
        </Modal>
      </>
    );
  },
};

// Success Modal
export const SuccessModal: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button colorScheme="green" onClick={() => setIsOpen(true)}>
          Show Success
        </Button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Success!" size="md">
          <ModalBody>
            <Alert variant="success" title="Operation Successful">
              Your changes have been saved successfully. You can now continue working.
            </Alert>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" onClick={() => setIsOpen(false)}>
              Great!
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );
  },
};
