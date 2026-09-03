import { Scale } from 'lucide-react';

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
            <p>By accessing or using the Vyn Logistics Platform ("Service", "we", "us"), you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions of this agreement, you may not access the website or use any services.</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-black text-navy mb-4">2. Description of Service</h2>
            <p>Vyn Logistics provides an AI-powered logistics anomaly detection and predictive analytics platform. The service includes web interfaces, APIs, documentation, and data processing pipelines. We reserve the right to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-navy mb-4">3. User Obligations and Data</h2>
            <p>You are solely responsible for all data, information, and other content ("User Data") that you upload, post, or otherwise provide or store in connection with the Service. By providing User Data, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and process the User Data solely for the purpose of providing and improving the Service.</p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>You must not upload data containing Personally Identifiable Information (PII) unless specifically required and permitted by law.</li>
              <li>You warrant that you have all necessary rights to upload the data.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-navy mb-4">4. Acceptable Use Policy</h2>
            <p>You agree not to use the Service to:</p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>Interfere with or disrupt the integrity or performance of the Service.</li>
              <li>Attempt to gain unauthorized access to the Service or its related systems.</li>
              <li>Reverse engineer the AI models or underlying infrastructure.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-navy mb-4">5. Limitation of Liability</h2>
            <p>In no event shall Vyn Logistics, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
