export const meta = {
  title: "message",
  description: "Short notifications. Hovering one pauses its timer."
};

import { Button, Group, message } from "@boltronx/solid-ui";

export default function Demo() {
  return (
    <Group wrap>
      <Button onClick={() => message.success("Changes saved")}>Success</Button>
      <Button onClick={() => message.error("Couldn't reach the server")}>Error</Button>
      <Button onClick={() => message.warning("Your session ends in 5 minutes")}>Warning</Button>
      <Button onClick={() => message.info("A new version is available")}>Info</Button>
    </Group>
  );
}
