import { type BaseProps, cx, mergeStyle } from "../../utils/style";

/** Initials for a name: "Ada Lovelace" -> "AL"; one word gives its first two letters. */
export function getInitials(name: string, twoChars = true): string {
  const trimmed = name.trim();
  if (!twoChars) return trimmed.charAt(0);
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length > 1) return `${words[0]!.charAt(0)}${words[1]!.charAt(0)}`;
  return trimmed.substring(0, 2);
}

export interface AvatarProps extends BaseProps {
  /** The person's name: shown as initials and used as the accessible name. */
  label: string;
  /** Default true. */
  twoChars?: boolean;
  /** Background color. Default the primary color. */
  color?: string;
}

export function Avatar(props: AvatarProps) {
  return (
    <div
      class={cx("bx-Avatar", props.class)}
      role="img"
      aria-label={props.label}
      style={mergeStyle(props.style, { "background-color": props.color })}
    >
      {getInitials(props.label, props.twoChars ?? true)}
    </div>
  );
}
