import { useSyncExternalStore } from "react";

/**
 * Returns `false` while server rendering and during the very first client
 * render, and `true` right after the component mounts.
 *
 * Implemented with `useSyncExternalStore` instead of `useEffect` + `useState`
 * so there is no extra render pass and no hydration mismatch.
 *
 * Use it to gate markup that depends on client-only state (e.g. redux state
 * hydrated from `localStorage`) so the server rendered HTML is identical to the
 * first client render.
 */
const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

const useIsMounted = () =>
  useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

export default useIsMounted;
export { useIsMounted };
