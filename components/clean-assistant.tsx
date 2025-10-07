'use client';

import React, { useEffect } from 'react';
import { CleanChat } from './clean-chat';
import useConversationStore from '@/stores/useConversationStore';
import { Item, processMessages } from '@/lib/assistant';

export default function CleanAssistant() {
  const { chatMessages, addConversationItem, addChatMessage, setAssistantLoading, initializeLanguage } =
    useConversationStore();

  // Initialize language on component mount
  useEffect(() => {
    initializeLanguage();
  }, [initializeLanguage]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userItem: Item = {
      type: 'message',
      role: 'user',
      content: [{ type: 'input_text', text: message.trim() }],
    };
    const userMessage: any = {
      role: 'user',
      content: message.trim(),
    };

    try {
      setAssistantLoading(true);
      addConversationItem(userMessage);
      addChatMessage(userItem);
      await processMessages();
    } catch (error) {
      console.error('Error processing message:', error);
    }
  };

  return (
    <CleanChat
      items={chatMessages}
      onSendMessage={handleSendMessage}
    />
  );
}
