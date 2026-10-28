import { createSignal, type JSX, splitProps } from "solid-js";

import { EyeIcon, EyeOffIcon } from "../../icons";
import { Input, type InputProps } from "../Input/Input";

export interface InputPasswordProps extends Omit<
  InputProps,
  "type" | "rightSection" | "inputMode"
> {
  /** Replaces the eye on the toggle button; `visible` is true while the password is shown. */
  visibilityToggleIcon?: (props: { visible: boolean }) => JSX.Element;
}

export function InputPassword(props: InputPasswordProps) {
  const [local, inputProps] = splitProps(props, ["visibilityToggleIcon"]);
  const [visible, setVisible] = createSignal(false);
  return (
    <Input
      {...inputProps}
      inputClass={
        inputProps.inputClass ? `bx-InputPassword ${inputProps.inputClass}` : "bx-InputPassword"
      }
      type={visible() ? "text" : "password"}
      rightSection={{
        pointerEvents: "all",
        node: (
          <button
            type="button"
            class="bx-Input-sectionButton"
            aria-label={visible() ? "Hide password" : "Show password"}
            aria-pressed={visible()}
            disabled={inputProps.disabled}
            onClick={() => setVisible(value => !value)}
          >
            {local.visibilityToggleIcon?.({ visible: visible() }) ??
              (visible() ? <EyeOffIcon /> : <EyeIcon />)}
          </button>
        )
      }}
    />
  );
}
