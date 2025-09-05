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
      className="grid sm:grid-cols-2 gap-2 w-full"
    >
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className={index > 1 ? 'hidden sm:block' : 'block'}
        >
          <Button
            variant="ghost"
            onClick={() => {
              onSendMessage(suggestedAction.action);
            }}
            className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start"
          >
            <span className="font-medium">{suggestedAction.title}</span>
            <span className="text-muted-foreground">
              {suggestedAction.label}
            </span>
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
