import type { IconProps } from "./IconProps";

export function PlusIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      stroke={props.color ?? "currentColor"}
      stroke-width="2"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-label={props.ariaLabel}
      aria-hidden={props.ariaHidden}
      role={props.role}
      onClick={event => props.onClick?.(event)}
      class={props.class}
      style={props.style}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}
