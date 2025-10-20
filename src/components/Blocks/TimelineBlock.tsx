import { TimelineBlockConfig } from "@/lib/blocks/types";

interface TimelineBlockProps {
  config: TimelineBlockConfig;
}

export function TimelineBlock({ config }: TimelineBlockProps) {
  return (
    <>
      {config.title && (
        <h3 className="text-2xl font-black text-primary mt-12">
          {config.title}
        </h3>
      )}
      <div className="mt-4 flex flex-col gap-6">
        {config.events.map((event, index) => {
          const isActive = event.status === "active";
          const isCompleted = event.status === "completed";

          const statusColor = isCompleted
            ? "bg-positive border-positive"
            : isActive
              ? "bg-brandPrimary border-brandPrimary"
              : "bg-line border-line";

          const textColor = isActive
            ? "text-brandPrimary"
            : isCompleted
              ? "text-positive"
              : "text-secondary";

          return (
            <div key={index} className="flex gap-4 relative">
              <div className="flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full ${statusColor} border-4 flex-shrink-0`}
                />
                {index < config.events.length - 1 && (
                  <div className="w-px flex-1 bg-line mt-1" />
                )}
              </div>

              <div className="flex-1 pb-6">
                <div className={`text-sm font-medium mb-1 ${textColor}`}>
                  {event.date}
                </div>
                <h4 className="font-semibold text-primary mb-1">
                  {event.title}
                </h4>
                <p className="text-secondary text-sm">{event.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
