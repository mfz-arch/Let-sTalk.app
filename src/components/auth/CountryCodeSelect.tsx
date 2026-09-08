'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { COUNTRY_CODES } from '../../data/countryCodes';
import { CountryCode } from '../../types/user';

interface CountryCodeSelectProps {
  selected: CountryCode;
  onSelect: (country: CountryCode) => void;
}

export const CountryCodeSelect: React.FC<CountryCodeSelectProps> = ({ selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = COUNTRY_CODES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dialCode.includes(search) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 px-3 py-2.5 rounded-xl bg-[#1A1D24] border border-white/[0.07] text-sm text-zinc-200 hover:border-white/20 transition-all cursor-pointer"
      >
        <span className="text-lg leading-none">{selected.flag}</span>
        <span className="font-semibold text-zinc-100">{selected.dialCode}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 z-50 w-64 bg-[#12141A] rounded-xl p-2 border border-white/[0.07] shadow-2xl space-y-2 max-h-60 overflow-y-auto">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1A1D24] border border-white/[0.07] rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-indigo-500/50"
            />
          </div>

          <div className="space-y-0.5">
            {filteredCountries.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => {
                  onSelect(country);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  selected.code === country.code
                    ? 'bg-indigo-600/20 text-indigo-400 font-semibold'
                    : 'hover:bg-zinc-800/60 text-zinc-300'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <span>{country.flag}</span>
                  <span className="truncate">{country.name}</span>
                </div>
                <span className="font-mono text-zinc-400 font-medium ml-2">{country.dialCode}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
