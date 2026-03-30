import { useState, useEffect } from 'react';

export function useApi(apiFn, fallbackData = null) {
  const [data, setData] = useState(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    apiFn()
      .then(result => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          console.warn('API fallback:', err.message);
          setError(err);
          setLoading(false);
          // Keep fallback data
        }
      });

    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}
