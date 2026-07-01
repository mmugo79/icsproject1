import * as React from 'react';
import { Mail, Phone, MapPin, Send, MessageSquareHeart, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ContactPage() {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [subject, setSubject] = React.useState('general');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setIsSubmitting(true); 
    // Simulate API request delay
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    }, 1200);
  }; 

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#fafcfa] font-sans text-slate-900">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex p-3 rounded-2xl bg-[#004d2c]/5 text-[#004d2c] border border-[#004d2c]/10">
            <Mail className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold text-[#004d2c] tracking-tight font-display">
            Contact Us
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto font-medium">
            Have a question, feedback, or need administrative scaling support? Send us a direct query using the form below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
          
          {/* Direct Address & Help Cards */}
          <div className="col-span-1 lg:col-span-2 space-y-6 flex flex-col justify-between">
            <div className="bg-white border border-slate-150 rounded-[2.5rem] p-8 space-y-6 flex-1 flex flex-col justify-center">
              <h3 className="text-xl font-extrabold text-[#004d2c] tracking-tight mb-2">Platform Details</h3>
              
              <div className="space-y-6">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#004d2c]/5 text-[#004d2c] flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">General Inquiries</h5>
                    <p className="text-sm font-bold text-[#0a1f11] hover:underline">support@raiavoice.go.ke</p>
                  </div>
                </div>

                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#004d2c]/5 text-[#004d2c] flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Administration Hotline</h5>
                    <p className="text-sm font-bold text-[#0a1f11]">+254 (0) 700 100 200</p>
                  </div>
                </div>

                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#004d2c]/5 text-[#004d2c] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Headquarters Office</h5>
                    <p className="text-sm font-bold text-[#0a1f11]">Civic Innovation Hub, Nairobi</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#004d2c] to-[#055a36] text-white rounded-[2.5rem] p-8 space-y-4">
              <MessageSquareHeart className="w-8 h-8 text-white/90" />
              <h4 className="text-lg font-black tracking-tight">Our Civic Mission</h4>
              <p className="text-xs text-white/80 font-medium leading-relaxed">
                RaiaVoice functions to enhance public transparency across East Africa. We process continuous input from Kenyan citizens and support local initiatives.
              </p>
            </div>
          </div>

          {/* Contact Interactive Form */}
          <div className="col-span-1 lg:col-span-3 bg-white border border-slate-150 rounded-[2.5rem] p-8 md:p-10 shadow-sm flex flex-col justify-center">
            {submitted ? (
              <div className="text-center py-16 space-y-6">
                <div className="inline-flex p-4 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <CheckCircle className="w-10 h-10 animate-bounce" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Inquiry Received Successfully!</h3>
                <p className="text-slate-500 font-medium text-sm max-w-sm mx-auto">
                  Thank you for reaching out. A community verification specialist will reply to your registered query within 24 business hours.
                </p>
                <Button 
                  onClick={() => setSubmitted(false)}
                  className="h-11 px-6 bg-[#004d2c] hover:bg-[#003820] text-white font-extrabold uppercase rounded-xl border-none text-xs tracking-wider cursor-pointer"
                >
                  Send another inquiry
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-2">Write a Direct Message</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 select-none">Full Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Moses Njoroge"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-12 px-4 bg-slate-50 border border-slate-200 focus:border-[#004d2c] focus:bg-white rounded-xl text-sm font-semibold outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 select-none">Email Address</label>
                    <input 
                      type="email" 
                      required
                      placeholder="e.g. moses@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-12 px-4 bg-slate-50 border border-slate-200 focus:border-[#004d2c] focus:bg-white rounded-xl text-sm font-semibold outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 select-none">Inquiry Nature</label>
                  <select 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 focus:border-[#004d2c] focus:bg-white rounded-xl text-sm font-semibold outline-none transition-all"
                  >
                    <option value="general">General Help & Feedback</option>
                    <option value="report">Trouble Reporting Issue</option>
                    <option value="partnership">County Partnership Escalations</option>
                    <option value="spam">Report Security Abuse / Fraud</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 select-none">Message Body</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="Elaborate on your question or request..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 focus:border-[#004d2c] focus:bg-white rounded-xl text-sm font-semibold outline-none transition-all resize-none"
                  />
                </div>

                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-[#004d2c] hover:bg-[#003820] text-white font-extrabold uppercase rounded-xl border-none shadow-md text-xs tracking-wider gap-2 flex items-center justify-center cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Transmitting inquiry...' : 'Deliver Inquiry'}
                </Button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
