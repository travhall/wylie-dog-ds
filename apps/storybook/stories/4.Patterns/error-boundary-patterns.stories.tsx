import type { Meta, StoryObj } from "@storybook/react-vite";
import { Component, useState, ReactNode } from "react";
import { Button } from "@wyliedog/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Badge } from "@wyliedog/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@wyliedog/ui/alert";

const meta: Meta = {
  title: "4. Patterns/Error Boundaries",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Error boundary patterns for graceful error handling in React applications. These examples demonstrate how to catch and handle errors in component trees, provide fallback UIs, and implement recovery strategies.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Error Boundary Implementation
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to error reporting service
    console.error("Error caught by boundary:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <Alert variant="destructive">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>
              {this.state.error?.message || "An unexpected error occurred"}
            </AlertDescription>
          </Alert>
        )
      );
    }

    return this.props.children;
  }
}

// Recoverable Error Boundary
interface RecoverableErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class RecoverableErrorBoundary extends Component<
  ErrorBoundaryProps,
  RecoverableErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): RecoverableErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Recoverable error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="w-125 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Error Occurred</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                {this.state.error?.message || "An unexpected error occurred"}
              </AlertDescription>
            </Alert>
            <Button onClick={this.reset} variant="secondary" className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Components that may throw errors
function BuggyCounter({ throwError }: { throwError?: boolean }) {
  const [count, setCount] = useState(0);

  if (throwError && count === 3) {
    throw new Error("Counter reached error threshold (3)");
  }

  return (
    <Card className="w-100">
      <CardHeader>
        <CardTitle>Buggy Counter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg">Count: {count}</p>
        <p className="text-sm text-gray-600">
          {throwError ? "Will error at count 3" : "Stable counter"}
        </p>
        <Button onClick={() => setCount(count + 1)} className="w-full">
          Increment
        </Button>
      </CardContent>
    </Card>
  );
}

function ComponentWithAsyncError({ shouldError }: { shouldError?: boolean }) {
  const [data, setData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (shouldError) {
        throw new Error("API request failed");
      }

      setData("Data loaded successfully");
    } catch (error) {
      // Note: Error boundaries don't catch async errors
      // This demonstrates that limitation
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-100">
      <CardHeader>
        <CardTitle>Async Operation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data ? (
          <p className="text-green-600">{data}</p>
        ) : (
          <p className="text-gray-600">No data loaded</p>
        )}
        <Button onClick={fetchData} disabled={loading} className="w-full">
          {loading ? "Loading..." : "Fetch Data"}
        </Button>
      </CardContent>
    </Card>
  );
}

// Story: Basic Error Boundary
export const BasicErrorBoundary: Story = {
  render: () => {
    const [shouldError, setShouldError] = useState(false);

    return (
      <div className="space-y-4 w-125">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShouldError(!shouldError)}
            variant={shouldError ? "destructive" : "secondary"}
          >
            {shouldError ? "Disable Errors" : "Enable Errors"}
          </Button>
          <Badge variant={shouldError ? "destructive" : "success"}>
            {shouldError ? "Errors Enabled" : "Errors Disabled"}
          </Badge>
        </div>

        <ErrorBoundary>
          <BuggyCounter throwError={shouldError} />
        </ErrorBoundary>
      </div>
    );
  },
};

// Story: Recoverable Error Boundary
export const RecoverableErrors: Story = {
  render: () => {
    const [shouldError, setShouldError] = useState(true);
    const [key, setKey] = useState(0);

    const handleReset = () => {
      setKey((k) => k + 1);
      setShouldError(false);
    };

    return (
      <div className="space-y-4 w-125">
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            This error boundary allows recovery by resetting the component
            state.
          </p>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShouldError(!shouldError)}
              variant="secondary"
              size="sm"
            >
              {shouldError ? "Disable Errors" : "Enable Errors"}
            </Button>
            <Button onClick={handleReset} variant="outline" size="sm">
              Force Reset
            </Button>
          </div>
        </div>

        <RecoverableErrorBoundary key={key}>
          <BuggyCounter throwError={shouldError} />
        </RecoverableErrorBoundary>
      </div>
    );
  },
};

