-- Create video_history table
CREATE TABLE IF NOT EXISTS public.video_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  video_id UUID NOT NULL,
  watched_at TIMESTAMP NOT NULL DEFAULT now(),
  progress TEXT NOT NULL DEFAULT '0',
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  
  CONSTRAINT video_history_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(clerk_id)
    ON DELETE CASCADE,
  
  CONSTRAINT video_history_video_id_fkey
    FOREIGN KEY (video_id) REFERENCES public.videos(id)
    ON DELETE CASCADE
);

-- Create indexes for optimization
CREATE INDEX IF NOT EXISTS video_history_user_idx ON public.video_history(user_id, watched_at);
CREATE INDEX IF NOT EXISTS video_history_video_idx ON public.video_history(video_id);
CREATE INDEX IF NOT EXISTS video_history_time_idx ON public.video_history(watched_at);
CREATE INDEX IF NOT EXISTS user_video_history_idx ON public.video_history(user_id, video_id);

-- Table for tracking user watch settings (like pausing history)
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id TEXT PRIMARY KEY,
  history_paused BOOLEAN DEFAULT false,
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  
  CONSTRAINT user_settings_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(clerk_id)
    ON DELETE CASCADE
); 