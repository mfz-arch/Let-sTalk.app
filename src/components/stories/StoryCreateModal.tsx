'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Image as ImageIcon, Sparkles, Upload } from 'lucide-react';
import { useStories } from '../../context/StoryContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

const MOCK_PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80',
];

export const StoryCreateModal: React.FC = () => {
  const { isCreateOpen, closeStoryCreator, addStory } = useStories();
  const [selectedImage, setSelectedImage] = useState(MOCK_PRESET_IMAGES[0]);
  const [caption, setCaption] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSelectedImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage || isPublishing) return;

    setIsPublishing(true);
    try {
      await addStory(selectedImage, caption.trim() || undefined);
      setCaption('');
      closeStoryCreator();
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Modal
      isOpen={isCreateOpen}
      onClose={closeStoryCreator}
      title="Create New Story"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Selected Image Preview */}
        <div className="relative w-full h-72 rounded-xl overflow-hidden bg-[#1A1D24] border border-white/[0.07] flex items-center justify-center group">
          <Image
            src={selectedImage}
            alt="Story Preview"
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <label className="cursor-pointer bg-[#12141A]/90 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center space-x-2 border border-white/10 hover:bg-[#1A1D24]">
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>Change Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Preset Image Options */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Select Sample Photo</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {MOCK_PRESET_IMAGES.map((imgUrl, i) => (
              <div
                key={i}
                onClick={() => setSelectedImage(imgUrl)}
                className={`relative h-16 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                  selectedImage === imgUrl ? 'border-indigo-500 scale-95' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <Image src={imgUrl} alt={`Preset ${i}`} fill className="object-cover" unoptimized />
              </div>
            ))}
          </div>
        </div>

        {/* Story Caption Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Caption (Optional)
          </label>
          <input
            type="text"
            placeholder="Add a catchy story caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full bg-[#1A1D24] px-4 py-2.5 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 outline-none border border-white/[0.07] focus:border-indigo-500/50 transition-colors"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <Button type="button" variant="ghost" onClick={closeStoryCreator}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isPublishing}
            leftIcon={<ImageIcon className="w-4 h-4" />}
          >
            Share to Story
          </Button>
        </div>
      </form>
    </Modal>
  );
};
