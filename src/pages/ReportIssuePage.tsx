import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Camera, MapPin, CheckCircle2, ChevronRight, ChevronLeft, AlertCircle, Info, Upload, Trash2 } from 'lucide-react';
import { IssueCategory } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { saveIssue, getIssues, upvoteIssue } from '@/lib/db';
import L from 'leaflet';
import { saveIssueToPostgreSQL } from '@/lib/postgres';

export const CONSTITUENCIES: Record<string, string[]> = {
  Nairobi: [
    'Westlands', 'Dagoretti North', 'Dagoretti South', 'Langata', 'Kibra',
    'Roysambu', 'Kasarani', 'Ruaraka', 'Embakasi South', 'Embakasi North',
    'Embakasi Central', 'Embakasi East', 'Embakasi West', 'Makadara', 
    'Kamukunji', 'Starehe', 'Mathare'
  ],
  Kisumu: [
    'Kisumu East', 'Kisumu West', 'Kisumu Central', 'Seme', 
    'Nyando', 'Muhoroni', 'Nyakach'
  ],
  Kiambu: [
    'Gatundu South', 'Gatundu North', 'Juja', 'Thika Town', 'Ruiru',
    'Githunguri', 'Kiambu', 'Kiambaa', 'Kabete', 'Kikuyu', 'Limuru', 'Lari'
  ],
  Kajiado: [
    'Kajiado Central', 'Kajiado North', 'Kajiado East', 'Kajiado West', 'Kajiado South'
  ],
  Machakos: [
    'Machakos Town', 'Mavoko', 'Mwala', 'Yatta', 'Kangundo', 'Matungulu', 'Kathiani', 'Masinga'
  ],
  Wajir: [
    'Wajir East', 'Wajir West', 'Wajir South', 'Wajir North', 'Tarbaj', 'Eldas'
  ],
  Mandera: [
    'Mandera East', 'Mandera West', 'Mandera South', 'Mandera North', 'Banissa', 'Lafey'
  ],
  Mombasa: [
    'Mvita', 'Changamwe', 'Jomvu', 'Likoni', 'Kisauni', 'Nyali'
  ],
  Nakuru: [
    'Nakuru Town East', 'Nakuru Town West', 'Naivasha', 'Molo', 'Gilgil', 'Rongai', 'Subukia', 'Bahati', 'Njoro', 'Kuresoi North', 'Kuresoi South'
  ],
  'Uasin Gishu': [
    'Ainabkoi', 'Kapseret', 'Kesses', 'Moiben', 'Soy', 'Turbo'
  ]
};

const CATEGORIES: { label: string; value: IssueCategory; icon: string }[] = [
  { label: 'Roads & Transport', value: 'ROADS', icon: '🛣️' },
  { label: 'Water & Sanitation', value: 'WATER', icon: '🚰' },
  { label: 'Electricity & Lighting', value: 'ELECTRICITY', icon: '💡' },
  { label: 'Waste Management', value: 'WASTE', icon: '🗑️' },
];

