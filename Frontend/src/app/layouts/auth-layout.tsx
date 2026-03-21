import { Outlet, Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex bg-surface">
      {/* Left Panel - Decorative (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy flex-col justify-between p-12 relative overflow-hidden">
        {/* Background Glow Effect */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-navy-light/20 to-transparent pointer-events-none" />
        
        <Link to="/" className="flex items-center gap-2 z-10 w-fit">
          <div className="bg-orange text-white p-1.5 rounded-xl">
            <Zap className="w-6 h-6" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-white">
            VYNLYTICS
          </span>
        </Link>

        <div className="z-10 max-w-md">
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Detect. Diagnose. Deliver.
          </h1>
          <p className="text-navy-100 text-lg">
            Log in to access your intelligent logistics dashboard and monitor your supply chain in real-time.
          </p>
        </div>
      </div>

      {/* Right Panel - Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}