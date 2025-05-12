'use client';

import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';

interface OpportunitiesPaginationProps {
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalCount: number;
  pageCount: number;
  loading?: boolean;
}

export function OpportunitiesPagination({
  page,
  setPage,
  pageSize,
  setPageSize,
  totalCount,
  pageCount,
  loading,
}: OpportunitiesPaginationProps) {
  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-gray-500">
        Showing {Math.min((page - 1) * pageSize + 1, totalCount)} - {Math.min(page * pageSize, totalCount)} of {totalCount} opportunities
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Rows per page:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => setPageSize(Number(value))}
            disabled={loading}
          >
            <SelectTrigger className="w-[70px] h-8">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(1)}
                disabled={page === 1 || loading}
                aria-label="Go to first page"
                className="h-8 w-8 p-0"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
            </PaginationItem>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage(Math.max(1, page - 1))}
                aria-disabled={page === 1 || loading}
                className={page === 1 || loading ? 'pointer-events-none opacity-50 h-8 px-3' : 'h-8 px-3'}
              />
            </PaginationItem>
            {
              // Dynamic pagination links (simplified example)
              // For a more robust solution, consider a pagination algorithm
              [...Array(pageCount)].map((_, i) => {
                const pageNum = i + 1;
                // Show current page, plus/minus 1-2 pages, and ellipses
                // This is a basic example; more complex logic might be needed for many pages
                if (pageCount <= 5 || (pageNum >= page -1 && pageNum <= page + 1) || pageNum === 1 || pageNum === pageCount) {
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        isActive={page === pageNum}
                        onClick={() => !loading && setPage(pageNum)}
                        className={loading ? 'pointer-events-none opacity-50 h-8 w-8' : 'h-8 w-8'}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                if (pageNum === page - 2 || pageNum === page + 2) {
                  return <PaginationItem key={`ellipsis-${pageNum}`}><span className="px-2 py-1 h-8">...</span></PaginationItem>;
                }
                return null;
              })
            }
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage(Math.min(pageCount, page + 1))}
                aria-disabled={page === pageCount || loading}
                className={page === pageCount || loading ? 'pointer-events-none opacity-50 h-8 px-3' : 'h-8 px-3'}
              />
            </PaginationItem>
            <PaginationItem>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(pageCount)}
                disabled={page === pageCount || loading}
                aria-label="Go to last page"
                className="h-8 w-8 p-0"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
