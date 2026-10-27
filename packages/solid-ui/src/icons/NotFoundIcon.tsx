import type { IconProps } from "./IconProps";

export function NotFoundIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={props.color ?? "currentColor"}
      stroke-width="2"
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
      <path d="M3 8v3a1 1 0 0 0 1 1h3" />
      <path d="M7 8v8" />
      <path d="M17 8v3a1 1 0 0 0 1 1h3" />
      <path d="M21 8v8" />
      <path d="M10 10v4a2 2 0 1 0 4 0v-4a2 2 0 1 0 -4 0" />
    </svg>
  );
}
