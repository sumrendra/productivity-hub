import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';

// Layouts
const RootLayout = lazy(() => import('@pages/RootLayout'));

// Pages
const DashboardPage = lazy(() => import('@pages/DashboardPage'));
const NotesPage = lazy(() => import('@pages/NotesPage'));
const LinksPage = lazy(() => import('@pages/LinksPage'));
const TasksPage = lazy(() => import('@pages/TasksPage'));
const FinancePage = lazy(() => import('@pages/FinancePage'));
const SettingsPage = lazy(() => import('@pages/SettingsPage'));
const NotFoundPage = lazy(() => import('@pages/NotFoundPage'));

// Loading component
const PageLoader = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '18px',
      color: '#666',
    }}
  >
    Loading...
  </div>
);

// Wrap routes with Suspense
const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <SuspenseWrapper>
        <RootLayout />
      </SuspenseWrapper>
    ),
    errorElement: (
      <SuspenseWrapper>
        <NotFoundPage />
      </SuspenseWrapper>
    ),
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <DashboardPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'notes',
        element: (
          <SuspenseWrapper>
            <NotesPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'links',
        element: (
          <SuspenseWrapper>
            <LinksPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'tasks',
        element: (
          <SuspenseWrapper>
            <TasksPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'finance',
        element: (
          <SuspenseWrapper>
            <FinancePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'settings',
        element: (
          <SuspenseWrapper>
            <SettingsPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },
  {
    path: '*',
    element: (
      <SuspenseWrapper>
        <NotFoundPage />
      </SuspenseWrapper>
    ),
  },
]);
