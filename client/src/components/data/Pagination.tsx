import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center space-x-2 mt-6">
      <Button
        variant="ghost"
        size="sm"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="px-2"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>
      
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
            p === page
              ? 'bg-primary text-white'
              : 'text-charcoal hover:bg-aura'
          }`}
        >
          {p}
        </button>
      ))}

      <Button
        variant="ghost"
        size="sm"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="px-2"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
};
