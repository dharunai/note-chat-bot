import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Smartphone, Monitor, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const HomePageInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone || isInWebAppiOS);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        
        setDeferredPrompt(null);
        return;
      } catch (error) {
        console.error('Error during install prompt:', error);
      }
    }
    
    // Always show manual install instructions if no native prompt
    setShowFeatures(true);
  };

  // Don't show if already installed
  if (isInstalled) {
    return (
      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
          <Smartphone className="h-5 w-5" />
          <span className="font-medium">✅ App installed! Launch from your home screen</span>
        </div>
      </div>
    );
  }

  // Always show the install button now
  return (
    <>
      <Button
        size="default"
        onClick={handleInstallClick}
        className="px-6 md:px-8 py-3 md:py-4 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transition-all duration-300 font-semibold group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
        <Download className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
        <span className="group-hover:scale-105 transition-transform duration-200">
          {deferredPrompt ? 'Install App' : 'Get App'}
        </span>
      </Button>

      {/* Manual Install Instructions Modal */}
      {showFeatures && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Install NoteBot AI</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFeatures(false)}
                  className="p-1"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Get the full app experience with offline access and quick launch!
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Smartphone className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm">Mobile (iOS/Android)</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Safari/Chrome → Share → "Add to Home Screen"
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Monitor className="h-5 w-5 text-purple-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm">Desktop</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Chrome/Edge → Address bar install icon → "Install"
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2 space-y-2">
                  <h4 className="font-semibold text-sm">App Features:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• 🚀 Faster loading times</li>
                    <li>• 📱 Works offline</li>
                    <li>• 🏠 Home screen access</li>
                    <li>• 🔔 App notifications</li>
                    <li>• 💾 Local file storage</li>
                  </ul>
                </div>
                
                <Button
                  onClick={() => setShowFeatures(false)}
                  className="w-full"
                >
                  Got it!
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HomePageInstallButton;
