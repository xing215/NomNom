'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    deviceId: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          deviceId: formData.deviceId,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Signup failed');
        return;
      }

      // Signup successful - redirect to main
      router.push('/main');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full md:h-screen h-[90vh] bg-[#f4dfdf] flex items-center justify-center overflow-hidden p-[10px]">
      {/* Background decorations */}
      <div className="absolute left-0 bottom-0 flex items-center justify-center w-[30px] md:w-[3000px] h-[10px] md:h-[70px]">
        <div className="rotate-90">
          <div className="w-[70px] md:w-[70px] h-[1462px] md:h-[5000px] bg-[#f7cbcb]" />
        </div>
      </div>

      {/* Image 9 - Left side cat */}
      <div className="absolute left-0 md:left-[40px] bottom-10 md:top-[301px] w-[177px] md:w-[299px] h-[340px] md:h-[574px]">
        <Image
          src="https://www.figma.com/api/mcp/asset/08f52c05-a995-445c-b991-cb99f13f07e2"
          alt="Cat decoration"
          fill
          className="object-cover md:hidden"
        />
        <Image
          src="https://www.figma.com/api/mcp/asset/825c475f-9307-4c0a-bbd2-04964809aa41"
          alt="Cat decoration"
          fill
          className="hidden md:block object-cover"
        />
      </div>

      {/* Image 10 - Bottom right */}
      <div className="absolute right-4 md:right-10 bottom-10 md:bottom-15 w-[109px] md:w-[280px] h-[71px] md:h-[200px]">
        <Image
          src="https://www.figma.com/api/mcp/asset/de228b6e-a01e-458b-9837-73bf805478cb"
          alt="Cat decoration"
          fill
          className="object-cover md:hidden"
        />
        <Image
          src="https://www.figma.com/api/mcp/asset/92d355cb-7ec5-439c-82b2-05cac69cebff"
          alt="Cat decoration"
          fill
          className="hidden md:block object-cover"
        />
      </div>

      {/* Image 11 - Bottom */}
      <div className="absolute right-20 md:right-100 bottom-160 md:bottom-15 w-[56px] md:w-[120px] h-[40px] md:h-[80px]">
        <Image
          src="https://www.figma.com/api/mcp/asset/27fcf04e-342f-4da2-b240-40b240c1ec71"
          alt="Cat decoration"
          fill
          className="object-cover md:hidden"
        />
        <Image
          src="https://www.figma.com/api/mcp/asset/13f79933-56a7-4fcb-ad4d-bc35d51a0b0f"
          alt="Cat decoration"
          fill
          className="hidden md:block object-cover"
        />
      </div>

      {/* Main form content */}
      <form onSubmit={handleSubmit} className="relative z-10 flex flex-col items-center gap-[50px] md:gap-[24px] p-[10px] w-full max-w-md md:max-w-none">
        <div className="flex flex-col items-center text-center gap-2">
          <Link href="/">
            <h1 className="font-bold text-[38px] md:text-[48px] text-[#390202] md:leading-tight md:mb-[12px] cursor-pointer hover:opacity-80 transition-opacity">
              Sign Up
            </h1>
          </Link>
          <p className="font-bold text-[16px] md:text-[18px] text-[#390202]">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Login
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg text-center max-w-[332px] md:max-w-[480px]">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-[24px] md:gap-[22px] items-center px-[20px] md:px-0 w-full">
          <div className="flex flex-col items-center gap-[12px] w-full">
            <label htmlFor="name" className="font-semibold text-[20px] text-[#390202] text-center">
              Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full max-w-[332px] md:max-w-[480px] h-[50px] md:h-[60px] bg-[#f7cbcb] border-[3px] border-[#4c5fe3] rounded-[18px] md:rounded-[16px] px-[15px] md:px-[18px] text-[16px] md:text-[18px] focus:outline-none focus:border-[#3d4ec4]"
            />
          </div>

          <div className="flex flex-col items-center gap-[12px] w-full">
            <label htmlFor="email" className="font-semibold text-[20px] text-[#390202] text-center">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full max-w-[332px] md:max-w-[480px] h-[50px] md:h-[60px] bg-[#f7cbcb] border-[3px] border-[#4c5fe3] rounded-[18px] md:rounded-[16px] px-[15px] md:px-[18px] text-[16px] md:text-[18px] focus:outline-none focus:border-[#3d4ec4]"
            />
          </div>

          <div className="flex flex-col items-center gap-[12px] w-full">
            <label htmlFor="deviceId" className="font-semibold text-[20px] text-[#390202] text-center">
              Device ID
            </label>
            <input
              id="deviceId"
              type="text"
              placeholder="Enter your device ID"
              value={formData.deviceId}
              onChange={handleChange}
              required
              className="w-full max-w-[332px] md:max-w-[480px] h-[50px] md:h-[60px] bg-[#f7cbcb] border-[3px] border-[#4c5fe3] rounded-[18px] md:rounded-[16px] px-[15px] md:px-[18px] text-[16px] md:text-[18px] focus:outline-none focus:border-[#3d4ec4]"
            />
          </div>

          <div className="flex flex-col items-center gap-[12px] w-full">
            <label htmlFor="password" className="font-semibold text-[20px] text-[#390202] text-center">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full max-w-[332px] md:max-w-[480px] h-[50px] md:h-[60px] bg-[#f7cbcb] border-[3px] border-[#4c5fe3] rounded-[18px] md:rounded-[16px] px-[15px] md:px-[18px] text-[16px] md:text-[18px] focus:outline-none focus:border-[#3d4ec4]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-[#ff9797] rounded-[14.612px] md:rounded-[12px] px-[60px] md:px-[48px] py-[15px] md:py-[12px] flex items-center justify-center cursor-pointer hover:bg-[#ff8585] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <p className="font-semibold text-[24px] md:text-[20px] text-black text-center">
              {loading ? 'SIGNING UP...' : 'SIGN UP'}
            </p>
          </button>
        </div>
      </form>
    </div>
  );
}
