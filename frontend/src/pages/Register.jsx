import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../hooks/useAuth';
import { Button, Input } from '../components/ui';

const schema = z.object({
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters' })
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message: 'Only letters, numbers, underscores and hyphens allowed',
    }),
  email: z.string().email({ message: 'Invalid email' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .regex(/[a-z]/, { message: 'Include a lowercase letter' })
    .regex(/[A-Z]/, { message: 'Include an uppercase letter' })
    .regex(/[0-9]/, { message: 'Include a number' }),
});

export default function Register() {
  const { register: registerUser, registerState } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    setErrorMessage('');
    try {
      await registerUser(values);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrorMessage(err?.normalizedMessage || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 hero-bg">
      <div className="w-full max-w-md glass card-base animate-fade-up">
        <h2 className="text-2xl font-bold mb-1">Create your account</h2>
        <p className="text-slate-600 mb-6">Start planning your next adventure.</p>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <Input
            id="username"
            label="Username"
            error={errors.username?.message}
            {...register('username')}
          />
          <Input
            id="email"
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            error={errors.password?.message}
            {...register('password')}
          />

          <Button type="submit" isLoading={registerState.isPending} size="lg">
            {registerState.isPending ? 'Creating...' : 'Register'}
          </Button>

          {errorMessage && (
            <div className="text-sm text-[var(--color-danger)]">{errorMessage}</div>
          )}
        </form>

        <p className="text-sm text-slate-600 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-[var(--color-primary)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
