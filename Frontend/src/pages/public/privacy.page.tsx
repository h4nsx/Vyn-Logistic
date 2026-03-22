import { Shield, Lock, Eye, FileText } from 'lucide-react';

export function PrivacyPolicyPage() {
  return (
    <div className="pt-32 pb-24 min-h-screen bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-12 text-center">
          <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange mx-auto mb-6">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-navy mb-4">Privacy Policy</h1>
          <p className="text-content-secondary">Last Updated: March 2026</p>
        </div>
        
        <div className="prose prose-navy max-w-none space-y-8 text-content-secondary leading-relaxed font-medium">
          <section>
            <h2 className="text-2xl font-black text-navy mb-4">1. Data Collection</h2>
            <p>At Vyn, we prioritize the security and privacy of your supply chain data. We collect information solely for the purpose of provide process analysis and intelligence insights.</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-black text-navy mb-4">2. Processing & Storage</h2>
            <p>Your logistics logs are processed via our neural mapping engine and stored using enterprise-grade encryption. We do not share your data with third parties for marketing purposes.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-navy mb-4">3. Your Rights</h2>
            <p>You have the right to export, modify, or delete your processed datasets at any time through the dashboard settings.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
