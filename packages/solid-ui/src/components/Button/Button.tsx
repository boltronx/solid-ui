import { type JSX, splitProps } from "solid-js";

import { type BaseProps, cx } from "../../utils/style";
import { Loader } from "../Loader/Loader";

export type ButtonVariant = "default" | "primary" | "danger" | "light" | "subtle";

type NativeButtonProps = Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  "class" | "style" | "ref" | "children"
>;

export interface ButtonProps extends NativeButtonProps, BaseProps {
  children?: JSX.Element;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  /** Shows a spinner and blocks clicks, keeping the button's look. */
  loading?: boolean;
  leftSection?: JSX.Element;
  rightSection?: JSX.Element;
  autoFocus?: boolean;
  ref?: (el: HTMLButtonElement) => void;
}

export function Button(props: ButtonProps) {
  // Anything not declared above (aria-*, data-*, form, name, value, ...) goes to the <button>.
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "style",
    "variant",
    "fullWidth",
    "loading",
    "leftSection",
    "rightSection",
    "autoFocus",
    "disabled",
    "type",
    "ref"
  ]);
  const variant = () => local.variant ?? "default";

  return (
    <button
      {...others}
      ref={el => {
        if (local.autoFocus) queueMicrotask(() => el.focus());
        local.ref?.(el);
      }}
      // "button", not the native "submit", so a button in a form never submits by accident.
      type={local.type ?? "button"}
      class={cx("bx-Button", local.class)}
      style={local.style}
      data-variant={variant()}
      data-loading={local.loading ? "" : undefined}
      data-full-width={local.fullWidth ? "" : undefined}
      data-with-left={local.loading || local.leftSection ? "" : undefined}
      data-with-right={local.rightSection ? "" : undefined}
      disabled={local.disabled || local.loading}
      aria-busy={local.loading || undefined}
    >
      {local.loading ? (
        <span class="bx-Button-section">
          <Loader size="xs" color="currentColor" />
        </span>
      ) : local.leftSection ? (
        <span class="bx-Button-section">{local.leftSection}</span>
      ) : null}
      <span class="bx-Button-label">{local.children}</span>
      {local.rightSection ? <span class="bx-Button-section">{local.rightSection}</span> : null}
    </button>
  );
}
