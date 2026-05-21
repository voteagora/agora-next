import React, { ReactNode } from "react";

interface IReceiptContainerProps {
  children: ReactNode;
}

const ReceiptContainer = ({ children }: IReceiptContainerProps) => {
  return (
    <div className="min-h-[723px] bg-[url('/images/receipt_bg.svg')] p-4 bg-cover bg-center flex justify-center items-center">
      {children}
    </div>
  );
};

export default ReceiptContainer;
