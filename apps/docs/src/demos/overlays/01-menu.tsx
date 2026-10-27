export const meta = {
  title: "Menu",
  description:
    "Any content can open a menu; a non-focusable target such as an Avatar becomes a button."
};

import {
  Avatar,
  Button,
  Group,
  Menu,
  MenuDivider,
  MenuDropdown,
  MenuItem,
  MenuTarget,
  message
} from "@boltronx/solid-ui";
import { EditIcon, LogoutIcon, SettingsIcon, TrashIcon } from "@boltronx/solid-ui/icons";

export default function Demo() {
  return (
    <Group>
      <Menu>
        <MenuTarget>
          <Button>Actions</Button>
        </MenuTarget>
        <MenuDropdown>
          <MenuItem leftSection={<EditIcon />} onClick={() => message.info("Edit")}>
            Edit
          </MenuItem>
          <MenuItem disabled>Archive</MenuItem>
          <MenuDivider />
          <MenuItem danger leftSection={<TrashIcon />} onClick={() => message.error("Deleted")}>
            Delete
          </MenuItem>
        </MenuDropdown>
      </Menu>
      <Menu position="bottom-end">
        <MenuTarget ariaLabel="Account menu">
          <Avatar label="Ada Lovelace" />
        </MenuTarget>
        <MenuDropdown>
          <MenuItem leftSection={<SettingsIcon />}>Settings</MenuItem>
          <MenuItem leftSection={<LogoutIcon />}>Sign out</MenuItem>
        </MenuDropdown>
      </Menu>
    </Group>
  );
}
