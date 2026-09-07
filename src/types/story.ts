import { User } from './user';

export interface StorySlide {
  id: string;
  mediaUrl: string;
  caption?: string;
  type: 'image' | 'video';
  createdAt: string;
  viewsCount: number;
  likesCount?: number;
  likes?: string[];
  viewers?: { userId: string; name: string; avatar?: string }[];
}

export interface UserStoryGroup {
  userId: string;
  user: User;
  hasUnseen: boolean;
  slides: StorySlide[];
  updatedAt: string;
}
