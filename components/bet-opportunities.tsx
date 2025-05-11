'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination"
import { ArrowDown, ArrowUp } from "lucide-react"
import { ChevronsLeft, ChevronsRight } from "lucide-react"

export interface Bet {
  id: string;
  sport: string;
  match: string;
  market: string;
  selection: string;
  odds: string;
  book_odds: string;
  edge_percentage: number;
  expected_value: string;
  event_time: string;
  confidence: string;
  status: string;
  result: string | null;
}

export function BetOpportunities() {
  const [filter, setFilter] = useState('all');
  const [opportunities, setOpportunities] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [sortColumn, setSortColumn] = useState<keyof Bet>("event_time");
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc");
  const [visibleColumns, setVisibleColumns] = useState({
    odds: true,
    edge_percentage: true,
    expected_value: true,
    event_time: true,
    confidence: true,
    actions: true,
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchBets = async () => {
      setLoading(true);

      try {
        const response = await fetch(
          `/api/get-bets?page=${page}&pageSize=${pageSize}&sortColumn=${sortColumn}&sortDirection=${sortDirection}`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch bets: ${response.status}`);
        }
        const { data, error, count } = await response.json();

        if (error) {
          console.error('Error fetching bets:', error);
        } else {
          console.log('Bets fetched successfully:', data);
          setOpportunities(data || []);
          setTotalCount(count || 0);
          if ((data?.length === 0 || !data) && page > 1) {
            setPage(1);
          }
        }
      } catch (error: any) {
        console.error('Error fetching bets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBets();
  }, [page, pageSize, sortColumn, sortDirection]);

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className="bg-green-500">High</Badge>
              </TooltipTrigger>
              <TooltipContent>High: Strong statistical edge and high confidence in this bet.</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case 'medium':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className="bg-yellow-500">Medium</Badge>
              </TooltipTrigger>
              <TooltipContent>Medium: Moderate edge and reasonable confidence in this bet.</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case 'low':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className="bg-red-500">Low</Badge>
              </TooltipTrigger>
              <TooltipContent>Low: Small edge and lower confidence in this bet.</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
    }
  };

  const filteredOpportunities =
    filter === 'all'
      ? opportunities
      : opportunities.filter((opp) => opp.confidence === filter);

  const handleRowClick = (betId: string) => {
    router.push(`/bets/${betId}`);
  };

  const pageCount = Math.ceil(totalCount / pageSize);

  const handleSort = (column: keyof Bet) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
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

  const handleToggleColumn = (col: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [col]: !prev[col] }));
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
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" aria-label="Filter opportunities">
                  <FilterIcon className="mr-2 h-4 w-4" />
                  Filter
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Confidence</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilter('all')}>
                  All Opportunities
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('high')}>
                  High Confidence
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('medium')}>
                  Medium Confidence
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('low')}>
                  Low Confidence
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Column Visibility Selector */}
        <div className="mb-4 flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" aria-label="Select visible columns">
                Columns
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Show Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={visibleColumns.odds} onChange={() => handleToggleColumn('odds')} /> DK Odds
                </label>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={visibleColumns.edge_percentage} onChange={() => handleToggleColumn('edge_percentage')} /> Edge %
                </label>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={visibleColumns.expected_value} onChange={() => handleToggleColumn('expected_value')} /> EV
                </label>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={visibleColumns.event_time} onChange={() => handleToggleColumn('event_time')} /> Time
                </label>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={visibleColumns.confidence} onChange={() => handleToggleColumn('confidence')} /> Confidence
                </label>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={visibleColumns.actions} onChange={() => handleToggleColumn('actions')} /> Actions
                </label>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* Filter Chips */}
        {filter !== 'all' && (
          <div className="mb-4 flex items-center gap-2">
            <Badge className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700">
              {filter.charAt(0).toUpperCase() + filter.slice(1)} Confidence
              <Button
                size="icon"
                variant="ghost"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => setFilter('all')}
                aria-label="Clear filter"
              >
                ×
              </Button>
            </Badge>
          </div>
        )}
        {/* Bulk Action Bar */}
        {someSelected && (
          <div className="mb-2 flex items-center gap-2 bg-blue-50 border border-blue-200 rounded px-4 py-2">
            <span className="font-medium text-blue-700">{selectedIds.length} selected</span>
            <Button size="sm" variant="outline" onClick={handleBulkExport}>Export Selected</Button>
            <Button size="sm" variant="outline" onClick={handleBulkSave}>Save Selected</Button>
            <Button size="icon" variant="ghost" onClick={() => setSelectedIds([])} aria-label="Clear selection">×</Button>
          </div>
        )}
        {loading ? (
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="sticky top-0 bg-white z-10">
                  <TableHead>Sport</TableHead>
                  <TableHead>Match</TableHead>
                  <TableHead>Market/Selection</TableHead>
                  <TableHead>DK Odds</TableHead>
                  <TableHead>Edge %</TableHead>
                  <TableHead>EV</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, idx) => (
                  <TableRow key={idx}>
                    {Array.from({ length: 9 }).map((_, cellIdx) => (
                      <TableCell key={cellIdx}>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
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
                    onClick={() => handleSort("sport")}
                    className={`cursor-pointer ${sortColumn === "sport" ? "font-bold bg-gray-100" : ""}`}
                  >
                    Sport {getSortIcon("sport")}
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("match")}
                    className={`cursor-pointer ${sortColumn === "match" ? "font-bold bg-gray-100" : ""}`}
                  >
                    Match {getSortIcon("match")}
                  </TableHead>
                  <TableHead>Market/Selection</TableHead>
                  {visibleColumns.odds && (
                    <TableHead
                      onClick={() => handleSort("odds")}
                      className={`cursor-pointer ${sortColumn === "odds" ? "font-bold bg-gray-100" : ""}`}
                    >
                      DK Odds {getSortIcon("odds")}
                    </TableHead>
                  )}
                  {visibleColumns.edge_percentage && (
                    <TableHead
                      onClick={() => handleSort("edge_percentage")}
                      className={`cursor-pointer ${sortColumn === "edge_percentage" ? "font-bold bg-gray-100" : ""}`}
                    >
                      Edge % {getSortIcon("edge_percentage")}
                    </TableHead>
                  )}
                  {visibleColumns.expected_value && (
                    <TableHead className="hidden md:table-cell">EV</TableHead>
                  )}
                  {visibleColumns.event_time && (
                    <TableHead
                      onClick={() => handleSort("event_time")}
                      className={`cursor-pointer ${sortColumn === "event_time" ? "font-bold bg-gray-100" : ""}`}
                    >
                      Time {getSortIcon("event_time")}
                    </TableHead>
                  )}
                  {visibleColumns.confidence && <TableHead>Confidence</TableHead>}
                  {visibleColumns.actions && <TableHead className="hidden md:table-cell">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOpportunities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center gap-3">
                        <InfoIcon className="h-8 w-8 text-gray-400 mb-2" />
                        <div className="text-lg font-semibold text-gray-600">No betting opportunities found</div>
                        <div className="text-gray-500 mb-2">Try fetching the latest odds or adjusting your filters.</div>
                        <Button variant="outline" onClick={() => window.location.reload()}>
                          Fetch Latest Odds
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOpportunities.slice((page - 1) * pageSize, page * pageSize).map((opportunity) => (
                    <TableRow
                      key={opportunity.id}
                      className="cursor-pointer group transition-colors duration-150 hover:bg-blue-50/80 focus-within:bg-blue-100 text-sm md:text-base"
                      onClick={() => handleRowClick(opportunity.id)}
                      tabIndex={0}
                      role="row"
                      aria-label={`View details for ${opportunity.match} - ${opportunity.market}`}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleRowClick(opportunity.id);
                        }
                      }}
                    >
                      <TableCell role="cell" className="w-8" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(opportunity.id)}
                          onChange={() => handleSelectRow(opportunity.id)}
                          aria-label={`Select opportunity for ${opportunity.match}`}
                          onClick={e => e.stopPropagation()}
                        />
                      </TableCell>
                      <TableCell role="cell">{opportunity.sport}</TableCell>
                      <TableCell role="cell">{opportunity.match}</TableCell>
                      <TableCell role="cell">
                        <div>
                          <div className="font-medium">{opportunity.market}</div>
                          <div className="text-xs md:text-sm text-muted-foreground">
                            {opportunity.selection}
                          </div>
                        </div>
                      </TableCell>
                      {visibleColumns.odds && <TableCell role="cell">{opportunity.odds}</TableCell>}
                      {visibleColumns.edge_percentage && (
                        <TableCell role="cell" className="font-medium text-green-600">
                          {opportunity.edge_percentage}%
                        </TableCell>
                      )}
                      {visibleColumns.expected_value && (
                        <TableCell role="cell" className={`hidden md:table-cell font-semibold ${parseFloat(opportunity.expected_value) > 0 ? 'text-green-600' : parseFloat(opportunity.expected_value) < 0 ? 'text-red-500' : 'text-gray-500'}`}>{opportunity.expected_value}</TableCell>
                      )}
                      {visibleColumns.event_time && (
                        <TableCell role="cell">
                          {new Date(opportunity.event_time).toLocaleString()}
                        </TableCell>
                      )}
                      {visibleColumns.confidence && (
                        <TableCell role="cell">
                          {getConfidenceBadge(opportunity.confidence)}
                        </TableCell>
                      )}
                      {visibleColumns.actions && (
                        <TableCell role="cell" className="hidden md:table-cell" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="outline" size="sm" aria-label="Save opportunity">
                                    <BookmarkIcon className="h-4 w-4" />
                                    <span className="sr-only">Save</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Save Opportunity</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Link href={`/bets/${opportunity.id}`} passHref aria-label="View opportunity details">
                                    <Button variant="outline" size="sm" aria-label="View details">
                                      <ExternalLinkIcon className="h-4 w-4" />
                                      <span className="sr-only">View</span>
                                    </Button>
                                  </Link>
                                </TooltipTrigger>
                                <TooltipContent>View Details</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
        <div className="flex items-center justify-center pt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={page === 1 ? (e) => e.preventDefault() : () => setPage(1)}
                aria-label="Go to first page"
                className={page === 1 ? 'pointer-events-none opacity-50' : ''}
              >
                <ChevronsLeft className="h-4 w-4" />
              </PaginationLink>
            </PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={page === 1 ? (e) => e.preventDefault() : () => setPage((prev) => Math.max(prev - 1, 1))}
              className={page === 1 ? 'pointer-events-none opacity-50' : ''}
            />
            <span className="mx-3 flex items-center text-sm text-gray-600 select-none">
              Page {page} of {pageCount}
            </span>
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  isActive={p === page}
                  onClick={() => setPage(p)}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationNext
              href="#"
              onClick={page === pageCount ? (e) => e.preventDefault() : () => setPage((prev) => Math.min(prev + 1, pageCount))}
              className={page === pageCount ? 'pointer-events-none opacity-50' : ''}
            />
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={page === pageCount ? (e) => e.preventDefault() : () => setPage(pageCount)}
                aria-label="Go to last page"
                className={page === pageCount ? 'pointer-events-none opacity-50' : ''}
              >
                <ChevronsRight className="h-4 w-4" />
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
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
      </CardFooter>
    </Card>
  );
}
