"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@heroicons/react/20/solid";
import QuarterlyReportCard from "./QuarterlyReportCard";
import ReportModal from "./ReportModal";
import CreatePostModal from "./CreatePostModal";
import { useForum } from "@/hooks/useForum";
import { ForumTopic } from "@/lib/forumUtils";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";

// Custom up-down chevron icon (outline)
const UpDownChevronIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M7 9l5-5 5 5" />
    <path d="M7 15l5 5 5-5" />
  </svg>
);

const DUNA_CATEGORY_ID = 1;

interface QuarterlyReportsSectionProps {
  initialReports: ForumTopic[];
}

const QuarterlyReportsSection = ({
  initialReports,
}: QuarterlyReportsSectionProps) => {
  const [reports, setReports] = useState<ForumTopic[]>(initialReports || []);
  const [selectedReport, setSelectedReport] = useState<ForumTopic | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showAllReports, setShowAllReports] = useState(false);
  const { address } = useAccount();

  const { createTopic, loading } = useForum();

  const handleReportClick = (report: ForumTopic) => {
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
      }
    } catch (error) {
      console.error("Error creating topic:", error);
      const errorMessage = "Failed to create topic";
      toast.error(errorMessage);
    }
  };

  // Show only 2 latest reports initially
  const initialReportsCount = 2;
  const hasMoreReports = reports.length > initialReportsCount;

  const displayedReports = showAllReports
    ? reports
    : reports.slice(0, initialReportsCount); // Show latest 2

  const handleToggleReports = () => {
    setShowAllReports(!showAllReports);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <h4 className="text-lg font-bold text-primary">Quarterly Reports</h4>
        {!!address && (
          <Button
            onClick={handleCreatePost}
            className="text-white border border-black hover:bg-gray-800 text-sm w-full sm:w-auto"
            style={{
              display: "flex",
              height: "36px",
              padding: "12px 20px",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              flexShrink: 0,
              borderRadius: "8px",
              background: "#171717",
              boxShadow:
                "0 4px 12px 0 rgba(0, 0, 0, 0.02), 0 2px 2px 0 rgba(0, 0, 0, 0.03)",
            }}
          >
            Create new post
          </Button>
        )}
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
        <div
          className="border rounded-lg bg-white"
          style={{ borderColor: "#E5E5E5" }}
        >
          {displayedReports.map((report, index) => (
            <QuarterlyReportCard
              key={report.id}
              report={report}
              onClick={() => handleReportClick(report)}
              isLast={index === displayedReports.length - 1}
            />
          ))}

          {/* Toggle button in the middle */}
          {hasMoreReports && (
            <div
              className="flex justify-between items-center py-3 border-t px-4"
              style={{ borderTopColor: "#E5E5E5" }}
            >
              <button
                onClick={handleToggleReports}
                className="text-xs font-medium text-secondary hover:text-primary transition-colors"
              >
                {showAllReports ? "SHOW LESS" : "VIEW OLDER POSTS"}
              </button>
              <button
                onClick={handleToggleReports}
                className="text-secondary hover:text-primary transition-colors"
              >
                <UpDownChevronIcon className="w-4 h-4" />
              </button>
            </div>
          )}
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
