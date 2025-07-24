// accessibility-validation.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Skeleton } from './skeleton';
import { Alert, AlertTitle, AlertDescription } from './alert';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';

describe('Accessibility Improvements Validation', () => {
  describe('Skeleton Component', () => {
    it('should announce loading state to screen readers', () => {
      render(<Skeleton />);
      
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveAttribute('aria-live', 'polite');
      expect(skeleton).toHaveAttribute('aria-label', 'Loading content');
      
      const srText = screen.getByText('Loading content');
      expect(srText).toHaveClass('sr-only');
    });

    it('should support custom loading text', () => {
      render(<Skeleton loadingText="Loading user profile" />);
      
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveAttribute('aria-label', 'Loading user profile');
      expect(screen.getByText('Loading user profile')).toBeInTheDocument();
    });

    it('should optionally hide loading announcements', () => {
      render(<Skeleton showLoadingText={false} />);
      
      const skeleton = screen.getByRole('status');
      expect(skeleton).not.toHaveAttribute('aria-label');
      expect(screen.queryByText('Loading content')).not.toBeInTheDocument();
    });
  });

  describe('Alert Component', () => {
    it('should use high urgency for destructive alerts', () => {
      render(
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Something went wrong</AlertDescription>
        </Alert>
      );
      
      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'assertive');
    });

    it('should use medium urgency for success alerts', () => {
      render(
        <Alert variant="success">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Operation completed</AlertDescription>
        </Alert>
      );
      
      const alert = screen.getByRole('status');
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });

    it('should use low urgency for default alerts', () => {
      render(
        <Alert variant="default">
          <AlertTitle>Info</AlertTitle>
          <AlertDescription>General information</AlertDescription>
        </Alert>
      );
      
      const alert = screen.getByRole('region');
      expect(alert).toHaveAttribute('aria-live', 'off');
    });

    it('should allow role override', () => {
      render(
        <Alert variant="default" role="alert">
          <AlertTitle>Custom</AlertTitle>
          <AlertDescription>Custom urgency level</AlertDescription>
        </Alert>
      );
      
      const alert = screen.getByRole('alert');
      expect(alert).not.toHaveAttribute('aria-live');
    });
  });

  describe('Avatar Component', () => {
    it('should provide semantic context for profile avatars', () => {
      render(
        <Avatar name="John Doe" semanticRole="profile">
          <AvatarFallback name="John Doe" />
        </Avatar>
      );
      
      const avatar = screen.getByRole('img');
      expect(avatar).toHaveAttribute('aria-label', "John Doe's profile picture");
    });

    it('should generate initials from name', () => {
      render(
        <Avatar name="John Doe">
          <AvatarFallback name="John Doe" />
        </Avatar>
      );
      
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should support decorative avatars', () => {
      render(
        <Avatar semanticRole="decorative">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      
      const avatar = screen.getByRole('presentation');
      expect(avatar).not.toHaveAttribute('aria-label');
    });

    it('should generate accessible alt text for images', () => {
      render(
        <Avatar name="Jane Smith">
          <AvatarImage src="/jane.jpg" name="Jane Smith" />
        </Avatar>
      );
      
      // Query the image by its alt text
      const image = screen.getByAltText('Profile picture of Jane Smith');
      expect(image).toHaveAttribute('alt', 'Profile picture of Jane Smith');
      expect(image).toHaveAttribute('loading', 'lazy');
    });
  });
});

// Usage Examples for Manual Testing
export const AccessibilityExamples = {
  SkeletonExamples: () => (
    <div className="space-y-4">
      <h3>Skeleton Loading States</h3>
      <Skeleton /> {/* Default: "Loading content" */}
      <Skeleton loadingText="Loading user profile" />
      <Skeleton showLoadingText={false} /> {/* Decorative */}
    </div>
  ),

  AlertExamples: () => (
    <div className="space-y-4">
      <h3>Alert Urgency Levels</h3>
      
      <Alert variant="destructive">
        <AlertTitle>Critical Error</AlertTitle>
        <AlertDescription>This will interrupt screen readers immediately</AlertDescription>
      </Alert>
      
      <Alert variant="warning">
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>This will be announced politely</AlertDescription>
      </Alert>
      
      <Alert variant="success">
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>This will be announced when convenient</AlertDescription>
      </Alert>
      
      <Alert variant="default">
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>This will only be announced when focused</AlertDescription>
      </Alert>
    </div>
  ),

  AvatarExamples: () => (
    <div className="space-y-4">
      <h3>Avatar Accessibility Context</h3>
      
      {/* Profile context with automatic labeling */}
      <Avatar name="John Doe" semanticRole="profile">
        <AvatarImage src="/john.jpg" name="John Doe" />
        <AvatarFallback name="John Doe" />
      </Avatar>
      
      {/* User context */}
      <Avatar name="Jane Smith" semanticRole="user">
        <AvatarFallback name="Jane Smith" />
      </Avatar>
      
      {/* Decorative avatar */}
      <Avatar semanticRole="decorative">
        <AvatarFallback>?</AvatarFallback>
      </Avatar>
    </div>
  ),
};
