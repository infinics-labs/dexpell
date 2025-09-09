'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { memo, useEffect, useState } from 'react';
import { translate, type SupportedLanguage } from '@/lib/i18n';

interface DexpellSuggestedActionsProps {
  onSendMessage: (message: string) => void;
}

function PureDexpellSuggestedActions({
  onSendMessage,
}: DexpellSuggestedActionsProps) {
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

  const suggestedActions = [
    {
      title: translate(lang, 'chat.suggestions.quote.title'),
      label: translate(lang, 'chat.suggestions.quote.label'),
      action: translate(lang, 'chat.suggestions.quote.action'),
    },
    {
      title: translate(lang, 'chat.suggestions.calculate.title'),
      label: translate(lang, 'chat.suggestions.calculate.label'),
      action: translate(lang, 'chat.suggestions.calculate.action'),
    },
    {
      title: translate(lang, 'chat.suggestions.whatCanShip.title'),
      label: translate(lang, 'chat.suggestions.whatCanShip.label'),
      action: translate(lang, 'chat.suggestions.whatCanShip.action'),
    },
    {
      title: translate(lang, 'chat.suggestions.checkRates.title'),
      label: translate(lang, 'chat.suggestions.checkRates.label'),
      action: translate(lang, 'chat.suggestions.checkRates.action'),
    },
  ];

  return (
    <div
      data-testid="suggested-actions"
      className="grid grid-cols-2 gap-3 w-full"
    >
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index, duration: 0.3 }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
        >
          <Button
            variant="ghost"
            onClick={() => {
              onSendMessage(suggestedAction.action);
            }}
            className="group text-left border border-gray-200 hover:border-blue-300 dark:border-gray-700 dark:hover:border-blue-600 rounded-xl px-4 py-3 text-sm w-full h-auto justify-start items-center gap-3 transition-all duration-200 hover:shadow-md hover:scale-[1.01] bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-950/30 flex-row"
          >
            <div className="flex flex-col gap-1 flex-1">
              <span className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors text-sm">
                {suggestedAction.title}
              </span>
              <span className="text-muted-foreground text-xs group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {suggestedAction.label}
              </span>
            </div>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const DexpellSuggestedActions = memo(
  PureDexpellSuggestedActions,
  (prevProps, nextProps) => {
    return prevProps.onSendMessage === nextProps.onSendMessage;
  },
);
