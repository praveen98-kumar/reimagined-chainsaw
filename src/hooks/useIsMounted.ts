import { useEffect, useState } from "react";

/**
 * Returns `false` while server rendering and during the very first client
 * render, and `true` right after the component mounted.
 *
 * Use it to gate markup that depends on client-only state (e.g. redux state
 * hydrated from `localStorage`) so the server rendered HTML is identical to the
 * first client render and React does not report a hydration mismatch.
 */
const useIsMounted = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
};

export default useIsMounted;
