import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { registerSchema, type RegisterCredentials } from '../../../features/auth/types';
import { authService } from '../../../features/auth/api/auth.service';
import { useAuthStore } from '../../../features/auth/store';

const perks = [
  'Free for up to 3 datasets / month',
  'AI bottleneck detection included',
  'No credit card required',
];

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterCredentials>({ resolver: zodResolver(registerSchema) });

  const mutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      login(data.user, data.token);
      navigate('/app');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      setError('root', { message });
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col gap-6"
    >
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-success-50 rounded-full text-success text-xs font-bold mb-4 border border-success/20">
          <div className="w-1.5 h-1.5 rounded-full bg-success" />
          No credit card required
        </div>
        <h1 className="text-3xl font-black text-navy leading-tight">Create your account</h1>
        <p className="text-content-secondary mt-2 text-sm">
          Start detecting supply chain bottlenecks in minutes.
        </p>
      </div>

      {/* Perks */}
      <div className="flex flex-col gap-2">
        {perks.map(p => (
          <div key={p} className="flex items-center gap-2.5 text-sm text-content-secondary">
            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
            {p}
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="flex flex-col gap-4">
        <Input
          id="name"
          label="Full Name"
          placeholder="Jane Doe"
          icon={<User className="w-4 h-4" />}
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          id="email"
          type="email"
          label="Work Email"
          placeholder="jane@company.com"
          icon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register('email')}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="Min. 8 chars"
            icon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            hint="Mix letters, numbers & symbols"
            {...register('password')}
          />
          <Input
            id="confirmPassword"
            type="password"
            label="Confirm"
            placeholder="Repeat"
            icon={<Lock className="w-4 h-4" />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
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

        <Button type="submit" size="lg" className="w-full mt-1" isLoading={mutation.isPending} glow icon>
          {mutation.isPending ? 'Creating account...' : 'Create Free Account'}
        </Button>
      </form>

      <p className="text-center text-xs text-content-muted">
        By signing up you agree to our{' '}
        <Link to="#" className="underline hover:text-navy">Terms</Link> &{' '}
        <Link to="#" className="underline hover:text-navy">Privacy Policy</Link>.
      </p>

      <p className="text-center text-sm text-content-secondary border-t border-border pt-4">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-navy hover:text-orange transition-colors">
          Sign in →
        </Link>
      </p>
    </motion.div>
  );
}