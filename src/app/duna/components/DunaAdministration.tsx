"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@heroicons/react/20/solid";
import QuarterlyReportsSection from "./QuarterlyReportsSection";
import DocumentsSection from "./DocumentsSection";

const DunaAdministration = () => {
  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-black text-primary">
          DUNA Administration
        </h3>
      </div>
      
      <Card className="border border-line bg-white shadow-sm">
        <CardContent className="p-6">
          <QuarterlyReportsSection />
          <div className="border-t border-line mt-8 pt-8">
            <DocumentsSection />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DunaAdministration; 