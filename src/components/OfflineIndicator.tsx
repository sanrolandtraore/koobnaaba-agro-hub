import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { getSyncQueueCount } from '@/lib/offlineDb';
import { onSyncChange, syncOnReconnect } from '@/lib/syncManager';
import { Badge } from '@/components/ui/badge';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    
    // Check pending items
    getSyncQueueCount().then(setPendingCount);
    const unsub = onSyncChange(setPendingCount);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      unsub();
    };
  }, []);

  const handleManualSync = async () => {
    if (!navigator.onLine || syncing) return;
    setSyncing(true);
    await syncOnReconnect();
    const count = await getSyncQueueCount();
    setPendingCount(count);
    setSyncing(false);
  };

  // Don't show anything when online and no pending items
  if (isOnline && pendingCount === 0) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-auto z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium transition-all ${
        isOnline
          ? 'bg-amber-500/90 text-white backdrop-blur-sm'
          : 'bg-destructive/90 text-destructive-foreground backdrop-blur-sm'
      }`}
    >
      {isOnline ? (
        <Wifi className="h-4 w-4 shrink-0" />
      ) : (
        <WifiOff className="h-4 w-4 shrink-0" />
      )}

      <span className="truncate">
        {isOnline
          ? `${pendingCount} modification(s) en attente`
          : 'Mode hors-ligne'}
      </span>

      {pendingCount > 0 && (
        <Badge variant="secondary" className="ml-1 text-xs shrink-0">
          {pendingCount}
        </Badge>
      )}

      {isOnline && pendingCount > 0 && (
        <button
          onClick={handleManualSync}
          disabled={syncing}
          className="ml-2 p-1 rounded-md hover:bg-white/20 transition-colors shrink-0"
          title="Synchroniser maintenant"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
        </button>
      )}
    </div>
  );
};

export default OfflineIndicator;
