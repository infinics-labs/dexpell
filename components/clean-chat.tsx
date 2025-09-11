'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Item } from '@/lib/assistant';
import useConversationStore from '@/stores/useConversationStore';
import ReactMarkdown from 'react-markdown';

interface CleanChatProps {
  items: Item[];
  onSendMessage: (message: string) => void;
}

const CleanMessage: React.FC<{ message: any }> = ({ message }) => {
  return (
    <div className="mb-6">
      {message.role === "user" ? (
        <div className="flex justify-end">
          <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-blue-600 text-white">
            <ReactMarkdown className="prose prose-sm prose-invert max-w-none">
              {message.content[0].text as string}
            </ReactMarkdown>
          </div>
        </div>
      ) : (
        <div className="flex justify-start">
          <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-gray-100 text-gray-900">
            <ReactMarkdown className="prose prose-sm max-w-none">
              {message.content[0].text as string}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

const CleanLoadingMessage: React.FC = () => {
  return (
    <div className="flex justify-start mb-6">
      <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-gray-100">
        <div className="flex items-center gap-2 text-gray-600">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className="text-sm">Assistant is typing...</span>
        </div>
      </div>
    </div>
  );
};

export const CleanChat: React.FC<CleanChatProps> = ({
  items,
  onSendMessage,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isComposing, setIsComposing] = useState(false);
  const { isAssistantLoading } = useConversationStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [items]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey && !isComposing) {
        event.preventDefault();
        if (inputMessage.trim()) {
          onSendMessage(inputMessage.trim());
          setInputMessage('');
        }
      }
    },
    [onSendMessage, inputMessage, isComposing]
  );

  const handleSend = () => {
    if (inputMessage.trim()) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  // Filter out tool calls and other internal AI information - only show messages
  const cleanMessages = items.filter(item => item.type === 'message');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Centered Chat Box with wider margins for future buttons/tabs */}
      <div className="max-w-xl mx-auto bg-white shadow-lg border border-gray-200 flex flex-col h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Chat Assistant</h1>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full px-6">
            <div className="h-full overflow-y-auto py-6">
              {/* Welcome message if no conversation yet */}
              {cleanMessages.length === 0 && (
                <div className="flex justify-center items-center h-full">
                  <div className="text-center">
                    <h2 className="text-2xl font-medium text-gray-900 mb-4">
                      Welcome to Clean Chat
                    </h2>
                    <p className="text-gray-600 mb-8 max-w-md">
                      Start a conversation with the AI assistant. Only the clean conversation between you and the assistant will be displayed.
                    </p>
                  </div>
                </div>
              )}

              {/* Messages */}
              {cleanMessages.map((item, index) => (
                <CleanMessage key={index} message={item} />
              ))}

              {/* Loading indicator */}
              {isAssistantLoading && <CleanLoadingMessage />}

              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
                placeholder="Type your message here..."
                className="w-full resize-none border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={1}
                style={{
                  minHeight: '48px',
                  maxHeight: '200px',
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
                }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!inputMessage.trim() || isAssistantLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg px-6 py-3 font-medium transition-colors duration-200"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
