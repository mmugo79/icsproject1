import * as React from 'react';
import { Scale, CheckCircle2 } from 'lucide-react';

export function TermsPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#fafcfa] font-sans text-slate-900">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Header */} 
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex p-3 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
            <Scale className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold text-[#004d2c] tracking-tight font-display">
            Terms of Service
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto font-medium">
            Please read these platform usage terms carefully before registering your civic account on RaiaVoice.
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-white border border-slate-150 rounded-[3rem] p-8 md:p-12 shadow-sm space-y-8">
          
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-[#004d2c] tracking-tight border-b border-light pb-3">
              1. Acceptable Citizen Engagement
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed font-semibold">
              RaiaVoice is created for constructive civic development tracking. By signing up, you explicitly agree that:
            </p>
            <ul className="space-y-3 text-slate-600 text-sm font-medium">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#004d2c] shrink-0 mt-0.5" />
                <span>You will provide accurate geographic positions and context when reporting public infrastructure issues.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#004d2c] shrink-0 mt-0.5" />
                <span>You will upload genuine high-resolution photographic evidence that directly depicts the specified defect.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#004d2c] shrink-0 mt-0.5" />
                <span>You will not submit duplicate, misleading, political, or offensive content on the platform.</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-[#004d2c] tracking-tight border-b border-light pb-3">
              2. Profile Authenticity Requirements
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed font-semibold">
              You must maintain accurate contact information. Creation of mock, fake, spam, or misleading identification (such as claiming false governmental agency roles) constitutes grounds for immediate administrative block. Each user may only register a single account.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-[#004d2c] tracking-tight border-b border-light pb-3">
              3. Disclaimer & Responsibility Limits
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed font-semibold">
              RaiaVoice matches reports to relevant administrators to encourage public accountability. While we take measures to streamline verifications, RaiaVoice is not liable for direct/indirect delays in municipal repair actions or external infrastructure accidents. Repair schedules remain the jurisdiction of local county development teams.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-[#004d2c] tracking-tight border-b border-light pb-3">
              4. Termination Rights
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed font-semibold">
              Platform administration maintains full jurisdiction to moderate, resolve, lock, or purge any submitted issue reports that fail to align with transparency policies or contain abusive/incorrect descriptions.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
