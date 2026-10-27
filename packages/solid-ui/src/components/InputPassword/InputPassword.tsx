import { createSignal } from "solid-js";

import { EyeIcon } from "../../icons/EyeIcon";
import { EyeOffIcon } from "../../icons/EyeOffIcon";
import { Input, type InputProps } from "../Input/Input";

export type InputPasswordProps = Omit<InputProps, "type" | "rightSection" | "inputMode">;

export function InputPassword(props: InputPasswordProps) {
  const [visible, setVisible] = createSignal(false);
  return (
    <Input
      {...props}
      inputClass={props.inputClass ? `bx-InputPassword ${props.inputClass}` : "bx-InputPassword"}
      type={visible() ? "text" : "password"}
      rightSection={{
        pointerEvents: "all",
        node: (
          <button
            type="button"
            class="bx-Input-sectionButton"
            aria-label={visible() ? "Hide password" : "Show password"}
            aria-pressed={visible()}
            disabled={props.disabled}
            onClick={() => setVisible(value => !value)}
          >
            {visible() ? <EyeOffIcon ariaHidden /> : <EyeIcon ariaHidden />}
          </button>
        )
      }}
    />
  );
}
