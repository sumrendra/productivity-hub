import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { Plus, Save, Trash2, Download } from 'lucide-react';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['solid', 'outline', 'ghost', 'link'],
    },
    colorScheme: {
      control: 'select',
      options: ['brand', 'gray', 'red', 'green', 'blue', 'yellow', 'purple'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    isLoading: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Variants
export const Solid: Story = {
  args: {
    children: 'Button',
    variant: 'solid',
    colorScheme: 'brand',
  },
};

export const Outline: Story = {
  args: {
    children: 'Button',
    variant: 'outline',
    colorScheme: 'brand',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Button',
    variant: 'ghost',
    colorScheme: 'brand',
  },
};

export const Link: Story = {
  args: {
    children: 'Button',
    variant: 'link',
    colorScheme: 'brand',
  },
};

// Sizes
export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    children: 'Medium Button',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
};

export const ExtraLarge: Story = {
  args: {
    children: 'Extra Large Button',
    size: 'xl',
  },
};

// With Icons
export const WithLeftIcon: Story = {
  args: {
    children: 'Add Item',
    leftIcon: <Plus size={20} />,
    colorScheme: 'brand',
  },
};

export const WithRightIcon: Story = {
  args: {
    children: 'Save',
    rightIcon: <Save size={20} />,
    colorScheme: 'green',
  },
};

export const IconOnly: Story = {
  args: {
    children: <Download size={20} />,
    colorScheme: 'brand',
    'aria-label': 'Download',
  },
};

// States
export const Loading: Story = {
  args: {
    children: 'Loading',
    isLoading: true,
    colorScheme: 'brand',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
    colorScheme: 'brand',
  },
};

// Color Schemes
export const ColorSchemes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Button colorScheme="brand">Brand</Button>
      <Button colorScheme="gray">Gray</Button>
      <Button colorScheme="red">Red</Button>
      <Button colorScheme="green">Green</Button>
      <Button colorScheme="blue">Blue</Button>
      <Button colorScheme="yellow">Yellow</Button>
      <Button colorScheme="purple">Purple</Button>
    </div>
  ),
};

// All Variants Together
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Button variant="solid" colorScheme="brand">
          Solid
        </Button>
        <Button variant="outline" colorScheme="brand">
          Outline
        </Button>
        <Button variant="ghost" colorScheme="brand">
          Ghost
        </Button>
        <Button variant="link" colorScheme="brand">
          Link
        </Button>
      </div>
    </div>
  ),
};

// Destructive Actions
export const DestructiveActions: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <Button colorScheme="red" leftIcon={<Trash2 size={18} />}>
        Delete
      </Button>
      <Button variant="outline" colorScheme="red">
        Cancel
      </Button>
    </div>
  ),
};
