// Header component
import Navbar from "../Navbar";
import { css } from "@emotion/css";
import { icons } from "../../icons/icons";
import { Container } from "../Container";
import { Logo } from "../Logo";
import styles from "../styles.module.scss";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useMediaQuery } from "react-responsive";
import * as theme from "../../lib/theme";
import { ConnectKitButton } from "connectkit";
import DelegateProfileDropdown from "./DelegateProfileDropdown";
import Image from "next/image";

export default function Header() {
  return (
    <header className="relative z-50 pb-11 lg:pt-11">
      <Container className="flex flex-wrap items-center justify-center sm:justify-between lg:flex-nowrap">
        <div className="inline-flex mt-10 lg:mt-0 lg:grow lg:basis-0">
          <Logo />
          <h1 className={styles.agora_title}>
            <Link href="/">
              Agora <span>(alpha)</span>
            </Link>
          </h1>
        </div>
        <div className="order-first -mx-4 flex flex-auto basis-full overflow-x-auto whitespace-nowrap border-b border-blue-600/10 py-4 font-mono text-sm text-blue-600 sm:-mx-6 lg:order-none lg:mx-0 lg:basis-auto lg:border-0 lg:py-0">
          <div className="mx-auto flex items-center gap-4 px-4">
            <Navbar />
          </div>
        </div>
        <div className="hidden sm:mt-10 sm:flex lg:mt-0 lg:grow lg:basis-0 lg:justify-end">
          <ConnectWalletButton />
        </div>
      </Container>
    </header>
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
    <ConnectKitButton.Custom>
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
    </ConnectKitButton.Custom>
  );
};

function DesktopButton() {
  const { address } = useAccount();


  return (
    <ConnectKitButton.Custom>
      {({ show }) => (
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
      )}
    </ConnectKitButton.Custom>
  );
}
