import { UserStoryGroup, StorySlide } from '../types/story';
import { User } from '../types/user';

class StoryService {
  private getStoredStories(): UserStoryGroup[] {
    if (typeof window === 'undefined') return [];
    const str = localStorage.getItem('letstalk_stories');
    if (!str) return [];
    try {
      return JSON.parse(str);
    } catch {
      return [];
    }
  }

  private saveStories(stories: UserStoryGroup[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('letstalk_stories', JSON.stringify(stories));
  }

  async getStories(): Promise<UserStoryGroup[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return this.getStoredStories();
  }

  async addStory(currentUser: User, mediaUrl: string, caption?: string): Promise<UserStoryGroup> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const newSlide: StorySlide = {
      id: `st_${Date.now()}`,
      mediaUrl,
      caption,
      type: 'image',
      createdAt: new Date().toISOString(),
      viewsCount: 1,
    };

    const stories = this.getStoredStories();
    const existingGroupIndex = stories.findIndex((s) => s.userId === currentUser.id);

    if (existingGroupIndex !== -1) {
      const updatedGroup = {
        ...stories[existingGroupIndex],
        user: currentUser,
        slides: [newSlide, ...stories[existingGroupIndex].slides],
        updatedAt: newSlide.createdAt,
      };
      stories[existingGroupIndex] = updatedGroup;
      this.saveStories(stories);
      return updatedGroup;
    } else {
      const newGroup: UserStoryGroup = {
        userId: currentUser.id,
        user: currentUser,
        hasUnseen: false,
        updatedAt: newSlide.createdAt,
        slides: [newSlide],
      };
      stories.unshift(newGroup);
      this.saveStories(stories);
      return newGroup;
    }
  }

  async markStorySeen(userId: string): Promise<void> {
    const stories = this.getStoredStories();
    const idx = stories.findIndex((s) => s.userId === userId);
    if (idx !== -1) {
      stories[idx].hasUnseen = false;
      this.saveStories(stories);
    }
  }
}

export const storyService = new StoryService();
