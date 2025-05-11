# Server Actions in SexCity Hub

This directory contains server actions for performing data mutations directly from client components. Server actions provide a more component-centric approach to handling mutations compared to traditional API routes.

## Server Actions vs API Routes

### When to Use Server Actions

- **Component-Centric Mutations**: For operations like liking a video, subscribing to a channel, or posting comments that are closely tied to specific components
- **Form Submissions**: For handling user inputs such as video comments or profile edits directly within the component's context
- **Progressive Enhancement**: When you want forms to work even without JavaScript enabled
- **Simplified State Management**: When you want to avoid complex state handling with loading/error states in the UI

### When to Use API Routes

- **External API Access**: When you need to expose functionality to external services or applications
- **Complex Authentication**: When you need more complex authentication than what server actions provide
- **Webhook Endpoints**: For receiving callbacks from external services
- **Complex Response Handling**: When you need more control over status codes, headers, and response formats

## Available Server Actions

### Likes and Dislikes
- `likeVideo(videoId)`: Add a like to a video
- `unlikeVideo(videoId)`: Remove a like from a video
- `getLikeStatus(videoId)`: Get like/dislike status and counts
- `dislikeVideo(videoId)`: Add a dislike to a video
- `undislikeVideo(videoId)`: Remove a dislike from a video

### Subscriptions
- `subscribe(creatorId)`: Subscribe to a channel
- `unsubscribe(creatorId)`: Unsubscribe from a channel
- `checkSubscriptionStatus(creatorId)`: Check if user is subscribed to a channel

### Comments
- `addComment({ content, videoId, parentId? })`: Add a comment to a video (accepts both FormData for progressive enhancement and direct object input)
- `updateComment(commentId, content)`: Update an existing comment
- `deleteComment(commentId)`: Delete a comment
- `getVideoComments(videoId)`: Fetch all comments for a video
- `getCommentWithReplies(commentId)`: Fetch a comment with all its replies

## Implementation Pattern

Each server action follows a consistent pattern:

1. Authentication check using Clerk's `auth()`
2. Input validation
3. Database operations
4. Cache revalidation with `revalidatePath()`
5. Return structured response with success/error info

## How to Use in Components

### Standard Component Usage

```tsx
"use client";

import { likeVideo, unlikeVideo } from "@/actions/likes";

export default function VideoActions({ videoId }: { videoId: string }) {
  const handleLike = async () => {
    const response = await likeVideo(videoId);
    
    if (response.success) {
      // Update UI
    } else {
      // Handle error
    }
  };
  
  return (
    <button onClick={handleLike}>Like</button>
  );
}
```

### Progressive Enhancement with Form

```tsx
"use client";

import { addComment } from "@/actions/comments";

export default function CommentForm({ videoId }: { videoId: string }) {
  return (
    <form action={addComment}>
      <input type="hidden" name="videoId" value={videoId} />
      <textarea name="content" placeholder="Add a comment..." />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Adding New Server Actions

When adding new server actions:

1. Create or update a file in this directory with a descriptive name
2. Add `"use server";` at the top of the file
3. Export functions that handle specific mutations
4. Use consistent error handling and response format
5. Add any necessary cache revalidation 