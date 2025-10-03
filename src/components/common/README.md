# Component Library Documentation

## Overview

This component library provides a comprehensive set of production-ready UI components built with **Chakra UI v3**, **TypeScript**, and **Framer Motion**. All components follow best practices for accessibility, performance, and user experience.

## Features

✨ **Modern & Accessible** - WCAG 2.1 AA compliant with ARIA labels and keyboard navigation  
🎨 **Dark Mode Ready** - Built-in dark mode support with theme tokens  
⚡ **Performant** - Optimized with React best practices and memoization  
🔧 **TypeScript** - Full type safety with comprehensive prop types  
🎭 **Animated** - Smooth animations powered by Framer Motion  
📦 **Tree-shakeable** - Import only what you need  

---

## Components

### 1. Button

A versatile button component with multiple variants, sizes, and states.

**Props:**
- `variant`: `'solid' | 'outline' | 'ghost' | 'link'` (default: `'solid'`)
- `colorScheme`: `'brand' | 'gray' | 'red' | 'green' | 'blue' | 'yellow' | 'purple'` (default: `'brand'`)
- `size`: `'sm' | 'md' | 'lg' | 'xl'` (default: `'md'`)
- `isLoading`: `boolean` - Shows loading spinner
- `leftIcon`: `ReactNode` - Icon before text
- `rightIcon`: `ReactNode` - Icon after text
- `disabled`: `boolean`

**Usage:**
```tsx
import { Button } from '@components/common';

<Button colorScheme="brand" size="md" leftIcon={<Plus />}>
  Add Item
</Button>
```

---

### 2. Card

Container component for grouping related content.

**Subcomponents:**
- `CardHeader` - Optional header with title and actions
- `CardBody` - Main content area
- `CardFooter` - Optional footer for actions

**Props:**
- `variant`: `'elevated' | 'outline' | 'subtle'` (default: `'elevated'`)

**CardHeader Props:**
- `title`: `string` (required)
- `subtitle`: `string`
- `action`: `ReactNode` - Action element (e.g., Badge, Button)

**Usage:**
```tsx
import { Card, CardHeader, CardBody, CardFooter, Button } from '@components/common';

<Card variant="elevated">
  <CardHeader title="Card Title" subtitle="Subtitle" />
  <CardBody>
    <p>Content goes here</p>
  </CardBody>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

---

### 3. Input

Text input component with validation and states.

**Props:**
- `label`: `string` - Label text
- `type`: `string` - HTML input type (default: `'text'`)
- `placeholder`: `string`
- `value`: `string`
- `onChange`: `(e: ChangeEvent) => void`
- `error`: `string` - Error message
- `helperText`: `string` - Helper text below input
- `required`: `boolean`
- `disabled`: `boolean`

**Usage:**
```tsx
import { Input } from '@components/common';

<Input
  label="Email"
  type="email"
  placeholder="your@email.com"
  error={errors.email}
  required
/>
```

---

### 4. Textarea

Multi-line text input component.

**Props:**
- `label`: `string`
- `placeholder`: `string`
- `value`: `string`
- `onChange`: `(e: ChangeEvent) => void`
- `rows`: `number` (default: `4`)
- `error`: `string`
- `helperText`: `string`
- `required`: `boolean`
- `disabled`: `boolean`

**Usage:**
```tsx
import { Textarea } from '@components/common';

<Textarea
  label="Description"
  placeholder="Enter description..."
  rows={5}
/>
```

---

### 5. Modal

Accessible modal dialog component.

**Subcomponents:**
- `ModalBody` - Modal content
- `ModalFooter` - Modal actions

**Props:**
- `isOpen`: `boolean` (required)
- `onClose`: `() => void` (required)
- `title`: `string` (required)
- `size`: `'sm' | 'md' | 'lg' | 'xl'` (default: `'md'`)

**Usage:**
```tsx
import { Modal, ModalBody, ModalFooter, Button } from '@components/common';

<Modal isOpen={isOpen} onClose={handleClose} title="Confirm Action" size="md">
  <ModalBody>
    <p>Are you sure?</p>
  </ModalBody>
  <ModalFooter>
    <Button variant="ghost" onClick={handleClose}>Cancel</Button>
    <Button colorScheme="brand" onClick={handleConfirm}>Confirm</Button>
  </ModalFooter>
</Modal>
```

---

### 6. Badge

Small status indicator component.

**Props:**
- `colorScheme`: `'gray' | 'red' | 'green' | 'blue' | 'yellow' | 'purple' | 'brand'` (default: `'gray'`)
- `children`: `ReactNode`

**Usage:**
```tsx
import { Badge } from '@components/common';

<Badge colorScheme="green">Active</Badge>
<Badge colorScheme="red">Error</Badge>
```

---

### 7. Alert

Feedback component for messages.

**Props:**
- `variant`: `'info' | 'success' | 'warning' | 'error'` (required)
- `title`: `string`
- `closable`: `boolean` - Show close button
- `onClose`: `() => void`
- `children`: `ReactNode`

**Usage:**
```tsx
import { Alert } from '@components/common';

