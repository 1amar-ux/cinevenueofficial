import React from 'react';
import { Film, MapPin, Calendar, Search, RefreshCw } from 'lucide-react';

export interface EmptyStateProps {
  icon?: 'film' | 'location' | 'calendar' | 'search' | React.ReactNode;
  title: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export default function EmptyState({
  icon = 'film',
  title,
  subtitle,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  className = '',
}: EmptyStateProps) {
  const renderIcon = () => {
    if (typeof icon !== 'string') {
      return icon;
    }
    switch (icon) {
      case 'location':
        return <MapPin className="w-10 h-10 text-gold/80 animate-pulse" />;
      case 'calendar':
        return <Calendar className="w-10 h-10 text-gold/80" />;
      case 'search':
        return <Search className="w-10 h-10 text-gold/80" />;
      case 'film':
      default:
        return <Film className="w-10 h-10 text-gold/80" />;
    }
  };

  return (
    <div
      className={`text-center py-16 px-6 bg-[#121213]/80 border border-white/10 rounded-2xl max-w-xl mx-auto backdrop-blur-md shadow-2xl flex flex-col items-center justify-center space-y-4 ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center shadow-lg shadow-gold/5">
        {renderIcon()}
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg md:text-xl font-bold text-white tracking-wide font-display">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs md:text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {(actionText || secondaryActionText) && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {actionText && onAction && (
            <button
              onClick={onAction}
              className="px-5 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-lg shadow-gold/20 flex items-center gap-2 cursor-pointer border-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {actionText}
            </button>
          )}

          {secondaryActionText && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold tracking-wider transition-all duration-200 cursor-pointer"
            >
              {secondaryActionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
