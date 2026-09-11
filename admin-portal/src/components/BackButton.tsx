import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  to?: string;
  label?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ to = '/', label = 'Back' }) => {
  return (
    <a
      href={to}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#061224] hover:bg-[#132647] text-slate-300 hover:text-white border border-[#1E2E4A] text-xs font-semibold transition cursor-pointer"
    >
      <ArrowLeft className="w-3.5 h-3.5" />
      <span>{label}</span>
    </a>
  );
};
