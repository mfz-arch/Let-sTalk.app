import { User } from '../types/user';
import { Conversation, Message } from '../types/chat';
import { UserStoryGroup } from '../types/story';

// Purged all fake static mock users. Only real registered users in local directory / API database will appear.
export const MOCK_USERS: User[] = [];
export const INITIAL_CONVERSATIONS: Conversation[] = [];
export const INITIAL_MESSAGES: Record<string, Message[]> = {};
export const INITIAL_STORIES: UserStoryGroup[] = [];
