import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Mail, Lock } from 'lucide-react';

import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { loginSchema, type LoginCredentials } from '../../../features/auth/types';
import { authService } from '../../../features/auth/api/auth.services';
import { useAuthStore } from '../../../features/auth/store';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      // 1. Pass the user and token to our Zustand store
      login(data.user, data.token);
      
      // 2. Redirect to the home page (or /app dashboard)
      // Let's redirect to '/' for now so you can see the Navbar change!
      navigate('/'); 
    },
    onError: (error: Error) => {
      setError('root', { message: error.message });
    },
  });

  const onSubmit = (data: LoginCredentials) => {
    mutation.mutate(data);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center lg:text-left">
        <h2 className="text-2xl font-bold text-navy">Welcome back</h2>
        <p className="text-sm text-content-secondary">
          Enter your credentials to access your account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <Input
          id="email"
          type="email"
          label="Email Address"
          placeholder="admin@vyn.com"
          icon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="flex flex-col gap-1.5">
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
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-orange hover:text-orange-dark transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {errors.root && (
          <div className="p-3 rounded-lg bg-danger-50 border border-danger-light text-sm text-danger">
            {errors.root.message}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          isLoading={mutation.isPending}
        >
          Log in
        </Button>
      </form>

      <p className="text-center text-sm text-content-secondary mt-4">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-navy hover:text-orange transition-colors">
          Sign up
        </Link>
      </p>
    </div>
  );
}