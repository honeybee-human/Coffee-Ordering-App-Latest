import React, { useEffect, useState } from 'react';
import { useGroupsStore } from '@/store/useGroupsStore';
import { fetchBootstrap } from '@/lib/api';
import { hydrateFromApi } from '@/store/hydrateFromApi';
import { setApiSyncing, startApiSync } from '@/store/apiSync';

const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setApiSyncing(true);
      try {
        const payload = await fetchBootstrap();
        if (!cancelled) {
          hydrateFromApi(payload);
        }
      } catch (error) {
        console.warn('API unavailable; using in-memory defaults', error);
        if (!cancelled) {
          useGroupsStore.getState().initialize();
        }
      } finally {
        if (!cancelled) {
          setApiSyncing(false);
          startApiSync();
          setReady(true);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading SafePlate…
      </div>
    );
  }

  return <>{children}</>;
};

export default AppProviders;