// Story: Multiple Error Boundaries
export const MultipleErrorBoundaries: Story = {
  render: () => {
    const [error1, setError1] = useState(false);
    const [error2, setError2] = useState(false);

    return (
      <div className="space-y-6 w-150">
        <Card>
          <CardHeader>
            <CardTitle>Isolated Error Boundaries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Each component has its own error boundary, so errors are isolated
              and don't affect other parts of the UI.
            </p>

            <div className="flex gap-3">
              <Button
                onClick={() => setError1(!error1)}
                variant="secondary"
                size="sm"
              >
                Toggle Component 1 Errors
              </Button>
              <Button
                onClick={() => setError2(!error2)}
                variant="secondary"
                size="sm"
              >
                Toggle Component 2 Errors
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <ErrorBoundary
            fallback={
              <Card className="border-red-200">
                <CardContent className="pt-6">
                  <Alert variant="destructive">
                    <AlertDescription>Component 1 failed</AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            }
          >
            <BuggyCounter throwError={error1} />
          </ErrorBoundary>

          <ErrorBoundary
            fallback={
              <Card className="border-red-200">
                <CardContent className="pt-6">
                  <Alert variant="destructive">
                    <AlertDescription>Component 2 failed</AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            }
          >
            <BuggyCounter throwError={error2} />
          </ErrorBoundary>
        </div>
      </div>
    );
  },
};

// Story: Custom Fallback UI
export const CustomFallbackUI: Story = {
  render: () => {
    const [shouldError, setShouldError] = useState(true);

    const customFallback = (
      <Card className="w-125 border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <div>
              <CardTitle className="text-red-700">
                Component Unavailable
              </CardTitle>
              <p className="text-sm text-red-600">
                This feature is temporarily unavailable
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTitle>Error Details</AlertTitle>
            <AlertDescription>
              An unexpected error occurred while rendering this component. Our
              team has been notified and is working on a fix.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              What you can do:
            </p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
              <li>Refresh the page to try again</li>
              <li>Check back later</li>
              <li>Contact support if the issue persists</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => window.location.reload()}
              variant="secondary"
              className="flex-1"
            >
              Refresh Page
            </Button>
            <Button variant="outline" className="flex-1">
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    );

    return (
      <div className="space-y-4 w-125">
        <Button
          onClick={() => setShouldError(!shouldError)}
          variant={shouldError ? "destructive" : "secondary"}
        >
          {shouldError ? "Disable Errors" : "Enable Errors"}
        </Button>

        <ErrorBoundary fallback={customFallback}>
          <BuggyCounter throwError={shouldError} />
        </ErrorBoundary>
      </div>
    );
  },
};

