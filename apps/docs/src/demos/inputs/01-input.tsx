export const meta = {
  title: "Input",
  description: "label, description and error are linked to the input for screen readers."
};

import { Input, SimpleGrid } from "@boltronx/solid-ui";
import { MailIcon } from "@boltronx/solid-ui/icons";

export default function Demo() {
  return (
    <SimpleGrid minChildWidth="14rem">
      <Input label="Full name" placeholder="Ada Lovelace" required />
      <Input
        label="Email"
        type="email"
        description="We never share it."
        leftSection={<MailIcon />}
        placeholder="ada@example.com"
      />
      <Input label="Username" defaultValue="ada" error="This username is taken." />
      <Input label="Read-only" defaultValue="Can't change this" readOnly />
    </SimpleGrid>
  );
}
