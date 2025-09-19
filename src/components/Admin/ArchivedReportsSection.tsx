"use client";

import React, { useState } from "react";
import { useForum, useForumAdmin } from "@/hooks/useForum";
import { ForumTopic } from "@/lib/forumUtils";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { ArrowUpIcon, EyeIcon } from "@heroicons/react/20/solid";
import { toast } from "react-hot-toast";
import Tenant from "@/lib/tenant/tenant";
import { useDunaCategory } from "@/hooks/useDunaCategory";

interface ArchivedReportCardProps {
  report: ForumTopic;
  onUnarchive?: () => void;
  isLast?: boolean;
}

const ArchivedReportCard = ({
  report,
  onUnarchive,
  isLast,
}: ArchivedReportCardProps) => {
  const { unarchiveTopic } = useForum();
  const openDialog = useOpenDialog();
  const { dunaCategoryId } = useDunaCategory();
  const { isAdmin, canManageTopics } = useForumAdmin(
    dunaCategoryId || undefined
  );
  const { ui } = Tenant.current();
  const useDarkStyling = ui.toggle("ui/use-dark-theme-styling")?.enabled;

  const handleUnarchive = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAdmin && !canManageTopics) {
      toast.error("You don't have permission to unarchive reports.");
      return;
    }

    openDialog({
      type: "CONFIRM",
      params: {
        title: "Unarchive Report",
        message: "Are you sure you want to unarchive this report?",
        onConfirm: async () => {
          const success = await unarchiveTopic(report.id);
          if (success && onUnarchive) {
            onUnarchive();
          }
        },
      },
    });
  };

  const handleViewReport = () => {
    openDialog({
      type: "REPORT_MODAL",
      className: "w-[48rem] sm:w-[48rem] p-0",
      params: {
        report,
        onDelete: () => {},
        onArchive: () => {},
        onCommentAdded: () => {},
        onCommentDeleted: () => {},
      },
    });
  };

  return (
    <div
      className={`p-4 cursor-pointer transition-colors ${
        !isLast ? "border-b" : ""
      } ${useDarkStyling ? "hover:bg-inputBackgroundDark" : "hover:bg-gray-50"}`}
      style={
        !isLast
          ? {
              borderBottomColor: useDarkStyling ? "#2B2449" : "#E5E5E5",
            }
          : {}
      }
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h5
              className={`font-bold text-base ${
                useDarkStyling ? "text-white" : "text-primary"
              }`}
            >
              {report.title}
            </h5>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm sm:ml-4">
          <button
            onClick={handleViewReport}
            className={`p-1 transition-colors ${
              useDarkStyling
                ? "text-[#87819F] hover:text-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
            title="View report"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          <button
            onClick={handleUnarchive}
            className={`p-1 transition-colors ${
              isAdmin || canManageTopics
                ? useDarkStyling
                  ? "text-[#5A4B7A] hover:text-[#6B5C8B]"
                  : "text-blue-500 hover:text-blue-700"
                : useDarkStyling
                  ? "text-[#87819F] cursor-not-allowed"
                  : "text-gray-400 cursor-not-allowed"
            }`}
            title={
              isAdmin || canManageTopics
                ? "Unarchive report"
                : "You don't have permission to unarchive"
            }
            disabled={!isAdmin && !canManageTopics}
          >
            <ArrowUpIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <p
          className={`text-sm leading-relaxed line-clamp-2 ${
            useDarkStyling ? "text-white" : "text-secondary"
          }`}
        >
          {report.content}
        </p>
      </div>

      <div
        className={`flex items-center justify-between text-xs ${
          useDarkStyling ? "text-[#87819F]" : "text-tertiary"
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span>Comments: {report.comments?.length || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Attachments: {report.attachments?.length || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ArchivedReportsSectionProps {
  initialReports: ForumTopic[];
}

const ArchivedReportsSection = ({
  initialReports,
}: ArchivedReportsSectionProps) => {
  const [reports, setReports] = useState<ForumTopic[]>(initialReports || []);
  const { loading } = useForum();

  const { ui } = Tenant.current();
  const useDarkStyling = ui.toggle("ui/use-dark-theme-styling")?.enabled;

  const handleUnarchiveReport = (reportToUnarchive: ForumTopic) => {
    setReports((prev) =>
      prev.filter((report) => report.id !== reportToUnarchive.id)
    );
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <h4
          className={`text-lg font-bold ${
            useDarkStyling ? "text-white" : "text-primary"
          }`}
        >
          Archived Reports
        </h4>
        <div
          className={`text-sm ${useDarkStyling ? "text-[#87819F]" : "text-secondary"}`}
        >
          {reports.length} archived report{reports.length !== 1 ? "s" : ""}
        </div>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className={useDarkStyling ? "text-white" : "text-secondary"}>
            Loading archived reports...
          </div>
        </div>
      )}

      {reports.length === 0 && (
        <div className="text-center py-8">
          <div className={useDarkStyling ? "text-white" : "text-secondary"}>
            No archived reports found.
          </div>
        </div>
      )}

      {reports.length > 0 && (
        <div
          className={`border rounded-lg border-line ${
            useDarkStyling ? "bg-modalBackgroundDark" : "bg-white"
          }`}
          style={{
            borderColor: useDarkStyling ? "#2B2449" : "#E5E5E5",
          }}
        >
          {reports.map((report, index) => (
            <ArchivedReportCard
              key={report.id}
              report={report}
              onUnarchive={() => handleUnarchiveReport(report)}
              isLast={index === reports.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ArchivedReportsSection;
