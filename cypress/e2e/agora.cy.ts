describe('Agora', () => {
  

  it("Nav works", () => {
    cy.visit("http://localhost:3000");

    cy.get("nav a").should("contain", "Proposals");

    // Find a link with an href attribute containing "about" and click it
    cy.get("a.delegatesNav").click({ force: true });

    // The new url should include "/about"
    cy.url().should("include", "/delegates");

    // The new page should contain an h1 with "About page"
    cy.get("h1").contains("Delegates");
  });



})