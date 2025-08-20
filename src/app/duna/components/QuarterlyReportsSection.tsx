"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import QuarterlyReportCard from "./QuarterlyReportCard";
import CreatePostModal from "./CreatePostModal";
import { useForum, useForumAdmin } from "@/hooks/useForum";
import { ForumTopic, ForumPost } from "@/lib/forumUtils";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { DUNA_CATEGORY_ID } from "@/lib/constants";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";

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

interface QuarterlyReportsSectionProps {
  initialReports: ForumTopic[];
  hideHeader?: boolean;
}

const QuarterlyReportsSection = ({
  initialReports,
  hideHeader = false,
}: QuarterlyReportsSectionProps) => {
  const [reports, setReports] = useState<ForumTopic[]>(initialReports || []);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showAllReports, setShowAllReports] = useState(false);
  const { address } = useAccount();

  // Check if current tenant is Towns
  const { namespace } = Tenant.current();
  const isTowns = namespace === TENANT_NAMESPACES.TOWNS;

  const { createTopic, loading } = useForum();
  const { canCreateTopics } = useForumAdmin(DUNA_CATEGORY_ID);
  const openDialog = useOpenDialog();

  const handleReportClick = (report: ForumTopic) => {
    openDialog({
      type: "REPORT_MODAL",
      className: "w-[48rem] sm:w-[48rem] p-0",
      params: {
        report,
        onDelete: () => handleDeleteReport(report),
        onArchive: () => handleArchiveReport(report),
        onCommentAdded: (newComment: ForumPost) =>
          handleCommentAdded(report.id, newComment),
        onCommentDeleted: (commentId: number) =>
          handleCommentDeleted(report.id, commentId),
      },
    });
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

  const handleDeleteReport = (reportToDelete?: ForumTopic) => {
    setReports((prev) =>
      prev.filter((report) => report.id !== reportToDelete?.id)
    );
  };

  const handleArchiveReport = (reportToArchive?: ForumTopic) => {
    setReports((prev) =>
      prev.filter((report) => report.id !== reportToArchive?.id)
    );
  };

  const handleCommentAdded = (reportId: number, newComment: ForumPost) => {
    setReports((prev) =>
      prev.map((report) =>
        report.id === reportId
          ? {
              ...report,
              comments: [...(report.comments || []), newComment],
            }
          : report
      )
    );
  };

  const handleCommentDeleted = (reportId: number, commentId: number) => {
    setReports((prev) =>
      prev.map((report) =>
        report.id === reportId
          ? {
              ...report,
              comments: (report.comments || []).filter(
                (comment) => comment.id !== commentId
              ),
            }
          : report
      )
    );
  };

  const initialReportsCount = 3;
  const hasMoreReports = reports.length > initialReportsCount;
  const displayedReports = showAllReports
    ? reports
    : reports.slice(0, initialReportsCount);

  const handleToggleReports = () => {
    setShowAllReports(!showAllReports);
  };

  return (
    <div>
      {!hideHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <h4
            className={`text-lg font-bold ${
              isTowns ? "text-white" : "text-primary"
            }`}
          >
            {isTowns ? "Community Dialogue" : "Quarterly Reports"}
          </h4>
          {!!address && canCreateTopics && (
            <Button
              onClick={handleCreatePost}
              className={`${
                isTowns
                  ? "bg-[#5A4B7A] text-white border-[#5A4B7A] hover:bg-[#6B5C8B]"
                  : "text-white border border-black hover:bg-gray-800"
              } text-sm w-full sm:w-auto`}
              style={
                !isTowns
                  ? {
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
                    }
                  : undefined
              }
            >
              Create new post
            </Button>
          )}
        </div>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className={isTowns ? "text-white" : "text-secondary"}>
            Creating report...
          </div>
        </div>
      )}

      {reports.length === 0 && (
        <div className="text-center py-8">
          <div className={isTowns ? "text-white" : "text-secondary"}>
            No reports found. Create the first one!
          </div>
        </div>
      )}

      {reports.length > 0 && (
        <div
          className={`border rounded-lg ${
            isTowns ? "bg-[#1E1A2F]" : "bg-white"
          }`}
          style={{
            borderColor: isTowns ? "#2B2449" : "#E5E5E5",
          }}
        >
          {displayedReports.map((report, index) => (
            <QuarterlyReportCard
              key={report.id}
              report={report}
              onClick={() => handleReportClick(report)}
              isLast={index === displayedReports.length - 1}
              onDelete={() => handleDeleteReport(report)}
              onArchive={() => handleArchiveReport(report)}
            />
          ))}

          {/* Toggle button in the middle */}
          {hasMoreReports && (
            <div
              className={`flex justify-between items-center py-3 border-t px-4 ${
                isTowns ? "border-[#2B2449]" : ""
              }`}
              style={!isTowns ? { borderTopColor: "#E5E5E5" } : {}}
            >
              <button
                onClick={handleToggleReports}
                className={`text-xs font-medium transition-colors ${
                  isTowns
                    ? "text-[#87819F] hover:text-white"
                    : "text-secondary hover:text-primary"
                }`}
              >
                {showAllReports ? "SHOW LESS" : "VIEW OLDER POSTS"}
              </button>
              <button
                onClick={handleToggleReports}
                className={`transition-colors ${
                  isTowns
                    ? "text-[#87819F] hover:text-white"
                    : "text-secondary hover:text-primary"
                }`}
              >
                <UpDownChevronIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateReport}
      />
    </div>
  );
};

export default QuarterlyReportsSection;
