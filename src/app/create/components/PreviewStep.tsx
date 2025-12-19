import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreatePostFormData, PostType, postTypeOptions } from "../types";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";

interface PreviewStepProps {
  formData: CreatePostFormData;
  postType: PostType;
  onBack: () => void;
  onNext: () => void;
}

export function PreviewStep({
  formData,
  postType,
  onBack,
  onNext,
}: PreviewStepProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Preview Your {postTypeOptions[postType]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-secondary mb-2">Title</h3>
            <p className="text-base">{formData.title}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-secondary mb-2">Body</h3>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{formData.description}</p>
            </div>
          </div>

          {formData.relatedDiscussions?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-secondary mb-2">
                Related Discussions
              </h3>
              <ul className="list-disc list-inside">
                {formData.relatedDiscussions.map((item) => (
                  <li key={item.id} className="text-sm">
                    {item.title}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {formData.relatedTempChecks?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-secondary mb-2">
                Related Temp Checks
              </h3>
              <ul className="list-disc list-inside">
                {formData.relatedTempChecks.map((item) => (
                  <li key={item.id} className="text-sm">
                    {item.title}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-between pt-6 border-t">
            <Button
              onClick={onBack}
              variant="outline"
              className="flex items-center gap-1"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Back to Edit
            </Button>
            <Button
              onClick={onNext}
              className="bg-black text-white hover:bg-gray-800"
            >
              Continue to Wallet Verification
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
