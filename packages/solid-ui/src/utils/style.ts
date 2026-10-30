import type { JSX } from "solid-js";

export type Size = "xs" | "sm" | "md" | "lg" | "xl";
export type SizeProp = Size | (string & {}) | number;
export type StyleProp = string | JSX.CSSProperties | undefined;

export type JustifyContent =
  | "flex-start"
  | "flex-end"
  | "center"
  | "space-between"
  | "space-around"
  | "space-evenly"
  | "start"
  | "end";
export type AlignItems =
  "flex-start" | "flex-end" | "stretch" | "center" | "baseline" | "start" | "end";

export interface BaseProps {
  class?: string;
  style?: StyleProp;
}

const SIZES = new Set<string>(["xs", "sm", "md", "lg", "xl"]);

export function cx(...args: (string | false | undefined | null)[]): string {
  return args.filter((c): c is string => typeof c === "string" && c.length > 0).join(" ");
}

/** Resolves a size prop to a CSS length: a token name, a number of px, or any CSS length. */
export function resolveSize(size: SizeProp, scale?: string): string;
export function resolveSize(size: SizeProp | undefined, scale?: string): string | undefined;
export function resolveSize(size: SizeProp | undefined, scale = "spacing"): string | undefined {
  if (size === undefined) return undefined;
  if (typeof size === "number") return `${size}px`;
  if (SIZES.has(size)) return `var(--bx-${scale}-${size})`;
  return size;
}

function styleEntryToCss(key: string, value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  // Custom properties are case-sensitive, so only regular property names are kebab-cased.
  const cssKey = key.startsWith("--") ? key : key.replace(/([A-Z])/g, "-$1").toLowerCase();
  return `${cssKey}: ${String(value)}`;
}

function styleObjectToCss(style: Record<string, unknown> | undefined): string {
  if (!style) return "";
  return Object.entries(style)
    .map(([key, value]) => styleEntryToCss(key, value))
    .filter((entry): entry is string => entry !== null)
    .join("; ");
}

/**
 * Merges a user `style` prop (string or object) with the component's own declarations. The user's
 * style comes last, so it wins where both set a property, e.g. `<Card style={{ padding: 0 }}>`.
 */
export function mergeStyle(
  style: StyleProp,
  additions: Record<string, string | undefined>
): string | undefined {
  const userCss =
    typeof style === "string" ? style : styleObjectToCss(style as Record<string, unknown>);
  const additionsCss = styleObjectToCss(additions);

  if (userCss && additionsCss) return `${additionsCss}; ${userCss}`;
  return userCss || additionsCss || undefined;
}
