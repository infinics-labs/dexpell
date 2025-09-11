'use client';

import { motion } from 'framer-motion';
import { translate, type SupportedLanguage } from '@/lib/i18n';
import { useEffect, useState } from 'react';

export const DexpellGreeting = () => {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  
  useEffect(() => {
    const cookie = document.cookie
      .split('; ')
      .find((c) => c.startsWith('lang='));
    if (cookie) {
      const value = cookie.split('=')[1] as SupportedLanguage;
      if (value === 'en' || value === 'tr') setLang(value);
    }
  }, []);

  return (
    <div
      key="overview"
      className="max-w-2xl mx-auto md:mt-20 px-8 size-full flex flex-col justify-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
        className="text-2xl font-semibold"
      >
        {translate(lang, 'chat.welcome.title')}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.6 }}
        className="text-2xl text-muted-foreground"
      >
        {translate(lang, 'chat.welcome.subtitle')}
      </motion.div>
    </div>
  );
};
