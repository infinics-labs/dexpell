"use client";
import React, { useEffect } from "react";
import { DexpellChat } from "./dexpell-chat";
import useConversationStore from "@/stores/useConversationStore";
import { Item, processMessages } from "@/lib/assistant";

export default function Assistant() {
  const { chatMessages, addConversationItem, addChatMessage, setAssistantLoading, initializeLanguage } =
    useConversationStore();

  // Initialize language on component mount
  useEffect(() => {
    initializeLanguage();
  }, [initializeLanguage]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userItem: Item = {
      type: "message",
      role: "user",
      content: [{ type: "input_text", text: message.trim() }],
    };
    const userMessage: any = {
      role: "user",
      content: message.trim(),
    };

    try {
      setAssistantLoading(true);
      addConversationItem(userMessage);
      addChatMessage(userItem);
      await processMessages();
    } catch (error) {
      console.error("Error processing message:", error);
    }
  };

  const handleApprovalResponse = async (
    approve: boolean,
    id: string
  ) => {
    const approvalItem = {
      type: "mcp_approval_response",
      approve,
      approval_request_id: id,
    } as any;
    try {
      addConversationItem(approvalItem);
      await processMessages();
    } catch (error) {
      console.error("Error sending approval response:", error);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    // For now, we'll just show the file names in a message
    const fileNames = Array.from(files).map(file => file.name).join(', ');
    const fileMessage = `Files attached: ${fileNames}`;
    
    // You can extend this to actually process and upload the files
    console.log('Files uploaded:', files);
    
    // For demo purposes, we'll send a message about the uploaded files
    handleSendMessage(fileMessage);
  };

  return (
    <DexpellChat
      items={chatMessages}
      onSendMessage={handleSendMessage}
      onApprovalResponse={handleApprovalResponse}
      onFileUpload={handleFileUpload}
    />
  );
}
