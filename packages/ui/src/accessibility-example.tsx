/**
 * Accessibility Example - Demonstrates all enhanced components
 * This file shows how the new accessibility features work together
 */

import React, { useState } from "react";
import { Form, FormField, FormLabel, FormDescription, FormMessage } from "./form";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Label } from "./label";
import { Button } from "./button";
import { Toast, ToastTitle, ToastDescription, ToastClose } from "./toast";
import { Skeleton } from "./skeleton";
import { Alert, AlertTitle, AlertDescription } from "./alert";
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";

// Example 1: Enhanced Form with Accessibility Context
export function AccessibleFormExample() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateEmail = (value: string) => {
    if (!value.includes("@")) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const validatePassword = (value: string) => {
    if (value.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
    } else {
      setPasswordError("");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h2 className="text-xl font-semibold">Enhanced Accessible Form</h2>
      
      <Form>
        {/* Email field with FormField context */}
        <FormField required error={!!emailError}>
          <FormLabel>Email Address</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              validateEmail(e.target.value);
            }}
            placeholder="Enter your email"
          />
          <FormDescription>
            We'll never share your email with anyone else.
          </FormDescription>
          {emailError && <FormMessage>{emailError}</FormMessage>}
        </FormField>

        {/* Password field with FormField context */}
        <FormField required error={!!passwordError}>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              validatePassword(e.target.value);
            }}
            placeholder="Enter password"
          />
          <FormDescription>
            Must be at least 8 characters long with a mix of letters and numbers.
          </FormDescription>
          {passwordError && <FormMessage>{passwordError}</FormMessage>}
        </FormField>

        {/* Message field with FormField context */}
        <FormField>
          <FormLabel>Message (Optional)</FormLabel>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message"
            resize="vertical"
          />
          <FormDescription>
            Tell us a bit about what you're looking for.
          </FormDescription>
        </FormField>

        <Button type="submit" className="w-full">
          Submit Form
        </Button>
      </Form>
    </div>
  );
}

// Example 2: Manual Form with Enhanced Individual Components
export function ManualAccessibleForm() {
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");

  const usernameId = "username-input";
  const usernameErrorId = "username-error";
  const usernameDescId = "username-description";

  const validateUsername = (value: string) => {
    if (value.length < 3) {
      setUsernameError("Username must be at least 3 characters");
    } else {
      setUsernameError("");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h2 className="text-xl font-semibold">Manual Accessible Form</h2>
      
      <div className="space-y-2">
        <Label 
          htmlFor={usernameId} 
          required 
          error={!!usernameError}
          size="md"
        >
          Username
        </Label>
        
        <Input
          id={usernameId}
          type="text"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            validateUsername(e.target.value);
          }}
          placeholder="Enter username"
          error={!!usernameError}
          required
          errorId={usernameError ? usernameErrorId : undefined}
          descriptionId={usernameDescId}
        />
        
        <p id={usernameDescId} className="text-sm text-[var(--color-text-secondary)]">
          Choose a unique username that others will see.
        </p>
        
        {usernameError && (
          <p 
            id={usernameErrorId} 
            role="alert" 
            aria-live="polite"
            className="text-sm font-medium text-[var(--color-text-danger)]"
          >
            {usernameError}
          </p>
        )}
      </div>
    </div>
  );
}

// Example 3: Enhanced Toast Components
export function AccessibleToastExample() {
  const [showToasts, setShowToasts] = useState(false);

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h2 className="text-xl font-semibold">Enhanced Toast Components</h2>
      
      <Button onClick={() => setShowToasts(!showToasts)}>
        {showToasts ? "Hide" : "Show"} Toast Examples
      </Button>

      {showToasts && (
        <div className="space-y-4">
          {/* Success toast with close button */}
          <Toast variant="success" role="alert" aria-live="assertive">
            <div>
              <ToastTitle>Success!</ToastTitle>
              <ToastDescription>Your changes have been saved successfully.</ToastDescription>
            </div>
            <ToastClose 
              srText="Close success notification"
              onClick={() => console.log('Success toast closed')} 
            />
          </Toast>

          {/* Warning toast with action */}
          <Toast variant="warning" role="alert" aria-live="assertive">
            <div>
              <ToastTitle>Session Warning</ToastTitle>
              <ToastDescription>Your session will expire in 5 minutes.</ToastDescription>
            </div>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => console.log('Session extended')}
            >
              Extend Session
            </Button>
          </Toast>

          {/* Error toast */}
          <Toast variant="destructive" role="alert" aria-live="assertive">
            <div>
              <ToastTitle>Error</ToastTitle>
              <ToastDescription>Failed to save changes. Please try again.</ToastDescription>
            </div>
            <ToastClose 
              srText="Dismiss error message"
              onClick={() => console.log('Error toast dismissed')} 
            />
          </Toast>
        </div>
      )}
    </div>
  );
}

// Combined example showing all improvements
export function ComprehensiveAccessibilityExample() {
  return (
    <div className="space-y-12 p-6">
      <AccessibleFormExample />
      <ManualAccessibleForm />
      <AccessibleToastExample />
      <EnhancedSkeletonExample />
      <EnhancedAlertExample />
      <EnhancedAvatarExample />
    </div>
  );
}

