import { generateHydrationScript, renderToString } from "solid-js/web";

import { colorSchemeScript } from "@boltronx/solid-ui";
// The stylesheet's URL, so the server's HTML is styled before any JavaScript runs.
import stylesUrl from "@boltronx/solid-ui/styles.css?url";

import { App } from "./App";

export function render(url: string) {
  const html = renderToString(() => <App url={url} />);
  const head = [
    `<link rel="stylesheet" href="${stylesUrl}" />`,
    `<script>${colorSchemeScript()}</script>`,
    generateHydrationScript()
  ].join("\n");
  return { head, html };
}
