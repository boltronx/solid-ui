import type { Accessor, JSX } from "solid-js";
import { createEffect, createSignal, onCleanup, Show } from "solid-js";
import { Portal } from "solid-js/web";

import { cx } from "../../utils/style";

export type FloatingPosition =
  "bottom" | "bottom-end" | "top" | "top-end" | "left" | "left-end" | "right" | "right-end";

export interface FloatingPanelProps {
  open: boolean;
  target: Accessor<HTMLElement | undefined>;
  children?: JSX.Element;
  class?: string;
  position?: FloatingPosition;
  matchTargetWidth?: boolean;
  /** With `matchTargetWidth`, the narrowest the panel gets, in px; a wider target still sets its width. */
  minWidth?: number;
  gap?: number;
  viewportPadding?: number;
  exitDuration?: number;
  ref?: (element: HTMLDivElement | undefined) => void;
  onClick?: (event: MouseEvent) => void;
}

type Coordinates = {
  top: number;
  left: number;
  position: FloatingPosition;
  width?: number;
};

function oppositePosition(position: FloatingPosition): FloatingPosition {
  const [side, alignment] = position.split("-") as [string, string | undefined];
  const opposite = { bottom: "top", top: "bottom", left: "right", right: "left" }[side];
  return `${opposite}${alignment ? `-${alignment}` : ""}` as FloatingPosition;
}

function coordinatesFor(
  position: FloatingPosition,
  target: DOMRect,
  panel: Pick<DOMRect, "width" | "height">,
  gap: number
) {
  let top = target.bottom + gap;
  let left = target.left;

  switch (position) {
    case "bottom-end":
      left = target.right - panel.width;
      break;
    case "top":
      top = target.top - panel.height - gap;
      break;
    case "top-end":
      top = target.top - panel.height - gap;
      left = target.right - panel.width;
      break;
    case "right":
      top = target.top;
      left = target.right + gap;
      break;
    case "right-end":
      top = target.bottom - panel.height;
      left = target.right + gap;
      break;
    case "left":
      top = target.top;
      left = target.left - panel.width - gap;
      break;
    case "left-end":
      top = target.bottom - panel.height;
      left = target.left - panel.width - gap;
      break;
  }

  return { top, left };
}

function isTargetVisible(target: HTMLElement, targetRect: DOMRect) {
  if (!target.isConnected || targetRect.width === 0 || targetRect.height === 0) return false;

  const targetStyle = window.getComputedStyle(target);
  if (targetStyle.display === "none" || targetStyle.visibility === "hidden") return false;

  let visibleTop = 0;
  let visibleRight = window.innerWidth;
  let visibleBottom = window.innerHeight;
  let visibleLeft = 0;

  for (let ancestor = target.parentElement; ancestor; ancestor = ancestor.parentElement) {
    const style = window.getComputedStyle(ancestor);
    const clipsX = /^(auto|clip|hidden|scroll)$/.test(style.overflowX);
    const clipsY = /^(auto|clip|hidden|scroll)$/.test(style.overflowY);
    if (!clipsX && !clipsY) continue;

    const rect = ancestor.getBoundingClientRect();
    if (clipsX) {
      visibleLeft = Math.max(visibleLeft, rect.left);
      visibleRight = Math.min(visibleRight, rect.right);
    }
    if (clipsY) {
      visibleTop = Math.max(visibleTop, rect.top);
      visibleBottom = Math.min(visibleBottom, rect.bottom);
    }
  }

  return (
    Math.max(targetRect.left, visibleLeft) < Math.min(targetRect.right, visibleRight) &&
    Math.max(targetRect.top, visibleTop) < Math.min(targetRect.bottom, visibleBottom)
  );
}

