"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUpDownIcon, PlusIcon } from "@heroicons/react/20/solid";
import QuarterlyReportCard from "./QuarterlyReportCard";
import ReportModal from "./ReportModal";
import CreatePostModal from "./CreatePostModal";
import { useDunaAPI } from "@/hooks/useDunaAPI";

const QuarterlyReportsSection = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const { fetchReports, createReport, loading, error } = useDunaAPI();

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    console.log("Component state:", { loading, error, reportsLength: reports.length });
  }, [loading, error, reports.length]);

  const loadReports = async () => {
    console.log("Loading reports...");
    const reportsData = await fetchReports();
    console.log("Reports loaded:", reportsData);
    setReports(reportsData);
  };

  const handleReportClick = (report: any) => {
    setSelectedReport(report);
    setIsReportModalOpen(true);
  };

  const handleCreatePost = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateReport = async (data: { title: string; content: string; attachment?: File }) => {
    const newReport = await createReport({
      title: data.title,
      content: data.content,
    });

    if (newReport) {
      setReports(prev => [newReport, ...prev]);
      setIsCreateModalOpen(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-bold text-primary">Quarterly Reports</h4>
        <Button 
          onClick={handleCreatePost}
          className="bg-black text-white border border-black hover:bg-gray-800"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Create new post
        </Button>
      </div>
      
      {loading && (
        <div className="text-center py-4">
          <div className="text-secondary">Loading reports...</div>
        </div>
      )}
      
      {error && (
        <div className="text-center py-4">
          <div className="text-red-500">{error}</div>
        </div>
      )}
      
      {!loading && !error && reports.length === 0 && (
        <div className="text-center py-8">
          <div className="text-secondary">No reports found. Create the first one!</div>
        </div>
      )}
      
      {!loading && !error && reports.length > 0 && (
        <div className="space-y-3">
          {reports.map((report) => (
            <QuarterlyReportCard
              key={report.id}
              report={report}
              onClick={() => handleReportClick(report)}
            />
          ))}
        </div>
      )}

      <ReportModal
        report={selectedReport}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateReport}
      />
    </div>
  );
};

export default QuarterlyReportsSection; 