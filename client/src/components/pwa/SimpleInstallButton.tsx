import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Smartphone, Monitor, X } from 'lucide-react';

export const SimpleInstallButton = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        size="default"
        onClick={() => setShowModal(true)}
        className="px-6 md:px-8 py-3 md:py-4 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transition-all duration-300 font-semibold group relative overflow-hidden"
      >
        <Download className="h-5 w-5 mr-2" />
        Get App
      </Button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 border rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Install NoteBot AI</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowModal(false)}
                  className="p-1"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  Get the full app experience with offline access and quick launch!
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Smartphone className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm">Mobile (iOS/Android)</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        Safari/Chrome → Share → "Add to Home Screen"
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Monitor className="h-5 w-5 text-purple-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm">Desktop</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        Chrome/Edge → Address bar install icon → "Install"
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2 space-y-2">
                  <h4 className="font-semibold text-sm">App Features:</h4>
                  <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• 🚀 Faster loading times</li>
                    <li>• 📱 Works offline</li>
                    <li>• 🏠 Home screen access</li>
                    <li>• 🔔 App notifications</li>
                    <li>• 💾 Local file storage</li>
                  </ul>
                </div>
                
                <Button
                  onClick={() => setShowModal(false)}
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

export default SimpleInstallButton;
