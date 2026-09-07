import { UserStoryGroup, StorySlide } from '../types/story';
import { User } from '../types/user';
import { INITIAL_STORIES } from '../data/mockData';

class StoryService {
  private stories: UserStoryGroup[] = [...INITIAL_STORIES];

  async getStories(): Promise<UserStoryGroup[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return this.stories;
  }

  async addStory(currentUser: User, mediaUrl: string, caption?: string): Promise<UserStoryGroup> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newSlide: StorySlide = {
      id: `st_${Date.now()}`,
      mediaUrl,
      caption,
      type: 'image',
      createdAt: new Date().toISOString(),
      viewsCount: 1,
    };

    const existingGroupIndex = this.stories.findIndex((s) => s.userId === currentUser.id);

    if (existingGroupIndex !== -1) {
      const updatedGroup = {
        ...this.stories[existingGroupIndex],
        slides: [newSlide, ...this.stories[existingGroupIndex].slides],
        updatedAt: newSlide.createdAt,
      };
      this.stories[existingGroupIndex] = updatedGroup;
      return updatedGroup;
    } else {
      const newGroup: UserStoryGroup = {
        userId: currentUser.id,
        user: currentUser,
        hasUnseen: false,
        updatedAt: newSlide.createdAt,
        slides: [newSlide],
      };
      this.stories.unshift(newGroup);
      return newGroup;
    }
  }

  async markStorySeen(userId: string): Promise<void> {
    const idx = this.stories.findIndex((s) => s.userId === userId);
    if (idx !== -1) {
      this.stories[idx].hasUnseen = false;
    }
  }
}

export const storyService = new StoryService();
