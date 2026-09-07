'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MessageCircle, User, Phone, Lock } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { COUNTRY_CODES } from '../../../data/countryCodes';
import { CountryCodeSelect } from '../../../components/auth/CountryCodeSelect';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Full name is required';
    if (!phoneNumber.trim()) errs.phoneNumber = 'Phone number is required';
    else if (phoneNumber.trim().length < 6) errs.phoneNumber = 'Enter a valid phone number';

    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';

    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await register({
        name: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        countryCode: selectedCountry.dialCode,
        password,
      });
      router.push('/');
    } catch (err: any) {
      setErrors({ form: err?.message || 'Registration failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10 my-8">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-xl shadow-indigo-600/30 mb-2">
            <MessageCircle className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Join Let'sTalk
          </h1>
          <p className="text-sm text-zinc-400">
            Create your account to start private chatting & story sharing.
          </p>
        </div>

        {/* Register Card */}
        <div className="glass-panel p-8 rounded-3xl border border-zinc-800 shadow-2xl space-y-6">
          {errors.form && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="e.g. Zalifa Ahmed"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={<User className="w-4 h-4 text-zinc-500" />}
              error={errors.fullName}
              required
            />

            {/* Country Code + Phone Input */}
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
                    error={errors.phoneNumber}
                    required
                  />
                </div>
              </div>
            </div>

            <Input
              label="Password"
              isPassword
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4 text-zinc-500" />}
              error={errors.password}
              required
            />

            <Input
              label="Confirm Password"
              isPassword
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4 text-zinc-500" />}
              error={errors.confirmPassword}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </form>

          {/* Switch to Login */}
          <div className="text-center pt-2 border-t border-zinc-800/80">
            <p className="text-xs text-zinc-400">
              Already registered?{' '}
              <Link href="/login" className="font-semibold text-indigo-400 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
