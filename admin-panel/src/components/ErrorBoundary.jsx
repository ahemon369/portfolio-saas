import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch() {
    // Keep silent in production UI; app shows fallback card.
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="auth-shell">
          <div className="glass card auth-card">
            <h2>Something went wrong</h2>
            <p>Please refresh the page and sign in again.</p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
