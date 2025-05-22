import React, { useState } from 'react';
import * as Switch from '@radix-ui/react-switch';
import { useAtom } from 'jotai';
import { debugModeAtom, pendingMessagesAtom, type PendingMessage } from '../store/debug';

export const DebugPanel: React.FC = () => {
  const [debugMode, setDebugMode] = useAtom(debugModeAtom);
  const [pendingMessages, setPendingMessages] = useAtom(pendingMessagesAtom);
  const [autoAccept, setAutoAccept] = useState(false);

  const handleApprove = (messageId: string) => {
    setPendingMessages((prev: PendingMessage[]) => {
      const message = prev.find((m: PendingMessage) => m.id === messageId);
      if (message) {
        // Trigger the message approval callback
        message.onApprove(message.content);
      }
      return prev.filter((m: PendingMessage) => m.id !== messageId);
    });
  };

  const handleContentChange = (messageId: string, newContent: string) => {
    setPendingMessages((prev: PendingMessage[]) =>
      prev.map((m: PendingMessage) =>
        m.id === messageId ? { ...m, content: newContent } : m
      )
    );
  };

  const handleDebugModeChange = (checked: boolean) => {
    setDebugMode(checked);
    if (!checked) {
      setAutoAccept(true);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Switch.Root
            className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full relative data-[state=checked]:bg-blue-500 outline-none cursor-default"
            checked={debugMode}
            onCheckedChange={handleDebugModeChange}
          >
            <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[22px]" />
          </Switch.Root>
          <span className="text-sm font-medium">Debug Mode</span>
        </div>
        {debugMode && (
          <div className="flex items-center space-x-2">
            <Switch.Root
              className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full relative data-[state=checked]:bg-blue-500 outline-none cursor-default"
              checked={autoAccept}
              onCheckedChange={setAutoAccept}
            >
              <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[22px]" />
            </Switch.Root>
            <span className="text-sm font-medium">Auto Accept</span>
          </div>
        )}
      </div>

      {debugMode && pendingMessages.length > 0 && (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {pendingMessages.map((message: PendingMessage) => (
            <div
              key={message.id}
              className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {message.simName}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <textarea
                className="w-full h-24 p-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md resize-none"
                value={message.content}
                onChange={(e) => handleContentChange(message.id, e.target.value)}
              />
              <button
                className="mt-2 px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                onClick={() => handleApprove(message.id)}
              >
                Approve
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 