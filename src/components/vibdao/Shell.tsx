import Link from 'next/link';
import { ReactNode } from 'react';
import { WalletStatus } from './WalletStatus';

const navItems = [
  { href: '/proposals', label: 'Proposals' },
  { href: '/delegates', label: 'Delegates' },
  { href: '/donate', label: 'Donate' },
  { href: '/fellowship', label: 'Fellows' },
  { href: '/claim', label: 'Claim' },
  { href: '/proposals/create-proposal', label: 'Create' },
];

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <p className="eyebrow">Local Governance</p>
          <h1>Agora governance routes with local DAO data</h1>
          <p className="muted">Read from Postgres, write to the local chain, and keep the full donation-to-execution flow visible.</p>
        </div>
        <nav className="nav">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="navLink">
              {item.label}
            </Link>
          ))}
        </nav>
        <WalletStatus />
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
