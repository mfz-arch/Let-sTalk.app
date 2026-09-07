'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MessageCircle, Lock, Phone } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { COUNTRY_CODES } from '../../../data/countryCodes';
import { CountryCodeSelect } from '../../../components/auth/CountryCodeSelect';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      await login({
        phoneNumber: phoneNumber.trim(),
        countryCode: selectedCountry.dialCode,
        password,
      });
      router.push('/');
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-xl shadow-indigo-600/30 mb-2">
            <MessageCircle className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Welcome to Let'sTalk
          </h1>
          <p className="text-sm text-zinc-400">
            Sign in to start private messaging & story sharing with friends.
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel p-8 rounded-3xl border border-zinc-800 shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Country Selector + Phone Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Phone Number
              </label>
              <div className="flex items-center space-x-2">
                <CountryCodeSelect
                  selected={selectedCountry}
                  onSelect={setSelectedCountry}
                />
                <div className="flex-1">
                  <Input
                    type="tel"
                    placeholder="e.g. 712509403"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    leftIcon={<Phone className="w-4 h-4 text-zinc-500" />}
                    required
                  />
                </div>
              </div>
            </div>

            <Input
              label="Password"
              isPassword
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4 text-zinc-500" />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Sign In to Let'sTalk
            </Button>
          </form>

          {/* Switch to Register */}
          <div className="text-center pt-2 border-t border-zinc-800/80">
            <p className="text-xs text-zinc-400">
              Don't have an account yet?{' '}
              <Link href="/register" className="font-semibold text-indigo-400 hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
