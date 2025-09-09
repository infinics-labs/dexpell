'use client';

import React from 'react';
import { DexpellMessages } from './dexpell-messages';
import { DexpellMultimodalInput } from './dexpell-multimodal-input';
import { DexpellChatHeader } from './dexpell-chat-header';
import { Item } from '@/lib/assistant';

interface DexpellChatProps {
  items: Item[];
  onSendMessage: (message: string) => void;
  onApprovalResponse: (approve: boolean, id: string) => void;
  onFileUpload?: (files: FileList) => void;
}

export const DexpellChat: React.FC<DexpellChatProps> = ({
  items,
  onSendMessage,
  onApprovalResponse,
  onFileUpload,
}) => {
  return (
    <div className="flex flex-col min-w-0 h-dvh bg-background">
      <DexpellChatHeader />

      <DexpellMessages
        messages={items}
        onSendMessage={onSendMessage}
        onApprovalResponse={onApprovalResponse}
      />

      <form className="flex mx-auto px-3 sm:px-4 bg-background pb-3 sm:pb-4 md:pb-6 gap-2 w-full md:max-w-3xl safe-area-inset-bottom">
        <DexpellMultimodalInput
          onSendMessage={onSendMessage}
          onFileUpload={onFileUpload}
          className=""
        />
      </form>
    </div>
  );
};
