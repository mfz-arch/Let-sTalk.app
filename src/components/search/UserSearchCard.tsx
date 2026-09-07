'use client';

import React from 'react';
import { MessageSquare, UserCheck } from 'lucide-react';
import { User } from '../../types/user';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';

interface UserSearchCardProps {
  user: User;
  onMessageClick: (user: User) => void;
}

export const UserSearchCard: React.FC<UserSearchCardProps> = ({ user, onMessageClick }) => {
  return (
    <div className="glass-card rounded-2xl p-4 flex items-center justify-between transition-all hover:border-zinc-700/80 hover:shadow-lg">
      <div className="flex items-center space-x-3.5 min-w-0">
        <Avatar
          src={user.avatar}
          alt={user.name}
          size="lg"
          showStatus
          onlineStatus={user.onlineStatus}
        />
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-zinc-100 truncate">{user.name}</h4>
          <p className="text-xs text-indigo-400 font-medium">@{user.username}</p>
          {user.bio && (
            <p className="text-xs text-zinc-400 truncate mt-1 max-w-[240px]">
              {user.bio}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
        <Button
          size="sm"
          variant="primary"
          onClick={() => onMessageClick(user)}
          leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
        >
          Message
        </Button>
      </div>
    </div>
  );
};
