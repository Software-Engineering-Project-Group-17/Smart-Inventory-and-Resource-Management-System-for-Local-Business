"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  error: string;
  onBack: () => void;
}

export default function ErrorState({ error, onBack }: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>{error || "Failed to load request details"}</span>
            </div>
            <Button className="mt-4" onClick={onBack}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
