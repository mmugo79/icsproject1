import * as React from 'react';

interface PasswordStrengthProps {
  password: string;
}

export function evaluatePasswordStrength(password: string) {
  const reqs = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  if (!password) { 
    return {
      score: 'empty' as const,
      label: '',
      colorClass: 'text-slate-400',
      barColorClass: 'bg-slate-200',
      barWidthClass: 'w-0',
      requirements: reqs,
    };
  }

  const matchesAll = reqs.length && reqs.uppercase && reqs.lowercase && reqs.number && reqs.special;

  if (matchesAll) {
    return {
      score: 'strong' as const,
      label: 'Strong Password',
      colorClass: 'text-emerald-600',
      barColorClass: 'bg-emerald-500',
      barWidthClass: 'w-full',
      requirements: reqs,
    };
  }

  const hasLetters = /[a-zA-Z]/.test(password);
  const hasNumbers = reqs.number;
  if (reqs.length && hasLetters && hasNumbers) {
    return {
      score: 'medium' as const,
      label: 'Medium Password',
      colorClass: 'text-amber-500',
      barColorClass: 'bg-amber-500',
      barWidthClass: 'w-2/3',
      requirements: reqs,
    };
  }

  return {
    score: 'weak' as const,
    label: 'Weak Password',
    colorClass: 'text-red-500',
    barColorClass: 'bg-red-500',
    barWidthClass: 'w-1/3',
    requirements: reqs,
  };
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = evaluatePasswordStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2.5 space-y-2 animate-in fade-in duration-200">
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
        <span className="text-slate-400">Password Strength:</span>
        <span className={strength.colorClass}>{strength.label}</span>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${strength.barColorClass} transition-all duration-300 ${strength.barWidthClass}`}
        />
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <span className={strength.requirements.length ? 'text-emerald-500 font-bold' : 'text-slate-300'}>
            ✓
          </span>
          <span className={strength.requirements.length ? 'text-emerald-700' : 'text-slate-400'}>
            8+ characters
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <span className={strength.requirements.uppercase ? 'text-emerald-500 font-bold' : 'text-slate-300'}>
            ✓
          </span>
          <span className={strength.requirements.uppercase ? 'text-emerald-700' : 'text-slate-400'}>
            Uppercase letter
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <span className={strength.requirements.number ? 'text-emerald-500 font-bold' : 'text-slate-300'}>
            ✓
          </span>
          <span className={strength.requirements.number ? 'text-emerald-700' : 'text-slate-400'}>
            Number
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <span className={strength.requirements.special ? 'text-emerald-500 font-bold' : 'text-slate-300'}>
            ✓
          </span>
          <span className={strength.requirements.special ? 'text-emerald-700' : 'text-slate-400'}>
            Special character
          </span>
        </div>
      </div>
    </div>
  );
}
