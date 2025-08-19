"use client";

import React, { useState } from "react";
import { useForum, useForumAdmin } from "@/hooks/useForum";
import { ForumTopic } from "@/lib/forumUtils";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { ArrowUpIcon, EyeIcon } from "@heroicons/react/20/solid";
import { toast } from "react-hot-toast";
import { DUNA_CATEGORY_ID } from "@/lib/constants";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";

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
  const { isAdmin, canManageTopics } = useForumAdmin(DUNA_CATEGORY_ID);

  // Check if current tenant is Towns
  const { namespace } = Tenant.current();
  const isTowns = namespace === TENANT_NAMESPACES.TOWNS;

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
      } ${isTowns ? "hover:bg-[#2A2338]" : "hover:bg-gray-50"}`}
      style={
        !isLast
          ? {
              borderBottomColor: isTowns ? "#2B2449" : "#E5E5E5",
            }
          : {}
      }
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h5
              className={`font-bold text-base ${
                isTowns ? "text-white" : "text-primary"
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
              isTowns
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
                ? isTowns
                  ? "text-[#5A4B7A] hover:text-[#6B5C8B]"
                  : "text-blue-500 hover:text-blue-700"
                : isTowns
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
            isTowns ? "text-white" : "text-secondary"
          }`}
        >
          {report.content}
        </p>
      </div>

      <div
        className={`flex items-center justify-between text-xs ${
          isTowns ? "text-[#87819F]" : "text-tertiary"
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

  // Check if current tenant is Towns
  const { namespace } = Tenant.current();
  const isTowns = namespace === TENANT_NAMESPACES.TOWNS;

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
            isTowns ? "text-white" : "text-primary"
          }`}
        >
          Archived Reports
        </h4>
        <div
          className={`text-sm ${isTowns ? "text-[#87819F]" : "text-secondary"}`}
        >
          {reports.length} archived report{reports.length !== 1 ? "s" : ""}
        </div>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className={isTowns ? "text-white" : "text-secondary"}>
            Loading archived reports...
          </div>
        </div>
      )}

      {reports.length === 0 && (
        <div className="text-center py-8">
          <div className={isTowns ? "text-white" : "text-secondary"}>
            No archived reports found.
          </div>
        </div>
      )}

      {reports.length > 0 && (
        <div
          className={`border rounded-lg border-line ${
            isTowns ? "bg-[#1E1A2F]" : "bg-white"
          }`}
          style={{
            borderColor: isTowns ? "#2B2449" : "#E5E5E5",
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
