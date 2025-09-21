# Gym Tracker Design System

A comprehensive design system built with React, TypeScript, and CSS Modules for the Gym Tracker application.

## Overview

This design system provides a consistent set of UI components, design tokens, and layout patterns that follow modern accessibility standards and responsive design principles.

## Features

- 🎨 **Design Tokens**: Centralized color, typography, spacing, and other design values
- 🌙 **Theme System**: Support for light, dark, and system themes
- 📱 **Mobile-First**: Responsive design optimized for mobile devices
- ♿ **Accessibility**: WCAG 2.1 compliant components with proper ARIA attributes
- 🧩 **Modular**: CSS Modules for scoped styling and better maintainability
- 🔧 **TypeScript**: Full type safety for all components and props
- ✅ **Tested**: Comprehensive unit tests for all components

## Design Tokens

Design tokens are defined in `src/styles/tokens.css` and include:

### Colors
- Primary colors (blue scale)
- Gray scale for text and backgrounds
- Semantic colors (success, warning, error)
- Theme-aware color mappings

### Typography
- Font families (Inter for UI, JetBrains Mono for code)
- Font sizes (xs to 4xl)
- Font weights (normal, medium, semibold, bold)
- Line heights (tight, normal, relaxed)

### Spacing
- Consistent spacing scale (1-20, following 4px base unit)
- Responsive spacing utilities

### Other Tokens
- Border radius values
- Box shadows
- Z-index layers
- Transition durations
- Breakpoints

## Components

### Base UI Components

#### Button
A versatile button component with multiple variants and states.

```tsx
import { Button } from '@/components';

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// States
<Button loading>Loading</Button>
<Button disabled>Disabled</Button>

// With icons
<Button leftIcon={<Icon />} rightIcon={<Icon />}>
  With Icons
</Button>

// Full width
<Button fullWidth>Full Width</Button>
```

#### Input
A flexible input component with validation states and icons.

```tsx
import { Input } from '@/components';

// Basic usage
<Input 
  label="Email" 
  placeholder="Enter your email"
  value={value}
  onChange={handleChange}
/>

// With validation
<Input 
  label="Password"
  type="password"
  error="Password is required"
/>

// With helper text
<Input 
  label="Username"
  helperText="Must be 3-20 characters"
/>

// With icons
<Input 
  leftIcon={<EmailIcon />}
  rightIcon={<CheckIcon />}
  placeholder="Email address"
/>

// Sizes
<Input size="sm" />
<Input size="md" />
<Input size="lg" />
```

#### Card
A container component for grouping related content.

```tsx
import { Card } from '@/components';

// Basic card
<Card>
  <p>Card content</p>
</Card>

// With header and footer
<Card 
  header={<h3>Card Title</h3>}
  footer={<Button>Action</Button>}
>
  <p>Card content</p>
</Card>

// Variants
<Card variant="default">Default</Card>
<Card variant="outlined">Outlined</Card>
<Card variant="elevated">Elevated</Card>

// Interactive
<Card hoverable onClick={handleClick}>
  Clickable card
</Card>

// Padding options
<Card padding="none">No padding</Card>
<Card padding="sm">Small padding</Card>
<Card padding="md">Medium padding</Card>
<Card padding="lg">Large padding</Card>
```

#### Modal
An accessible modal dialog with focus management.

```tsx
import { Modal } from '@/components';

<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Modal Title"
  size="md"
>
  <p>Modal content</p>
</Modal>

// Sizes
<Modal size="sm">Small modal</Modal>
<Modal size="md">Medium modal</Modal>
<Modal size="lg">Large modal</Modal>
<Modal size="xl">Extra large modal</Modal>
<Modal size="full">Full screen modal</Modal>

// Configuration
<Modal
  closeOnBackdropClick={false}
  closeOnEscape={false}
  showCloseButton={false}
>
  Custom behavior
</Modal>
```

### Theme Components

#### ThemeProvider
Provides theme context and applies theme classes to the document.

```tsx
import { ThemeProvider } from '@/components';

function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}
```

#### ThemeToggle
A component for switching between themes.

