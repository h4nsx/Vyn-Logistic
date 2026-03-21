import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { User, Lock, Bell, Save, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';

import { useAuthStore } from '../../features/auth/store';
import { Input } from '../../shared/components/ui/Input';
import { Button } from '../../shared/components/ui/Button';
import { Badge } from '../../shared/components/ui/Badge';
import { passwordSchema, type PasswordInput } from '../../features/auth/types';
import { authService } from '../../features/auth/api/auth.service';
import { useToastStore } from '../../shared/store/toastStore';

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export function SettingsPage() {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<PasswordInput>({ resolver: zodResolver(passwordSchema) });

  const passwordMutation = useMutation({
    mutationFn: authService.changePassword,
    onSuccess: () => {
      reset();
      addToast('Password updated successfully!', 'success');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update password';
      setError('root', { message });
      addToast(message, 'error');
    },
  });

  const onPasswordSubmit = (data: PasswordInput) => {
    passwordMutation.mutate(data);
  };

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(false);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-3xl space-y-6"
    >
      {/* Profile Section */}
      <motion.section variants={sectionVariants} className="bg-white rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-surface/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-navy-50 text-navy rounded-xl">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-navy">Profile Information</h2>
              <p className="text-xs text-content-muted">Your account identity</p>
            </div>
          </div>
          <Badge variant="info">{user?.role || 'User'}</Badge>
        </div>

        <div className="p-6">
          {/* User Avatar Block */}
          <div className="flex items-center gap-5 mb-6 pb-6 border-b border-border">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-navy to-navy-dark text-white flex items-center justify-center text-2xl font-black shadow-lg">
              {user?.initials || '?'}
            </div>
            <div>
              <p className="text-lg font-bold text-navy">{user?.name || 'User'}</p>
              <p className="text-sm text-content-secondary">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-content-muted uppercase tracking-wider">Full Name</p>
              <div className="flex items-center gap-3 bg-surface border border-border rounded-xl px-4 py-3">
                <p className="text-sm font-semibold text-navy">{user?.name || '—'}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-content-muted uppercase tracking-wider">Email Address</p>
              <div className="flex items-center gap-3 bg-surface border border-border rounded-xl px-4 py-3">
                <p className="text-sm font-semibold text-navy">{user?.email || '—'}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Security Section */}
      <motion.section variants={sectionVariants} className="bg-white rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="px-6 py-5 border-b border-border bg-surface/40 flex items-center gap-3">
          <div className="p-2 bg-orange-50 text-orange rounded-xl">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-navy">Change Password</h2>
            <p className="text-xs text-content-muted">Keep your account secure</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onPasswordSubmit)} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Input
              id="currentPassword"
              label="Current Password"
              type="password"
              placeholder="••••••••"
              error={errors.currentPassword?.message}
              {...register('currentPassword')}
            />
            <Input
              id="newPassword"
              label="New Password"
              type="password"
              placeholder="Min. 8 characters"
              hint="Use letters, numbers & symbols."
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />
            <Input
              id="confirmPassword"
              label="Confirm New Password"
              type="password"
              placeholder="Repeat new password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </div>

          {errors.root && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center gap-2 p-4 rounded-xl bg-danger-50 border border-danger/20 text-danger text-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errors.root.message}
            </motion.div>
          )}

          {passwordMutation.isSuccess && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center gap-2 p-4 rounded-xl bg-success-50 border border-success/20 text-success text-sm"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Password updated successfully!
            </motion.div>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              isLoading={passwordMutation.isPending}
              icon={<Save className="w-4 h-4" />}
            >
              Update Password
            </Button>
          </div>
        </form>
      </motion.section>

      {/* Notifications Section */}
      <motion.section variants={sectionVariants} className="bg-white rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="px-6 py-5 border-b border-border bg-surface/40 flex items-center gap-3">
          <div className="p-2 bg-cyan-50 text-cyan rounded-xl">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-navy">Notifications</h2>
            <p className="text-xs text-content-muted">Control how you receive alerts</p>
          </div>
        </div>
        <div className="divide-y divide-border">
          {[
            { label: 'Email Alerts', desc: 'Daily digest of anomalies and risk scores', state: emailAlerts, setter: setEmailAlerts },
            { label: 'System Notifications', desc: 'In-app alerts for critical bottlenecks', state: systemAlerts, setter: setSystemAlerts },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between px-6 py-5">
              <div>
                <p className="text-sm font-semibold text-navy">{item.label}</p>
                <p className="text-xs text-content-secondary mt-0.5">{item.desc}</p>
              </div>
              <button
                onClick={() => item.setter(!item.state)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange ${
                  item.state ? 'bg-orange' : 'bg-border'
                }`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                  item.state ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Danger Zone */}
      <motion.section variants={sectionVariants} className="bg-white rounded-2xl border border-danger/20 shadow-card overflow-hidden">
        <div className="px-6 py-5 border-b border-danger/10 bg-danger-50/30 flex items-center gap-3">
          <div className="p-2 bg-danger-50 text-danger rounded-xl">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-navy">Danger Zone</h2>
            <p className="text-xs text-content-muted">Irreversible actions</p>
          </div>
        </div>
        <div className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-navy">Delete Account</p>
            <p className="text-xs text-content-secondary mt-0.5">Permanently remove your account and all data.</p>
          </div>
          <Button variant="danger" size="sm" icon={<ChevronRight className="w-4 h-4" />}>
            Delete Account
          </Button>
        </div>
      </motion.section>
    </motion.div>
  );
}


