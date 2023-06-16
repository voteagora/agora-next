import React, { ReactNode, FC } from "react";
import Image from "next/image"; // Assuming you're using Next.js

type SuspenseWrapperProps = {
  children: ReactNode;
};

const SuspenseWrapper: FC<SuspenseWrapperProps> = ({ children }) => (
  <React.Suspense
    fallback={
      <div>
        Loading... <br />
        <Image
          src="/images/blink.gif"
          alt="Blinking Agora Logo"
          width={50}
          height={20}
        />
      </div>
    }
  >
    {children}
  </React.Suspense>
);

export default SuspenseWrapper;
