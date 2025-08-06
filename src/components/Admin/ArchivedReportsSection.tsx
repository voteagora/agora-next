"use client";

import React, { useState } from "react";
import { useForum } from "@/hooks/useForum";
import { ForumTopic } from "@/lib/forumUtils";
import { useAccount } from "wagmi";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { ArrowUpIcon, EyeIcon } from "@heroicons/react/20/solid";
import { toast } from "react-hot-toast";
import Tenant from "@/lib/tenant/tenant";
import { UIForumConfig } from "@/lib/tenant/tenantUI";

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
  const { address } = useAccount();
  const { unarchiveTopic } = useForum();
  const openDialog = useOpenDialog();

  const tenant = Tenant.current();
  const forumToggle = tenant.ui.toggle("duna");
  const forumConfig = forumToggle?.config as UIForumConfig | undefined;
  const forumAdmins = forumConfig?.adminAddresses || [];
  const isAdmin = forumAdmins.includes(address as `0x${string}`);

  const handleUnarchive = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAdmin) {
      toast.error("Only forum admins can unarchive reports.");
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
      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
        !isLast ? "border-b border-line" : ""
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h5 className="font-bold text-primary text-base">{report.title}</h5>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-secondary sm:ml-4">
          <button
            onClick={handleViewReport}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
            title="View report"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          <button
            onClick={handleUnarchive}
            className={`p-1 transition-colors ${
              isAdmin
                ? "text-blue-500 hover:text-blue-700"
                : "text-gray-400 cursor-not-allowed"
            }`}
            title={
              isAdmin ? "Unarchive report" : "Only forum admins can unarchive"
            }
            disabled={!isAdmin}
          >
            <ArrowUpIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-secondary leading-relaxed line-clamp-2">
          {report.content}
        </p>
      </div>

      <div className="flex items-center justify-between text-xs text-tertiary">
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

  const handleUnarchiveReport = (reportToUnarchive: ForumTopic) => {
    setReports((prev) =>
      prev.filter((report) => report.id !== reportToUnarchive.id)
    );
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <h4 className="text-lg font-bold text-primary">Archived Reports</h4>
        <div className="text-sm text-secondary">
          {reports.length} archived report{reports.length !== 1 ? "s" : ""}
        </div>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="text-secondary">Loading archived reports...</div>
        </div>
      )}

      {reports.length === 0 && (
        <div className="text-center py-8">
          <div className="text-secondary">No archived reports found.</div>
        </div>
      )}

      {reports.length > 0 && (
        <div className="border rounded-lg bg-white border-line">
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
