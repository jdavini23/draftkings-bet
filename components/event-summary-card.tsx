import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDisplayDateTime } from "@/lib/utils";
import { 
  Dribbble, 
  Shield, 
  Zap, 
  Activity, 
  Gem, 
  Goal
} from "lucide-react";
import type React from 'react';

// Define a specific interface for the data this component needs
interface BetSummaryData {
  sport: string;
  match: string;
  event_time: string; 
  status: string;
  result: string | null;
}

// Helper function to get sport icon
const getSportIcon = (sport: string): React.ReactElement => {
  const sportLower = sport.toLowerCase();
  let IconComponent: React.ElementType = Activity; 
  let iconColor = "text-gray-500";

  if (sportLower.includes('nba') || sportLower.includes('basketball') || sportLower.includes('ncaab')) {
    IconComponent = Dribbble;
    iconColor = "text-orange-500";
  } else if (sportLower.includes('nfl') || sportLower.includes('football') || sportLower.includes('ncaaf') || sportLower.includes('american football')) {
    IconComponent = Shield; 
    iconColor = "text-amber-700"; 
  } else if (sportLower.includes('mlb') || sportLower.includes('baseball')) {
    IconComponent = Gem;
    iconColor = "text-red-600";
  } else if (sportLower.includes('nhl') || sportLower.includes('hockey')) {
    IconComponent = Zap;
    iconColor = "text-blue-500";
  } else if (sportLower.includes('soccer') || sportLower.includes('mls') || sportLower.includes('premier league') || sportLower.includes('epl') || sportLower.includes('futbol')) {
    IconComponent = Goal;
    iconColor = "text-green-600";
  }
  // For other sports, ActivityIcon with gray color will be used by default.

  return <IconComponent className={`mr-2 h-5 w-5 ${iconColor}`} />;
};

interface EventSummaryCardProps {
  bet: BetSummaryData;
}

export function EventSummaryCard({ bet }: EventSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Sport:</span>
            <div className="flex items-center">
              {getSportIcon(bet.sport)}
              <span className="font-medium">{bet.sport}</span>
            </div>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Match:</span>
            <span className="font-medium">{bet.match}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date & Time:</span>
            <span className="font-medium">{formatDisplayDateTime(bet.event_time)}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status:</span>
            <span className="font-medium capitalize">{bet.status}</span>
          </div>
          {bet.result && (
            <>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Result:</span>
                <span
                  className={`font-medium capitalize ${
                    bet.result === "win" ? "text-green-600" : bet.result === "loss" ? "text-red-600" : ""
                  }`}
                >
                  {bet.result}
                </span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
