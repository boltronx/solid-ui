import { type Accessor, createContext, type JSX, useContext } from "solid-js";

const ReadOnlyContext = createContext<Accessor<boolean>>(() => false);

/** Makes every input inside read-only, e.g. to show a saved form before an Edit button. */
export function ReadOnlyProvider(props: { readOnly: boolean; children: JSX.Element }) {
  const value = () => props.readOnly;
  return <ReadOnlyContext.Provider value={value}>{props.children}</ReadOnlyContext.Provider>;
}

export function useReadOnly(readOnly?: Accessor<boolean>): Accessor<boolean> {
  const context = useContext(ReadOnlyContext);
  return () => context() || readOnly?.() === true;
}
