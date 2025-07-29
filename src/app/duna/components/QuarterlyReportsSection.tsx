"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@heroicons/react/20/solid";
import QuarterlyReportCard from "./QuarterlyReportCard";
import ReportModal from "./ReportModal";
import CreatePostModal from "./CreatePostModal";
import { useForum } from "@/hooks/useForum";
import toast from "react-hot-toast";

const DUNA_CATEGORY_ID = 1;

interface Report {
  id: number;
  title: string;
  author: string;
  content: string;
  createdAt: string;
  comments: any[];
  attachments: any[];
}

interface QuarterlyReportsSectionProps {
  initialReports: Report[];
}

const QuarterlyReportsSection = ({
  initialReports,
}: QuarterlyReportsSectionProps) => {
  const [reports, setReports] = useState<Report[]>(initialReports || []);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { createTopic, loading } = useForum();

  const handleReportClick = (report: any) => {
    setSelectedReport(report);
    setIsReportModalOpen(true);
  };

  const handleCreatePost = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateReport = async (data: {
    title: string;
    content: string;
    attachment?: File;
  }) => {
    try {
      const newReport = await createTopic({
        title: data.title,
        content: data.content,
        categoryId: DUNA_CATEGORY_ID,
        attachment: data.attachment,
      });

      if (newReport) {
        setReports((prev) => [newReport, ...prev]);
        setIsCreateModalOpen(false);
        toast.success("Topic created successfully!");
      } else {
        throw new Error("Failed to create topic");
      }
    } catch (error) {
      console.error("Error creating topic:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create topic";
      toast.error(errorMessage);
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
          <div className="text-secondary">Creating report...</div>
        </div>
      )}

      {reports.length === 0 && (
        <div className="text-center py-8">
          <div className="text-secondary">
            No reports found. Create the first one!
          </div>
        </div>
      )}

      {reports.length > 0 && (
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
