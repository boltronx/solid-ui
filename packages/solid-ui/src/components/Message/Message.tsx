import { createRoot, createSignal, For, type JSX, Show } from "solid-js";
import { render } from "solid-js/web";

import { CloseIcon, ErrorIcon, InfoIcon, SuccessIcon, WarningIcon } from "../../icons";

export type MessageType = "success" | "error" | "warning" | "info";

export interface MessageOptions {
  /** How long the message stays, in seconds. 0 keeps it until it is closed (and makes it closable). */
  seconds?: number;
  /** Replaces the icon for its type. */
  icon?: JSX.Element;
  /** Shows a button that closes the message. */
  closable?: boolean;
}

/** Closes the message, or drops it if it is still waiting in the queue. */
export type CloseMessage = () => void;

interface MessageItem {
  id: number;
  type: MessageType;
  text: string;
  icon: JSX.Element | undefined;
  closable: boolean;
  exiting: () => boolean;
  pause: () => void;
  resume: () => void;
  close: () => void;
}

let idCounter = 0;
let setMessages: ((updater: (prev: MessageItem[]) => MessageItem[]) => void) | undefined;
let announceError: ((text: string) => void) | undefined;

const ICONS: Record<MessageType, () => JSX.Element> = {
  success: () => <SuccessIcon />,
  error: () => <ErrorIcon />,
  warning: () => <WarningIcon />,
  info: () => <InfoIcon />
};

function MessageContainer() {
  const [messages, setMessageList] = createSignal<MessageItem[]>([]);
  const [errorText, setErrorText] = createSignal("");
  setMessages = setMessageList;
  // Emptied first, so the same error twice in a row is still a change to announce.
  announceError = text => {
    setErrorText("");
    setTimeout(() => setErrorText(`Error: ${text}`), 50);
  };

  return (
    <>
      <div class="bx-Message" role="status" aria-live="polite" aria-label="Notifications">
        <For each={messages()}>
          {item => (
            <div
              class="bx-Message-item"
              data-type={item.type}
              data-exiting={item.exiting() ? "" : undefined}
              onPointerEnter={item.pause}
              onPointerLeave={item.resume}
            >
              {/* An error is read out by the alert region instead, so it isn't heard twice. */}
              <span
                class="bx-Message-content"
                aria-hidden={item.type === "error" ? "true" : undefined}
              >
                <span class="bx-Message-icon">{item.icon ?? ICONS[item.type]()}</span>
                <span class="bx-Message-text">{item.text}</span>
              </span>
              <Show when={item.closable}>
                <button
                  type="button"
                  class="bx-Message-close"
                  aria-label="Close notification"
                  onClick={item.close}
                >
                  <CloseIcon />
                </button>
              </Show>
            </div>
          )}
        </For>
      </div>
      {/* Errors interrupt, as an alert should; the polite region above waits its turn. */}
      <div class="bx-visually-hidden" role="alert">
        {errorText()}
      </div>
    </>
  );
}

function ensureContainer() {
  if (setMessages) return;
  const host = document.createElement("div");
  document.body.appendChild(host);
  render(() => <MessageContainer />, host);
}

interface QueuedMessage {
  type: MessageType;
  text: string;
  icon: JSX.Element | undefined;
  seconds: number;
  closable: boolean;
  /** Set once it is on screen; until then, closing just takes it out of the queue. */
  close?: () => void;
}

const DEFAULT_LIMIT = 3;
let limit = DEFAULT_LIMIT;
/** Messages on screen and not yet leaving; at most `limit`. */
let visibleCount = 0;
/** Messages waiting for a free slot, oldest first. */
const queue: QueuedMessage[] = [];

/** Shows queued messages while there is room. */
function drain() {
  while (visibleCount < limit && queue.length > 0) display(queue.shift()!);
}

/** `options` is the seconds to show for, or an options object; defaultSeconds is used without. */
function show(
  type: MessageType,
  text: string,
  options: number | MessageOptions | undefined,
  defaultSeconds: number
): CloseMessage {
  const {
    seconds = defaultSeconds,
    icon,
    closable = false
  } = typeof options === "number" ? { seconds: options } : (options ?? {});
  // One that never leaves on its own must be closable, or it could stay on screen for good.
  const queued: QueuedMessage = { type, text, icon, seconds, closable: closable || seconds <= 0 };
  queue.push(queued);
  drain();
  return () => {
    if (queued.close) return queued.close();
    const index = queue.indexOf(queued);
    if (index >= 0) queue.splice(index, 1);
  };
}

function display(queued: QueuedMessage) {
  const { type, text, icon, seconds, closable } = queued;
  ensureContainer();
  const id = ++idCounter;
  visibleCount++;

  // Each message owns its exiting signal inside a root so it has a proper
  // reactive owner and is cleaned up when the message is removed.
  createRoot(dispose => {
    const [exiting, setExiting] = createSignal(false);
    // The duration starts when the message appears, not while it waits in the queue.
    let remaining = Math.max(0, seconds * 1000);
    const persistent = seconds <= 0;
    let startedAt = 0;
    let dismissTimer: ReturnType<typeof setTimeout> | undefined;

    const dismiss = () => {
      // Closed by the button, by its close function or by the timer: whichever comes first.
      if (exiting()) return;
      clearTimeout(dismissTimer);
      dismissTimer = undefined;
      setExiting(true);
      // Its slot frees as it starts leaving, so the next message comes in without a gap.
      visibleCount--;
      drain();
      setTimeout(() => {
        setMessages!(prev => prev.filter(m => m.id !== id));
        dispose();
      }, 320);
    };

    const resume = () => {
      if (persistent || exiting() || dismissTimer !== undefined) return;
      startedAt = performance.now();
      dismissTimer = setTimeout(dismiss, remaining);
    };

    const pause = () => {
      if (exiting() || dismissTimer === undefined) return;
      clearTimeout(dismissTimer);
      dismissTimer = undefined;
      remaining = Math.max(0, remaining - (performance.now() - startedAt));
    };

    // The item object is never replaced — only `exiting` (a signal) changes.
    // This keeps <For> from recreating DOM nodes during the exit transition.
    setMessages!(prev => [
      ...prev,
      { id, type, text, icon, closable, exiting, pause, resume, close: dismiss }
    ]);
    queued.close = dismiss;
    if (type === "error") announceError!(text);
    if (!persistent) {
      startedAt = performance.now();
      dismissTimer = setTimeout(dismiss, remaining);
    }
  });
}

export interface MessageConfig {
  /** How many messages show at once; more wait in a queue. Default 3. */
  limit?: number;
}

/**
 * Short notifications at the top of the screen. The second argument is how long to show the
 * message, in seconds (0 keeps it until closed), or `{ seconds, icon, closable }`. Each call
 * returns a function that closes the message. Up to three show at once (see `config`); the rest
 * queue and each appears as an earlier one leaves.
 */
export const message = {
  success(text: string, options?: number | MessageOptions): CloseMessage {
    return show("success", text, options, 3);
  },
  error(text: string, options?: number | MessageOptions): CloseMessage {
    return show("error", text, options, 6);
  },
  warning(text: string, options?: number | MessageOptions): CloseMessage {
    return show("warning", text, options, 4);
  },
  info(text: string, options?: number | MessageOptions): CloseMessage {
    return show("info", text, options, 3);
  },
  /** Changes how many messages show at once. */
  config(config: MessageConfig) {
    if (config.limit !== undefined) limit = Math.max(1, Math.floor(config.limit));
    drain();
  }
};
