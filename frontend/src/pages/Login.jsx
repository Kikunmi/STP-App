import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../hooks/useAuth';
import { Button, Input } from '../components/ui';

const schema = z.object({
  email: z.string().email({ message: 'Invalid email' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export default function Login() {
  const { login, loginState } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const from = location.state?.from?.pathname || '/dashboard';

  const onSubmit = async (values) => {
    setErrorMessage('');
    try {
      await login(values);
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err?.normalizedMessage || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 hero-bg">
      <div className="w-full max-w-md glass card-base animate-fade-up">
        <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
        <p className="text-slate-600 mb-6">Sign in to continue planning.</p>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
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

          <Button type="submit" isLoading={loginState.isPending} size="lg">
            {loginState.isPending ? 'Signing in...' : 'Login'}
          </Button>

          {errorMessage && (
            <div className="text-sm text-[var(--color-danger)]">{errorMessage}</div>
          )}
        </form>

        <p className="text-sm text-slate-600 mt-4">
          No account?{' '}
          <Link to="/register" className="text-[var(--color-primary)] hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
