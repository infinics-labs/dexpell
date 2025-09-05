import React, { memo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DexpellGreeting } from './dexpell-greeting';
import { DexpellSuggestedActions } from './dexpell-suggested-actions';
import Message from './message';
import ToolCall from './tool-call';
import Annotations from './annotations';
import McpToolsList from './mcp-tools-list';
import McpApproval from './mcp-approval';
import LoadingMessage from './loading-message';
import { Item, McpApprovalRequestItem } from '@/lib/assistant';
import useConversationStore from '@/stores/useConversationStore';

interface DexpellMessagesProps {
  messages: Item[];
  onSendMessage: (message: string) => void;
  onApprovalResponse: (approve: boolean, id: string) => void;
}

function PureDexpellMessages({
  messages,
  onSendMessage,
  onApprovalResponse,
}: DexpellMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isAssistantLoading } = useConversationStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col min-w-0 gap-4 sm:gap-6 flex-1 overflow-y-scroll pt-3 sm:pt-4 px-3 sm:px-4 relative">
      {messages.length === 0 && (
        <>
          <DexpellGreeting />
          <div className="max-w-3xl mx-auto px-8 pb-8">
            <DexpellSuggestedActions onSendMessage={onSendMessage} />
          </div>
        </>
      )}

      {messages.map((item, index) => (
        <React.Fragment key={index}>
          {item.type === "tool_call" ? (
            <ToolCall toolCall={item} />
          ) : item.type === "message" ? (
            <div className="flex flex-col gap-1">
              <Message message={item} />
              {item.content &&
                item.content[0].annotations &&
                item.content[0].annotations.length > 0 && (
                  <Annotations
                    annotations={item.content[0].annotations}
                  />
                )}
            </div>
          ) : item.type === "mcp_list_tools" ? (
            <McpToolsList item={item} />
          ) : item.type === "mcp_approval_request" ? (
            <McpApproval
              item={item as McpApprovalRequestItem}
              onRespond={onApprovalResponse}
            />
          ) : null}
        </React.Fragment>
      ))}

      {isAssistantLoading && <LoadingMessage />}

      <motion.div
        ref={messagesEndRef}
        className="shrink-0 min-w-[24px] min-h-[24px]"
      />
    </div>
  );
}

export const DexpellMessages = memo(PureDexpellMessages, (prevProps, nextProps) => {
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  return true;
});
