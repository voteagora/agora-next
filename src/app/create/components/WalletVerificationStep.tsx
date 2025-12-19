import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckIcon, ChevronLeftIcon } from "@heroicons/react/20/solid";
import { PostType, postTypeOptions } from "../types";

interface WalletVerificationStepProps {
  address: string | undefined;
  postType: PostType;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function WalletVerificationStep({
  address,
  postType,
  onBack,
  onSubmit,
  isSubmitting,
}: WalletVerificationStepProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Verify Your Wallet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="text-sm text-gray-600 mb-4">
              Please confirm your wallet address before submitting this{" "}
              {postTypeOptions[postType].toLowerCase()}.
            </p>

            <div className="flex items-start gap-3">
              <CheckIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-secondary mb-1">
                  Connected Wallet Address
                </p>
                <p className="font-mono text-sm break-all">{address}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Important:</strong> This wallet will be recorded as the
              proposer. Make sure you are connected with the correct wallet
              before proceeding.
            </p>
          </div>

          <div className="flex justify-between pt-6 border-t">
            <Button
              onClick={onBack}
              variant="outline"
              className="flex items-center gap-1"
              disabled={isSubmitting}
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Back to Preview
            </Button>
            <Button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="bg-black text-white hover:bg-gray-800"
            >
              {isSubmitting
                ? "Creating..."
                : `Confirm and Create ${postTypeOptions[postType]}`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
