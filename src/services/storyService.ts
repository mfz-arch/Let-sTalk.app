import { UserStoryGroup } from '../types/story';
import { User } from '../types/user';

class StoryService {
  async getStories(): Promise<UserStoryGroup[]> {
    try {
      const res = await fetch('/api/stories', { cache: 'no-store' });
      if (!res.ok) return [];
      const data = await res.json();
      return data.stories || [];
    } catch (err) {
      console.error('getStories error:', err);
      return [];
    }
  }

  async addStory(currentUser: User, mediaUrl: string, caption?: string): Promise<void> {
    try {
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          userId: currentUser.id,
          mediaUrl,
          caption,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Add story failed');
      }
    } catch (err) {
      console.error('addStory error:', err);
    }
  }

  async toggleLikeStory(storyId: string, userId: string): Promise<void> {
    try {
      await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'like',
          storyId,
          userId,
        }),
      });
    } catch (err) {
      console.error('toggleLikeStory error:', err);
    }
  }

  async markStorySeen(userId: string): Promise<void> {
    // No-op for now
  }
}

export const storyService = new StoryService();
