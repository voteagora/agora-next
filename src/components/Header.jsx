// Header component
import Navbar from "./Navbar";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { Button } from "./Button";
import styles from "./styles.module.scss";

export default function Header() {
  return (
    <header className="relative z-50 pb-11 lg:pt-11">
      <Container className="flex flex-wrap items-center justify-center sm:justify-between lg:flex-nowrap">
        <div className="inline-flex mt-10 lg:mt-0 lg:grow lg:basis-0">
          <Logo />
          <h1 className={styles.agora_title}>
            Agora <span>(alpha)</span>
          </h1>
        </div>
        <div className="order-first -mx-4 flex flex-auto basis-full overflow-x-auto whitespace-nowrap border-b border-blue-600/10 py-4 font-mono text-sm text-blue-600 sm:-mx-6 lg:order-none lg:mx-0 lg:basis-auto lg:border-0 lg:py-0">
          <div className="mx-auto flex items-center gap-4 px-4">
            <Navbar />
          </div>
        </div>
        <div className="hidden sm:mt-10 sm:flex lg:mt-0 lg:grow lg:basis-0 lg:justify-end">
          <Button className={styles.connectWallet} href="#">
            Connect Wallet
          </Button>
        </div>
      </Container>
    </header>
  );
}
