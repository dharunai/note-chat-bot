import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showOfflineMessage) return null;

  return (
    <div className="fixed top-16 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
      <div className="bg-yellow-500 text-yellow-900 rounded-lg shadow-lg p-3 border border-yellow-600">
        <div className="flex items-center gap-2">
          <WifiOff className="h-4 w-4" />
          <div className="flex-1">
            <p className="text-sm font-medium">You're offline</p>
            <p className="text-xs">Some features may not work until you're back online.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineIndicator;
