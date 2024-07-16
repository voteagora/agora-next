type FormCardProps = {
  children: React.ReactNode;
};
const FormCard = ({ children }: FormCardProps) => {
  return <div className="">{children}</div>;
};

const FormCardSection = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`p-6 border-b border-agora-stone-100 border-x first-of-type:border-t first-of-type:rounded-t-2xl last-of-type:rounded-b-2xl last-of-type:shadow-newDefault z-20 relative bg-white ${className}`}
    >
      {children}
    </div>
  );
};

const FormCardFooter = ({ children }: { children: React.ReactNode }) => {
  return (
    <footer className="px-6 pb-6 pt-12 bg-agora-stone-50 border border-agora-stone-100 rounded-b-2xl z-10 mt-[-24px]">
      {children}
    </footer>
  );
};

const FormCardHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <header className="px-6 pt-2 bg-[#FAFAF2] border-[#ECE3CA] text-[#B16B19] border rounded-t-2xl z-10 pb-[32px] mb-[-24px]">
      {children}
    </header>
  );
};

FormCard.Header = FormCardHeader;
FormCard.Section = FormCardSection;
FormCard.Footer = FormCardFooter;
export default FormCard;
