import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { loginSchema, type LoginCredentials } from '../../../features/auth/types';
import { authService } from '../../../features/auth/api/auth.service';
import { useAuthStore } from '../../../features/auth/store';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginCredentials>({ resolver: zodResolver(loginSchema) });

  const mutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      login(data.user, data.token);
      navigate('/app');
    },
    onError: (error: Error) => {
      setError('root', { message: error.message });
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col gap-7"
    >
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-full text-orange text-xs font-bold mb-4 border border-orange/20">
          <div className="w-1.5 h-1.5 rounded-full bg-orange animate-pulse" />
          Welcome back
        </div>
        <h1 className="text-3xl font-black text-navy leading-tight">Sign in to Vyn</h1>
        <p className="text-content-secondary mt-2 text-sm">
          Your supply chain intelligence is waiting.
        </p>
    </div>

      {/* Form */}
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="flex flex-col gap-4">
        <Input
          id="email"
          type="email"
          label="Email Address"
          placeholder="you@company.com"
          icon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="space-y-1">
          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs font-semibold text-orange hover:text-orange-dark transition-colors">
              Forgot password?
            </Link>
          </div>
        </div>

        {errors.root && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center gap-2.5 p-3.5 rounded-xl bg-danger-50 border border-danger/20 text-danger text-sm"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errors.root.message}
          </motion.div>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full mt-1"
          isLoading={mutation.isPending}
          glow
        >
          {mutation.isPending ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <div className="flex items-center gap-3 text-xs text-content-muted">
        <div className="h-px flex-1 bg-border" />
        <span>OR</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <p className="text-center text-sm text-content-secondary">
        Don't have an account?{' '}
        <Link to="/register" className="font-bold text-navy hover:text-orange transition-colors">
          Create one free →
        </Link>
      </p>
    </motion.div>
  );
}