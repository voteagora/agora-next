"use client";

import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { X, MessageSquare, Coins } from "lucide-react";
import { useAccount } from "wagmi";
import useConnectedDelegate from "@/hooks/useConnectedDelegate";
import Tenant from "@/lib/tenant/tenant";
import { hasDelegateStatement } from "@/lib/delegateUtils";
import { useForumPermissionsContext } from "@/contexts/ForumPermissionsContext";
import { VotingPowerInfoTooltip } from "@/components/shared/VotingPowerInfoTooltip";

interface InsufficientVPModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: "topic" | "post" | "upvote" | "react";
}

const ACTION_TEXT = {
  topic: "create topics",
  post: "post replies",
  upvote: "upvote",
  react: "react to posts",
};

export function InsufficientVPModal({
  isOpen,
  onClose,
  action,
}: InsufficientVPModalProps) {
  const { address } = useAccount();
  const delegateData = useConnectedDelegate();
  const permissions = useForumPermissionsContext();
  const { token } = Tenant.current();

  const delegate = delegateData.delegate;
  const hasStatement = hasDelegateStatement(delegate);

  // Calculate required VP based on action type
  const requiredVP =
    action === "topic"
      ? permissions.settings?.minVpForTopics || 0
      : action === "post"
        ? permissions.settings?.minVpForReplies || 0
        : permissions.settings?.minVpForActions || 0;

  const currentVP = parseInt(permissions.currentVP) || 0;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Headline */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              Oh no, you don&apos;t have enough tokens to {ACTION_TEXT[action]}
            </h2>
            <p className="text-sm text-gray-600">
              It&apos;s important that conversations are aligned only to token
              holders
            </p>
          </div>

          {/* VP Stats */}
          <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600 inline-flex items-center">
                Your voting power and token balance
                <VotingPowerInfoTooltip />
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {currentVP.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 inline-flex items-center justify-end">
                Required voting power
                <VotingPowerInfoTooltip />
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {requiredVP.toLocaleString()}
              </p>
            </div>
          </div>

          {/* How to get tokens */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              How can I get tokens?
            </h3>

            <div className="grid gap-4">
              {/* <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {hasStatement
                        ? "Share your delegate statement and request delegations"
                        : "Create a delegate statement and request delegations"}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      {hasStatement
                        ? "You already have a delegate statement! Share it on X or in communities and ask token holders to delegate to you."
                        : "Create your delegate statement to introduce yourself to the community, then share it on X or in communities to request delegations from token holders."}
                    </p>
                    {hasStatement ? (
                      <a
                        href={`/delegates/${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        View your statement →
                      </a>
                    ) : (
                      <a
                        href={`/delegates/${address}`}
                        className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        Create statement →
                      </a>
                    )}
                  </div>
                </div>
              </div> */}

              {/* Card 2: Buy Tokens */}
              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Coins className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Buy {token.symbol} tokens
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Purchase {token.symbol} tokens to gain voting power. Your
                      token balance counts as voting power, even without
                      delegation. You can also delegate to yourself or others
                      for additional governance participation.
                    </p>
                    {/* <div className="flex gap-2">
                      {address && (
                        <a
                          href={`/delegates/${address}`}
                          className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700"
                        >
                          View delegation options →
                        </a>
                      )}
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Close button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Got it
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
