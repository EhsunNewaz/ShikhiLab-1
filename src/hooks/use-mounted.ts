'use client';

import { useState, useEffect } from 'react';

/**
 * A hook to check if the component has mounted on the client.
 * This is useful for preventing hydration mismatches by ensuring
 * that client-side-only UI is not rendered on the server.
 * @returns {boolean} - True if the component has mounted, false otherwise.
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