```tsx
import { ThemeToggle } from '@/components';

// Button variant (cycles through themes)
<ThemeToggle />
<ThemeToggle showLabel />

// Select variant
<ThemeToggle variant="select" />
<ThemeToggle variant="select" showLabel />
```

### Layout Components

#### AppLayout
The main application layout with header, content area, and bottom navigation.

```tsx
import { AppLayout } from '@/components';

<AppLayout 
  title="Page Title"
  headerActions={<Button>Action</Button>}
  showBottomNav={true}
  showThemeToggle={true}
>
  <YourPageContent />
</AppLayout>
```

#### AuthLayout
A centered layout for authentication pages.

```tsx
import { AuthLayout } from '@/components';

<AuthLayout
  title="Sign In"
  subtitle="Welcome back to Gym Tracker"
  showLogo={true}
>
  <SignInForm />
</AuthLayout>
```

#### BottomNavigation
Mobile-optimized bottom navigation component.

```tsx
import { BottomNavigation } from '@/components';

<BottomNavigation 
  items={navigationItems}
  onItemClick={handleNavigation}
/>
```

## Theme System

The theme system supports three modes:

- **Light**: Light color scheme
- **Dark**: Dark color scheme  
- **System**: Follows the user's system preference

Themes are applied via CSS custom properties and data attributes:

```css
/* Light theme (default) */
:root {
  --color-background: #f9fafb;
  --color-text-primary: #111827;
}

/* Dark theme */
[data-theme='dark'] {
  --color-background: #111827;
  --color-text-primary: #f9fafb;
}

/* System theme */
@media (prefers-color-scheme: dark) {
  [data-theme='system'] {
    --color-background: #111827;
    --color-text-primary: #f9fafb;
  }
}
```

## Responsive Design

The design system follows a mobile-first approach with these breakpoints:

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

Components automatically adapt to different screen sizes using CSS media queries and flexible layouts.

## Accessibility

All components follow WCAG 2.1 guidelines and include:

- Proper semantic HTML
- ARIA attributes for screen readers
- Keyboard navigation support
- Focus management
- Color contrast compliance
- Reduced motion support

## CSS Modules

Components use CSS Modules for styling, which provides:

- Scoped CSS classes (no global conflicts)
- Better maintainability
- Type safety with TypeScript
- Automatic vendor prefixing
- Dead code elimination

## Testing

Components are thoroughly tested with:

- Unit tests using Vitest and React Testing Library
- Accessibility testing
- Visual regression testing (planned)
- Cross-browser compatibility testing

## Usage Guidelines

### Importing Components

```tsx
// Import individual components
import { Button, Input, Card } from '@/components';

// Or import from specific modules
import Button from '@/components/ui/Button';
import { AppLayout } from '@/components/layout';
```

### Styling Guidelines

1. Use design tokens instead of hardcoded values
2. Follow the established spacing scale
3. Maintain consistent typography hierarchy
4. Ensure proper color contrast
5. Test with different themes

### Best Practices

1. Always provide accessible labels and descriptions
2. Use semantic HTML elements
3. Test keyboard navigation
4. Validate form inputs properly
5. Handle loading and error states
6. Optimize for mobile devices first

## Development

### Adding New Components

1. Create component directory in appropriate category (`ui/`, `layout/`, etc.)
2. Implement component with TypeScript interfaces
3. Create CSS Module file with proper naming
4. Add comprehensive unit tests
5. Update index files for exports
6. Document component usage

### Modifying Existing Components

1. Ensure backward compatibility
2. Update tests accordingly
3. Test across different themes
4. Verify accessibility compliance
5. Update documentation

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

The design system is optimized for performance with:

- Tree shaking for unused components
- CSS Modules for efficient styling
- Lazy loading for non-critical components
- Minimal bundle size impact
- Efficient re-renders with React best practices

## Contributing

When contributing to the design system:

1. Follow the established patterns and conventions
2. Write comprehensive tests
3. Ensure accessibility compliance
4. Test across different devices and browsers
5. Update documentation
6. Consider backward compatibility