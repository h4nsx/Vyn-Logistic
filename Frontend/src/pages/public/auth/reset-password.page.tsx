import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Lock, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { resetPasswordSchema, type ResetPasswordInput } from '../../../features/auth/types';
import { authService } from '../../../features/auth/api/auth.service';
import { showToast } from '../../../shared/store/toastStore';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || '',
    },
  });

  // If token is missing, redirect to forgot-password
  useEffect(() => {
    if (!token) {
      showToast('Invalid or missing reset token. Please request a new one.', 'error');
      navigate('/forgot-password');
    }
  }, [token, navigate]);

  const mutation = useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: () => {
      setSuccess(true);
      showToast('Password reset successful! You can now log in.', 'success');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Something went wrong. Please try again.';
      setError('root', { message });
    },
  });

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center gap-6"
      >
        <div className="w-20 h-20 rounded-full bg-success-50 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-success" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-navy">Password Updated</h2>
          <p className="text-content-secondary text-sm leading-relaxed max-w-xs mx-auto">
            Your password has been reset successfully. You can now use your new password to sign in.
          </p>
        </div>
        <Button
          onClick={() => navigate('/login')}
          size="lg"
          className="w-full mt-2"
          icon={<ArrowRight className="w-4 h-4" />}
        >
          Proceed to Login
        </Button>
      </motion.div>
    );
  }

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
          <div className="w-1.5 h-1.5 rounded-full bg-orange" />
          Secure Reset
        </div>
        <h1 className="text-3xl font-black text-navy leading-tight">Create new password</h1>
        <p className="text-content-secondary mt-2 text-sm">
          Please enter your new password below. Ensure it is strong and secure.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="flex flex-col gap-4">
        <input type="hidden" {...register('token')} />

        <Input
          id="new_password"
          type="password"
          label="New Password"
          placeholder="••••••••"
          icon={<Lock className="w-4 h-4" />}
          error={errors.new_password?.message}
          {...register('new_password')}
        />

        <Input
          id="confirmPassword"
          type="password"
          label="Confirm New Password"
          placeholder="••••••••"
          icon={<Lock className="w-4 h-4" />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

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
          {mutation.isPending ? 'Updating...' : 'Reset Password'}
        </Button>
      </form>

      <div className="text-center pt-2">
        <Link to="/login" className="text-sm font-semibold text-content-secondary hover:text-navy transition-colors">
          Remember your password? Log in
        </Link>
      </div>
    </motion.div>
  );
}
