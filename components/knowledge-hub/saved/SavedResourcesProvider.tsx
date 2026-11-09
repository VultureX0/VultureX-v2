"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type SavedMap = Record<string, string>;

type SavedContextValue = {
  saved: SavedMap;
  authenticated: boolean;
  loading: boolean;
  isSaved: (key: string) => boolean;
  toggle: (key: string) => Promise<{ ok: boolean; error?: string }>;
};

const SavedContext = createContext<SavedContextValue | null>(null);

export function SavedResourcesProvider({ children }: { children: React.ReactNode }) {
  const [saved, setSaved] = useState<SavedMap>({});
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/saved-resources", { cache: "no-store" })
      .then(async (response) => {
        if (cancelled) return;
        if (response.status === 401) {
          setAuthenticated(false);
          return;
        }
        if (!response.ok) return;
        const data = (await response.json()) as {
          resources?: { resourceKey: string; id: string }[];
        };
        if (cancelled) return;
        const next: SavedMap = {};
        for (const resource of data.resources ?? []) {
          next[resource.resourceKey] = resource.id;
        }
        setSaved(next);
        setAuthenticated(true);
      })
      .catch(() => {
        // Keep the actions usable; a failed load is not a save failure.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = useCallback(
    async (key: string): Promise<{ ok: boolean; error?: string }> => {
      const currentlySaved = Boolean(saved[key]);
      const snapshot = { ...saved };

      setSaved((previous) => {
        const next = { ...previous };
        if (currentlySaved) delete next[key];
        else next[key] = "pending";
        return next;
      });

      try {
        const response = await fetch(
          currentlySaved
            ? `/api/saved-resources?key=${encodeURIComponent(key)}`
            : "/api/saved-resources",
          {
            method: currentlySaved ? "DELETE" : "POST",
            headers: currentlySaved ? undefined : { "Content-Type": "application/json" },
            body: currentlySaved ? undefined : JSON.stringify({ key }),
          }
        );
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
          resource?: { id: string };
        };

        if (!response.ok) {
          setSaved(snapshot);
          return { ok: false, error: data.error ?? "Could not update saved resources." };
        }

        if (!currentlySaved && data.resource?.id) {
          setSaved((previous) => ({ ...previous, [key]: data.resource!.id }));
        }
        return { ok: true };
      } catch {
        setSaved(snapshot);
        return { ok: false, error: "Network error. Nothing was changed." };
      }
    },
    [saved]
  );

  const value = useMemo<SavedContextValue>(
    () => ({
      saved,
      authenticated,
      loading,
      isSaved: (key: string) => Boolean(saved[key]),
      toggle,
    }),
    [saved, authenticated, loading, toggle]
  );

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSavedResources(): SavedContextValue {
  const value = useContext(SavedContext);
  if (!value) {
    throw new Error("useSavedResources must be used inside SavedResourcesProvider");
  }
  return value;
}
