# Phase 2 Continuation Guide

## Quick Start: Fixing Chakra UI v3 Compatibility

### Current Issue
We've created components using Chakra UI v2 API, but Chakra UI v3.27.0 is installed. The v3 API has significant changes that need to be addressed before we can build and run the application.

---

## Step 1: Install Chakra UI CLI Snippet for Color Mode

```bash
npx @chakra-ui/cli snippet add color-mode
```

This will:
- Install `next-themes` dependency
- Create `src/components/ui/color-mode.tsx` component
- Set up proper color mode management for v3

---

## Step 2: Update Theme Configuration

**File**: `src/config/theme.ts`

Replace the current implementation with Chakra UI v3 API:

```typescript
import { defineConfig, createSystem } from "@chakra-ui/react"

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#E6F2FF" },
          100: { value: "#B3D9FF" },
          200: { value: "#80C0FF" },
          300: { value: "#4DA7FF" },
          400: { value: "#1A8EFF" },
          500: { value: "#0066FF" }, // Primary
          600: { value: "#0052CC" },
          700: { value: "#003D99" },
          800: { value: "#002966" },
          900: { value: "#001433" },
        },
        // ... add other color palettes similarly
      },
      fonts: {
        heading: { value: "Inter, -apple-system, sans-serif" },
        body: { value: "Inter, -apple-system, sans-serif" },
        mono: { value: "JetBrains Mono, Menlo, monospace" },
      },
    },
    semanticTokens: {
      colors: {
        primary: {
          value: { base: "{colors.brand.500}", _dark: "{colors.brand.400}" },
        },
      },
    },
  },
})

export const system = createSystem(config)
export default system
```

---

## Step 3: Update Main Entry Point

**File**: `src/main.tsx`

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { ColorModeProvider } from './components/ui/color-mode';
import App from './App';
import { system } from './config/theme';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider value={system}>
      <ColorModeProvider>
        <App />
      </ColorModeProvider>
    </ChakraProvider>
  </React.StrictMode>
);
```

---

## Step 4: Fix Component Imports (Chakra UI v3 Uses Namespaces)

### Example: Updating Sidebar.tsx

**Before (v2)**:
```typescript
import { 
  Box, 
  VStack, 
  HStack, 
  Drawer,
  DrawerOverlay,
  useColorModeValue,
} from '@chakra-ui/react';
```

**After (v3)**:
```typescript
import { 
  Box, 
  VStack, 
  HStack,
} from '@chakra-ui/react';
import { DrawerRoot, DrawerBackdrop, DrawerContent } from '@chakra-ui/react/drawer';
```

---

## Step 5: Update Hook Usage

### useDisclosure Changes

**Before (v2)**:
```typescript
const { isOpen, onToggle, onClose } = useDisclosure({ defaultIsOpen: true });
```

**After (v3)**:
```typescript
const { open, onOpen, onClose, onToggle } = useDisclosure({ defaultOpen: true });
// Note: isOpen → open, defaultIsOpen → defaultOpen
```

---

## Step 6: Update Prop Names

### IconButton Props

**Before (v2)**:
```typescript
<IconButton icon={<MenuIcon />} aria-label="Menu" />
```

**After (v3)**:
```typescript
<IconButton aria-label="Menu">
  <MenuIcon />
</IconButton>
```

### MenuItem Props

**Before (v2)**:
```typescript
<MenuItem icon={<UserIcon />}>Profile</MenuItem>
```

**After (v3)**:
```typescript
<MenuItem>
  <UserIcon /> Profile
</MenuItem>
```

---

## Step 7: Replace `useColorModeValue` with Direct Prop Usage

**Before (v2)**:
```typescript
const bgColor = useColorModeValue('white', 'gray.800');

<Box bg={bgColor}>Content</Box>
```

**After (v3)**:
```typescript
<Box bg={{ base: 'white', _dark: 'gray.800' }}>Content</Box>
```

---

## Step 8: Fix Styling Props

### Remove `sx` Prop

**Before (v2)**:
```typescript
<Box sx={{ '&::-webkit-scrollbar': { width: '4px' } }}>
```

**After (v3)**:
```typescript
<Box css={{ '&::-webkit-scrollbar': { width: '4px' } }}>
```

or use inline styles:
```typescript
<Box style={{ scrollbarWidth: 'thin' }}>
```

---

## Step 9: Update Component-Specific APIs

### Drawer Component

**Before (v2)**:
```typescript
<Drawer isOpen={isOpen} onClose={onClose} placement="left">
  <DrawerOverlay />
  <DrawerContent>
    {content}
  </DrawerContent>
</Drawer>
```

**After (v3)**:
```typescript
import { DrawerRoot, DrawerBackdrop, DrawerContent } from '@chakra-ui/react/drawer';

