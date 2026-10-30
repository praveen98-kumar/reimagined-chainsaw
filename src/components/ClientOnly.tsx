import useIsMounted from "@/hooks/useIsMounted";

/**
 * Renders `children` only on the client, rendering `fallback` (null by default)
 * on the server and during the first client render. Useful for wrapping subtrees
 * that depend on client-only state without sprinkling `useIsMounted` everywhere.
 */
export function ClientOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const isMounted = useIsMounted();
  if (!isMounted) return <>{fallback}</>;
  return <>{children}</>;
}

export default ClientOnly;
