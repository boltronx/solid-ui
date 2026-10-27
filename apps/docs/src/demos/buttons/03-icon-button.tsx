export const meta = {
  title: "IconButton",
  description: "tooltip also gives the button its accessible name."
};

import { Group, IconButton } from "@boltronx/solid-ui";
import { EditIcon, SettingsIcon, TrashIcon } from "@boltronx/solid-ui/icons";

export default function Demo() {
  return (
    <Group>
      <IconButton tooltip="Settings">
        <SettingsIcon />
      </IconButton>
      <IconButton tooltip="Edit" color="primary" bordered>
        <EditIcon />
      </IconButton>
      <IconButton tooltip="Delete" color="danger" bordered>
        <TrashIcon />
      </IconButton>
    </Group>
  );
}
