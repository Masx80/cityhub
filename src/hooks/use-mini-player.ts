import { create } from 'zustand';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channel: {
    name: string;
  };
}

interface MiniPlayerState {
  isOpen: boolean;
  currentVideo: Video | null;
  open: (video: Video) => void;
  close: () => void;
}

export const useMiniPlayer = create<MiniPlayerState>((set: any) => ({
  isOpen: false,
  currentVideo: null,
  open: (video: Video) => set({ isOpen: true, currentVideo: video }),
  close: () => set({ isOpen: false }),
})); 