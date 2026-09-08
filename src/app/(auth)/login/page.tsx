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
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200/80 shadow-xs mb-1">
            <MessageCircle className="w-7 h-7 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Welcome to Let'sTalk
          </h1>
          <p className="text-xs text-slate-500">
            Sign in to start private messaging & story sharing with friends.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Country Selector + Phone Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
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
                    leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
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
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
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
          <div className="text-center pt-2 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              Don't have an account yet?{' '}
              <Link href="/register" className="font-semibold text-emerald-600 hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
