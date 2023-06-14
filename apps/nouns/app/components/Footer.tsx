import { Container } from "ui"

import { Social } from "."

export default function Footer() {
  return (
    <footer className="relative z-20 bg-white py-8 text-center shadow-sm">
      <Container>
        <Social wrapperClassName="flex justify-center" />
      </Container>
    </footer>
  )
}
