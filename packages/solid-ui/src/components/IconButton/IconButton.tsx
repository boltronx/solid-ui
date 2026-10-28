import { createUniqueId, type JSX, Show, splitProps } from "solid-js";

import { type BaseProps, cx } from "../../utils/style";

type NativeButtonProps = Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  "class" | "style" | "ref" | "children"
>;

export interface IconButtonProps extends NativeButtonProps, BaseProps {
  children?: JSX.Element;
  color?: "default" | "primary" | "danger";
  bordered?: boolean;
  /** Shown above the button on hover and keyboard focus; also its accessible name. */
  tooltip?: string;
  autoFocus?: boolean;
  ref?: (el: HTMLButtonElement) => void;
}

export function IconButton(props: IconButtonProps) {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "style",
    "color",
    "bordered",
    "tooltip",
    "autoFocus",
    "type",
    "ref"
  ]);
  const tooltipId = `bx-tooltip-${createUniqueId()}`;

  const button = () => (
    <button
      {...others}
      ref={el => {
        if (local.autoFocus) queueMicrotask(() => el.focus());
        local.ref?.(el);
      }}
      type={local.type ?? "button"}
      class={cx("bx-IconButton", local.class)}
      style={local.style}
      data-color={local.color ?? "default"}
      data-bordered={local.bordered ? "" : undefined}
      aria-label={others["aria-label"] ?? local.tooltip}
      // The tooltip already names the button; it only describes it when aria-label names it.
      aria-describedby={
        local.tooltip && others["aria-label"] ? tooltipId : others["aria-describedby"]
      }
    >
      {local.children}
    </button>
  );

  return (
    <Show when={local.tooltip} fallback={button()}>
      <span class="bx-IconButton-wrapper">
        {button()}
        <span id={tooltipId} role="tooltip" class="bx-IconButton-tooltip">
          {local.tooltip}
        </span>
      </span>
    </Show>
  );
}
