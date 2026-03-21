import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { registerSchema, type RegisterCredentials } from '../../../features/auth/types';
import { authService } from '../../../features/auth/api/auth.services';
import { useAuthStore } from '../../../features/auth/store';

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterCredentials>({
    resolver: zodResolver(registerSchema),
  });

  const mutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      login(data.user, data.token);
      navigate('/');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      setError('root', { message });
    },
  });

  const onSubmit = (data: RegisterCredentials) => {
    mutation.mutate(data);
  };
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center lg:text-left">
        <h2 className="text-2xl font-bold text-navy">Create your account</h2>
        <p className="text-sm text-content-secondary">Join the Vyn logistics network.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          id="name"
          label="Full Name"
          placeholder="John Doe"
          icon={<User className="w-4 h-4" />}
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          id="email"
          type="email"
          label="Email Address"
          placeholder="john@vyn.com"
          icon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="Min. 8 chars"
            icon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            id="confirmPassword"
            type="password"
            label="Confirm"
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4" />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
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
          icon={<ArrowRight className="w-4 h-4" />}
        >
          Create Account
        </Button>
      </form>

      <p className="text-center text-sm text-content-secondary">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-navy hover:text-orange transition-colors">
          Log in
        </Link>
      </p>
    </div>
  );
}