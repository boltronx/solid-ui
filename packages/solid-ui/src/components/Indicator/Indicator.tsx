import type { JSX } from "solid-js";

import { type BaseProps, cx } from "../../utils/style";

export interface IndicatorProps extends BaseProps {
  children?: JSX.Element;
  /** Badge content; a number above `maxValue` shows as "99+". Hidden when undefined. */
  label?: JSX.Element | number;
  /** Badge color. Default the danger color. */
  color?: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  maxValue?: number;
}

export function Indicator(props: IndicatorProps) {
  const displayLabel = () => {
    const maxValue = props.maxValue ?? 99;
    if (typeof props.label === "number") {
      return props.label > maxValue ? `${maxValue}+` : props.label;
    }
    return props.label;
  };

  return (
    <div class={cx("bx-Indicator", props.class)} style={props.style}>
      {props.children}
      <div
        class="bx-Indicator-badge"
        data-position={props.position ?? "top-right"}
        style={props.color ? { background: props.color } : undefined}
        hidden={displayLabel() === undefined}
      >
        {displayLabel()}
      </div>
    </div>
  );
}
