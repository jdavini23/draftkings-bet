'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { XIcon, DownloadIcon, BookmarkIcon } from 'lucide-react';

interface OpportunitiesToolbarProps {
  filter: string;
  onClearFilter: () => void;
  selectedCount: number;
  onBulkExport: () => void;
  onBulkSave: () => void;
  totalOpportunitiesInFilter: number;
}

export function OpportunitiesToolbar({
  filter,
  onClearFilter,
  selectedCount,
  onBulkExport,
  onBulkSave,
  totalOpportunitiesInFilter,
}: OpportunitiesToolbarProps) {
  const showFilterChip = filter !== 'all';
  const showBulkActionBar = selectedCount > 0;

  if (!showFilterChip && !showBulkActionBar) {
    return null; // Render nothing if no active filter and no selection
  }

  return (
    <div className="mb-4 py-3 px-4 border rounded-lg bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      {/* Filter Chips Section */}
      {showFilterChip && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Active filter:</span>
          <Badge variant="secondary" className="capitalize">
            {filter} ({totalOpportunitiesInFilter} found)
            <Button
              variant="ghost"
              size="icon"
              onClick={onClearFilter}
              className="ml-1 h-5 w-5 p-0 hover:bg-gray-300 rounded-full"
              aria-label="Clear filter"
            >
              <XIcon className="h-3 w-3" />
            </Button>
          </Badge>
        </div>
      )}

      {/* Spacer for when only filter chip is shown */}
      {showFilterChip && !showBulkActionBar && <div className="flex-grow"></div>}

      {/* Bulk Action Bar Section */}
      {showBulkActionBar && (
        <div className="flex items-center gap-2 sm:ml-auto">
          <span className="text-sm font-medium text-gray-700">
            {selectedCount} selected
          </span>
          <Button variant="outline" size="sm" onClick={onBulkExport}>
            <DownloadIcon className="mr-2 h-4 w-4" />
            Export Selected
          </Button>
          <Button variant="outline" size="sm" onClick={onBulkSave}>
            <BookmarkIcon className="mr-2 h-4 w-4" />
            Save Selected
          </Button>
        </div>
      )}
    </div>
  );
}
