import * as React from 'react';
import { motion } from 'motion/react';
import { MapPin, Search, Filter, Info, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getIssues } from '@/lib/db';
import { Issue, IssueCategory } from '@/types';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';

export function MapPage() {
  const [issues, setIssues] = React.useState<Issue[]>(getIssues());
  const [selectedCounty, setSelectedCounty] = React.useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'ALL' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [hoveredIssueId, setHoveredIssueId] = React.useState<string | null>(null);

  const mapInstanceRef = React.useRef<L.Map | null>(null);
  const mapContainerRef = React.useRef<HTMLDivElement | null>(null);
  const markersRef = React.useRef<Record<string, L.Marker>>({});
  const hasFocusedOnDeepLinkRef = React.useRef(false);

  const navigate = useNavigate();

  React.useEffect(() => {
    const handleUpdate = () => {
      setIssues(getIssues());
    };
    window.addEventListener('raia_issues_updated', handleUpdate);
    return () => {
      window.removeEventListener('raia_issues_updated', handleUpdate);
    };
  }, []);

  const getMarkerIcon = (category: string) => {
    let emoji = '📌';
    let bgColor = 'bg-slate-700 hover:bg-slate-800';
    
    if (category === 'WATER') {
      emoji = '🚰';
      bgColor = 'bg-[#055a36] hover:bg-[#04472b]';
    } else if (category === 'ROADS') {
      emoji = '🛣️';
      bgColor = 'bg-[#004d2c] hover:bg-[#003820]';
    } else if (category === 'WASTE') {
      emoji = '🗑️';
      bgColor = 'bg-slate-600 hover:bg-slate-500';
    } else if (category === 'ELECTRICITY') {
      emoji = '💡';
      bgColor = 'bg-amber-600 hover:bg-amber-700';
    }

    return L.divIcon({
      className: 'custom-leaflet-pin',
      html: `
        <div class="relative flex flex-col items-center">
          <div class="p-2 rounded-full border-2 border-white shadow-xl flex items-center justify-center transition-all duration-300 ${bgColor}">
            <span class="text-sm leading-none">${emoji}</span>
          </div>
          <div class="w-1.5 h-1.5 -mt-0.5 bg-white rotate-45 shadow-sm"></div>
        </div>
      `,
      iconSize: [30, 36],
      iconAnchor: [15, 36],
      popupAnchor: [0, -36]
    });
  };

  // Filter issues based on criteria
  const filteredIssues = issues.filter(issue => {
    const matchesCounty = selectedCounty === 'ALL' || issue.location.county.toLowerCase() === selectedCounty.toLowerCase();
    const matchesCategory = selectedCategory === 'ALL' || issue.category === selectedCategory;
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          issue.location.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'ALL' || 
                       (activeTab === 'IN_PROGRESS' && issue.status === 'IN_PROGRESS') ||
                       (activeTab === 'RESOLVED' && issue.status === 'RESOLVED');
    return matchesCounty && matchesCategory && matchesSearch && matchesTab;
  });

  // Initialize map once
  React.useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      // Point center around Kenya (Nairobi center)
      const map = L.map(mapContainerRef.current, {
        zoomControl: false
      }).setView([-1.2921, 36.8219], 10); 

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Add zoom control Custom Positioning
      L.control.zoom({ position: 'topright' }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync Markers dynamically
  React.useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old removed markers
    Object.keys(markersRef.current).forEach(id => {
      const isStillPresent = filteredIssues.some(issue => issue.id === id);
      if (!isStillPresent) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Add or update existing markers
    filteredIssues.forEach(issue => {
      const lat = issue.location.lat;
      const lng = issue.location.lng;
      if (typeof lat !== 'number' || typeof lng !== 'number') return;

      let marker = markersRef.current[issue.id];
      const icon = getMarkerIcon(issue.category);

      if (!marker) {
        marker = L.marker([lat, lng], { icon }).addTo(map);

        // Build premium styled popup containing View Issue link
        const container = document.createElement('div');
        container.className = 'p-1.5 min-w-[200px] text-xs font-sans text-slate-800 space-y-2';

        const header = document.createElement('div');
        header.className = 'flex justify-between items-center gap-1.5 mb-1';
        header.innerHTML = `
          <span class="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-[#004d2c]/10 text-[#004d2c]">
            ${issue.category}
          </span>
          <span class="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-slate-100 text-slate-600">
            ${issue.status}
          </span>
        `;
        container.appendChild(header);

        const title = document.createElement('div');
        title.className = 'font-bold text-slate-900 leading-tight';
        title.textContent = issue.title;
        container.appendChild(title);

        const addr = document.createElement('div');
        addr.className = 'text-[10px] text-slate-400 flex items-center gap-1 mt-1';
        addr.innerHTML = `📍 ${issue.location.constituency || ''}, ${issue.location.county}`;
        container.appendChild(addr);

        const upvotes = document.createElement('div');
        upvotes.className = 'text-[10px] font-bold text-emerald-600 mt-1';
        upvotes.textContent = `▲ ${issue.upvotes || 0} Supporters`;
        container.appendChild(upvotes);

        const btn = document.createElement('button');
        btn.className = 'w-full h-8 bg-[#004d2c] text-white hover:bg-[#003820] font-bold uppercase tracking-wider text-[9px] rounded-lg mt-2 cursor-pointer transition-colors border-none py-1';
        btn.textContent = 'View Issue';
        btn.onclick = () => {
          navigate(`/issue/${issue.id}`);
        };
        container.appendChild(btn);

        marker.bindPopup(container);
        
        // Hover synchronizations
        marker.on('mouseover', () => {
          setHoveredIssueId(issue.id);
        });

        markersRef.current[issue.id] = marker;
      } else {
        marker.setIcon(icon);
      }
    });

  }, [filteredIssues, navigate]);

  // Handle hovered elements
  React.useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    if (hoveredIssueId) {
      const issue = issues.find(i => i.id === hoveredIssueId);
      if (issue && typeof issue.location.lat === 'number') {
        mapInstanceRef.current.panTo([issue.location.lat, issue.location.lng]);
        const marker = markersRef.current[issue.id];
        if (marker && !marker.isPopupOpen()) {
          marker.openPopup();
        }
      }
    }
  }, [hoveredIssueId, issues]);

  // Handle deep linking from detailed view pages
  React.useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || filteredIssues.length === 0 || hasFocusedOnDeepLinkRef.current) return;

    const issueIdParam = new URLSearchParams(window.location.search).get('issueId');
    if (issueIdParam) {
      // Find the matched issue
      const matchedIssue = issues.find(i => i.id === issueIdParam);
      if (matchedIssue) {
        // Ensure filters do not hide the targeted issue
        if (selectedCounty !== 'ALL' || selectedCategory !== 'ALL' || searchQuery !== '' || activeTab !== 'ALL') {
          setSelectedCounty('ALL');
          setSelectedCategory('ALL');
          setActiveTab('ALL');
          setSearchQuery('');
          return; // Let the state trigger again
        }

        const marker = markersRef.current[issueIdParam];
        if (marker) {
          hasFocusedOnDeepLinkRef.current = true;
          // Zoom closely to that specific marker and pan to it
          map.setView([matchedIssue.location.lat, matchedIssue.location.lng], 14);
          
          setTimeout(() => {
            marker.openPopup();
            setHoveredIssueId(issueIdParam);
            
            // Scroll the card in the list view to highlight and scroll to it
            const cardElement = document.getElementById(`issue-card-${issueIdParam}`);
            if (cardElement) {
              cardElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }, 150);

          // Clear query parameters gracefully to prevent future scroll resets
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
        }
      }
    }
  }, [issues, filteredIssues, selectedCounty, selectedCategory, searchQuery, activeTab]);

  // Zoom on county selectors
  React.useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Skip automatic centering if there is a deep-linked issue on page load
    const hasFocusParam = new URLSearchParams(window.location.search).has('issueId');
    if (hasFocusParam && !hasFocusedOnDeepLinkRef.current) {
      return;
    }

    if (selectedCounty === 'ALL') {
      mapInstanceRef.current.setView([-1.2921, 36.8219], 9);
    } else {
      const countyCenters: Record<string, [number, number]> = {
        Nairobi: [-1.2921, 36.8219],
        Kisumu: [-0.1022, 34.7617],
        Kiambu: [-1.1714, 36.8356],
        Kajiado: [-1.8524, 36.7850],
        Machakos: [-1.5177, 37.2634],
        Wajir: [1.7471, 40.0596],
        Mandera: [3.9368, 41.8569],
        Mombasa: [-4.0435, 39.6682],
        Nakuru: [-0.3031, 36.0800],
        'Uasin Gishu': [0.5143, 35.2698]
      };
      const center = countyCenters[selectedCounty];
      if (center) {
        mapInstanceRef.current.setView(center, 11);
      }
    }
  }, [selectedCounty]);

  return (
    <div className="min-h-screen pt-16 bg-[#fafcfa] overflow-hidden flex flex-col font-sans text-slate-900">
      <div className="flex-grow relative h-[calc(100vh-64px)] flex">
        
        {/* Left Interactive Leaflet Map Container */}
        <div className="flex-grow h-full relative p-0 bg-slate-50 border-r border-[#dfeae0]/60 flex items-center justify-center overflow-hidden">
          
          <div ref={mapContainerRef} className="absolute inset-0 z-10 w-full h-full" />

          {/* Floating Search & Location Filters Top Bar */}
          <div className="absolute top-6 left-6 right-6 flex flex-col md:flex-row justify-between items-stretch gap-3 z-20 pointer-events-none">
            <div className="bg-white/95 backdrop-blur-md p-2 rounded-[2rem] border border-[#dfeae0] shadow-xl flex items-center gap-2 max-w-lg w-full pointer-events-auto">
              <Search className="w-5 h-5 text-slate-400 ml-4 flex-shrink-0" />
              <input 
                type="text" 
                placeholder="Search observation area..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 bg-transparent border-none outline-none focus:ring-0 text-sm font-bold text-[#0a1f11] placeholder-slate-400"
              />
            </div>

            <div className="flex gap-2 pointer-events-auto ml-auto">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-14 px-5 bg-white border border-[#dfeae0] rounded-2xl text-xs font-black uppercase tracking-wider shadow-xl outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="WATER">Water & Sanitation</option>
                <option value="ROADS">Roads & Transport</option>
                <option value="WASTE">Waste Management</option>
                <option value="ELECTRICITY">Electricity & Lighting</option>
              </select>

              {/* County fast selector */}
              <select
                value={selectedCounty}
                onChange={(e) => setSelectedCounty(e.target.value)}
                className="h-14 px-5 bg-white border border-[#dfeae0] rounded-2xl text-xs font-black uppercase tracking-wider shadow-xl outline-none"
              >
                <option value="ALL">All Counties</option>
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
            </div>
          </div>

          {/* Regional Legend bottom left */}
          <div className="absolute bottom-6 left-6 z-20 bg-white/95 backdrop-blur-md px-6 py-5 rounded-[2rem] border border-[#dfeae0] shadow-xl max-w-xs text-left">
            <p className="text-[9px] uppercase font-black text-slate-400 tracking-wider mb-3">Live Service Legend</p>
            <div className="space-y-2">
              <div className="flex items-center gap-3.5">
                <span className="w-3.5 h-3.5 rounded-full bg-[#004d2c] border border-white" />
                <span className="text-xs font-bold text-slate-600">Road Infrastructure</span>
              </div>
              <div className="flex items-center gap-3.5">
                <span className="w-3.5 h-3.5 rounded-full bg-[#055a36] border border-white" />
                <span className="text-xs font-bold text-slate-600">Water & Sewage</span>
              </div>
              <div className="flex items-center gap-3.5">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-600 border border-white" />
                <span className="text-xs font-bold text-slate-600">Power & Lights</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Live Sidebar Panel */}
        <div className="w-[370px] flex-shrink-0 h-full bg-white flex flex-col relative z-20 shadow-lg">
          
          {/* Sidebar Header */}
          <div className="p-6 border-b border-[#dfeae0]/60 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-[#004d2c] tracking-tight flex items-center gap-2 font-display">
                <AlertCircle className="w-5 h-5" /> Live Map Pulse
              </h2>
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            
            <p className="text-xs font-semibold text-slate-400">
              Interactive geographic feed of resolutions and pending actions.
            </p>

            {/* In-view Status Tabs */}
            <div className="grid grid-cols-3 bg-[#f4faf6] p-1 rounded-xl text-center">
              {(['ALL', 'IN_PROGRESS', 'RESOLVED'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    activeTab === tab 
                      ? 'bg-[#004d2c] text-white' 
                      : 'text-[#3e5243] hover:bg-[#edf2ed]'
                  }`}
                >
                  {tab === 'ALL' ? 'All' : tab.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* List items */}
          <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {filteredIssues.length > 0 ? (
              filteredIssues.map((issue) => (
                <div 
                  key={issue.id} 
                  id={`issue-card-${issue.id}`}
                  onMouseEnter={() => setHoveredIssueId(issue.id)}
                  onMouseLeave={() => setHoveredIssueId(null)}
                  onClick={() => {
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.setView([issue.location.lat, issue.location.lng], 13);
                      markersRef.current[issue.id]?.openPopup();
                    }
                  }}
                  className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer text-left relative overflow-hidden flex flex-col justify-between ${
                    hoveredIssueId === issue.id 
                      ? 'bg-[#004d2c]/5 border-[#004d2c]/30 shadow-md translate-x-1' 
                      : 'bg-[#fbfbfa] border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <Badge variant="category" category={issue.category} />
                    <span className="text-[9px] font-bold text-slate-400 uppercase">
                      {format(new Date(issue.createdAt), 'MMM dd')}
                    </span>
                  </div>

                  <h4 className="text-sm font-extrabold text-slate-800 tracking-tight mb-2 truncate leading-snug line-clamp-2 max-h-10 text-ellipsis whitespace-normal">
                    {issue.title}
                  </h4>

                  <div className="flex justify-between items-center pt-2.5 border-t border-slate-50 mt-1.5">
                    <p className="text-[10px] text-[#3e5243] font-bold truncate flex items-center gap-1 max-w-[150px]">
                      <MapPin className="w-3.5 h-3.5 text-[#004d2c] flex-shrink-0" /> {issue.location.address.split(',')[0]}
                    </p>
                    <Badge variant="status" status={issue.status} />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No match in this focus</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
