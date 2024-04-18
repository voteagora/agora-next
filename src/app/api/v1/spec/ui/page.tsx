import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function Page() {
  return (
    <>
      <main>
        <SwaggerUI url="/api/v1/spec" />
      </main>
    </>
  );
}