export function ReportIssuePage() {
  const [step, setStep] = React.useState(1);
  const { user } = useAuth();
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    category: '' as IssueCategory | '',
    location: '',
    county: 'Nairobi',
    constituency: 'Westlands',
    lat: -1.2921,
    lng: 36.8219,
    images: [] as string[],
  });
  const [similarIssues, setSimilarIssues] = React.useState<any[]>([]);
  const navigate = useNavigate();

  const mapRef = React.useRef<L.Map | null>(null);
  const markerRef = React.useRef<L.Marker | null>(null);
  const mapContainerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    // Override Leaflet default icon paths safely to prevent missing icon crashes
    const defaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = defaultIcon;
  }, []);

  React.useEffect(() => {
    if (step === 3 && similarIssues.length === 0 && mapContainerRef.current) {
      if (!mapRef.current) {
        const initialLat = formData.lat || -1.2921;
        const initialLng = formData.lng || 36.8219;
        
        const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        const marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);
        
        marker.on('dragend', () => {
          const position = marker.getLatLng();
          setFormData(prev => ({
            ...prev,
            lat: position.lat,
            lng: position.lng
          }));
        });

        map.on('click', (e) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          setFormData(prev => ({
            ...prev,
            lat,
            lng
          }));
        });

        mapRef.current = map;
        markerRef.current = marker;
      } else {
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.invalidateSize();
          }
        }, 150);
      }
    }

    return () => {
      if (step !== 3 && mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [step, similarIssues.length]);

  const handleCountyChange = (county: string) => {
    const centers: Record<string, { lat: number; lng: number }> = {
      Nairobi: { lat: -1.2921, lng: 36.8219 },
      Kisumu: { lat: -0.1022, lng: 34.7617 },
      Kiambu: { lat: -1.1714, lng: 36.8356 },
      Kajiado: { lat: -1.8524, lng: 36.7850 },
      Machakos: { lat: -1.5177, lng: 37.2634 },
      Wajir: { lat: 1.7471, lng: 40.0596 },
      Mandera: { lat: 3.9368, lng: 41.8569 },
      Mombasa: { lat: -4.0435, lng: 39.6682 },
      Nakuru: { lat: -0.3031, lng: 36.0800 },
      'Uasin Gishu': { lat: 0.5143, lng: 35.2698 }
    };
    const center = centers[county] || centers.Nairobi;
    const countyConstituencies = CONSTITUENCIES[county] || [];
    const defaultCons = countyConstituencies[0] || '';

    setFormData(prev => ({
      ...prev,
      county,
      constituency: defaultCons,
      lat: center.lat,
      lng: center.lng
    }));

    if (mapRef.current && markerRef.current) {
      mapRef.current.setView([center.lat, center.lng], 12);
      markerRef.current.setLatLng([center.lat, center.lng]);
    }
  };

  const handleGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            lat: latitude,
            lng: longitude,
            location: prev.location || `GPS Location`
          }));

          if (mapRef.current && markerRef.current) {
            mapRef.current.setView([latitude, longitude], 15);
            markerRef.current.setLatLng([latitude, longitude]);
          }
        },
        (error) => {
          console.warn('Geolocation failed or rejected:', error);
          alert('Could not enable browser geolocation. Please select or pin your location manually on the map.');
        }
      );
    } else {
      alert('Your browser does not support geolocation.');
    }
  };

  const checkDuplicates = () => {
    try {
      const allIssues = getIssues();
      const matches = allIssues.filter(issue => {
        const sameCategory = issue.category === formData.category;
        const sameCounty = issue.location.county.toLowerCase() === formData.county.toLowerCase();
        
        if (!sameCategory || !sameCounty) return false;

        const isActive = issue.status !== 'RESOLVED' && issue.status !== 'REJECTED';
        if (!isActive) return false;

        const cleanWords = (str: string) => 
          str.toLowerCase()
            .replace(/[.\/#!$%\^&\*;:{}=\-_`~()]/g, "")
            .split(/\s+/)
            .filter(w => w.length > 3 && !['with', 'your', 'this', 'that', 'from', 'have', 'roads', 'water', 'waste', 'electricity'].includes(w));

        const inputTokens = cleanWords(`${formData.title} ${formData.location}`);
        const issueText = `${issue.title} ${issue.location.address} ${issue.description}`.toLowerCase();

        const overlap = inputTokens.filter(token => issueText.includes(token));
        return overlap.length >= 1; // Overlap of at least 1 keyword
      });
      return matches;
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const handleNextStep3 = () => {
    const matches = checkDuplicates();
    if (matches.length > 0) {
      setSimilarIssues(matches);
    } else {
      setStep(4);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({
          ...prev, 
          images: [...prev.images, reader.result as string] 
        }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const isStep1Valid = !!formData.category;
  const isStep2Valid = formData.title.length >= 5 && formData.description.length >= 20;
  const isStep3Valid = !!formData.location && !!formData.county && !!formData.constituency;

  const steps = [
    { id: 1, title: 'Category', icon: AlertCircle },
    { id: 2, title: 'Details', icon: Info },
    { id: 3, title: 'Location & Photos', icon: MapPin },
    { id: 4, title: 'Review', icon: CheckCircle2 },
  ];

  const handleSubmit = () => {
    const newIssue = {
      id: 'issue_' + Date.now(),
      title: formData.title,
      description: formData.description,
      category: formData.category as IssueCategory,
      status: 'SUBMITTED' as const,
      location: {
        address: formData.location,
        county: formData.county,
        constituency: formData.constituency,
        lat: formData.lat,
        lng: formData.lng,
      },
      reporterId: user?.id || 'guest',
      reporterName: user?.name || 'Anonymous Citizen',
      images: formData.images.length > 0 ? formData.images : [],
      upvotes: 0,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveIssue(newIssue);
    saveIssueToPostgreSQL(newIssue);
    setStep(5); // Success state
  };

  return (
    <div className="min-h-screen pt-28 pb-20 bg-[#fbfbfa] font-sans text-slate-900">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Progress Header */}
        <div className="mb-16">
          <div className="flex justify-between items-center px-4 md:px-0 relative">
            <div className="absolute left-0 right-0 top-6 h-px bg-[#dfeae0]/60 -z-0" />
            {steps.map((s, index) => (
              <div key={s.id} className="flex flex-col items-center gap-4 relative z-10 select-none">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all border-2 ${
                  step >= s.id 
                    ? 'bg-[#004d2c] border-[#004d2c] text-white shadow-lg shadow-[#004d2c]/10' 
                    : 'bg-white text-slate-300 border-slate-100'
                }`}>
                  {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : s.id}
                </div>
                <span className={`text-[10px] uppercase font-black tracking-[0.2em] hidden md:block ${
                  step >= s.id ? 'text-[#004d2c]' : 'text-slate-300'
                }`}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="text-center space-y-3">
                <h2 className="text-4xl md:text-5xl font-black text-[#004d2c] tracking-tight font-display">New Issue Category</h2>
                <p className="text-slate-500 font-medium max-w-lg mx-auto">Categorize your community report to route coordinates instantly to corresponding Kenyan authorities.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setFormData({ ...formData, category: cat.value })}
                    className={`p-10 rounded-[2.5rem] flex flex-col items-center gap-6 transition-all border-2 text-center h-full hover:shadow-xl group cursor-pointer ${
                      formData.category === cat.value 
                        ? 'bg-[#004d2c] border-[#004d2c] shadow-xl shadow-[#004d2c]/10 text-white' 
                        : 'bg-white border-slate-150 hover:border-[#004d2c]/20'
                    }`}
                  >
                    <span className="text-5xl transition-transform group-hover:scale-110 duration-500">
                      {cat.icon}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${formData.category === cat.value ? 'text-white' : 'text-slate-400'}`}>
                      {cat.label.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex justify-center pt-8">
                <Button 
                  size="lg" 
                  disabled={!isStep1Valid}
                  onClick={() => setStep(2)}
                  className="h-16 px-12 gap-3 bg-[#004d2c] hover:bg-[#003820] text-white shadow-xl shadow-[#004d2c]/15 rounded-2xl font-black uppercase tracking-widest text-[10px] border-none"
                >
                  Next: Description <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-10"
            >
              <div className="text-center space-y-3">
                <h2 className="text-4xl md:text-5xl font-black text-[#004d2c] tracking-tight font-display">Explain the Issue</h2>
                <p className="text-slate-500 font-medium max-w-lg mx-auto">Clear descriptions accelerate confirmation timelines from regional administrative officers.</p>
              </div>

              <div className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-slate-150 space-y-8 text-left">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Issue Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Damaged Water Pipe on Ngong Road"
                    className="w-full h-16 px-6 bg-[#f4faf6] border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#004d2c]/10 transition-all font-bold text-lg text-slate-700 placeholder-slate-400"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Description & Impact</label>
                  <textarea 
                    placeholder="Provide details. What happened? How long has it been like this? Who is affected?"
                    className="w-full min-h-[180px] p-6 bg-[#f4faf6] border-none rounded-[2rem] focus:outline-none focus:ring-2 focus:ring-[#004d2c]/10 transition-all font-bold text-lg text-slate-700 placeholder-slate-400 resize-none leading-relaxed"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                  <div className="flex justify-between px-1">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Min 20 characters</p>
                    <p className="text-[10px] text-[#004d2c] font-black uppercase tracking-widest">{formData.description.length} / 500</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-8">
                <Button variant="ghost" className="h-16 px-10 gap-2 font-black uppercase tracking-widest text-xs text-slate-400 border-none hover:bg-slate-50 cursor-pointer" onClick={() => setStep(1)}>
                  <ChevronLeft className="w-5 h-5" /> Back
                </Button>
                <Button 
                  size="lg" 
                  disabled={!isStep2Valid}
                  onClick={() => setStep(3)}
                  className="h-16 px-12 gap-3 bg-[#004d2c] hover:bg-[#003820] text-white shadow-xl shadow-[#004d2c]/15 rounded-2xl font-black uppercase tracking-widest text-[10px] border-none"
                >
                  Locate & Photos <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && similarIssues.length === 0 && (
            <motion.div
              key="step3_form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-10"
            >
              <div className="text-center space-y-3">
                <h2 className="text-4xl md:text-5xl font-black text-[#004d2c] tracking-tight font-display">Where & Proof</h2>
                <p className="text-slate-500 font-medium max-w-lg mx-auto">Precise physical layouts trigger speedier resolution dispatches.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                
                {/* Location Picker */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-150 shadow-sm space-y-6 flex flex-col justify-between">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Target County & Constituency</label>
                    <div className="grid grid-cols-2 gap-3 mt-2 mb-4">
                      <select
                        value={formData.county}
                        onChange={(e) => handleCountyChange(e.target.value)}
                        className="w-full h-14 px-4 bg-[#f4faf6] border-none rounded-xl font-bold text-slate-700 outline-none text-xs"
                      >
                        <option value="Nairobi">Nairobi</option>
                        <option value="Kisumu">Kisumu</option>
                        <option value="Kiambu">Kiambu</option>
                        <option value="Kajiado">Kajiado</option>
                        <option value="Machakos">Machakos</option>
                        <option value="Wajir">Wajir</option>
                        <option value="Mandera">Mandera</option>
                        <option value="Mombasa">Mombasa</option>
                        <option value="Nakuru">Nakuru</option>
                        <option value="Uasin Gishu">Uasin Gishu</option>
                      </select>

                      <select
                        value={formData.constituency}
                        onChange={(e) => setFormData({ ...formData, constituency: e.target.value })}
                        className="w-full h-14 px-4 bg-[#f4faf6] border-none rounded-xl font-bold text-slate-700 outline-none text-xs"
                      >
                        {(CONSTITUENCIES[formData.county] || []).map(cons => (
                          <option key={cons} value={cons}>{cons}</option>
                        ))}
                      </select>
                    </div>

                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Detailed Landmark / Address</label>
                    <div className="relative mt-2 mb-4">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#004d2c]" />
                      <input 
                        type="text" 
                        placeholder="e.g., Block B, Ngong Road..."
                        className="w-full h-14 pl-11 pr-4 bg-[#f4faf6] border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004d2c]/10 transition-all font-bold text-xs text-slate-700 placeholder-slate-400"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>

                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex justify-between items-center mb-2">
                      <span>Pin Location on Map</span>
                      <span className="text-[9px] text-[#004d2c] font-black tracking-normal uppercase normal-case italic">Drag pin or click map</span>
                    </label>
                    <div ref={mapContainerRef} className="w-full h-48 border border-[#e1eae3] rounded-xl relative overflow-hidden z-10 shadow-inner bg-slate-50 mb-3" />
                    
                    <div className="text-[10px] font-mono text-slate-400 flex justify-between items-center px-1 mb-4">
                      <span>Lat: {formData.lat.toFixed(5)}</span>
                      <span>Lng: {formData.lng.toFixed(5)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGeolocation}
                    className="w-full h-12 bg-white hover:bg-slate-50 gap-2 border border-slate-150 font-bold rounded-xl text-slate-400 text-[10px] uppercase tracking-wider inline-flex items-center justify-center cursor-pointer mt-2"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#004d2c]" /> Allow Browser GPS Geolocation
                  </button>
                </div>

                {/* Optional Media (Ensuring user flow allows empty pictures easily!) */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-150 shadow-sm space-y-6">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex flex-col">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Evidence Photos</label>
                      <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase leading-none">(Optional)</span>
                    </div>
                    <span className="text-[10px] font-black text-[#004d2c] bg-[#004d2c]/5 px-2 py-0.5 rounded italic">{formData.images.length}/3</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {formData.images.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-[1.5rem] overflow-hidden bg-[#f4faf6] group border border-slate-150">
                        <img src={img} alt="Evidence" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => removeImage(i)}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {formData.images.length < 3 && (
                      <label className="aspect-square rounded-[1.5rem] border-2 border-dashed border-[#dfeae0] bg-white flex flex-col items-center justify-center cursor-pointer hover:border-[#004d2c] hover:bg-[#004d2c]/5 transition-all group select-none">
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        <Camera className="w-6 h-6 text-slate-300 group-hover:text-[#004d2c] mb-2 transition-colors" />
                        <span className="text-[9px] font-black text-slate-300 group-hover:text-[#004d2c] tracking-widest">UPLOAD</span>
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-8">
                <Button variant="ghost" className="h-16 px-10 gap-2 font-black uppercase tracking-widest text-xs text-slate-400 border-none hover:bg-slate-50 cursor-pointer" onClick={() => setStep(2)}>
                  <ChevronLeft className="w-5 h-5" /> Back
                </Button>
                <Button 
                  size="lg" 
                  disabled={!isStep3Valid}
                  onClick={handleNextStep3}
                  className="h-16 px-12 gap-3 bg-[#004d2c] hover:bg-[#003820] text-white shadow-xl shadow-[#004d2c]/15 rounded-2xl font-black uppercase tracking-widest text-[10px] border-none"
                >
                  Review Details <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && similarIssues.length > 0 && (
            <motion.div
              key="similar_issues_warning"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10 text-left"
            >
              <div className="bg-amber-50 rounded-[2.5rem] border border-amber-200 p-8 flex items-start gap-6 shadow-sm">
                <div className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-amber-950 uppercase tracking-tight">Similar Community Concerns Detected</h3>
                  <p className="text-sm font-semibold text-amber-900/85 leading-relaxed">
                    Other citizens have already reported similar problems in <span className="font-bold underline">{formData.county}</span> matching your category. 
                    Supporting an existing report helps regional officers prioritize resources and resolve them faster instead of creating duplicates!
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Existing Live Reports</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {similarIssues.map((issue) => (
                    <div 
                      key={issue.id} 
                      className="bg-white rounded-[2.5rem] p-8 border border-slate-150 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all"
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <span className="text-[10px] font-black uppercase bg-[#004d2c]/5 text-[#004d2c] px-3 py-1 rounded-full border border-[#004d2c]/10">
                            {issue.category}
                          </span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{issue.location.address.split(',')[0]}</span>
                        </div>
                        <h4 className="text-lg font-black text-slate-900 leading-snug line-clamp-2">{issue.title}</h4>
                        <p className="text-slate-500 font-medium text-xs line-clamp-3 leading-relaxed">{issue.description}</p>
                      </div>

                      <div className="pt-6 border-t border-slate-100 mt-6 flex flex-col gap-3">
                        {user && issue.supporterIds?.includes(user.id) ? (
                          <Button 
                            disabled 
                            className="h-12 bg-emerald-50 text-emerald-800 border-none cursor-not-allowed font-extrabold text-[10px] uppercase tracking-wider rounded-xl w-full"
                          >
                            ✓ Already Supporting This ({issue.upvotes})
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => {
                              upvoteIssue(issue.id);
                              navigate(`/issue/${issue.id}`);
                            }}
                            className="h-12 bg-[#004d2c] hover:bg-[#003820] text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl w-full cursor-pointer"
                          >
                            👍 Support This Existing Issue ({issue.upvotes})
                          </Button>
                        )}
                        <Button 
                          variant="outline"
                          onClick={() => navigate(`/issue/${issue.id}`)}
                          className="h-12 border-slate-200 text-slate-700 hover:text-slate-950 font-bold text-[10px] uppercase tracking-widest rounded-xl w-full cursor-pointer"
                        >
                          View Report & Join Discussion ({issue.commentsCount || 0})
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-10 border-t border-slate-150 flex flex-col sm:flex-row justify-between items-center gap-6">
                <Button 
                  variant="ghost" 
                  className="h-16 px-10 gap-2 font-black uppercase tracking-widest text-xs text-slate-400 border-none hover:bg-slate-50 cursor-pointer" 
                  onClick={() => setSimilarIssues([])}
                >
                  <ChevronLeft className="w-5 h-5" /> Back to Edit Location
                </Button>
                <Button 
                  onClick={() => {
                    setSimilarIssues([]);
                    setStep(4);
                  }}
                  className="h-16 px-12 bg-amber-600 hover:bg-amber-700 text-white shadow-xl shadow-amber-600/10 rounded-2xl font-black uppercase tracking-widest text-[10px] border-none cursor-pointer"
                >
                  My Issue is Different, Continue Submission <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-12"
            >
              <div className="text-center space-y-3">
                <h2 className="text-4xl md:text-5xl font-black text-[#004d2c] tracking-tight font-display">One Final Look</h2>
                <p className="text-slate-500 font-medium max-w-lg mx-auto">Confirm coordinate layouts and descriptions prior to official authorization.</p>
              </div>

              <div className="bg-white rounded-[3rem] p-4 shadow-xl border border-slate-100 text-left">
                <div className="flex flex-col md:flex-row gap-12 p-8">
                  <div className="w-full md:w-[280px] aspect-[1/1.1] rounded-[2rem] bg-slate-50 overflow-hidden shadow-inner border border-slate-150 flex-shrink-0 flex items-center justify-center p-6 relative">
                    {formData.images.length > 0 ? (
                      <img src={formData.images[0]} alt="Submission Preview" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <AlertCircle className="w-12 h-12 text-[#004d2c]" />
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">No proof picture</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-grow space-y-6 py-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="category" category={formData.category as IssueCategory} />
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-[#004d2c]" />
                        {formData.location}, {formData.constituency}, {formData.county} ({formData.lat.toFixed(4)}, {formData.lng.toFixed(4)})
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight leading-snug">{formData.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed font-semibold italic overflow-hidden line-clamp-3">
                        "{formData.description}"
                      </p>
                    </div>

                    <div className="flex gap-3">
                      {formData.images.slice(1).map((img, i) => (
                        <div key={i} className="w-16 h-16 rounded-xl overflow-hidden shadow-sm border border-slate-150">
                          <img src={img} alt="Evidence" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-8">
                <Button variant="ghost" className="h-16 px-10 gap-2 font-black uppercase tracking-widest text-xs text-slate-400 border-none hover:bg-slate-50 cursor-pointer" onClick={() => setStep(3)}>
                  <ChevronLeft className="w-5 h-5" /> Edit Details
                </Button>
                <div className="flex items-center gap-6">
                   <p className="text-xs font-black uppercase tracking-widest text-slate-400 hidden lg:block">Submit report live?</p>
                   <Button 
                    size="lg" 
                    onClick={handleSubmit}
                    className="h-16 px-12 gap-3 bg-[#004d2c] hover:bg-[#003820] text-white shadow-xl shadow-[#004d2c]/15 rounded-2xl font-black uppercase tracking-widest text-[10px] border-none"
                  >
                    <CheckCircle2 className="w-5 h-5" /> Submit Official Report
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 bg-[#004d2c] text-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-[#004d2c]/10 animate-in zoom-in duration-500">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight font-display">Report Received</h2>
              <p className="text-slate-500 text-lg max-w-md mx-auto mb-12 leading-relaxed font-semibold">
                Thank you, Raia. Your community issue has been successfully logged to our active coordinates queue database.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
                <Button size="lg" className="w-full sm:w-auto h-16 px-12 bg-[#004d2c] hover:bg-[#003820] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl" onClick={() => navigate('/dashboard')}>
                  Go To Dashboard
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-16 px-12 text-[10px] font-black uppercase tracking-widest rounded-2xl border-slate-200" onClick={() => navigate('/feed')}>
                  Browse Public Feed
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
