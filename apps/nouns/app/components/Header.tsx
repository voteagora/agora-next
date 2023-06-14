import Link from "next/link"
import { Container } from "ui"
import { Logo } from "ui/icons/Logo"

import { appName, CustomConnectButton, Navbar } from "."

export default function Header() {
  return (
    <header>
      <Container>
        <div className="relative mx-auto flex h-16 items-center justify-between sm:px-6">
          <div className="flex items-center space-x-7 sm:space-x-10">
            <Link
              href="/"
              className="flex items-center"
              aria-label={`${appName} logo`}
            >
              <Logo className="h-5 w-5" />
              <p className="ml-3 text-sm">
                {appName} <span className="text-gray-600">(alpha)</span>
              </p>
            </Link>
          </div>
          <div className="mx-auto flex items-center gap-4 px-4">
            <Navbar />
          </div>

          <div className="xs:space-x-6 relative z-10 flex items-center space-x-6 sm:space-x-8">
            <CustomConnectButton />
          </div>
        </div>
      </Container>
      <hr className="w-full border-gray-200" />
    </header>
  )
}
