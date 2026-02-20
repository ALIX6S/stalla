import { useCallback, useEffect, useRef, useState } from "react";
import type { ApiResponse } from "../../core/types";

export interface ApiData<T> {
  data: T;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

/** Loads data from a stable (module-level) fetcher and exposes loading/error state. */
export function useApiData<T>(fetcher: () => Promise<ApiResponse<T>>, initial: T): ApiData<T> {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const reload = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    const response = await fetcher();
    if (id !== requestId.current) return;
    if (response.success) {
      setData(response.data);
      setError(null);
    } else {
      setError(response.message);
    }
    setLoading(false);
  }, [fetcher]);

  useEffect(() => {
    void reload();
    return () => {
      requestId.current++;
    };
  }, [reload]);

  return { data, loading, error, reload };
}
