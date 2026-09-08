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
    <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center justify-between transition-all hover:border-slate-300 shadow-xs">
      <div className="flex items-center space-x-3.5 min-w-0">
        <Avatar
          src={user.avatar}
          alt={user.name}
          size="lg"
          showStatus
          onlineStatus={user.onlineStatus}
        />
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-slate-900 truncate">{user.name}</h4>
          <p className="text-xs text-emerald-700 font-medium">@{user.username}</p>
          {user.bio && (
            <p className="text-xs text-slate-500 truncate mt-1 max-w-[240px]">
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
