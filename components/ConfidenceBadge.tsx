'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export type ConfidenceLevel = 'high' | 'medium' | 'low' | string; // Allow other strings for flexibility

interface ConfidenceBadgeProps {
  confidence: ConfidenceLevel;
}

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  let badgeClass = '';
  let tooltipContent = '';
  let label = '';

  switch (confidence) {
    case 'high':
      badgeClass = 'bg-green-500 hover:bg-green-600';
      tooltipContent = 'High: Strong statistical edge and high confidence in this bet.';
      label = 'High';
      break;
    case 'medium':
      badgeClass = 'bg-yellow-500 hover:bg-yellow-600 text-black'; // Ensuring text visibility
      tooltipContent = 'Medium: Moderate edge and reasonable confidence in this bet.';
      label = 'Medium';
      break;
    case 'low':
      badgeClass = 'bg-red-500 hover:bg-red-600';
      tooltipContent = 'Low: Small edge and lower confidence in this bet.';
      label = 'Low';
      break;
    default:
      // Handle unknown confidence levels gracefully, or return null
      return <Badge className="bg-gray-400 hover:bg-gray-500">{confidence || 'N/A'}</Badge>; 
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={badgeClass}>{label}</Badge>
        </TooltipTrigger>
        <TooltipContent>{tooltipContent}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
