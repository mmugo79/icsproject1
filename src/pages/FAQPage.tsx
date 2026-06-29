import * as React from 'react';
import { motion } from 'motion/react';
import { HelpCircle, ChevronDown, ChevronUp, Search, MessageSquare, AlertCircle, Info, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';

interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'issues' | 'privacy' | 'admin';
}

const FAQ_DATA: FAQItem[] = [
  {
    category: 'general',
    question: 'What is RaiaVoice?',
    answer: 'RaiaVoice is Kenya’s premium civic issue reporting and monitoring platform. It connects citizens directly with local community representatives, administration officials, and utility service providers to fast-track the monitoring, resolution, and transparency of vital public infrastructure like roads, water pipes, sewage lines, waste disposal, and street lights.'
  },
  {
    category: 'general',
    question: 'How do I get started with reporting on RaiaVoice?',
    answer: 'Simply create an account on RaiaVoice using your email and verified phone number. After logging in, navigate to the "Report Issue Page" to submit detailed spatial coordinates, high-resolution imagery, and categorical classifications of the infrastructure vulnerability.'
  },
  {
    category: 'issues',
    question: 'What types of infrastructure issues can I submit?',
    answer: 'You can submit issues across four major civic infrastructure pillars: Water & Sanitation (broken pipes, open sewers, dry taps), Roads & Transport (potholes, missing signages, broken guardrails), Waste Management (illegal dumpsites, full garbage bins), and Electricity & Lights (flickering street lamps, hanging cables).'
  },
  {
    category: 'issues',
    question: 'How are issue reports verified and prioritized?',
    answer: 'Reports go through double validation: geographical validation via county/constituency pinpointing, and citizen backing via "Upvotes". High upvote density signals systemic priority to relevant administrative stakeholders, guaranteeing faster response protocols.'
  },
  {
    category: 'privacy',
    question: 'Is my report anonymous to the public?',
    answer: 'By default, your display name and registered county are visible on reported public issues. For sensitive complaints, your detailed credentials (like exact email or verified phone) are securely shielded from general public view and are only accessed by authorized regional administrator verifiers.'
  },
  {
    category: 'privacy',
    question: 'Do I need a verified Kenyan phone number to submit reports?',
    answer: 'Yes. To maintain high credibility, eliminate spam reports, and enable real-time SMS updates about issue resolutions, we verify phone numbers using a standard verification protocol.'
  },
  {
    category: 'admin',
    question: 'How do administration officials update issue statuses?',
    answer: 'Registered regional administration verifiers access the dedicated Admin Dashboard where they review incoming reports, assign priorities, update statuses (from SUBMITTED to IN_PROGRESS or RESOLVED), attach verification notes, and sync updates instantly back to citizens.'
  }
];

export function FAQPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<'all' | 'general' | 'issues' | 'privacy' | 'admin'>('all');
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);
  const navigate = useNavigate();

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredFAQs = FAQ_DATA.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#fafcfa] font-sans text-slate-900">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex p-3 rounded-2xl bg-[#004d2c]/5 text-[#004d2c] border border-[#004d2c]/10">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold text-[#004d2c] tracking-tight font-display">
            Frequently Asked Questions
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto font-medium">
            Got questions about civic reporting, status verifications, or data privacy? We have curated explicit answers below to assist you.
          </p>
        </div>

        {/* Searching and Category Bar */}
        <div className="bg-white border border-[#dfeae0]/60 rounded-3xl p-6 shadow-sm space-y-4 mb-8">
          <div className="relative flex items-center bg-slate-50 border border-[#dfeae0] rounded-2xl px-4 py-1">
            <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
            <input 
              type="text" 
              placeholder="Search FAQs by keywords..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 bg-transparent border-none outline-none text-sm font-semibold placeholder-slate-400 focus:ring-0"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {(['all', 'general', 'issues', 'privacy', 'admin'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  selectedCategory === cat 
                    ? 'bg-[#004d2c] text-white' 
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-[#004d2c]'
                }`}
              >
                {cat === 'all' ? 'All Questions' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="space-y-4 mb-12">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div 
                  key={index}
                  className="bg-white border border-slate-150 rounded-2xl overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full text-left px-6 py-5 flex justify-between items-center bg-white hover:bg-[#004d2c]/5 transition-colors cursor-pointer border-none"
                  >
                    <span className="font-extrabold text-slate-800 text-sm md:text-base tracking-tight ring-0 outline-none">
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-[#004d2c] flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 border-t border-slate-50">
                      <p className="text-slate-600 leading-relaxed text-sm font-medium">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-white border border-[#dfeae0] rounded-2xl p-12 text-center">
              <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No matching questions found</p>
            </div>
          )}
        </div>

        {/* Support Invitation Footer */}
        <div className="bg-[#004d2c]/5 border border-[#004d2c]/10 rounded-[2.5rem] p-8 text-center space-y-4">
          <h3 className="text-xl font-black text-[#004d2c]">Could not find your question?</h3>
          <p className="text-slate-500 text-xs md:text-sm max-w-md mx-auto font-medium">
            Contact our dedicated support, administration, and community liaison team to escalate queries or clear doubts.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Button 
              onClick={() => navigate('/contact')}
              className="h-12 px-6 bg-[#004d2c] hover:bg-[#003820] text-white font-extrabold uppercase rounded-xl border-none text-xs tracking-wider"
            >
              Contact Support
            </Button> 
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
              className="h-12 px-6 border-slate-200 hover:bg-slate-100 font-extrabold uppercase rounded-xl text-xs tracking-wider"
            >
              Back to Safety
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