export function FloatingPanel(props: FloatingPanelProps) {
  let panelRef: HTMLDivElement | undefined;
  let closeTimer: number | undefined;
  let rafId: number | undefined;
  const [mounted, setMounted] = createSignal(false);
  const [positioned, setPositioned] = createSignal(false);
  const [coords, setCoords] = createSignal<Coordinates>({
    top: 0,
    left: 0,
    position: "bottom"
  });

  const updatePosition = () => {
    const target = props.target();
    if (!target || !panelRef) return;

    const targetRect = target.getBoundingClientRect();
    if (!isTargetVisible(target, targetRect)) {
      setPositioned(false);
      return;
    }

    const panelRect = panelRef.getBoundingClientRect();
    const padding = props.viewportPadding ?? 8;
    const matchedWidth = props.matchTargetWidth
      ? Math.min(Math.max(targetRect.width, props.minWidth ?? 0), window.innerWidth - padding * 2)
      : undefined;
    const measuredPanel = {
      width: matchedWidth ?? panelRect.width,
      height: panelRect.height
    };
    const gap = props.gap ?? 4;
    const preferred = props.position ?? "bottom";
    const preferredSide = preferred.split("-")[0];
    const spaces = {
      bottom: window.innerHeight - targetRect.bottom - gap - padding,
      top: targetRect.top - gap - padding,
      right: window.innerWidth - targetRect.right - gap - padding,
      left: targetRect.left - gap - padding
    };
    const panelSize =
      preferredSide === "bottom" || preferredSide === "top"
        ? measuredPanel.height
        : measuredPanel.width;
    const opposite = oppositePosition(preferred);
    const oppositeSide = opposite.split("-")[0] as keyof typeof spaces;
    const resolved =
      spaces[preferredSide as keyof typeof spaces] < panelSize &&
      spaces[oppositeSide] > spaces[preferredSide as keyof typeof spaces]
        ? opposite
        : preferred;
    const raw = coordinatesFor(resolved, targetRect, measuredPanel, gap);

    setCoords({
      top: Math.max(
        padding,
        Math.min(raw.top, window.innerHeight - measuredPanel.height - padding)
      ),
      left: Math.max(
        padding,
        Math.min(raw.left, window.innerWidth - measuredPanel.width - padding)
      ),
      position: resolved,
      width: matchedWidth
    });
    setPositioned(true);
  };

  const schedulePositionUpdate = () => {
    if (rafId !== undefined) return;
    rafId = window.requestAnimationFrame(() => {
      rafId = undefined;
      updatePosition();
    });
  };

  createEffect(() => {
    if (props.open) {
      if (closeTimer !== undefined) window.clearTimeout(closeTimer);
      closeTimer = undefined;
      setPositioned(false);
      setMounted(true);
      queueMicrotask(schedulePositionUpdate);
      return;
    }

    if (!mounted()) return;
    const exitDuration = props.exitDuration ?? 0;
    if (exitDuration === 0) {
      setMounted(false);
      props.ref?.(undefined);
      return;
    }
    closeTimer = window.setTimeout(() => {
      setMounted(false);
      props.ref?.(undefined);
      closeTimer = undefined;
    }, exitDuration);
  });

  createEffect(() => {
    if (!props.open) return;
    schedulePositionUpdate();
    const resizeObserver = new ResizeObserver(schedulePositionUpdate);
    const target = props.target();
    if (target) resizeObserver.observe(target);
    queueMicrotask(() => {
      if (panelRef) resizeObserver.observe(panelRef);
    });
    window.addEventListener("resize", schedulePositionUpdate);
    window.addEventListener("scroll", schedulePositionUpdate, { capture: true, passive: true });

    onCleanup(() => {
      window.removeEventListener("resize", schedulePositionUpdate);
      window.removeEventListener("scroll", schedulePositionUpdate, true);
      resizeObserver.disconnect();
      if (rafId !== undefined) window.cancelAnimationFrame(rafId);
      rafId = undefined;
    });
  });

  onCleanup(() => {
    if (closeTimer !== undefined) window.clearTimeout(closeTimer);
    if (rafId !== undefined) window.cancelAnimationFrame(rafId);
    props.ref?.(undefined);
  });

  return (
    <Show when={mounted()}>
      <Portal>
        <div
          ref={element => {
            panelRef = element;
            props.ref?.(element);
            queueMicrotask(schedulePositionUpdate);
          }}
          class={cx("bx-FloatingPanel", props.class)}
          data-open={props.open.toString()}
          data-position={coords().position}
          style={{
            top: `${coords().top}px`,
            left: `${coords().left}px`,
            width: coords().width === undefined ? undefined : `${coords().width}px`,
            visibility: positioned() ? undefined : "hidden"
          }}
          onClick={event => props.onClick?.(event)}
        >
          {/*
            Created only once open: made up front, the closed panel's content would be built while
            hydrating, with no server HTML to match it.
          */}
          {props.children}
        </div>
      </Portal>
    </Show>
  );
}
