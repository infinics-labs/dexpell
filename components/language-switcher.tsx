'use client';

import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import type { SupportedLanguage } from '@/lib/i18n';

export function LanguageSwitcher() {
  const [lang, setLang] = useState<SupportedLanguage>('en');

  useEffect(() => {
    const cookie = document.cookie
      .split('; ')
      .find((c) => c.startsWith('lang='));
    if (cookie) {
      const value = cookie.split('=')[1] as SupportedLanguage;
      if (value === 'en' || value === 'tr') setLang(value);
    } else {
      // default from browser
      const isTR = navigator.language.toLowerCase().includes('tr');
      setLang(isTR ? 'tr' : 'en');
    }
  }, []);

  const setLanguage = (value: SupportedLanguage) => {
    setLang(value);
    const expires = new Date(Date.now() + 365 * 24 * 3600 * 1000).toUTCString();
    document.cookie = `lang=${value}; path=/; expires=${expires}`;
    // force re-render of server components by navigating
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={lang === 'en' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setLanguage('en')}
      >
        EN
      </Button>
      <Button
        variant={lang === 'tr' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setLanguage('tr')}
      >
        TR
      </Button>
    </div>
  );
}
