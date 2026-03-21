import { FileText, CheckCircle, Scale } from 'lucide-react';

export function TermsOfServicePage() {
  return (
    <div className="pt-32 pb-24 min-h-screen bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-12 text-center">
          <div className="w-16 h-16 bg-navy-50 rounded-2xl flex items-center justify-center text-navy mx-auto mb-6">
            <Scale className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-navy mb-4">Terms of Service</h1>
          <p className="text-content-secondary">Effective Date: March 2026</p>
        </div>
        
        <div className="prose prose-navy max-w-none space-y-8 text-content-secondary leading-relaxed font-medium">
          <section>
            <h2 className="text-2xl font-black text-navy mb-4">1. Acceptance of Terms</h2>
            <p>By using the Vyn Intelligence Platform, you agree to abide by these terms. If you do not agree to these terms, you should not access our service.</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-black text-navy mb-4">2. Subscription & Usage</h2>
            <p>We provide various subscription tiers for log analysis. Users are responsible for ensuring the accuracy and legality of the data they upload.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-navy mb-4">3. Prohibited Uses</h2>
            <p>You may not use Vyn to analyze data for illegal activities or attempt to breach the security of our neural mapping infrastructure.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
