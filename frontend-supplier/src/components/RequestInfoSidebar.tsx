"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, MapPin, User, Mail, Phone } from "lucide-react";

interface RequestInfoSidebarProps {
  requiredByDate: string;
  createdAt: string;
  daysLeft: number;
  branch: {
    id: number;
    name: string;
    location: string;
    contact_number?: string;
    description?: string;
  };
  createdBy: {
    id: number;
    name: string;
    email: string;
  };
}

export default function RequestInfoSidebar({
  requiredByDate,
  createdAt,
  daysLeft,
  branch,
  createdBy,
}: RequestInfoSidebarProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Request Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Request Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-400" />
            <div>
              <div className="text-gray-500">Required by</div>
              <div className="font-medium">
                {formatDateShort(requiredByDate)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-gray-400" />
            <div>
              <div className="text-gray-500">Created</div>
              <div className="font-medium">{formatDate(createdAt)}</div>
            </div>
          </div>

          <Separator />

          <div>
            <div className="text-sm font-medium text-gray-900 mb-2">
              Time Remaining
            </div>
            <div
              className={`text-lg font-bold ${
                daysLeft <= 3
                  ? "text-red-600"
                  : daysLeft <= 7
                  ? "text-yellow-600"
                  : "text-green-600"
              }`}
            >
              {daysLeft <= 0 ? "Overdue" : `${daysLeft} days`}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Branch Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Branch Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-gray-400" />
            <div>
              <div className="font-medium">{branch.name}</div>
              <div className="text-gray-500">{branch.location}</div>
            </div>
          </div>

          {branch.contact_number && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-gray-400" />
              <div className="text-gray-600">{branch.contact_number}</div>
            </div>
          )}

          {branch.description && (
            <div className="text-sm text-gray-600 mt-2">
              {branch.description}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Created By */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Requested By</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-gray-400" />
            <div className="font-medium">{createdBy.name}</div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-gray-400" />
            <div className="text-gray-600">{createdBy.email}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
