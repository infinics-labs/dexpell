'use client';

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  memo,
} from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { translate, type SupportedLanguage } from '@/lib/i18n';
import { ArrowUp, Square, Paperclip } from 'lucide-react';
import useConversationStore from '@/stores/useConversationStore';

interface DexpellMultimodalInputProps {
  onSendMessage: (message: string) => void;
  onStop?: () => void;
  onFileUpload?: (files: FileList) => void;
  className?: string;
}

function PureDexpellMultimodalInput({
  onSendMessage,
  onStop,
  onFileUpload,
  className,
}: DexpellMultimodalInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState('');
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const { isAssistantLoading } = useConversationStore();

  useEffect(() => {
    const cookie = document.cookie
      .split('; ')
      .find((c) => c.startsWith('lang='));
    if (cookie) {
      const value = cookie.split('=')[1] as SupportedLanguage;
      if (value === 'en' || value === 'tr') setLang(value);
    }
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  };

  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = '98px';
    }
  };

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const submitForm = useCallback(() => {
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
      resetHeight();
    }
  }, [input, onSendMessage]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submitForm();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0 && onFileUpload) {
      onFileUpload(files);
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitForm();
  };

  return (
    <div className={`flex relative items-end w-full gap-2 ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        multiple
        accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.jpg,.jpeg,.png,.gif"
      />
      
      <div className="flex flex-col w-full gap-2">
        <div className="flex items-end w-full gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAttachmentClick}
            disabled={isAssistantLoading}
            className="rounded-full p-2 h-fit border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            title="Attach file"
          >
            <Paperclip size={16} className="text-gray-600 dark:text-gray-400" />
          </Button>
          
          <div className="relative flex-1">
            <Textarea
              ref={textareaRef}
              placeholder={translate(lang, 'chat.placeholder')}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              className="min-h-[98px] max-h-[300px] overflow-hidden resize-none rounded-xl text-base bg-muted border-input pl-4 pr-4"
              rows={3}
              autoFocus
            />
          </div>

          {isAssistantLoading ? (
            <Button
              className="rounded-full p-2 h-fit border border-red-200 dark:border-red-700 hover:border-red-300 dark:hover:border-red-600 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 transition-all duration-200"
              onClick={(event) => {
                event.preventDefault();
                onStop?.();
              }}
              disabled={!onStop}
              type="button"
              title="Stop generation"
            >
              <Square size={16} className="text-red-600 dark:text-red-400" />
            </Button>
          ) : (
            <Button
              className="rounded-full p-2 h-fit border border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={submitForm}
              disabled={input.length === 0}
              type="button"
              title="Send message"
            >
              <ArrowUp size={16} className="text-blue-600 dark:text-blue-400" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export const DexpellMultimodalInput = memo(
  PureDexpellMultimodalInput,
  (prevProps, nextProps) => {
    if (prevProps.onSendMessage !== nextProps.onSendMessage) return false;
    if (prevProps.onStop !== nextProps.onStop) return false;
    if (prevProps.onFileUpload !== nextProps.onFileUpload) return false;
    return true;
  },
);
