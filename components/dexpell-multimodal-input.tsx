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
import { ArrowUp, Square } from 'lucide-react';
import useConversationStore from '@/stores/useConversationStore';

interface DexpellMultimodalInputProps {
  onSendMessage: (message: string) => void;
  onStop?: () => void;
  className?: string;
}

function PureDexpellMultimodalInput({
  onSendMessage,
  onStop,
  className,
}: DexpellMultimodalInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitForm();
  };

  return (
    <div className={`flex relative items-end w-full gap-2 ${className}`}>
      <div className="flex flex-col w-full gap-2">
        <div className="flex items-end w-full gap-2">
          <div className="relative flex-1">
            <Textarea
              ref={textareaRef}
              placeholder={translate(lang, 'chat.placeholder')}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              className="min-h-[98px] max-h-[300px] overflow-hidden resize-none rounded-xl text-base bg-muted border-input"
              rows={3}
              autoFocus
            />
          </div>

          {isAssistantLoading ? (
            <Button
              className="rounded-full p-1.5 h-fit dark:border-zinc-600"
              onClick={(event) => {
                event.preventDefault();
                onStop?.();
              }}
              disabled={!onStop}
              type="button"
            >
              <Square size={14} />
            </Button>
          ) : (
            <Button
              className="rounded-full p-1.5 h-fit dark:border-zinc-600"
              onClick={submitForm}
              disabled={input.length === 0}
              type="button"
            >
              <ArrowUp size={14} />
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
    return true;
  },
);