// Example 4: Enhanced Skeleton Loading States
export function EnhancedSkeletonExample() {
  const [loading, setLoading] = useState(false);

  const simulateLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h2 className="text-xl font-semibold">Enhanced Skeleton Loading States</h2>
      
      <Button onClick={simulateLoading} disabled={loading}>
        {loading ? "Loading..." : "Simulate Loading"}
      </Button>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">User Profile</h3>
        
        {loading ? (
          <div className="space-y-3">
            {/* Avatar skeleton with specific loading message */}
            <div className="flex items-center space-x-3">
              <Skeleton 
                variant="circular" 
                size="lg" 
                loadingText="Loading profile picture"
              />
              <div className="space-y-2">
                <Skeleton 
                  variant="text" 
                  className="h-4 w-32"
                  loadingText="Loading user name"
                />
                <Skeleton 
                  variant="text" 
                  className="h-3 w-48"
                  loadingText="Loading user title"
                />
              </div>
            </div>
            
            {/* Content skeleton */}
            <div className="space-y-2">
              <Skeleton variant="text" className="h-4 w-full" loadingText="Loading content" />
              <Skeleton variant="text" className="h-4 w-3/4" showLoadingText={false} />
              <Skeleton variant="text" className="h-4 w-1/2" showLoadingText={false} />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Avatar name="John Doe" semanticRole="profile">
                <AvatarImage src="/john.jpg" name="John Doe" />
                <AvatarFallback name="John Doe" />
              </Avatar>
              <div>
                <h4 className="font-medium">John Doe</h4>
                <p className="text-sm text-gray-600">Senior Developer</p>
              </div>
            </div>
            <p className="text-sm">
              Experienced full-stack developer with expertise in React, TypeScript, and Node.js.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Example 5: Enhanced Alert Urgency Levels
export function EnhancedAlertExample() {
  const [alerts, setAlerts] = useState({
    error: false,
    warning: false,
    success: false,
    info: false,
  });

  const showAlert = (type: keyof typeof alerts) => {
    setAlerts(prev => ({ ...prev, [type]: true }));
    setTimeout(() => {
      setAlerts(prev => ({ ...prev, [type]: false }));
    }, 5000);
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h2 className="text-xl font-semibold">Enhanced Alert Urgency Levels</h2>
      
      <div className="grid grid-cols-2 gap-2">
        <Button 
          variant="destructive" 
          size="sm"
          onClick={() => showAlert('error')}
        >
          Show Error
        </Button>
        <Button 
          variant="secondary" 
          size="sm"
          onClick={() => showAlert('warning')}
        >
          Show Warning
        </Button>
        <Button 
          variant="secondary" 
          size="sm"
          onClick={() => showAlert('success')}
        >
          Show Success
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => showAlert('info')}
        >
          Show Info
        </Button>
      </div>

      <div className="space-y-3">
        {alerts.error && (
          <Alert variant="destructive">
            <AlertTitle>Critical Error</AlertTitle>
            <AlertDescription>
              Failed to save changes. This interrupts screen readers immediately.
            </AlertDescription>
          </Alert>
        )}
        
        {alerts.warning && (
          <Alert variant="warning">
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Your session will expire soon. Announced with medium urgency.
            </AlertDescription>
          </Alert>
        )}
        
        {alerts.success && (
          <Alert variant="success">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Changes saved successfully. Announced politely to screen readers.
            </AlertDescription>
          </Alert>
        )}
        
        {alerts.info && (
          <Alert variant="default">
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              General information. Only announced when focused by screen readers.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="text-xs text-gray-600 space-y-1">
        <p><strong>Error:</strong> role="alert" + aria-live="assertive" (high urgency)</p>
        <p><strong>Warning:</strong> role="alert" + aria-live="polite" (medium urgency)</p>
        <p><strong>Success:</strong> role="status" + aria-live="polite" (medium urgency)</p>
        <p><strong>Info:</strong> role="region" + aria-live="off" (low urgency)</p>
      </div>
    </div>
  );
}

// Example 6: Enhanced Avatar Accessibility Context
export function EnhancedAvatarExample() {
  const users = [
    { name: "John Doe", title: "Senior Developer", image: "/john.jpg" },
    { name: "Jane Smith", title: "Product Manager", image: null },
    { name: "Mike Johnson", title: "UX Designer", image: "/mike.jpg" },
  ];

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h2 className="text-xl font-semibold">Enhanced Avatar Accessibility</h2>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Team Members (Profile Context)</h3>
        {users.map((user) => (
          <div key={user.name} className="flex items-center space-x-3">
            <Avatar name={user.name} semanticRole="profile">
              {user.image ? (
                <AvatarImage src={user.image} name={user.name} />
              ) : null}
              <AvatarFallback name={user.name} />
            </Avatar>
            <div>
              <h4 className="font-medium">{user.name}</h4>
              <p className="text-sm text-gray-600">{user.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">User Context Examples</h3>
        
        <div className="flex items-center space-x-3">
          <Avatar name="Active User" semanticRole="user">
            <AvatarFallback name="Active User" />
          </Avatar>
          <span className="text-sm">Online user indicator</span>
        </div>

        <div className="flex items-center space-x-3">
          <Avatar semanticRole="decorative">
            <AvatarFallback>?</AvatarFallback>
          </Avatar>
          <span className="text-sm">Anonymous user (decorative)</span>
        </div>
      </div>

      <div className="text-xs text-gray-600 space-y-1">
        <p><strong>Profile:</strong> "Name's profile picture" + role="img"</p>
        <p><strong>User:</strong> "Name's avatar" + role="img"</p>
        <p><strong>Decorative:</strong> No label + role="presentation"</p>
        <p><strong>Auto-initials:</strong> Generated from name (max 2 chars)</p>
        <p><strong>Performance:</strong> Images use loading="lazy"</p>
      </div>
    </div>
  );
}

export default ComprehensiveAccessibilityExample;
