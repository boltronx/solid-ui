import { createSignal, Show } from "solid-js";
import { Dynamic } from "solid-js/web";

import { Button, Card, Code, Group, Stack, Text, Title } from "@boltronx/solid-ui";
import { CheckIcon } from "@boltronx/solid-ui/icons";

import type { Demo as DemoData } from "./registry";

export function Demo(props: { demo: DemoData }) {
  const [showCode, setShowCode] = createSignal(false);
  const [copied, setCopied] = createSignal(false);

  const copy = async () => {
    await navigator.clipboard.writeText(props.demo.source);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section id={props.demo.id} class="docs-demo">
      <Stack gap="xs">
        <Title order={3} size={4}>
          {props.demo.title}
        </Title>
        <Show when={props.demo.description}>
          <Text c="dimmed">{props.demo.description}</Text>
        </Show>
      </Stack>
      <Card padding={0} class="docs-demo-card">
        <div class="docs-demo-preview">
          <Dynamic component={props.demo.component} />
        </div>
        <Group justify="flex-end" gap="xs" class="docs-demo-toolbar">
          <Show when={showCode()}>
            <Button variant="subtle" onClick={copy} leftSection={copied() ? <CheckIcon /> : null}>
              {copied() ? "Copied" : "Copy"}
            </Button>
          </Show>
          <Button
            variant="subtle"
            aria-expanded={showCode()}
            onClick={() => setShowCode(value => !value)}
          >
            {showCode() ? "Hide code" : "Show code"}
          </Button>
        </Group>
        <Show when={showCode()}>
          <Code block class="docs-demo-code">
            {props.demo.source}
          </Code>
        </Show>
      </Card>
    </section>
  );
}
