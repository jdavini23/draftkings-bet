'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bet } from '@/types'; 
import { OpportunitiesTableColumnKey } from '../OpportunitiesHeaderControls'; 

export interface UseBetOpportunitiesTableProps {
  initialPageSize?: number;
  initialSortColumn?: keyof Bet;
  initialSortDirection?: 'asc' | 'desc';
}

export function useBetOpportunitiesTable({
  initialPageSize = 10,
  initialSortColumn = 'event_time',
  initialSortDirection = 'desc',
}: UseBetOpportunitiesTableProps = {}) {
  const [opportunities, setOpportunities] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [sortColumn, setSortColumn] = useState<keyof Bet>(initialSortColumn);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(
    initialSortDirection || 'asc'
  );

  // State for column visibility
  const [visibleColumns, setVisibleColumns] = useState<Record<OpportunitiesTableColumnKey, boolean>>({
    odds: true,
    edge_percentage: true,
    expected_value: true,
    event_time: true,
    confidence: true,
    actions: true,
  });

  const fetchBets = useCallback(async () => {
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
        setOpportunities([]);
        setTotalCount(0);
      } else {
        setOpportunities(data || []);
        setTotalCount(count || 0);
        if ((data?.length === 0 || !data) && page > 1) {
          setPage(1); // Reset to page 1 if current page has no data (e.g., after deletion or filter change)
        }
      }
    } catch (error: any) {
      console.error('Error fetching bets:', error);
      setOpportunities([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortColumn, sortDirection]);

  useEffect(() => {
    fetchBets();
  }, [fetchBets]);

  const handleSort = (column: keyof Bet) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setPage(1); // Reset to page 1 on sort change
  };

  // Handler for toggling column visibility
  const handleToggleColumn = useCallback((columnKey: OpportunitiesTableColumnKey) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  }, []);

  const pageCount = Math.ceil(totalCount / pageSize);

  return {
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
    fetchBets, // Exposing fetchBets directly if a manual refresh is needed
    visibleColumns,
    handleToggleColumn,
  };
}
