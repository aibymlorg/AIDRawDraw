import React, { useState, useEffect } from 'react';
import { requestQueue } from '../services/requestQueue';

export const QueueStatusIndicator: React.FC = () => {
  const [queueStatus, setQueueStatus] = useState({
    queueSize: 0,
    concurrentRequests: 0,
    isProcessing: false
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Poll queue status every second
    const interval = setInterval(() => {
      const status = requestQueue.getStatus();
      setQueueStatus(status);

      // Show indicator when there's activity
      setIsVisible(status.queueSize > 0 || status.concurrentRequests > 0);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white/95 backdrop-blur-sm border-2 border-blue-300 rounded-lg shadow-lg p-3 z-50 min-w-[200px]">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-semibold text-gray-700">Processing Requests</span>
      </div>

      <div className="space-y-1 text-xs text-gray-600">
        <div className="flex justify-between">
          <span>Active:</span>
          <span className="font-semibold text-blue-600">{queueStatus.concurrentRequests}</span>
        </div>

        {queueStatus.queueSize > 0 && (
          <div className="flex justify-between">
            <span>In Queue:</span>
            <span className="font-semibold text-orange-600">{queueStatus.queueSize}</span>
          </div>
        )}
      </div>

      {queueStatus.queueSize > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500 italic">
            Your request will be processed shortly...
          </p>
        </div>
      )}
    </div>
  );
};
