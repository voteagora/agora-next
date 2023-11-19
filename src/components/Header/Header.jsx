// Header component
import Navbar from "./Navbar";
import { css } from "@emotion/css";
import { icons } from "../../icons/icons";
import { HStack } from "../Layout/Stack";
import { useAccount } from "wagmi";
import { useMediaQuery } from "react-responsive";
import * as theme from "../../styles/theme";
import DelegateProfileDropdown from "./DelegateProfileDropdown";
import Image from "next/image";
import LogoLink from "./LogoLink";

export default function Header() {
  return (
    <HStack className="main_header" justifyContent="justify-between">
      <LogoLink instance_name="Optimism" />
      <Navbar />
      <ConnectWalletButton />
    </HStack>
  );
}

function ConnectWalletButton() {
  const isMobile = useMediaQuery({
    query: `(max-width: ${theme.maxWidth.md})`,
  });

  if (isMobile) {
    return <MobileButton />;
  }

  return <DesktopButton />;
}

export const MobileButton = () => {
  return (
    <w3m-button balance={false}>
      {({ isConnected, show }) => {
        return (
          <div
            className={css`
              margin-top: 13px;
            `}
            onClick={show}
          >
            {isConnected ? (
              <Image src={icons.walletConnected} alt="connect wallet button" />
            ) : (
              <Image src={icons.wallet} alt="connect wallet button" />
            )}
          </div>
        );
      }}
    </w3m-button>
  );
};

function DesktopButton() {
  const { address } = useAccount();

  const renderContent = (show) => {
    return (
      <div
        className={css`
          border: 1px solid ${theme.colors.gray.eb};
          background-color: ${theme.colors.gray.fa};
          border-radius: ${theme.borderRadius.full};
          transition: 0.3s background-color;
          position: relative;
          top: 10px;

          :hover {
            background: ${theme.colors.gray.eb};
          }
        `}
      >
        {address ? (
          <DelegateProfileDropdown address={address} />
        ) : (
          <div
            className={css`
              padding: ${theme.spacing[2]} ${theme.spacing[5]};
              cursor: pointer;
            `}
            onClick={show}
          >
            Connect Wallet
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Assuming w3m-button component handles children as a render prop */}
      <w3m-button balance={false}>
        {({ show }) => renderContent(show)}
      </w3m-button>
    </>
  );
}
