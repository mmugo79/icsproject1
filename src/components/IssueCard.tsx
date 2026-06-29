import { Issue } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  MapPin, 
  Clock, 
  ThumbsUp, 
  MessageSquare, 
  ChevronRight,
  Construction,
  Droplet,
  Zap,
  Trash2,
  Shield,
  Heart,
  Leaf,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface IssueCardProps {
  issue: Issue;
}

export function IssueCard({ issue }: IssueCardProps) {
  const hasImage = issue.images && issue.images.length > 0 && issue.images[0];

  // Helper to get category icons for fallback displays
  const getCategoryIcon = () => {
    switch (issue.category) {
      case 'ROADS': return <Construction className="w-12 h-12 text-[#004d2c]" />;
      case 'WATER': return <Droplet className="w-12 h-12 text-[#055a36]" />;
      case 'ELECTRICITY': return <Zap className="w-12 h-12 text-amber-600" />;
      case 'WASTE': return <Trash2 className="w-12 h-12 text-slate-700" />;
      default: return <AlertCircle className="w-12 h-12 text-[#004d2c]" />;
    }
  };

  return (
    <Card className="flex flex-col h-full border border-slate-150 shadow-sm hover:shadow-lg hover:border-[#004d2c]/30 transition-all duration-300 group overflow-hidden rounded-[2.5rem] bg-white">
      {/* Dynamic Image Header with custom fallbacks */}
      <div className="relative aspect-[16/10] overflow-hidden select-none">
        {hasImage ? (
          <img 
            src={issue.images[0]} 
            alt={issue.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#ccebda]/20 to-[#edf2ed] flex items-center justify-center p-6 relative">
            {/* Grid overlay for details */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{ 
                   backgroundImage: 'radial-gradient(#004d2c 1.5px, transparent 1.5px)', 
                   backgroundSize: '16px 16px' 
                 }} 
            />
            <div className="flex flex-col items-center gap-3 relative z-10">
              <div className="w-20 h-20 bg-white border border-[#edf2ed] rounded-3xl flex items-center justify-center shadow-lg shadow-[#004d2c]/5">
                {getCategoryIcon()}
              </div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{issue.category} Report</span>
            </div>
          </div>
        )}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <Badge variant="status" status={issue.status} className="shadow-lg border border-white/50" />
        </div>
      </div>

      <CardContent className="flex-grow p-8 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant="category" category={issue.category} />
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-widest select-none">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}</span>
            </div>
          </div>

          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight line-clamp-2 group-hover:text-[#004d2c] transition-colors leading-snug">
            {issue.title}
          </h3>
          
          <p className="text-slate-500 text-sm line-clamp-2 font-medium leading-relaxed">
            {issue.description}
          </p>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold pt-6 border-t border-slate-50 mt-6">
          <MapPin className="w-4 h-4 flex-shrink-0 text-[#004d2c]" />
          <span className="truncate">{issue.location.address.split(',')[0]}</span>
        </div>
      </CardContent>

      <CardFooter className="px-8 pb-8 pt-0 flex items-center justify-between">
        <div className="flex items-center gap-6 select-none">
          <div className="flex items-center gap-1.5 text-slate-400">
            <ThumbsUp className="w-4 h-4" />
            <span className="text-xs font-black">{issue.upvotes}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <MessageSquare className="w-4 h-4" />
            <span className="text-xs font-black">{issue.commentsCount}</span>
          </div>
        </div>

        <Link to={`/issue/${issue.id}`}>
          <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#004d2c] group-hover:text-white group-hover:border-[#004d2c] transition-all duration-300">
            <ChevronRight className="w-5 h-5" />
          </div>
        </Link>
      </CardFooter>
    </Card>
  );
}
