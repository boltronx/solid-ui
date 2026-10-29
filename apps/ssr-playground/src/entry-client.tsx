import { hydrate } from "solid-js/web";

import { App } from "./App";

// Takes over the server's HTML. Hydration warns in the console if the first render here differs.
hydrate(() => <App url={location.pathname + location.search} />, document.getElementById("app")!);
