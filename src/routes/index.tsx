import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import AppShell from '@/components/layout/AppShell'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import NotesPage from '@/pages/NotesPage'
import TasksPage from '@/pages/TasksPage'
import LinksPage from '@/pages/LinksPage'
import FinancePage from '@/pages/FinancePage'
import SettingsPage from '@/pages/SettingsPage'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

function Page({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Page><DashboardPage /></Page>} />
        <Route path="/notes" element={<Page><NotesPage /></Page>} />
        <Route path="/tasks" element={<Page><TasksPage /></Page>} />
        <Route path="/links" element={<Page><LinksPage /></Page>} />
        <Route path="/finance" element={<Page><FinancePage /></Page>} />
        <Route path="/settings" element={<Page><SettingsPage /></Page>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
