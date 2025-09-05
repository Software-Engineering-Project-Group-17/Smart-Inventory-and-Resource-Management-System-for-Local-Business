"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, AlertCircle } from "lucide-react";

interface RequestHeaderProps {
  title: string;
  id: number;
  status: string;
  priority: string;
  isUrgent: boolean;
  daysLeft: number;
  onBack: () => void;
}

const PRIORITY_COLORS = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

const STATUS_COLORS = {
  pending: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function RequestHeader({
  title,
  id,
  status,
  priority,
  isUrgent,
  daysLeft,
  onBack,
}: RequestHeaderProps) {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600 mt-1">Restock Request #{id}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              className={STATUS_COLORS[status as keyof typeof STATUS_COLORS]}
            >
              {status}
            </Badge>
            <Badge
              className={
                PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS]
              }
            >
              {priority}
            </Badge>
            {isUrgent && (
              <Badge className="bg-red-100 text-red-800">
                <AlertCircle className="h-3 w-3 mr-1" />
                {daysLeft <= 0 ? "Overdue" : `${daysLeft} days left`}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
