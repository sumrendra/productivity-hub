import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';
import { Textarea } from './Textarea';

const meta = {
  title: 'Components/Forms/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Input
export const Basic: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

// With Label
export const WithLabel: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter your username',
  },
};

// Required Field
export const Required: Story = {
  args: {
    label: 'Email',
    placeholder: 'your@email.com',
    required: true,
  },
};

// With Helper Text
export const WithHelperText: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
    helperText: 'Must be at least 8 characters long',
  },
};

// With Error
export const WithError: Story = {
  args: {
    label: 'Email',
    placeholder: 'your@email.com',
    error: 'Invalid email address',
    value: 'invalid-email',
  },
};

// Disabled
export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    placeholder: 'Cannot edit this',
    disabled: true,
  },
};

// Email Type
export const EmailType: Story = {
  args: {
    label: 'Email Address',
    type: 'email',
    placeholder: 'your@email.com',
    required: true,
  },
};

// Password Type
export const PasswordType: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
    required: true,
    helperText: 'Use a strong password',
  },
};

// Number Type
export const NumberType: Story = {
  args: {
    label: 'Age',
    type: 'number',
    placeholder: '0',
    helperText: 'Enter your age',
  },
};

// Date Type
export const DateType: Story = {
  args: {
    label: 'Birth Date',
    type: 'date',
  },
};

// Form Example
export const FormExample: Story = {
  render: () => (
    <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Input label="Full Name" placeholder="John Doe" required />
      <Input label="Email" type="email" placeholder="john@example.com" required />
      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        required
        helperText="Minimum 8 characters"
      />
      <Input label="Phone" type="tel" placeholder="+1 (555) 123-4567" />
    </div>
  ),
};

// Textarea Stories
const textareaMeta = {
  title: 'Components/Forms/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Textarea>;

export const TextareaBasic: StoryObj<typeof textareaMeta> = {
  args: {
    placeholder: 'Enter long text...',
  },
};

export const TextareaWithLabel: StoryObj<typeof textareaMeta> = {
  args: {
    label: 'Description',
    placeholder: 'Enter description...',
    rows: 4,
  },
};

export const TextareaRequired: StoryObj<typeof textareaMeta> = {
  args: {
    label: 'Comments',
    placeholder: 'Share your thoughts...',
    required: true,
    rows: 5,
  },
};

export const TextareaWithError: StoryObj<typeof textareaMeta> = {
  args: {
    label: 'Message',
    placeholder: 'Enter message...',
    error: 'Message is too short',
    value: 'Hi',
    rows: 4,
  },
};

export const TextareaWithHelperText: StoryObj<typeof textareaMeta> = {
  args: {
    label: 'Bio',
    placeholder: 'Tell us about yourself...',
    helperText: 'Maximum 500 characters',
    rows: 6,
  },
};

export const TextareaDisabled: StoryObj<typeof textareaMeta> = {
  args: {
    label: 'Disabled Textarea',
    placeholder: 'Cannot edit this',
    disabled: true,
    value: 'This text cannot be edited',
    rows: 3,
  },
};
