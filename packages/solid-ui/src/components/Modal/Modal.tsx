import {
  type Accessor,
  createContext,
  createEffect,
  createRoot,
  createSignal,
  createUniqueId,
  For,
  type JSX,
  onCleanup,
  Show,
  splitProps,
  useContext
} from "solid-js";
import { render } from "solid-js/web";

import { CloseIcon } from "../../icons";
import { cx, type StyleProp } from "../../utils/style";
import { ScrollArea, type ScrollAreaProps } from "../ScrollArea/ScrollArea";

/** Why a modal closed without a value: Escape, a backdrop click, the header close button or closeAll. */
export type ModalDismissReason = "escape" | "backdrop" | "close" | "closeAll";

export interface ModalContext<T = string> {
  close: (value?: T) => Promise<void>;
  /** Blocks dismissing (Escape, backdrop, close button), e.g. while saving. */
  lock: (locked: boolean) => void;
  locked: Accessor<boolean>;
}

type ModalOffset = string | number;

export type ModalPosition =
  | "centered"
  | {
      top?: ModalOffset;
      bottom?: ModalOffset;
    };

export interface ModalOptions<T = string> {
  position?: ModalPosition;
  closeOnEscape?: boolean;
  closeOnBackdrop?: boolean;
  /** Return false to keep the modal open, e.g. after asking to discard changes. */
  onBeforeClose?: (reason?: ModalDismissReason | T) => Promise<boolean> | boolean;
  content: (ctx: ModalContext<T>) => JSX.Element;
}

type ResolvedModalOptions<T = string> = Required<
  Pick<ModalOptions<T>, "closeOnEscape" | "closeOnBackdrop">
> &
  Omit<ModalOptions<T>, "closeOnEscape" | "closeOnBackdrop">;

interface ModalItem extends ModalContext<unknown> {
  id: number;
  renderContent: (ctx: ModalContext<unknown>) => JSX.Element;
  requestDismiss: (reason: Exclude<ModalDismissReason, "closeAll">) => void;
  exiting: Accessor<boolean>;
  options: ResolvedModalOptions<unknown>;
}

function toCssLength(value: ModalOffset) {
  return typeof value === "number" ? `${value}px` : value;
}

function resolvePlacement(position: ModalPosition | undefined): {
  placement: "center" | "top" | "bottom";
  style?: JSX.CSSProperties;
} {
  if (position === undefined || position === "centered") return { placement: "center" };
  const top = position.top === undefined ? undefined : toCssLength(position.top);
  const bottom = position.bottom === undefined ? undefined : toCssLength(position.bottom);
  // Both given: a bottom sheet on phones, where the thumb is, and a top dialog elsewhere.
  if (top !== undefined && bottom !== undefined) {
    return window.matchMedia("(max-width: 431px)").matches
      ? { placement: "bottom", style: { "--bx-modal-offset": bottom } }
      : { placement: "top", style: { "--bx-modal-offset": top } };
  }
  if (top !== undefined) return { placement: "top", style: { "--bx-modal-offset": top } };
  if (bottom !== undefined) return { placement: "bottom", style: { "--bx-modal-offset": bottom } };
  return { placement: "center" };
}

let idCounter = 0;
let getModals: (() => ModalItem[]) | undefined;
let setModals: ((updater: (prev: ModalItem[]) => ModalItem[]) => void) | undefined;

function ModalContainer() {
  const [modals, setModalList] = createSignal<ModalItem[]>([]);
  getModals = modals;
  setModals = setModalList;

  createEffect(() => {
    document.documentElement.classList.toggle("bx-scroll-locked", modals().length > 0);
  });
  onCleanup(() => document.documentElement.classList.remove("bx-scroll-locked"));

  return (
    <div class="bx-Modal" role="presentation">
      <For each={modals()}>
        {item => {
          const placement = resolvePlacement(item.options.position);
          return (
            <div
              class="bx-Modal-wrap"
              data-placement={placement.placement}
              data-exiting={item.exiting() ? "" : undefined}
              style={placement.style}
              role="presentation"
            >
              <div class="bx-Modal-overlay" onClick={() => item.requestDismiss("backdrop")} />
              {item.renderContent({ close: item.close, lock: item.lock, locked: item.locked })}
            </div>
          );
        }}
      </For>
    </div>
  );
}

interface ModalSectionProps {
  children?: JSX.Element;
  class?: string;
  style?: StyleProp;
}

const TitleIdContext = createContext<string>();

