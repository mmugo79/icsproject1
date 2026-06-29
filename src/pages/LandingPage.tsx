import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, MapPin, Camera, TrendingUp, Users, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';

export function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="flex flex-col bg-[#fbfcfa] min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden select-none">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ 
               backgroundImage: 'radial-gradient(#004d2c 1.5px, transparent 1.5px)', 
               backgroundSize: '24px 24px' 
             }} 
        />
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#edf2ed] filter blur-[100px] opacity-70 pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10 max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div 
              className="flex-1 text-center lg:text-left space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#004d2c]/5 text-[#004d2c] font-black text-[10px] uppercase tracking-widest border border-[#004d2c]/10">
                <TrendingUp className="w-3.5 h-3.5" />
                Empowering Kenya's Citizens
              </div>
              
              <h1 className="text-5xl lg:text-[5.5rem] font-extrabold tracking-tight text-slate-900 leading-[0.95] font-display">
                Report Community Issues.<br />
                <span className="text-[#004d2c] relative">
                  Track Action.
                  <span className="absolute left-0 bottom-1 w-full h-[6px] bg-[#ccebda]/50 rounded-full z-[-1]" />
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-500 max-w-xl mx-auto lg:mx-0 leading-relaxed font-semibold">
                RaiaVoice helps Kenyan citizens report local problems, upvote urgent neighborhood issues, and follow their resolution transparently with local authorities.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2">
                <Link to="/report">
                  <Button size="lg" className="w-full sm:w-auto h-16 px-10 gap-2 text-sm font-extrabold uppercase tracking-widest bg-[#004d2c] hover:bg-[#003820] text-white shadow-xl shadow-[#004d2c]/10 rounded-2xl border-none">
                    Report an Issue <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <Link to="/feed">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto h-16 px-10 text-sm font-extrabold uppercase tracking-widest border-slate-200 text-[#004d2c] hover:bg-slate-50 bg-white rounded-2xl">
                    View Community Issues
                  </Button>
                </Link>
              </div>

              {/* Social proof matching screenshot */}
              <div className="flex items-center gap-4 justify-center lg:justify-start pt-4">
                <div className="flex -space-x-3">
                  <span className="inline-block h-9 w-9 rounded-full ring-2 ring-[#fbfcfa] bg-slate-200 text-slate-800 text-[10px] font-bold flex items-center justify-center select-none">JN</span>
                  <span className="inline-block h-9 w-9 rounded-full ring-2 ring-[#fbfcfa] bg-emerald-100 text-slate-800 text-[10px] font-bold flex items-center justify-center select-none">KW</span>
                  <span className="inline-block h-9 w-9 rounded-full ring-2 ring-[#fbfcfa] bg-teal-100 text-slate-800 text-[10px] font-bold flex items-center justify-center select-none">AM</span>
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Joined by 2,400+ Kenyans this week
                </p>
              </div>
            </motion.div>

            {/* Right side preview block resembling screenshot */}
            <motion.div 
              className="flex-1 relative flex justify-center lg:justify-end"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative z-10 p-4 bg-white border border-[#dfeae0]/60 rounded-[3.5rem] shadow-2xl max-w-md w-full">
                <div className="bg-[#f4faf6] p-6 rounded-[2.75rem] space-y-6">
                  
                  {/* Styled mock reports inside card */}
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] text-left">Recent Reports</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex gap-4 items-start text-left">
                      <div className="w-10 h-10 bg-[#004d2c]/5 rounded-xl flex items-center justify-center text-[#004d2c] flex-shrink-0">
                        <Camera className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-black uppercase bg-[#004d2c]/10 text-[#004d2c] px-2 py-0.5 rounded-md">In Progress</span>
                          <span className="text-[10px] text-slate-400 font-bold">Nairobi</span>
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-800 leading-snug">Burst water pipe on Langata Road</h4>
                        <p className="text-[10.5px] font-bold text-slate-400 uppercase mt-2">Upvotes: 142 • Active</p>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex gap-4 items-start text-left">
                      <div className="w-10 h-10 bg-amber-500/5 rounded-xl flex items-center justify-center text-amber-600 flex-shrink-0">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-black uppercase bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-md">Pending</span>
                          <span className="text-[10px] text-slate-400 font-bold">Kisumu</span>
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-800 leading-snug font-sans">Uncollected garbage at Githurai</h4>
                        <p className="text-[10.5px] font-bold text-slate-400 uppercase mt-2">Upvotes: 89 • Assessed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white border-y border-[#dfeae0]/60 text-center">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="max-w-2xl mx-auto space-y-4 mb-20">
            <p className="text-[#004d2c] text-[10px] font-black uppercase tracking-[0.25em]">Civic Mechanism</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 font-display">How It Works</h2>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Three simple steps to bridge the gap between citizens and service providers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
            {[
              {
                step: "01",
                title: "Report an issue",
                desc: "Quickly capture photos and precise location details of infrastructure or service failures in your neighborhood.",
                color: "text-[#004d2c]"
              },
              {
                step: "02",
                title: "Community upvotes",
                desc: "Collective voices prioritize urgent needs. Issues with more upvotes gain visibility and faster response times.",
                color: "text-[#055a36]"
              },
              {
                step: "03",
                title: "Authorities update",
                desc: "Track resolution in real-time. Receive notifications as your reported issues move from pending to resolved.",
                color: "text-amber-600"
              }
            ].map((item, i) => (
              <div key={i} className="p-10 rounded-[2.5rem] bg-[#fbfbfa] border border-slate-100 flex flex-col gap-6 relative group hover:border-[#004d2c]/20 hover:scale-103 transition-all duration-300">
                <span className={`text-4xl font-black ${item.color} font-display`}>{item.step}</span>
                <h3 className="text-xl font-extrabold text-slate-800 tracking-tight font-display">{item.title}</h3>
                <p className="text-slate-400 text-sm font-semibold leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid Panel */}
      <section className="py-28 bg-[#fbfbfa]">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-12 mb-20 text-left">
            <div className="space-y-4 max-w-xl">
              <p className="text-[#004d2c] text-[10px] font-black uppercase tracking-[0.25em]">Platform Excellence</p>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 font-display">Everything you need to drive community change</h2>
            </div>
            <p className="text-slate-500 font-semibold max-w-lg leading-relaxed">
              We've built a robust suite of tools designed to ensure transparency, administrative reporting, and citizen accountability at every key level from Ward to County.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
            {[
              {
                title: "Location-Based Reporting",
                desc: "Pins are mapped onto our live geographical layout across Nairobi, Kisumu, and Mombasa, allowing rapid regional assessment.",
                icon: <MapPin className="w-6 h-6 text-[#004d2c]" />,
                badge: "GEO-MAPPING"
              },
              {
                title: "Smart Category Routing",
                desc: "Issues are automatically sorted under Roads, Water, Electricity, or Waste, then assigned directly to appropriate regional parastatals.",
                icon: <TrendingUp className="w-6 h-6 text-[#055a36]" />,
                badge: "INTELLIGENT"
              },
              {
                title: "Collective Upvotes System",
                desc: "High community counts establish social proof and peaceful democratic pressure for authorities to prioritize repairs.",
                icon: <Users className="w-6 h-6 text-amber-600" />,
                badge: "UPVOTE ALGORITHM"
              },
              {
                title: "Public Accountability Dashboard",
                desc: "An audit trail documents the life-cycle of every single issue, allowing you to trace feedback loops openly.",
                icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
                badge: "OPEN SOURCE"
              }
            ].map((cell, idx) => (
              <div key={idx} className="p-10 rounded-[2.5rem] bg-white border border-slate-150 shadow-sm flex flex-col gap-6 group hover:border-[#004d2c]/20 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#004d2c]/5 flex items-center justify-center">
                    {cell.icon}
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">{cell.badge}</span>
                </div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight font-display">{cell.title}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{cell.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hero CTA Block */}
      <section className="py-24 max-w-7xl mx-auto w-full px-6">
        <div className="bg-[#004d2c] rounded-[3.5rem] p-10 md:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{ 
                 backgroundImage: 'radial-gradient(#ffffff 1.5px, transparent 1.5px)', 
                 backgroundSize: '20px 20px' 
               }} 
          />
          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-black text-white font-display leading-tight">Be part of better service delivery in your community</h2>
            <p className="text-[#ccebda] text-base md:text-lg font-semibold max-w-md mx-auto leading-relaxed">
              Your voice counts. Register now to experience real transparent civic coordination right today.
            </p>
            <div className="pt-4">
              <Link to="/register">
                <Button size="lg" className="bg-white text-[#004d2c] hover:bg-slate-50 hover:scale-103 font-extrabold tracking-widest text-xs uppercase h-16 px-12 rounded-2xl border-none shadow-xl">
                  Create Free Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
