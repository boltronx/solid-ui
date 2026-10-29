import { For, Show } from "solid-js";

import {
  Button,
  Card,
  Checkbox,
  Code,
  DatePicker,
  Flex,
  Group,
  Input,
  InputNumber,
  Menu,
  MenuDropdown,
  MenuItem,
  MenuTarget,
  message,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  Textarea,
  Title,
  useColorScheme
} from "@boltronx/solid-ui";

/**
 * The page rendered on the server and hydrated in the browser. The form submits with a plain GET,
 * so it works before JavaScript loads: the server renders what it received.
 */
export function App(props: { url: string }) {
  const submitted = () => [...new URL(props.url, "http://localhost").searchParams];
  const { scheme, setMode } = useColorScheme();

  return (
    <Stack gap="lg" style={{ padding: "24px", "max-width": "760px", margin: "0 auto" }}>
      <Group justify="space-between">
        <Title order={1}>SSR playground</Title>
        <Button onClick={() => setMode(scheme() === "dark" ? "light" : "dark")}>
          Theme: {scheme()}
        </Button>
      </Group>
      <Text c="dimmed">
        Rendered on the server, then hydrated. Disable JavaScript to see the server's HTML alone;
        the form still submits.
      </Text>

      <Flex direction={{ base: "column", md: "row" }} gap="md">
        <Card style={{ flex: "1" }}>
          <Text fw={600}>Flex</Text>
          <Text size="sm" c="dimmed">
            A column on phones, a row from md, without JavaScript.
          </Text>
        </Card>
        <Card style={{ flex: "1" }}>
          <Group>
            <Menu>
              <MenuTarget>
                <Button>Menu</Button>
              </MenuTarget>
              <MenuDropdown>
                <MenuItem onClick={() => message.success("Picked")}>Show a message</MenuItem>
              </MenuDropdown>
            </Menu>
            <Button onClick={() => message.info("Hydrated and interactive")}>Message</Button>
          </Group>
        </Card>
      </Flex>

      <form method="get">
        <Stack>
          <SimpleGrid minChildWidth="14rem">
            <Input label="Name" name="name" defaultValue="Ada" required />
            <InputNumber label="Budget" name="budget" currency="USD" defaultValue={1234.5} />
            <Select
              label="Country"
              name="country"
              searchable
              defaultValue="ph"
              options={[
                { value: "ph", label: "Philippines" },
                { value: "jp", label: "Japan" },
                { value: "nl", label: "Netherlands" }
              ]}
            />
            <DatePicker label="Start" name="start" defaultValue="2026-10-05" clearable />
          </SimpleGrid>
          <Textarea label="Notes" name="notes" defaultValue="Hello" showCount maxLength={200} />
          <Checkbox label="Subscribe" name="subscribe" defaultChecked />
          <Switch label="Notifications" name="notifications" onLabel="ON" offLabel="OFF" />
          <Group justify="flex-end">
            <Button type="reset">Reset</Button>
            <Button type="submit" variant="primary">
              Submit
            </Button>
          </Group>
        </Stack>
      </form>

      <Show when={submitted().length > 0}>
        <Card>
          <Text fw={600}>The server received</Text>
          <Code block>
            <For each={submitted()}>{([key, value]) => `${key} = ${value}\n`}</For>
          </Code>
        </Card>
      </Show>
    </Stack>
  );
}
