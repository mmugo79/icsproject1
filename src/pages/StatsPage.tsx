import * as React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, CheckCircle, Clock, Users, ArrowUpRight, ShieldAlert, Award, AlertCircle, Building, Droplet, Lightbulb, MapPin, Construction } from 'lucide-react';
import { getIssues } from '@/lib/db';
import { Issue, IssueCategory, IssueStatus } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { formatDistanceToNow } from 'date-fns';

export function StatsPage() {
  const [issues, setIssues] = React.useState<Issue[]>(getIssues());

  React.useEffect(() => {
    const handleUpdate = () => {
      setIssues(getIssues());
    };
    window.addEventListener('raia_issues_updated', handleUpdate);
    return () => {
      window.removeEventListener('raia_issues_updated', handleUpdate);
    };
  }, []);

  // Compute stats metrics dynamically
  const totalReports = issues.length;
  const inProgressReports = issues.filter(i => i.status === 'IN_PROGRESS').length;
  const resolvedReports = issues.filter(i => i.status === 'RESOLVED').length;
  const pendingReports = issues.filter(i => i.status === 'SUBMITTED' || i.status === 'REOPENED').length;

  const totalUpvotes = issues.reduce((acc, current) => acc + (current.upvotes || 0), 0);
  
  // Resolution percentage
  const resolutionPercentage = totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0;

  // Group by category counts
  const categoryCounts: Record<IssueCategory, number> = {
    WATER: 0,
    ROADS: 0,
    WASTE: 0,
    ELECTRICITY: 0
  };
  
  issues.forEach(issue => {
    if (categoryCounts[issue.category] !== undefined) {
      categoryCounts[issue.category]++;
    }
  });

  // Category percentage helper
  const getCategoryPercent = (cat: IssueCategory) => {
    if (totalReports === 0) return 0;
    return Math.round((categoryCounts[cat] / totalReports) * 100);
  };

  // Group by county counts
  const countyCounts: Record<string, number> = {};
  issues.forEach(issue => {
    const county = issue.location.county || 'Unspecified';
    countyCounts[county] = (countyCounts[county] || 0) + 1;
  });

  const sortedCounties = Object.entries(countyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const getCountyPercent = (count: number) => {
    if (totalReports === 0) return 0;
    return Math.round((count / totalReports) * 100);
  };

  // Upvoted leaderboard
  const leadingIssues = [...issues]
    .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
    .slice(0, 3);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#fafcfa] font-sans text-slate-900">
      <div className="max-w-6xl mx-auto px-6 space-y-12">
        
        {/* Editorial Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex p-3 rounded-2xl bg-[#004d2c]/5 text-[#004d2c] border border-[#004d2c]/10">
            <TrendingUp className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#004d2c] tracking-tight font-display">
            Transparency Stats
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto font-medium">
            Dynamic, audit-friendly statistics of civic issue reporting, county resolutions, and citizen backings in Kenya.
          </p>
        </div>

        {/* Pulse Stats Board */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white border border-slate-150 p-6 rounded-3xl flex flex-col justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Platform Reports</p>
              <h3 className="text-4xl font-extrabold text-slate-800 tracking-tight mt-2">{totalReports}</h3>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-4 pt-4 border-t border-slate-50">Cumulative reports logged</p>
          </div>

          <div className="bg-white border border-slate-150 p-6 rounded-3xl flex flex-col justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Fully Resolved</p>
              <h3 className="text-4xl font-extrabold text-emerald-600 tracking-tight mt-2">{resolvedReports}</h3>
            </div>
            <p className="text-xs font-semibold text-emerald-800/60 mt-4 pt-4 border-t border-slate-50">
              <span className="font-bold">{resolutionPercentage}%</span> Resolution Index
            </p>
          </div>

          <div className="bg-white border border-slate-150 p-6 rounded-3xl flex flex-col justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#004d2c]">Working / In Progress</p>
              <h3 className="text-4xl font-extrabold text-[#004d2c] tracking-tight mt-2">{inProgressReports}</h3>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-4 pt-4 border-t border-slate-50">County crews dispatched</p>
          </div>

          <div className="bg-white border border-slate-150 p-6 rounded-3xl flex flex-col justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Citizen Backing</p>
              <h3 className="text-4xl font-extrabold text-amber-600 tracking-tight mt-2">{totalUpvotes}</h3>
            </div>
            <p className="text-xs font-semibold text-amber-800/60 mt-4 pt-4 border-t border-slate-50">Collective upvotes applied</p>
          </div>

        </div>

        {/* Categories and Counties visual blocks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Category Pillar */}
          <div className="bg-white border border-slate-150 rounded-[2.5rem] p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-xl font-extrabold text-[#004d2c] tracking-tight">Vulnerability Pillars</h3>
              <p className="text-slate-400 text-xs font-semibold">Classification profile of civic grievances</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-2">🛣️ Roads & Transport</span>
                  <span>{categoryCounts.ROADS} reports ({getCategoryPercent('ROADS')}%)</span>
                </div>
                <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-700 rounded-full" style={{ width: `${getCategoryPercent('ROADS')}%` }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-2">🚰 Water & Sanitation</span>
                  <span>{categoryCounts.WATER} reports ({getCategoryPercent('WATER')}%)</span>
                </div>
                <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden">
                  <div className="h-full bg-[#055a36] rounded-full" style={{ width: `${getCategoryPercent('WATER')}%` }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-2">💡 Electricity & Lighting</span>
                  <span>{categoryCounts.ELECTRICITY} reports ({getCategoryPercent('ELECTRICITY')}%)</span>
                </div>
                <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-600 rounded-full" style={{ width: `${getCategoryPercent('ELECTRICITY')}%` }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-2">🗑️ Waste Management</span>
                  <span>{categoryCounts.WASTE} reports ({getCategoryPercent('WASTE')}%)</span>
                </div>
                <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-600 rounded-full" style={{ width: `${getCategoryPercent('WASTE')}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Regional County Leaderboard */}
          <div className="bg-white border border-slate-150 rounded-[2.5rem] p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-xl font-extrabold text-[#004d2c] tracking-tight">County Activity Intensity</h3>
              <p className="text-slate-400 text-xs font-semibold">Geographical hotbeds of citizen reporting</p>
            </div>

            <div className="space-y-5">
              {sortedCounties.length > 0 ? (
                sortedCounties.map(([county, count]) => (
                  <div key={county} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1.5 font-extrabold text-slate-800">
                        <MapPin className="w-3.5 h-3.5 text-[#004d2c]" /> {county} County
                      </span>
                      <span>{count} reports ({getCountyPercent(count)}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#004d2c]/65 rounded-full" style={{ width: `${getCountyPercent(count)}%` }} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  No spatial logs logged yet.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Priority Leaderboard - Citizen Driven */}
        <div className="bg-white border border-slate-150 rounded-[2.5rem] p-8 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-extrabold text-[#004d2c] tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5" /> High-Priority Citizen Escalations
            </h3>
            <p className="text-slate-400 text-xs font-semibold">Active infrastructure reports backed with high citizen upvote counts</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {leadingIssues.length > 0 ? (
              leadingIssues.map((issue) => (
                <div 
                  key={issue.id}
                  className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex flex-col justify-between space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <Badge variant="category" category={issue.category} />
                    <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                      ▲ {issue.upvotes || 0} Backings
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-slate-800 leading-snug line-clamp-2 min-h-10">
                    {issue.title}
                  </h4>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-200/50 text-[10px] font-semibold text-slate-400">
                    <span>📍 {issue.location.constituency}, {issue.location.county}</span>
                    <Badge variant="status" status={issue.status} />
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-slate-400 text-xs font-bold uppercase tracking-wider">
                No active priority indicators.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
