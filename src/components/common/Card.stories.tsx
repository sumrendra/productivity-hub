import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardBody, CardFooter } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['elevated', 'outline', 'subtle'],
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Variants
export const Elevated: Story = {
  render: () => (
    <Card variant="elevated" style={{ width: '400px' }}>
      <CardBody>
        <p>This is an elevated card with shadow effect.</p>
      </CardBody>
    </Card>
  ),
};

export const Outline: Story = {
  render: () => (
    <Card variant="outline" style={{ width: '400px' }}>
      <CardBody>
        <p>This is an outline card with border.</p>
      </CardBody>
    </Card>
  ),
};

export const Subtle: Story = {
  render: () => (
    <Card variant="subtle" style={{ width: '400px' }}>
      <CardBody>
        <p>This is a subtle card with light background.</p>
      </CardBody>
    </Card>
  ),
};

// With Header
export const WithHeader: Story = {
  render: () => (
    <Card variant="elevated" style={{ width: '400px' }}>
      <CardHeader title="Card Title" />
      <CardBody>
        <p>This card has a header with a title.</p>
      </CardBody>
    </Card>
  ),
};

// With Header and Subtitle
export const WithSubtitle: Story = {
  render: () => (
    <Card variant="elevated" style={{ width: '400px' }}>
      <CardHeader title="Card Title" subtitle="This is a subtitle" />
      <CardBody>
        <p>This card has both a title and subtitle in the header.</p>
      </CardBody>
    </Card>
  ),
};

// With Header Action
export const WithHeaderAction: Story = {
  render: () => (
    <Card variant="elevated" style={{ width: '400px' }}>
      <CardHeader
        title="Card Title"
        action={
          <Badge colorScheme="green">Active</Badge>
        }
      />
      <CardBody>
        <p>This card has an action element in the header.</p>
      </CardBody>
    </Card>
  ),
};

// With Footer
export const WithFooter: Story = {
  render: () => (
    <Card variant="elevated" style={{ width: '400px' }}>
      <CardHeader title="Card Title" />
      <CardBody>
        <p>This card has a footer with actions.</p>
      </CardBody>
      <CardFooter>
        <Button variant="ghost" size="sm">
          Cancel
        </Button>
        <Button colorScheme="brand" size="sm">
          Save
        </Button>
      </CardFooter>
    </Card>
  ),
};

// Complete Card
export const CompleteCard: Story = {
  render: () => (
    <Card variant="elevated" style={{ width: '400px' }}>
      <CardHeader
        title="Product Card"
        subtitle="Full-featured card example"
        action={<Badge colorScheme="blue">New</Badge>}
      />
      <CardBody>
        <p style={{ marginBottom: '1rem' }}>
          This is a complete card example with header, body, and footer. It
          demonstrates all the available features.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Badge colorScheme="gray">Tag 1</Badge>
          <Badge colorScheme="gray">Tag 2</Badge>
          <Badge colorScheme="gray">Tag 3</Badge>
        </div>
      </CardBody>
      <CardFooter>
        <Button variant="outline" size="sm">
          Learn More
        </Button>
        <Button colorScheme="brand" size="sm">
          Get Started
        </Button>
      </CardFooter>
    </Card>
  ),
};

// Grid of Cards
export const CardGrid: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1rem',
        width: '800px',
      }}
    >
      <Card variant="elevated">
        <CardHeader title="Card 1" />
        <CardBody>
          <p>First card in the grid</p>
        </CardBody>
      </Card>
      <Card variant="elevated">
        <CardHeader title="Card 2" />
        <CardBody>
          <p>Second card in the grid</p>
        </CardBody>
      </Card>
      <Card variant="elevated">
        <CardHeader title="Card 3" />
        <CardBody>
          <p>Third card in the grid</p>
        </CardBody>
      </Card>
      <Card variant="elevated">
        <CardHeader title="Card 4" />
        <CardBody>
          <p>Fourth card in the grid</p>
        </CardBody>
      </Card>
    </div>
  ),
};

// Interactive Card
export const InteractiveCard: Story = {
  render: () => (
    <Card
      variant="elevated"
      style={{
        width: '400px',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <CardHeader title="Interactive Card" subtitle="Hover over me!" />
      <CardBody>
        <p>This card responds to hover interactions with animations.</p>
      </CardBody>
    </Card>
  ),
};
