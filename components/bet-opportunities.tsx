'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  BookmarkIcon,
  ChevronDown,
  ExternalLinkIcon,
  FilterIcon,
  InfoIcon,
  ArrowDown,
  ArrowUp,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useBetOpportunitiesTable } from './hooks/useBetOpportunitiesTable';
import { Bet } from '@/types';
import { OpportunitiesTable } from './OpportunitiesTable';
import { OpportunitiesPagination } from './OpportunitiesPagination';
import { OpportunitiesHeaderControls, OpportunitiesTableColumnKey } from './OpportunitiesHeaderControls';
import { OpportunitiesToolbar } from './OpportunitiesToolbar';

const COLUMN_DEFINITIONS: { key: OpportunitiesTableColumnKey; label: string }[] = [
  { key: 'odds', label: 'Odds' },
  { key: 'edge_percentage', label: 'Edge %' },
  { key: 'expected_value', label: 'Expected Value' },
  { key: 'event_time', label: 'Event Time' },
  { key: 'confidence', label: 'Confidence' },
  { key: 'actions', label: 'Actions' },
];

export function BetOpportunities() {
  const [filter, setFilter] = useState('all');
  const [exportLoading, setExportLoading] = useState(false);
  const router = useRouter();

  const {
    opportunities,
    loading,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalCount,
    pageCount,
    sortColumn,
    sortDirection,
    handleSort,
    visibleColumns,
    handleToggleColumn,
  } = useBetOpportunitiesTable({
    initialPageSize: 10,
    initialSortColumn: 'event_time',
    initialSortDirection: 'desc',
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredOpportunities =
    filter === 'all'
      ? opportunities
      : opportunities.filter((opp) => opp.confidence === filter);

  const handleRowClick = (betId: string) => {
    router.push(`/bets/${betId}`);
  };

  const getSortIcon = (column: keyof Bet) => {
    if (column === sortColumn) {
      return sortDirection === "asc" ? (
        <ArrowUp className="h-4 w-4 transition-transform duration-200" />
      ) : (
        <ArrowDown className="h-4 w-4 transition-transform duration-200" />
      );
    }
    return null;
  };

  const handleExportCSV = async () => {
    setExportLoading(true);
    try {
      // Simulate export delay
      await new Promise((res) => setTimeout(res, 1200));
      // TODO: Replace with actual export logic
      alert('CSV exported!'); // Replace with toast if available
    } catch (e) {
      alert('Failed to export CSV.');
    } finally {
      setExportLoading(false);
    }
  };

  const allVisibleIds = filteredOpportunities.slice((page - 1) * pageSize, page * pageSize).map((opp) => opp.id);
  const allSelected = allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedIds.includes(id));
  const someSelected = selectedIds.length > 0;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(selectedIds.filter((id) => !allVisibleIds.includes(id)));
    } else {
      setSelectedIds(Array.from(new Set([...selectedIds, ...allVisibleIds])));
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleBulkExport = () => {
    alert(`Exporting ${selectedIds.length} selected opportunities (stub)`);
  };

  const handleBulkSave = () => {
    alert(`Saved ${selectedIds.length} selected opportunities (stub)`);
  };

  return (
    <Card className="shadow-lg border border-gray-200 rounded-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Profitable Betting Opportunities</CardTitle>
            <CardDescription>
              Opportunities with positive expected value based on our analysis.
            </CardDescription>
          </div>
          <OpportunitiesHeaderControls
            filter={filter}
            setFilter={setFilter}
            visibleColumns={visibleColumns}
            handleToggleColumn={handleToggleColumn}
            columnNames={COLUMN_DEFINITIONS}
          />
        </div>
      </CardHeader>
      <CardContent>
        <OpportunitiesToolbar
          filter={filter}
          onClearFilter={() => setFilter('all')}
          selectedCount={selectedIds.length}
          onBulkExport={handleBulkExport}
          onBulkSave={handleBulkSave}
          totalOpportunitiesInFilter={filteredOpportunities.length}
        />
        <OpportunitiesTable
          opportunities={filteredOpportunities}
          loading={loading}
          visibleColumns={visibleColumns}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          handleSort={handleSort}
          getSortIcon={getSortIcon}
          handleRowClick={handleRowClick}
          selectedIds={selectedIds}
          allSelected={allSelected}
          handleSelectRow={handleSelectRow}
          handleSelectAll={handleSelectAll}
        />
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-4 pt-4">
        <OpportunitiesPagination
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          totalCount={totalCount}
          pageCount={pageCount}
          loading={loading}
        />
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-600">
            {totalCount} opportunities found. Last updated: {new Date().toLocaleTimeString()}.
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportCSV}
              disabled={exportLoading}
              aria-label="Export to CSV"
            >
              {exportLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></span>
                  Exporting...
                </span>
              ) : (
                'Export to CSV'
              )}
            </Button>
            <Button
              onClick={() =>
                window.open('https://sportsbook.draftkings.com', '_blank')
              }
              aria-label="Open DraftKings"
            >
              Open in DraftKings
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
