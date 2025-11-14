'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { memo } from 'react';
import { LanguageSwitcher } from './language-switcher';
import { translate, type SupportedLanguage } from '@/lib/i18n';
import { useEffect, useState } from 'react';
import useConversationStore from '@/stores/useConversationStore';
import Image from 'next/image';

function PureDexpellChatHeader() {
  const router = useRouter();
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const { language } = useConversationStore();
  
  useEffect(() => {
    const cookie = document.cookie
      .split('; ')
      .find((c) => c.startsWith('lang='));
    if (cookie) {
      const value = cookie.split('=')[1] as SupportedLanguage;
      if (value === 'en' || value === 'tr') {
        setLang(value);
      }
    }
  }, []);
  
  // Sync with conversation store language
  useEffect(() => {
    setLang(language);
  }, [language]);

  return (
    <header className="flex sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3 sm:py-4 items-center px-4 sm:px-6 gap-4 border-b safe-area-inset-top">
      {/* Logo and Brand */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Image
          src="/images/dexpell-logo.jpg"
          alt="Dexpell Logo"
          width={32}
          height={32}
          className="rounded-lg sm:size-10"
        />
        <span className="text-lg sm:text-xl font-bold">
          {translate(lang, 'nav.brand')}
        </span>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2 sm:gap-4 ml-auto">
        <LanguageSwitcher />
        <Button
          variant="outline"
          className="px-3 sm:px-4 min-h-[44px] sm:min-h-fit"
          onClick={() => {
            router.push('/');
            router.refresh();
          }}
          type="button"
        >
          <Plus size={16} />
          <span className="ml-2">{translate(lang, 'chat.new')}</span>
        </Button>
      </div>
    </header>
  );
}

export const DexpellChatHeader = memo(PureDexpellChatHeader);
