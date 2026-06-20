import { Component, type ErrorInfo, type ReactNode } from 'react'
import { EmptyState } from '@/components/shared/EmptyState'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  message?: string
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('FlowSpace error boundary:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 48 }}>
          <EmptyState
            icon={AlertTriangle}
            title="Something went wrong"
            description={this.state.message || 'An unexpected error occurred in this view.'}
            action={{
              label: 'Reload page',
              onClick: () => window.location.reload(),
            }}
          />
        </div>
      )
    }

    return this.props.children
  }
}
