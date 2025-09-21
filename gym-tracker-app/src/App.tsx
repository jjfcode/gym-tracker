import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { 
  ThemeProvider, 
  AppLayout, 
  Button, 
  Input, 
  Card, 
  Modal,
  ThemeToggle 
} from './components';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && 'status' in error) {
          const status = (error as Error & { status: number }).status;
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < 3;
      },
    },
  },
});

function DesignSystemDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  return (
    <AppLayout title="Design System Demo">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px' }}>
        
        {/* Theme Toggle Demo */}
        <Card header={<h2>Theme System</h2>}>
          <p>Toggle between light, dark, and system themes:</p>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem' }}>
            <ThemeToggle showLabel />
            <ThemeToggle variant="select" showLabel />
          </div>
        </Card>

        {/* Button Demo */}
        <Card header={<h2>Button Components</h2>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
              <Button 
                leftIcon={<span>👍</span>}
                rightIcon={<span>→</span>}
              >
                With Icons
              </Button>
            </div>
            
            <Button fullWidth>Full Width Button</Button>
          </div>
        </Card>

        {/* Input Demo */}
        <Card header={<h2>Input Components</h2>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input 
              label="Basic Input" 
              placeholder="Enter some text..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            
            <Input 
              label="Input with Error" 
              error="This field is required"
              placeholder="Error state"
            />
            
            <Input 
              label="Input with Helper Text" 
              helperText="This is some helpful information"
              placeholder="Helper text example"
            />
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Input size="sm" placeholder="Small" />
              <Input size="md" placeholder="Medium" />
              <Input size="lg" placeholder="Large" />
            </div>
            
            <Input 
              label="Input with Icons"
              leftIcon={<span>@</span>}
              rightIcon={<span>✓</span>}
              placeholder="With icons"
            />
          </div>
        </Card>

        {/* Card Demo */}
        <Card header={<h2>Card Components</h2>}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <Card variant="default" padding="sm">
              <h3>Default Card</h3>
              <p>This is a default card with small padding.</p>
            </Card>
            
            <Card variant="outlined" padding="md">
              <h3>Outlined Card</h3>
              <p>This is an outlined card with medium padding.</p>
            </Card>
            
            <Card variant="elevated" padding="lg">
              <h3>Elevated Card</h3>
              <p>This is an elevated card with large padding.</p>
            </Card>
            
            <Card 
              hoverable 
              onClick={() => alert('Card clicked!')}
              header={<h4>Interactive Card</h4>}
              footer={<Button size="sm" variant="ghost">Action</Button>}
            >
              <p>This card is hoverable and clickable.</p>
            </Card>
          </div>
        </Card>

        {/* Modal Demo */}
        <Card header={<h2>Modal Component</h2>}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Button onClick={() => setIsModalOpen(true)}>
              Open Modal
            </Button>
          </div>
          
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Demo Modal"
            size="md"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p>This is a modal dialog with proper focus management and accessibility features.</p>
              <Input label="Modal Input" placeholder="Try typing here..." />
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsModalOpen(false)}>
                  Confirm
                </Button>
              </div>
            </div>
          </Modal>
        </Card>

        {/* Layout Demo */}
        <Card header={<h2>Layout System</h2>}>
          <p>This demo is using the AppLayout component with:</p>
          <ul>
            <li>Responsive header with title and theme toggle</li>
            <li>Bottom navigation (visible on mobile)</li>
            <li>Proper spacing and typography</li>
            <li>Mobile-first responsive design</li>
          </ul>
        </Card>

      </div>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <DesignSystemDemo />
        </ThemeProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
