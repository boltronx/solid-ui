// A minimal SSR dev server: each request renders the page on the server with Solid, and the
// browser hydrates it. Vite compiles both halves, the library included (vite-plugin-solid compiles
// Solid packages from their JSX build), and picks up changes on the next reload.
//   pnpm dev:server   (from the repo root)
import { readFileSync } from "node:fs";
import http from "node:http";

import { createServer } from "vite";

const port = Number(process.env.PORT ?? 3000);
const root = new URL(".", import.meta.url);

const vite = await createServer({
  root: root.pathname.replace(/^\/(\w:)/, "$1"),
  server: { middlewareMode: true },
  appType: "custom"
});

const server = http.createServer((req, res) => {
  vite.middlewares(req, res, async () => {
    try {
      const url = req.url ?? "/";
      const template = await vite.transformIndexHtml(
        url,
        readFileSync(new URL("index.html", root), "utf8")
      );
      // Loaded per request, so edits show on the next reload without restarting.
      const { render } = await vite.ssrLoadModule("/src/entry-server.tsx");
      const { head, html } = render(url);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(template.replace("<!--app-head-->", head).replace("<!--app-html-->", html));
    } catch (error) {
      vite.ssrFixStacktrace(error);
      console.error(error);
      res.statusCode = 500;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.end(error.stack);
    }
  });
});

server.listen(port, () => {
  console.log(`SSR playground: http://localhost:${port}`);
});