function ModalRoot(props: ModalSectionProps & { "aria-label"?: string }) {
  const titleId = `bx-modal-title-${createUniqueId()}`;
  return (
    <TitleIdContext.Provider value={titleId}>
      <section
        class={cx("bx-Modal-card", props.class)}
        role="dialog"
        aria-modal="true"
        aria-label={props["aria-label"]}
        aria-labelledby={props["aria-label"] ? undefined : titleId}
        tabindex={-1}
        style={props.style}
      >
        {props.children}
      </section>
    </TitleIdContext.Provider>
  );
}

function ModalHeader(
  props: ModalSectionProps &
    // `never` accepts the `close` of a modal typed with any value, e.g. modal.open<"ok">.
    Partial<Pick<ModalContext<never>, "close" | "locked">> & {
      title?: JSX.Element;
      /** Default true. */
      closable?: boolean;
      /** Replaces the cross on the close button. */
      closeIcon?: JSX.Element;
    }
) {
  const titleId = useContext(TitleIdContext);
  return (
    <header class={cx("bx-Modal-header", props.class)} style={props.style}>
      <Show
        when={props.children}
        fallback={
          <>
            <h2 id={titleId} class="bx-Modal-title">
              {props.title}
            </h2>
            <Show when={props.closable !== false}>
              <button
                type="button"
                class="bx-Modal-close"
                aria-label="Close"
                disabled={props.locked?.()}
                onClick={() =>
                  (props.close as ((reason: "close") => Promise<void>) | undefined)?.("close")
                }
              >
                {props.closeIcon ?? <CloseIcon />}
              </button>
            </Show>
          </>
        }
      >
        {props.children}
      </Show>
    </header>
  );
}

function ModalBody(props: ScrollAreaProps) {
  const [local, rest] = splitProps(props, ["class", "viewportClass"]);
  return (
    <ScrollArea
      {...rest}
      class={cx("bx-Modal-body", local.class)}
      viewportClass={cx("bx-Modal-viewport", local.viewportClass)}
    />
  );
}

function ModalFooter(props: ModalSectionProps) {
  return (
    <footer class={cx("bx-Modal-footer", props.class)} style={props.style}>
      {props.children}
    </footer>
  );
}

function ensureContainer() {
  if (setModals) return;
  const host = document.createElement("div");
  document.body.appendChild(host);
  render(() => <ModalContainer />, host);
}

/** Opens a modal and resolves with the value passed to `close`, or the dismiss reason. */
function open<T = string>(options: ModalOptions<T>): Promise<T | ModalDismissReason | undefined> {
  ensureContainer();
  const id = ++idCounter;
  const resolvedOptions: ResolvedModalOptions<T> = {
    closeOnEscape: true,
    closeOnBackdrop: true,
    position: "centered",
    ...options
  };

  return new Promise<T | ModalDismissReason | undefined>(resolve => {
    createRoot(dispose => {
      const [exiting, setExiting] = createSignal(false);
      const [locked, setLocked] = createSignal(false);
      let closed = false;

      const isTopModal = () => getModals?.().at(-1)?.id === id;

      const close = async (value?: T | ModalDismissReason | undefined) => {
        if (closed) return;
        if (resolvedOptions.onBeforeClose) {
          const proceed = await resolvedOptions.onBeforeClose(value);
          if (!proceed) return;
        }
        closed = true;
        window.removeEventListener("keydown", onKeyDown);
        setExiting(true);

        // Let the exit state paint before starting teardown timing.
        requestAnimationFrame(() => {
          window.setTimeout(() => {
            setModals?.(prev => prev.filter(item => item.id !== id));
            resolve(value);
            dispose();
          }, 220);
        });
      };

      const requestDismiss = (reason: Exclude<ModalDismissReason, "closeAll">) => {
        if (closed || locked() || !isTopModal()) return;
        if (reason === "escape" && !resolvedOptions.closeOnEscape) return;
        if (reason === "backdrop" && !resolvedOptions.closeOnBackdrop) return;
        void close(reason);
      };

      const onKeyDown = (event: KeyboardEvent) => {
        // Skip an Escape already handled inside the modal, e.g. one that closed a Select dropdown.
        if (event.key !== "Escape" || event.defaultPrevented) return;
        requestDismiss("escape");
      };

      window.addEventListener("keydown", onKeyDown);

      setModals?.(prev => [
        ...prev,
        {
          id,
          renderContent: options.content,
          close,
          requestDismiss,
          lock: (value: boolean) => setLocked(value),
          locked,
          exiting,
          options: resolvedOptions
        } as unknown as ModalItem
      ]);
    });
  });
}

function closeAll() {
  for (const item of getModals?.() ?? []) void item.close("closeAll");
}

export const modal = {
  open,
  closeAll
};

// Marked pure so bundlers can drop Modal from apps that never import it.
export const Modal = /* @__PURE__ */ Object.assign(ModalRoot, {
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter
});
