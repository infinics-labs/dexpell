'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { memo } from 'react';
import { LanguageSwitcher } from './language-switcher';
import { translate, type SupportedLanguage } from '@/lib/i18n';
import { useEffect, useState } from 'react';
import useConversationStore from '@/stores/useConversationStore';

function PureDexpellChatHeader() {
  const router = useRouter();
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const { setLanguage: setConversationLanguage, updateInitialMessage } = useConversationStore();
  
  useEffect(() => {
    const cookie = document.cookie
      .split('; ')
      .find((c) => c.startsWith('lang='));
    if (cookie) {
      const value = cookie.split('=')[1] as SupportedLanguage;
      if (value === 'en' || value === 'tr') {
        setLang(value);
        setConversationLanguage(value);
        updateInitialMessage();
      }
    }
  }, [setConversationLanguage, updateInitialMessage]);

  return (
    <header className="flex sticky top-0 bg-background py-2 sm:py-1.5 items-center px-3 sm:px-2 md:px-2 gap-2 border-b sm:border-b-0 safe-area-inset-top">
      <Button
        variant="outline"
        className="order-2 md:order-1 md:px-2 px-3 sm:px-2 md:h-fit ml-auto md:ml-0 min-h-[44px] sm:min-h-fit"
        onClick={() => {
          router.push('/');
          router.refresh();
        }}
        type="button"
      >
        <Plus size={16} />
        <span className="md:sr-only ml-2 sm:ml-0">{translate(lang, 'chat.new')}</span>
      </Button>

      <div className="ml-auto">
        <LanguageSwitcher />
      </div>
    </header>
  );
}

export const DexpellChatHeader = memo(PureDexpellChatHeader);
