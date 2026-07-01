
import { Issue } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

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
  AlertCircle,
} from 'lucide-react';

interface IssueCardProps {
  issue: Issue;
}

/* ---------------------------------- */
/* Category Icon Mapping */
/* ---------------------------------- */

const categoryIcons = {
  ROADS: Construction,
  WATER: Droplet,
  ELECTRICITY: Zap,
  WASTE: Trash2,
};

export function IssueCard({ issue }: IssueCardProps) {
  const {
    id,
    title,
    description,
    category,
    status,
    images,
    createdAt,
    location,
    upvotes,
    commentsCount,
  } = issue;

  const hasImage = Boolean(images?.[0]);

  const Icon =
    categoryIcons[category as keyof typeof categoryIcons] || AlertCircle;

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-[#004d2c]/30 hover:shadow-lg">
      
      {/* ---------------------------------- */}
      {/* Header Section */}
      {/* ---------------------------------- */}

      <div className="relative aspect-[16/10] overflow-hidden">
        {hasImage ? (
          <img
            src={images[0]}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-[#ccebda]/20 to-[#edf2ed] p-6">
            
            {/* Background Pattern */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  'radial-gradient(#004d2c 1.5px, transparent 1.5px)',
                backgroundSize: '16px 16px',
              }}
            />

            {/* Fallback Content */}
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-[#edf2ed] bg-white shadow-lg shadow-[#004d2c]/5">
                <Icon className="h-12 w-12 text-[#004d2c]" />
              </div>

              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                {category} Report
              </span>
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute left-4 top-4">
          <Badge
            variant="status"
            status={status}
            className="border border-white/50 shadow-lg"
          />
        </div>
      </div>

      {/* ---------------------------------- */}
      {/* Body Section */}
      {/* ---------------------------------- */}

      <CardContent className="flex flex-grow flex-col justify-between p-8">
        <div className="space-y-4">
          
          {/* Meta */}
          <div className="flex items-center gap-3">
            <Badge variant="category" category={category} />

            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <Clock className="h-3.5 w-3.5" />

              <span>
                {formatDistanceToNow(new Date(createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>

          {/* Title */}
          <h3 className="line-clamp-2 text-xl font-extrabold leading-snug tracking-tight text-slate-900 transition-colors group-hover:text-[#004d2c]">
            {title}
          </h3>

          {/* Description */}
          <p className="line-clamp-2 text-sm font-medium leading-relaxed text-slate-500">
            {description}
          </p>
        </div>

        {/* Location */}
        <div className="mt-6 flex items-center gap-2 border-t border-slate-50 pt-6 text-xs font-bold text-slate-400">
          <MapPin className="h-4 w-4 flex-shrink-0 text-[#004d2c]" />

          <span className="truncate">
            {location.address.split(',')[0]}
          </span>
        </div>
      </CardContent>

      {/* ---------------------------------- */}
      {/* Footer Section */}
      {/* ---------------------------------- */}

      <CardFooter className="flex items-center justify-between px-8 pb-8 pt-0">
        
        {/* Stats */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-slate-400">
            <ThumbsUp className="h-4 w-4" />
            <span className="text-xs font-black">{upvotes}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <MessageSquare className="h-4 w-4" />
            <span className="text-xs font-black">
              {commentsCount}
            </span>
          </div>
        </div>

        {/* Link Button */}
        <Link to={`/issue/${id}`}>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-100 text-slate-400 transition-all duration-300 group-hover:border-[#004d2c] group-hover:bg-[#004d2c] group-hover:text-white">
            <ChevronRight className="h-5 w-5" />
          </div>
        </Link>
      </CardFooter>
    </Card>
  );
}
