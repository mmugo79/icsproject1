import * as React from 'react';
import { motion } from 'motion/react';
import { getIssues } from '@/lib/db';
import { IssueCard } from '@/components/IssueCard';
import { Button } from '@/components/ui/Button';
import { Search, Filter, SlidersHorizontal, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { IssueCategory, Issue } from '@/types';

const CATEGORIES: { label: string; value: IssueCategory | 'ALL' }[] = [
  { label: 'All Issues', value: 'ALL' },
  { label: 'Roads', value: 'ROADS' },
  { label: 'Water', value: 'WATER' }, 
  { label: 'Electricity', value: 'ELECTRICITY' },
  { label: 'Waste', value: 'WASTE' },
];
 
export function FeedPage() {
  const [issues, setIssues] = React.useState<Issue[]>(getIssues());
  const [selectedCategory, setSelectedCategory] = React.useState<IssueCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortBy, setSortBy] = React.useState<'recent' | 'priority'>('recent');

  React.useEffect(() => {
    const handleUpdate = () => {
      setIssues(getIssues());
    };
    window.addEventListener('raia_issues_updated', handleUpdate);
    return () => {
      window.removeEventListener('raia_issues_updated', handleUpdate);
    };
  }, []);

  const filteredIssues = issues.filter(issue => {
    const matchesCategory = selectedCategory === 'ALL' || issue.category === selectedCategory;
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          issue.location.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedIssues = [...filteredIssues].sort((a, b) => {
    if (sortBy === 'priority') {
      const upvoteDiff = (b.upvotes || 0) - (a.upvotes || 0);
      if (upvoteDiff !== 0) return upvoteDiff;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="min-h-screen pt-28 pb-20 bg-[#fbfbfa]">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#004d2c]/5 text-[#004d2c] font-black text-[10px] uppercase tracking-widest border border-[#004d2c]/10">
              Live Reports
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-[#004d2c] tracking-tight font-display">Community Feed</h1>
            <p className="text-slate-500 font-medium max-w-xl leading-relaxed">
              Explore civic concerns reported by Kenyan citizens. Stay informed, upvote, and track resolutions transparently.
            </p>
          </div>
          <Link to="/report">
            <Button className="h-16 px-8 gap-2 bg-[#004d2c] hover:bg-[#003820] text-white shadow-xl shadow-[#004d2c]/10 text-sm font-extrabold uppercase rounded-2xl border-none">
              <PlusCircle className="w-5 h-5" />
              New Report
            </Button>
          </Link>
        </div>

        {/* Filters and Search - Offset adjusted to top-20 to sit beautifully below the h-16 sticky header with z-40 */}
        <div className="sticky top-20 z-40 mb-16 p-3 bg-white/90 backdrop-blur-md border border-[#dfeae0] rounded-[2.5rem] shadow-sm flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by keywords or location..."
              className="w-full h-14 pl-14 pr-6 bg-[#f4faf6] border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#004d2c]/10 transition-all font-bold text-slate-700 placeholder-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide px-2 w-full md:w-auto custom-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`flex-shrink-0 px-6 h-14 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer select-none ${
                  selectedCategory === cat.value 
                    ? 'bg-[#004d2c] text-white border-[#004d2c] shadow-md shadow-[#004d2c]/10' 
                    : 'bg-white text-[#3e5243] border-slate-100 hover:border-slate-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="h-10 w-px bg-slate-100 hidden md:block mx-1" />

          {/* Interactive Sort Controller */}
          <div className="flex gap-1 bg-[#f4faf6] p-1.5 rounded-2xl border border-slate-100 flex-shrink-0 select-none w-full md:w-auto justify-center">
            <button
              onClick={() => setSortBy('recent')}
              className={`px-4 py-2.5 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                sortBy === 'recent' 
                  ? 'bg-white text-[#004d2c] shadow-sm' 
                  : 'text-slate-400 hover:text-slate-650'
              }`}
            >
              Recent Reports
            </button>
            <button
              onClick={() => setSortBy('priority')}
              className={`px-4 py-2.5 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                sortBy === 'priority' 
                  ? 'bg-[#004d2c] text-white shadow-sm' 
                  : 'text-slate-400 hover:text-[#004d2c]'
              }`}
            >
              🔥 Priority Focus
            </button>
          </div>
        </div>

        {/* Issues Grid */}
        {sortedIssues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {sortedIssues.map((issue, index) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <IssueCard issue={issue} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Filter className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2 font-display">No reports match your filters</h3>
            <p className="text-slate-500 font-semibold max-w-sm mx-auto">We couldn't find any issues matching those terms. Try adjusting your search query.</p>
            <Button 
              variant="outline" 
              className="mt-8 font-black uppercase tracking-widest text-[10px] h-12 border-slate-200 hover:bg-[#004d2c] hover:text-white hover:border-[#004d2c]"
              onClick={() => { setSelectedCategory('ALL'); setSearchQuery(''); }}
            >
              Reset Filters
            </Button>
          </div>
        )}

        {/* Load More */}
        {sortedIssues.length > 0 && (
          <div className="mt-24 text-center">
            <Button variant="outline" className="h-16 px-12 border-slate-200 text-slate-600 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-[#004d2c] hover:text-white hover:border-[#004d2c] transition-all">
              Load More Activity
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
