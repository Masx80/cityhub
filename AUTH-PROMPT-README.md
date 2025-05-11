# Auth Prompt Feature

This feature improves the user experience for unauthenticated users by displaying a modal dialog when they attempt to perform actions that require authentication, such as liking, commenting, subscribing, or saving videos.

## Components

### AuthPromptModal

Located at `src/components/auth-prompt-modal.tsx`, this is a reusable modal component that displays an attractive and informative dialog prompting users to sign in. Features include:

- Customizable title and description
- Action-specific default messaging
- Visual indicators of the benefits of signing in
- Sign In and Cancel buttons

Usage:
```tsx
<AuthPromptModal
  isOpen={isOpen}
  onClose={handleClose}
  actionType="like" // "like", "subscribe", "comment", "save", or "interaction"
  title="Custom title" // optional
  description="Custom description" // optional
/>
```

### useAuthPrompt Hook

Located at `src/lib/hooks/use-auth-prompt.ts`, this custom hook manages the state and logic for showing auth prompts throughout the application.

Features:
- Controls modal visibility
- Manages action-specific messaging
- Provides a convenient `handleAuthAction` method to conditionally run code based on auth state

Usage:
```tsx
const { 
  isAuthPromptOpen, 
  promptType, 
  customTitle, 
  customDescription, 
  openAuthPrompt, 
  closeAuthPrompt, 
  handleAuthAction 
} = useAuthPrompt();

// Simple usage - just open the modal
const handleClick = () => {
  if (!isSignedIn) {
    openAuthPrompt("like");
    return;
  }
  // Handle the action for signed-in users
};

// Advanced usage - handle the action conditionally
const handleAction = () => {
  handleAuthAction(
    isSignedIn, 
    "subscribe", 
    () => {
      // This code only runs if user is authenticated
      console.log("User is authenticated, performing action");
    }
  );
};
```

## Implementation

The auth prompt has been implemented in the following key locations:

1. **Video Actions** (`src/app/watch/[videoId]/components/client-video-actions.tsx`)
   - Like/dislike buttons
   - Subscribe button
   - Save button

2. **Comments** (`src/components/comments/comment-form.tsx`)
   - Comment form

## Benefits

- Improved user experience by providing clear feedback when authentication is required
- Increased conversion to sign-ups by showing the benefits of being logged in
- Consistent UI for auth prompts across the application
- Reduced code duplication through the shared hook and component

## Future Enhancements

- Add analytics to track conversion rates from auth prompts
- A/B test different messaging and visual styles
- Add direct registration form within the modal
- Add social proof elements (e.g., "Join 10,000+ users")
 