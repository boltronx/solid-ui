import type { IconProps } from "./IconProps";

export function MoonIcon(props: IconProps) {
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
      <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
    </svg>
  );
}