<DrawerRoot open={isOpen} onClose={onClose} placement="start">
  <DrawerBackdrop />
  <DrawerContent>
    {content}
  </DrawerContent>
</DrawerRoot>
```

### Menu Component

**Before (v2)**:
```typescript
<Menu>
  <MenuButton as={Button}>Actions</MenuButton>
  <MenuList>
    <MenuItem>Edit</MenuItem>
  </MenuList>
</Menu>
```

**After (v3)**:
```typescript
import { MenuRoot, MenuTrigger, MenuContent, MenuItem } from '@chakra-ui/react/menu';

<MenuRoot>
  <MenuTrigger asChild>
    <Button>Actions</Button>
  </MenuTrigger>
  <MenuContent>
    <MenuItem>Edit</MenuItem>
  </MenuContent>
</MenuRoot>
```

### Tooltip Component

**Before (v2)**:
```typescript
<Tooltip label="Help text">
  <Button>Hover me</Button>
</Tooltip>
```

**After (v3)**:
```typescript
import { TooltipRoot, TooltipTrigger, TooltipContent } from '@chakra-ui/react/tooltip';

<TooltipRoot>
  <TooltipTrigger asChild>
    <Button>Hover me</Button>
  </TooltipTrigger>
  <TooltipContent>Help text</TooltipContent>
</TooltipRoot>
```

---

## Step 10: Update Stack Components

### HStack/VStack Props

**Before (v2)**:
```typescript
<HStack spacing={4}>
  {children}
</HStack>
```

**After (v3)**:
```typescript
<HStack gap={4}>
  {children}
</HStack>
```

Note: `spacing` prop is replaced with `gap` in v3.

---

## Testing Checklist

After making the changes, test the following:

- [ ] Application builds without TypeScript errors
- [ ] Development server starts successfully
- [ ] Sidebar navigation appears and is clickable
- [ ] Sidebar collapses/expands on button click
- [ ] Mobile responsive behavior works (test in DevTools)
- [ ] Dark mode toggle works
- [ ] Search bar is visible and styled correctly
- [ ] User menu dropdown works
- [ ] Breadcrumbs display correctly
- [ ] All icons render properly

---

## Common Errors and Solutions

### Error: "Module has no exported member 'useColorModeValue'"
**Solution**: Replace with direct prop usage as shown in Step 7.

### Error: "Property 'icon' does not exist on type IconButtonProps"
**Solution**: Move icon to children as shown in Step 6.

### Error: "Property 'spacing' does not exist on type StackProps"
**Solution**: Replace `spacing` with `gap`.

### Error: "JSX element type 'Drawer' does not have any construct or call signatures"
**Solution**: Use namespace imports from '@chakra-ui/react/drawer'.

---

## Alternative: Use Material-UI Instead

If Chakra UI v3 API changes are too extensive, consider switching to Material-UI v5 which was already in the project's dependencies:

```bash
# Already installed
@mui/material@^5.14.5
@mui/icons-material@^5.14.3
```

**Pros**:
- More mature and stable API
- Better documentation
- Larger community
- Already in package.json

**Cons**:
- Different design language (Material Design vs Chakra UI)
- Theme system works differently
- Would need to rewrite theme.ts

---

## Next Steps After Fixing Compatibility

1. **Run the build** to verify no TypeScript errors:
   ```bash
   npm run build
   ```

2. **Start development server**:
   ```bash
   npm run dev:all
   ```

3. **Test basic functionality** in browser (http://localhost:3000)

4. **Continue with 2.4 Common Components Library**:
   - Start with simple components (Card, Button variants)
   - Use the corrected v3 API patterns
   - Test each component individually

5. **Document patterns** for future components to maintain consistency

---

## Helpful Resources

- **Chakra UI v3 Documentation**: https://v3.chakra-ui.com/
- **Migration Guide**: https://v3.chakra-ui.com/docs/upgrade/migrate
- **Component Examples**: https://v3.chakra-ui.com/docs/components
- **Snippets CLI**: https://v3.chakra-ui.com/docs/theming/snippets

---

## Questions to Consider

1. **Should we continue with Chakra UI v3 or switch to Material-UI?**
   - Chakra v3 is cutting-edge but requires more work
   - Material-UI is battle-tested but different design language

2. **Do we want to use the Chakra UI CLI for component scaffolding?**
   ```bash
   npx @chakra-ui/cli snippet add [component-name]
   ```

3. **Should we set up Storybook for component documentation?**
   - Helpful for testing components in isolation
   - Great for design system documentation
   - Adds development overhead

---

**Last Updated**: October 2025  
**Status**: Ready to continue Phase 2 implementation
