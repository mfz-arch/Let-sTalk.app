import { User } from './user';

export interface StorySlide {
  id: string;
  mediaUrl: string;
  caption?: string;
  type: 'image' | 'video';
  createdAt: string;
  viewsCount: number;
}

export interface UserStoryGroup {
  userId: string;
  user: User;
  hasUnseen: boolean;
  slides: StorySlide[];
  updatedAt: string;
}
