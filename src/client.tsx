import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";

function isValidHtmlChild(node: Node | string) {
  return node === document.head || node === document.body;
}

function moveInvalidHtmlChildrenIntoBody() {
  const { body, documentElement } = document;
  if (!body) {
    return;
  }

  for (const node of Array.from(documentElement.childNodes)) {
    if (!isValidHtmlChild(node)) {
      body.appendChild(node);
    }
  }
}

function keepInvalidChildrenOutOfHtml() {
  const { body, documentElement } = document;
  if (!body) {
    return;
  }

  // TanStack Start hydrates the whole document, so extension/SDK nodes inserted
  // directly under <html> before hydration must be moved to a valid container.
  const appendChild = documentElement.appendChild.bind(documentElement);
  const append = documentElement.append.bind(documentElement);
  const insertBefore = documentElement.insertBefore.bind(documentElement);
  const prepend = documentElement.prepend.bind(documentElement);

  documentElement.appendChild = ((node: Node) => {
    if (!isValidHtmlChild(node)) {
      return body.appendChild(node);
    }

    return appendChild(node);
  }) as typeof documentElement.appendChild;

  documentElement.append = ((...nodes: Array<Node | string>) => {
    const validNodes = nodes.filter(isValidHtmlChild);
    const invalidNodes = nodes.filter((node) => !isValidHtmlChild(node));

    if (invalidNodes.length) {
      body.append(...invalidNodes);
    }

    if (validNodes.length) {
      append(...validNodes);
    }
  }) as typeof documentElement.append;

  documentElement.insertBefore = ((node: Node, child: Node | null) => {
    if (!isValidHtmlChild(node)) {
      return body.appendChild(node);
    }

    return insertBefore(node, child);
  }) as typeof documentElement.insertBefore;

  documentElement.prepend = ((...nodes: Array<Node | string>) => {
    const validNodes = nodes.filter(isValidHtmlChild);
    const invalidNodes = nodes.filter((node) => !isValidHtmlChild(node));

    if (invalidNodes.length) {
      body.prepend(...invalidNodes);
    }

    if (validNodes.length) {
      prepend(...validNodes);
    }
  }) as typeof documentElement.prepend;
}

keepInvalidChildrenOutOfHtml();

void Promise.all([
  import("@tanstack/react-start/client"),
  import("@tanstack/react-router"),
]).then(async ([{ hydrateStart }, { RouterProvider }]) => {
  const router = await hydrateStart();
  moveInvalidHtmlChildrenIntoBody();

  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <RouterProvider router={router} />
      </StrictMode>
    );
  });
});
