/* 
Smoke test that the app loads and the nav works.
*/

describe("Agora", () => {
  it("Nav works", () => {
    cy.visit("http://localhost:3000")
    cy.get("nav a").should("contain", "Proposals")
    cy.get("a").contains("Delegates").click({ force: true })
    cy.url().should("include", "/delegates")
    cy.get("h1").contains("Delegates")
  })
})
