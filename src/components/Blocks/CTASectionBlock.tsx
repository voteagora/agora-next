import { CTASectionBlockConfig } from "@/lib/blocks/types";
import Link from "next/link";

interface CTASectionBlockProps {
  config: CTASectionBlockConfig;
}

export function CTASectionBlock({ config }: CTASectionBlockProps) {
  const bgColor = config.background_color || "bg-brandPrimary";

  const buttonStyles = {
    primary: "bg-white text-primary hover:bg-wash border border-line",
    secondary: "bg-buttonBackground text-white hover:opacity-90",
    outline:
      "bg-transparent text-white border-2 border-white hover:bg-white hover:text-primary",
  };

  return (
    <div className={`${bgColor} rounded-xl p-8 sm:p-12 mt-6`}>
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
          {config.title}
        </h2>
        {config.description && (
          <p className="text-base sm:text-lg text-white/90 mb-6">
            {config.description}
          </p>
        )}
        <div className="flex flex-wrap gap-3 justify-center">
          {config.buttons.map((button, index) => {
            const style = button.style || "primary";
            return (
              <Link
                key={index}
                href={button.url}
                target={button.url.startsWith("http") ? "_blank" : undefined}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all ${buttonStyles[style]}`}
              >
                {button.text}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
