import { UserStoryGroup } from '../types/story';
import { User } from '../types/user';

class StoryService {
  private getSeenStoryUserIds(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('seenStoryUserIds');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  async getStories(): Promise<UserStoryGroup[]> {
    try {
      const res = await fetch('/api/stories', { cache: 'no-store' });
      if (!res.ok) return [];
      const data = await res.json();
      const rawStories: UserStoryGroup[] = data.stories || [];

      const seenIds = this.getSeenStoryUserIds();
      return rawStories.map((group) => ({
        ...group,
        hasUnseen: !seenIds.includes(group.userId),
      }));
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

  markStorySeen(userId: string): void {
    if (typeof window === 'undefined' || !userId) return;
    try {
      const seenIds = this.getSeenStoryUserIds();
      if (!seenIds.includes(userId)) {
        seenIds.push(userId);
        localStorage.setItem('seenStoryUserIds', JSON.stringify(seenIds));
      }
    } catch (err) {
      console.error('markStorySeen error:', err);
    }
  }
}

export const storyService = new StoryService();
