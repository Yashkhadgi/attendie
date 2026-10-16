"use client";

import { useEffect } from "react";

export function SessionKeepAlive() {
  useEffect(() => {
    let isMounted = true;

    async function refreshSession() {
      const response = await fetch("/auth/refresh", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
      });

      if (isMounted && response.status === 401) {
        // Use a full navigation so the browser enters the login route handler.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign("/auth/login");
      }
    }

    const interval = window.setInterval(refreshSession, 10 * 60 * 1000);
    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, []);

  return null;
}
