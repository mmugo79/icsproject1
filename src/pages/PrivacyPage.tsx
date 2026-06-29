import * as React from 'react';
import { ShieldCheck, Mail, Lock, Eye, CheckCircle } from 'lucide-react';

export function PrivacyPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#fafcfa] font-sans text-slate-900">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex p-3 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold text-[#004d2c] tracking-tight font-display">
            Privacy Policy
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto font-medium">
            At RaiaVoice, we maintain strict standards to shield and respect your identity. Read how we protect your civic data below.
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-white border border-slate-150 rounded-[3rem] p-8 md:p-12 shadow-sm space-y-8">
          
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-[#004d2c] tracking-tight border-b border-slate-100 pb-3">
              1. General Commitment & Purpose
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed font-medium">
              RaiaVoice operates as a community transparency platform. All collected information is specifically used to verify geographical positions, manage citizen priority upvotes, and communicate genuine infrastructure feedback with local county administrations. We strictly do not trade, sell, or rent your private contact info to advertising vendors.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-[#004d2c] tracking-tight border-b border-slate-100 pb-3">
              2. Data We Safely Acquire
            </h2>
            <ul className="space-y-3.5 text-slate-600 text-sm font-medium">
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</span>
                <span><strong>User Profile Details:</strong> Registering requires your full name, clear email, and active phone number for authentic security verification.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</span>
                <span><strong>Report Geographic Information:</strong> Submitting issues logs exact latitudinal and longitudinal coordinates to ensure municipal workers can locate the physical reported problems accurately.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</span>
                <span><strong>Civic Attachments:</strong> High-fidelity photos of infrastructure issues uploaded by you are hosted securely on our cloud storage buckets solely for verifications.</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-[#004d2c] tracking-tight border-b border-[#004d2c]/10 pb-3">
              3. Protection of Verified Phone Numbers
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed font-medium">
              Verified phone numbers represent a benchmark of our civic integrity check. Phone verification utilizes standard OTP protocols and stays strictly confidential. It will not be exposed to the public community. It is uniquely utilized to prevent automated bots and send resolution confirmations.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-[#004d2c] tracking-tight border-b border-[#004d2c]/10 pb-3">
              4. Security Measures & Compliance
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed font-medium">
              We leverage secure PostgreSQL access rules and bearer token authorization to guarantee that your profile configuration cannot be altered as standard citizens by unauthorized sessions. Regular vulnerability audits are carried out by our security teams.
            </p>
          </div>

          <div className="p-6 bg-[#004d2c]/5 rounded-2xl flex items-start gap-4">
            <Lock className="w-6 h-6 text-[#004d2c] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-black text-[#004d2c] uppercase tracking-wider mb-1">Your Consent & Freedom</h4>
              <p className="text-slate-600 text-xs font-semibold leading-relaxed">
                By participating on RaiaVoice, you fully consent to our digital safety disclosures. You hold the dynamic freedom to modify, erase, or update your citizen reports and profile records anytime!
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
