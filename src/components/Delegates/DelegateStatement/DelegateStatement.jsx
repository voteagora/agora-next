import { useState, useRef, useEffect } from "react";
import Markdown from "@/components/shared/Markdown/Markdown";
import { sanitizeContent } from "@/lib/sanitizationUtils";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import Tenant from "@/lib/tenant/tenant";

export default function DelegateStatement({ statement }) {
  const sanitizedStatement = sanitizeContent(statement);
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowButton, setShouldShowButton] = useState(false);
  const contentRef = useRef(null);
  const { ui } = Tenant.current();

  // Maximum height in pixels before truncation (approximately 10 lines)
  const MAX_HEIGHT = 200;

  useEffect(() => {
    if (contentRef.current) {
      // Check if content exceeds max height
      const contentHeight = contentRef.current.scrollHeight;
      setShouldShowButton(contentHeight > MAX_HEIGHT);
    }
  }, [sanitizedStatement]);

  const useNeutral =
    ui.toggle("syndicate-colours-fix-delegate-pages")?.enabled ?? false;

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-2xl font-bold text-primary">Delegate Statement</h2>
      <div
        className={`relative p-4 text-secondary ${useNeutral ? "bg-neutral" : "bg-wash"} rounded-xl shadow-newDefault border border-line`}
      >
        <div
          ref={contentRef}
          className={`overflow-hidden transition-all duration-300 ${
            !isExpanded && shouldShowButton ? `max-h-[${MAX_HEIGHT}px]` : ""
          }`}
          style={
            !isExpanded && shouldShowButton
              ? { maxHeight: `${MAX_HEIGHT}px` }
              : {}
          }
        >
          <Markdown content={sanitizedStatement} />
        </div>

        {/* Gradient overlay when collapsed */}
        {shouldShowButton && !isExpanded && (
          <div
            className={`absolute bottom-10 left-0 right-0 h-24 bg-gradient-to-t ${useNeutral ? "from-neutral" : "from-wash"} to-transparent pointer-events-none`}
          />
        )}

        {/* Expand/Collapse button */}
        {shouldShowButton && (
          <div className="flex justify-center">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 flex items-center text-xs gap-1 text-secondary hover:text-primary font-medium transition-all duration-300 text-center"
            >
              {isExpanded ? (
                <>
                  Show less
                  <ChevronUpIcon className="w-4 h-4" />
                </>
              ) : (
                <>
                  Show more
                  <ChevronDownIcon className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
