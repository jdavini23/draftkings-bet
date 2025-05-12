'use client';

import React, { ReactElement } from 'react'; 
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  BookmarkIcon,
  ExternalLinkIcon,
  InfoIcon,
  ChevronDown, 
} from 'lucide-react';
import { Bet } from '@/types';
import { ConfidenceBadge, ConfidenceLevel } from './ConfidenceBadge';

interface OpportunitiesTableProps {
  loading: boolean;
  opportunities: Bet[];
  visibleColumns: {
    odds: boolean;
    edge_percentage: boolean;
    expected_value: boolean;
    event_time: boolean;
    confidence: boolean;
    actions: boolean;
  };
  sortColumn: keyof Bet | null; 
  sortDirection: 'asc' | 'desc';
  handleSort: (column: keyof Bet) => void;
  getSortIcon: (column: keyof Bet) => React.ReactNode;
  handleRowClick: (betId: string) => void;
  selectedIds: string[];
  allSelected: boolean;
  handleSelectRow: (id: string) => void;
  handleSelectAll: () => void;
}

export function OpportunitiesTable({
  loading,
  opportunities,
  visibleColumns,
  sortColumn,
  sortDirection,
  handleSort,
  getSortIcon,
  handleRowClick,
  selectedIds,
  allSelected,
  handleSelectRow,
  handleSelectAll,
}: OpportunitiesTableProps) {
  const router = useRouter(); 

  if (loading) {
    return (
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow className="sticky top-0 bg-white z-10">
              <TableHead className="w-8"><input type="checkbox" disabled /></TableHead>
              <TableHead>Sport</TableHead>
              <TableHead>Match</TableHead>
              <TableHead>Market/Selection</TableHead>
              {visibleColumns.odds && <TableHead>DK Odds</TableHead>}
              {visibleColumns.edge_percentage && <TableHead>Edge %</TableHead>}
              {visibleColumns.expected_value && <TableHead>EV</TableHead>}
              {visibleColumns.event_time && <TableHead>Time</TableHead>}
              {visibleColumns.confidence && (
                <TableHead onClick={() => handleSort('confidence')} className="cursor-pointer">
                  <div className="flex items-center">
                    Confidence {getSortIcon('confidence')}
                  </div>
                </TableHead>
              )}
              {visibleColumns.actions && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, idx) => (
              <TableRow key={idx}>
                {[...Array(Object.values(visibleColumns).filter(Boolean).length + 4)].map((_, cellIdx) => ( 
                  <TableCell key={cellIdx}>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto max-h-[500px] overflow-y-auto w-full">
      <Table>
        <TableHeader>
          <TableRow className="sticky top-0 bg-gray-50 z-10 rounded-t-lg">
            <TableHead className="w-8">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleSelectAll}
                aria-label="Select all visible opportunities"
              />
            </TableHead>
            <TableHead
              onClick={() => handleSort('sport')}
              className={`cursor-pointer ${sortColumn === 'sport' ? 'font-bold bg-gray-100' : ''}`}
            >
              Sport {getSortIcon('sport')}
            </TableHead>
            <TableHead
              onClick={() => handleSort('match')}
              className={`cursor-pointer ${sortColumn === 'match' ? 'font-bold bg-gray-100' : ''}`}
            >
              Match {getSortIcon('match')}
            </TableHead>
            <TableHead>Market/Selection</TableHead>
            {visibleColumns.odds && (
              <TableHead
                onClick={() => handleSort('book_odds')}
                className={`cursor-pointer ${sortColumn === 'book_odds' ? 'font-bold bg-gray-100' : ''}`}
              >
                DK Odds {getSortIcon('book_odds')}
              </TableHead>
            )}
            {visibleColumns.edge_percentage && (
              <TableHead
                onClick={() => handleSort('edge_percentage')}
                className={`cursor-pointer ${sortColumn === 'edge_percentage' ? 'font-bold bg-gray-100' : ''}`}
              >
                Edge % {getSortIcon('edge_percentage')}
              </TableHead>
            )}
            {visibleColumns.expected_value && (
              <TableHead
                onClick={() => handleSort('expected_value')}
                className={`cursor-pointer ${sortColumn === 'expected_value' ? 'font-bold bg-gray-100' : ''}`}
              >
                EV {getSortIcon('expected_value')}
              </TableHead>
            )}
            {visibleColumns.event_time && (
              <TableHead
                onClick={() => handleSort('event_time')}
                className={`cursor-pointer ${sortColumn === 'event_time' ? 'font-bold bg-gray-100' : ''}`}
              >
                Time {getSortIcon('event_time')}
              </TableHead>
            )}
            {visibleColumns.confidence && (
              <TableHead onClick={() => handleSort('confidence')} className="cursor-pointer">
                <div className="flex items-center">
                  Confidence {getSortIcon('confidence')}
                </div>
              </TableHead>
            )}
            {visibleColumns.actions && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {opportunities.length > 0 ? (
            opportunities.map((opportunity) => (
              <TableRow
                key={opportunity.id}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <TableCell onClick={(e) => e.stopPropagation()} className="w-8">
                   <input
                    type="checkbox"
                    checked={selectedIds.includes(opportunity.id)}
                    onChange={() => handleSelectRow(opportunity.id)}
                    aria-label={`Select opportunity ${opportunity.id}`}
                  />
                </TableCell>
                <TableCell onClick={() => handleRowClick(opportunity.id)}>{opportunity.sport}</TableCell>
                <TableCell onClick={() => handleRowClick(opportunity.id)}>{opportunity.match}</TableCell>
                <TableCell onClick={() => handleRowClick(opportunity.id)}>
                  <div>{opportunity.market}</div>
                  <div className="text-xs text-gray-500">{opportunity.selection}</div>
                </TableCell>
                {visibleColumns.odds && (
                  <TableCell onClick={() => handleRowClick(opportunity.id)}>
                    <span className="font-semibold">{opportunity.book_odds}</span>
                  </TableCell>
                )}
                {visibleColumns.edge_percentage && (
                  <TableCell onClick={() => handleRowClick(opportunity.id)}>
                    <span
                      className={opportunity.edge_percentage > 0 ? 'text-green-600' : 'text-red-600'}
                    >
                      {opportunity.edge_percentage.toFixed(2)}%
                    </span>
                  </TableCell>
                )}
                {visibleColumns.expected_value && (
                  <TableCell onClick={() => handleRowClick(opportunity.id)}>
                     {opportunity.expected_value}
                  </TableCell>
                )}
                {visibleColumns.event_time && (
                  <TableCell onClick={() => handleRowClick(opportunity.id)}>
                    {new Date(opportunity.event_time).toLocaleString()}
                  </TableCell>
                )}
                {visibleColumns.confidence && (
                  <TableCell>
                    <ConfidenceBadge confidence={opportunity.confidence as ConfidenceLevel} />
                  </TableCell>
                )}
                {visibleColumns.actions && (
                  <TableCell onClick={(e) => e.stopPropagation()}> 
                    <div className="flex items-center gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/bets/${opportunity.id}?tab=details`)}
                              aria-label="View details"
                            >
                              <InfoIcon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View Details</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => alert(`Bookmarking ${opportunity.id}`)} 
                              aria-label="Save opportunity"
                            >
                              <BookmarkIcon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Save Opportunity</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="More actions">
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`https://sportsbook.draftkings.com`} target="_blank" rel="noopener noreferrer" className="flex items-center w-full">
                              Open in DraftKings <ExternalLinkIcon className="ml-2 h-3 w-3" />
                            </Link>
                          </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => router.push(`/bets/${opportunity.id}?tab=similar`)}>
                            Find Similar Bets
                          </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => alert('Hide this opportunity (stub)')}>
                            Hide Opportunity
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 4} className="text-center">
                No opportunities found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
