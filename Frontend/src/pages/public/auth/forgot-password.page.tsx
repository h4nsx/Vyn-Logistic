import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Mail, AlertCircle, ArrowLeft, CheckCircle2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { forgotPasswordSchema, type ForgotPasswordInput } from '../../../features/auth/types';
import { authService } from '../../../features/auth/api/auth.service';

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const mutation = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: (_, vars) => {
      setSubmittedEmail(vars.email);
      setSent(true);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Something went wrong. Please try again.';
      setError('root', { message });
    },
  });

  return (
    <AnimatePresence mode="wait">
      {!sent ? (
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-7"
        >
          {/* Header */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-full text-orange text-xs font-bold mb-4 border border-orange/20">
              <div className="w-1.5 h-1.5 rounded-full bg-orange" />
              Password Recovery
            </div>
            <h1 className="text-3xl font-black text-navy leading-tight">Forgot your password?</h1>
            <p className="text-content-secondary mt-2 text-sm leading-relaxed">
              No worries — enter your email and we'll send a secure reset link straight to your inbox.
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
              hint="Use the email linked to your Vyn account."
              error={errors.email?.message}
              {...register('email')}
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
              icon={<Send className="w-4 h-4" />}
            >
              {mutation.isPending ? 'Sending link...' : 'Send Reset Link'}
            </Button>
          </form>

          <Link
            to="/login"
            className="flex items-center justify-center gap-1.5 text-sm text-content-secondary hover:text-navy font-semibold transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to login
          </Link>
        </motion.div>
      ) : (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col items-center text-center gap-6"
        >
          {/* Success icon */}
          <div className="relative mt-4">
            <div className="w-20 h-20 rounded-full bg-success-50 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 15 }}
              className="absolute -top-1 -right-1 w-6 h-6 bg-orange rounded-full flex items-center justify-center"
            >
              <Send className="w-3 h-3 text-white" />
            </motion.div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-navy">Check your inbox</h2>
            <p className="text-content-secondary text-sm leading-relaxed max-w-xs mx-auto">
              We've sent a password reset link to{' '}
              <span className="font-bold text-navy break-all">{submittedEmail}</span>.
              {' '}It expires in <strong>30 minutes</strong>.
            </p>
          </div>

          {/* Tips */}
          <div className="w-full p-4 bg-surface rounded-xl border border-border text-left space-y-2">
            <p className="text-xs font-bold text-content-muted uppercase tracking-wider">Didn't get it?</p>
            <ul className="text-sm text-content-secondary space-y-1.5">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange mt-1.5 shrink-0" />
                Check your spam or junk folder
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange mt-1.5 shrink-0" />
                Make sure you used the email linked to your account
              </li>
            </ul>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => { setSent(false); setSubmittedEmail(''); }}
          >
            Try a different email
          </Button>

          <Link
            to="/login"
            className="flex items-center gap-1.5 text-sm text-content-secondary hover:text-navy font-semibold transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to login
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
