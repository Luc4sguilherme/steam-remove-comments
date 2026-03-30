import { useCallback, useEffect, useRef, useState } from 'react';

import {
  removeMyComments,
  removeCommentsFromMyProfile,
} from '../services/removeComments.js';
import { client, community } from '../services/steamClient.js';

export function useCommentRemoval(mode, filter, active) {
  const [progress, setProgress] = useState({
    current: 0,
    total: 0,
    page: null,
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const cancelledRef = useRef(false);

  const removeComments = useCallback(async () => {
    try {
      if (cancelledRef.current) return;

      const steamId = client.steamID.toString();

      if (mode === 1) {
        const res = await removeMyComments({
          community,
          steamId,
          onPage: (page, count) => {
            if (!cancelledRef.current)
              setProgress({ current: 0, total: count, page });
          },
          onProgress: (current, total) => {
            if (!cancelledRef.current)
              setProgress((prev) => ({ ...prev, current, total }));
          },
        });

        if (!cancelledRef.current) setResult(res);

        return;
      }

      if (mode === 2) {
        const res = await removeCommentsFromMyProfile({
          community,
          steamId,
          filter,
          onStart: (total) => {
            if (!cancelledRef.current)
              setProgress({ current: 0, total, page: null });
          },
          onProgress: (current, total) => {
            if (!cancelledRef.current)
              setProgress({ current, total, page: null });
          },
        });

        if (!cancelledRef.current) setResult(res);
      }
    } catch (err) {
      if (!cancelledRef.current) {
        setError(err.message || String(err));
      }
    }
  }, [mode, filter]);

  useEffect(() => {
    if (!active) return undefined;

    cancelledRef.current = false;
    setResult(null);
    setError(null);
    setProgress({ current: 0, total: 0, page: null });
    removeComments();

    return () => {
      cancelledRef.current = true;
    };
  }, [active, removeComments]);

  return { progress, result, error };
}
