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

  // Check if we should show suggested actions (only initial assistant message, no user messages)
  const shouldShowSuggestedActions = messages.length <= 1 && 
    (messages.length === 0 || (messages.length === 1 && messages[0].type === 'message' && messages[0].role === 'assistant'));

  return (
    <div className="flex flex-col min-w-0 gap-4 sm:gap-6 flex-1 overflow-y-scroll pt-3 sm:pt-4 px-3 sm:px-4 relative">
      {shouldShowSuggestedActions && (
        <>
          <DexpellGreeting />
          <div className="flex mx-auto px-3 sm:px-4 pb-6 w-full md:max-w-2xl">
            <DexpellSuggestedActions onSendMessage={onSendMessage} />
          </div>
        </>
      )}

      <div className="max-w-2xl mx-auto w-full">
        {messages.map((item, index) => (
          <React.Fragment key={index}>
            {item.type === "tool_call" ? (
              <div className="mb-4">
                <ToolCall toolCall={item} />
              </div>
            ) : item.type === "message" ? (
              <div className="flex flex-col gap-1 mb-4">
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
      </div>

      {isAssistantLoading && (
        <div className="max-w-2xl mx-auto w-full">
          <LoadingMessage />
        </div>
      )}

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
