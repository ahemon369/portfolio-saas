import { Component } from 'react'

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      message: '',
    }
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: String(error?.message ?? 'Unexpected error'),
    }
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '' })
    window.location.assign('/')
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <div className="relative min-h-screen overflow-hidden bg-neon-mesh px-4 py-7 sm:px-6 lg:px-8">
        <div className="noise-overlay" aria-hidden="true" />

        <main className="relative z-10 mx-auto flex w-full max-w-xl flex-col gap-4">
          <section className="glass rounded-2xl p-6 text-slate-200">
            <p className="font-code text-xs uppercase tracking-[0.2em] text-cyan-200">Application Error</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-50">Something went wrong</h1>
            <p className="mt-2 text-sm text-slate-300">
              The app hit an unexpected issue. You can retry safely.
            </p>
            {this.state.message ? <p className="mt-3 text-xs text-rose-200/90">{this.state.message}</p> : null}
            <button
              type="button"
              onClick={this.handleReset}
              className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-gradient-to-r from-cyan-300 via-sky-300 to-indigo-300 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_8px_22px_rgba(56,189,248,0.28)]"
            >
              Return to Portfolio
            </button>
          </section>
        </main>
      </div>
    )
  }
}

export { AppErrorBoundary }
