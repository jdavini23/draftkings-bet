'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { FilterIcon, ChevronDown } from 'lucide-react';

// Define the specific keys for table columns
export type OpportunitiesTableColumnKey = 
  | "odds"
  | "edge_percentage"
  | "expected_value"
  | "event_time"
  | "confidence"
  | "actions";

interface OpportunitiesHeaderControlsProps {
  filter: 'all' | 'low' | 'medium' | 'high';
  setFilter: (newFilter: 'all' | 'low' | 'medium' | 'high') => void;
  visibleColumns: Record<OpportunitiesTableColumnKey, boolean>;
  handleToggleColumn: (columnKey: OpportunitiesTableColumnKey) => void;
  columnNames: { key: OpportunitiesTableColumnKey; label: string }[];
}

export function OpportunitiesHeaderControls({
  filter,
  setFilter,
  visibleColumns,
  handleToggleColumn,
  columnNames,
}: OpportunitiesHeaderControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" aria-label="Filter opportunities">
            <FilterIcon className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Filter by Confidence</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setFilter('all')}
            className={filter === 'all' ? 'bg-accent' : ''}
          >
            All
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setFilter('high')}
            className={filter === 'high' ? 'bg-accent' : ''}
          >
            High
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setFilter('medium')}
            className={filter === 'medium' ? 'bg-accent' : ''}
          >
            Medium
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setFilter('low')}
            className={filter === 'low' ? 'bg-accent' : ''}
          >
            Low
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" aria-label="Toggle column visibility">
            Columns <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {columnNames.map((col) => (
            <DropdownMenuCheckboxItem
              key={col.key}
              checked={visibleColumns[col.key]}
              onCheckedChange={() => handleToggleColumn(col.key)}
            >
              {col.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
