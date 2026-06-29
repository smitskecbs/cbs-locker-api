import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Application } from "express";

const SWAGGER_UI_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CBS Locker API Docs</title>
    <link
      rel="stylesheet"
      href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css"
    />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: "/openapi.json",
        dom_id: "#swagger-ui",
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis],
        layout: "BaseLayout",
      });
    </script>
  </body>
</html>`;

const OPENAPI_SPEC_PATH = join(__dirname, "..", "spec", "openapi.json");

let cachedOpenApiSpec: string | null = null;

function getOpenApiSpec(): string {
  if (!cachedOpenApiSpec) {
    cachedOpenApiSpec = readFileSync(OPENAPI_SPEC_PATH, "utf8");
  }

  return cachedOpenApiSpec;
}

/** Register docs routes directly on the app (not a sub-router). */
export function mountDocsRoutes(app: Application): void {
  app.get("/openapi.json", (_req, res) => {
    res.type("application/json").send(getOpenApiSpec());
  });

  app.get("/docs", (_req, res) => {
    res.type("html").send(SWAGGER_UI_HTML);
  });
}