<Alert variant="success" title="Success!">
  Your changes have been saved.
</Alert>

<Alert variant="error" closable onClose={handleClose}>
  An error occurred. Please try again.
</Alert>
```

---

### 8. LoadingSpinner

Loading indicator component.

**Props:**
- `size`: `'sm' | 'md' | 'lg'` (default: `'md'`)
- `label`: `string` - Accessible label

**Usage:**
```tsx
import { LoadingSpinner } from '@components/common';

<LoadingSpinner size="lg" label="Loading data..." />
```

---

### 9. EmptyState

Placeholder component for empty content states.

**Props:**
- `icon`: `ReactNode` - Icon element
- `title`: `string` (required)
- `description`: `string`

**Usage:**
```tsx
import { EmptyState } from '@components/common';
import { Inbox } from 'lucide-react';

<EmptyState
  icon={<Inbox size={64} />}
  title="No items yet"
  description="Create your first item to get started"
/>
```

---

### 10. Tooltip

Hover tooltip component.

**Props:**
- `label`: `string` (required)
- `placement`: `'top' | 'right' | 'bottom' | 'left'` (default: `'top'`)
- `children`: `ReactNode`

**Usage:**
```tsx
import { Tooltip, Button } from '@components/common';

<Tooltip label="Click to save">
  <Button>Save</Button>
</Tooltip>
```

---

### 11. Breadcrumbs

Navigation breadcrumbs component.

**Props:**
- `items`: `Array<{ label: string; href?: string }>` (required)

**Usage:**
```tsx
import { Breadcrumbs } from '@components/common';

<Breadcrumbs
  items={[
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Details' },
  ]}
/>
```

---

### 12. Menu

Dropdown menu component.

**Subcomponents:**
- `MenuItem` - Individual menu item

**Props:**
- `trigger`: `ReactNode` (required) - Button or element to trigger menu
- `children`: `ReactNode` - Menu items

**MenuItem Props:**
- `icon`: `ReactNode`
- `label`: `string`
- `onClick`: `() => void`
- `danger`: `boolean` - Destructive action styling

**Usage:**
```tsx
import { Menu, MenuItem, Button } from '@components/common';
import { Settings, User, LogOut } from 'lucide-react';

<Menu trigger={<Button>Options</Button>}>
  <MenuItem icon={<Settings />} label="Settings" onClick={handleSettings} />
  <MenuItem icon={<User />} label="Profile" onClick={handleProfile} />
  <MenuItem icon={<LogOut />} label="Logout" onClick={handleLogout} danger />
</Menu>
```

---

### 13. Tabs

Tabbed interface component.

**Subcomponents:**
- `TabList` - Container for tabs
- `Tab` - Individual tab button
- `TabPanels` - Container for tab panels
- `TabPanel` - Individual tab content

**Props:**
- `defaultIndex`: `number` (default: `0`)

**Usage:**
```tsx
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@components/common';

<Tabs defaultIndex={0}>
  <TabList>
    <Tab>Tab 1</Tab>
    <Tab>Tab 2</Tab>
    <Tab>Tab 3</Tab>
  </TabList>
  <TabPanels>
    <TabPanel>Content 1</TabPanel>
    <TabPanel>Content 2</TabPanel>
    <TabPanel>Content 3</TabPanel>
  </TabPanels>
</Tabs>
```

---

### 14. Avatar

User profile image component.

**Props:**
- `src`: `string` - Image URL
- `alt`: `string` - Alt text
- `name`: `string` - Fallback initials
- `size`: `'sm' | 'md' | 'lg'` (default: `'md'`)

**Usage:**
```tsx
import { Avatar } from '@components/common';

<Avatar
  src="/avatar.jpg"
  alt="User name"
  name="John Doe"
  size="md"
/>
```

---

## Styling & Theming

All components use Chakra UI's theme system and support:

- **Dark Mode**: Automatic dark mode support via `_dark` prop
- **Color Schemes**: Consistent color palette across components
- **Responsive Design**: Mobile-first responsive utilities
- **Custom Tokens**: Override theme tokens for customization

---

## Accessibility

All components follow accessibility best practices:

- ✅ Semantic HTML
- ✅ ARIA labels and roles
- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Screen reader support
- ✅ Color contrast compliance

---

## Development

### Running Storybook

```bash
npm run storybook
```

Visit `http://localhost:6006` to view the component library.

### Building Storybook

```bash
npm run build-storybook
```

Outputs static Storybook to `storybook-static/` directory.

---

## Best Practices

1. **Always provide labels** for form components
2. **Use semantic color schemes** (e.g., 'red' for delete, 'green' for success)
3. **Include loading states** for async operations
4. **Provide error messages** for form validation
5. **Use tooltips** for icon-only buttons
6. **Include empty states** for lists/grids

---

## Support

For questions, issues, or feature requests, please refer to the project repository or contact the development team.

---

**Version:** 1.0.0  
**Last Updated:** 2025-10-03  
**License:** MIT