// Story: Error Logging
export const ErrorLogging: Story = {
  render: () => {
    const [shouldError, setShouldError] = useState(false);
    const [errorLog, setErrorLog] = useState<
      Array<{ timestamp: string; message: string }>
    >([]);

    const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
      const timestamp = new Date().toLocaleTimeString();
      setErrorLog((log) => [
        ...log,
        {
          timestamp,
          message: `${error.message} (Component: ${errorInfo.componentStack?.split("\n")[1]?.trim()})`,
        },
      ]);

      // In production, send to error tracking service
      // logErrorToService(error, errorInfo);
    };

    return (
      <div className="space-y-4 w-150">
        <Card>
          <CardHeader>
            <CardTitle>Error Logging Example</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Errors are logged and can be sent to monitoring services like
              Sentry, LogRocket, or Datadog.
            </p>

            <Button
              onClick={() => setShouldError(!shouldError)}
              variant={shouldError ? "destructive" : "secondary"}
            >
              {shouldError ? "Disable Errors" : "Enable Errors"}
            </Button>
          </CardContent>
        </Card>

        <ErrorBoundary onError={handleError}>
          <BuggyCounter throwError={shouldError} />
        </ErrorBoundary>

        {errorLog.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Error Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {errorLog.map((entry, index) => (
                  <div
                    key={index}
                    className="text-xs p-2 bg-red-50 border border-red-200 rounded"
                  >
                    <span className="font-mono text-red-600">
                      [{entry.timestamp}]
                    </span>{" "}
                    <span className="text-red-700">{entry.message}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  },
};

// Story: Granular Error Boundaries
export const GranularErrorBoundaries: Story = {
  render: () => {
    const [headerError, setHeaderError] = useState(false);
    const [contentError, setContentError] = useState(false);
    const [sidebarError, setSidebarError] = useState(false);

    return (
      <div className="space-y-4 w-200">
        <Card>
          <CardHeader>
            <CardTitle>Granular Error Boundaries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              Wrap individual sections with error boundaries to prevent one
              section's error from breaking the entire page.
            </p>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setHeaderError(!headerError)}
                variant="secondary"
                size="sm"
              >
                Toggle Header Error
              </Button>
              <Button
                onClick={() => setContentError(!contentError)}
                variant="secondary"
                size="sm"
              >
                Toggle Content Error
              </Button>
              <Button
                onClick={() => setSidebarError(!sidebarError)}
                variant="secondary"
                size="sm"
              >
                Toggle Sidebar Error
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="border rounded-lg overflow-hidden">
          {/* Header Section */}
          <ErrorBoundary
            fallback={
              <div className="p-4 bg-red-50 border-b border-red-200">
                <p className="text-sm text-red-600">Header failed to load</p>
              </div>
            }
          >
            <div className="p-4 bg-gray-100 border-b">
              <h2 className="font-semibold">Page Header</h2>
              {headerError && <BuggyCounter throwError />}
            </div>
          </ErrorBoundary>

          <div className="flex">
            {/* Sidebar Section */}
            <ErrorBoundary
              fallback={
                <div className="w-48 p-4 bg-red-50 border-r border-red-200">
                  <p className="text-xs text-red-600">Sidebar unavailable</p>
                </div>
              }
            >
              <div className="w-48 p-4 bg-gray-50 border-r">
                <p className="text-sm font-medium mb-2">Sidebar</p>
                <ul className="text-xs space-y-1">
                  <li>Menu Item 1</li>
                  <li>Menu Item 2</li>
                  <li>Menu Item 3</li>
                </ul>
                {sidebarError && <BuggyCounter throwError />}
              </div>
            </ErrorBoundary>

            {/* Main Content Section */}
            <ErrorBoundary
              fallback={
                <div className="flex-1 p-4 bg-red-50">
                  <Alert variant="destructive">
                    <AlertDescription>
                      Content failed to load. Please try refreshing the page.
                    </AlertDescription>
                  </Alert>
                </div>
              }
            >
              <div className="flex-1 p-4">
                <p className="text-sm mb-2">Main Content Area</p>
                <p className="text-xs text-gray-600">
                  This is where your main content would appear.
                </p>
                {contentError && <BuggyCounter throwError />}
              </div>
            </ErrorBoundary>
          </div>
        </div>
      </div>
    );
  },
};

// Story: Best Practices Guide
export const BestPractices: Story = {
  render: () => (
    <Card className="w-200">
      <CardHeader>
        <CardTitle>Error Boundary Best Practices</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">
            1. Place Boundaries Strategically
          </h3>
          <p className="text-sm text-gray-600">
            Wrap error boundaries around independent sections of your UI to
            prevent one section's error from affecting others.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">
            2. Provide Helpful Fallbacks
          </h3>
          <p className="text-sm text-gray-600">
            Show users what went wrong and give them options to recover (retry,
            refresh, contact support).
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">
            3. Log Errors for Monitoring
          </h3>
          <p className="text-sm text-gray-600">
            Send errors to a monitoring service to track issues in production
            (Sentry, LogRocket, Datadog).
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">
            4. Handle Async Errors Separately
          </h3>
          <p className="text-sm text-gray-600">
            Error boundaries only catch errors during rendering. Use try/catch
            for async operations.
          </p>
          <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
            {`try {
  await fetchData();
} catch (error) {
  setError(error);
}`}
          </pre>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">
            5. Don't Overuse Error Boundaries
          </h3>
          <p className="text-sm text-gray-600">
            Too many boundaries can make error handling complex. Find the right
            balance between granularity and simplicity.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">
            6. Test Error Scenarios
          </h3>
          <p className="text-sm text-gray-600">
            Regularly test your error boundaries to ensure they work as expected
            and provide a good user experience.
          </p>
        </div>

        <Alert>
          <AlertDescription>
            <strong>Note:</strong> Error boundaries are a last line of defense.
            Proper error handling with try/catch and input validation should be
            your first priority.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  ),
};
