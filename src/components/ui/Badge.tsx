import * as React from 'react';
import { cn } from '@/lib/utils';
import { IssueStatus, IssueCategory } from '@/types';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'status' | 'category' | 'outline';
  status?: IssueStatus;
  category?: IssueCategory; 
  className?: string;
}

export function Badge({ className, variant = 'default', status, category, ...props }: BadgeProps) {
  const statusColors: Record<IssueStatus, string> = {
    SUBMITTED: 'bg-slate-100 text-slate-800 border-slate-200',
    UNDER_REVIEW: 'bg-blue-50 text-blue-800 border-blue-200',
    IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-150',
    RESOLVED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    REOPENED: 'bg-rose-50 text-rose-700 border-rose-200',
    REJECTED: 'bg-red-50 text-red-700 border-red-150',
  };

  const categoryColors: Record<IssueCategory, string> = {
    ROADS: 'bg-slate-50 text-slate-700 border-slate-200',
    WATER: 'bg-blue-50 text-blue-700 border-blue-100',
    ELECTRICITY: 'bg-amber-50 text-amber-700 border-amber-100',
    WASTE: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg border px-3 py-1 text-[9px] font-black uppercase tracking-widest transition-all focus:outline-none',
        variant === 'default' && 'border-transparent bg-slate-900 text-white shadow-sm',
        variant === 'outline' && 'text-slate-600 border-slate-200 bg-white/50',
        variant === 'status' && status && statusColors[status],
        variant === 'category' && category && categoryColors[category],
        className
      )}
      {...props}
    />
  );
}
