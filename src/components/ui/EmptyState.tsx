import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-[#CBD5E1] bg-white shadow-2xs">
      <div className="w-12 h-12 rounded-2xl bg-[#D1FAE5] text-[#047857] flex items-center justify-center mb-3.5 shadow-2xs">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-[#1F2937] mb-1">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-[#475569] max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-[#047857] hover:bg-[#065f46] rounded-xl transition-all shadow-xs focus-visible:ring-2 focus-visible:ring-[#047857] focus:outline-hidden whitespace-nowrap active:scale-[0.98]"
          >
            {actionLabel}
          </button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="px-4 py-2.5 text-xs font-semibold text-[#1F2937] bg-white border border-[#CBD5E1] hover:bg-[#D1FAE5]/40 rounded-xl transition-all shadow-2xs focus-visible:ring-2 focus-visible:ring-[#047857] focus:outline-hidden whitespace-nowrap active:scale-[0.98]"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
};
