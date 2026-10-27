import { For } from "solid-js";

import { Code, Text } from "@boltronx/solid-ui";

import { Demo } from "../Demo";
import { demosFor } from "../registry";

import { Page, Section } from "./Page";

export function Forms() {
  return (
    <Page
      title="Forms"
      lead="Plain HTML forms: read values with FormData, reset with form.reset(), validate with required."
    >
      <Section title="Two ways to hold a value">
        <Text>
          <strong>Uncontrolled</strong>: pass <Code>defaultValue</Code> (or{" "}
          <Code>defaultChecked</Code>). The browser keeps the value, a submit reads it from{" "}
          <Code>FormData</Code>, and <Code>form.reset()</Code> brings the default back. Use this for
          most forms.
        </Text>
        <Text>
          <strong>Controlled</strong>: pass <Code>value</Code> (or <Code>checked</Code>) and update
          it from <Code>onChange</Code>. The value belongs to your code, so a form reset leaves it
          alone. Use this when other parts of the page react to the value as it changes.
        </Text>
        <Text>
          Composite inputs submit like native ones: a multiple <Code>Select</Code> adds one entry
          per value (read them with <Code>formData.getAll()</Code>), and <Code>InputNumber</Code>{" "}
          submits the plain number even while it shows grouped digits.
        </Text>
      </Section>
      <For each={demosFor("forms")}>{demo => <Demo demo={demo} />}</For>
    </Page>
  );
}
