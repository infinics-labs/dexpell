'use client';

import { motion } from 'framer-motion';
import { 
  TruckIcon, 
  GlobeIcon, 
  CalculatorIcon, 
  MessageSquareIcon,
  ArrowRightIcon 
} from 'lucide-react';
import { translate, type SupportedLanguage } from '@/lib/i18n';

interface ChatWelcomeProps {
  language: SupportedLanguage;
  onSuggestedAction: (message: string) => void;
}

const suggestions = [
  {
    icon: TruckIcon,
    titleKey: 'chat.suggestions.quote.title',
    labelKey: 'chat.suggestions.quote.label', 
    actionKey: 'chat.suggestions.quote.action',
  },
  {
    icon: CalculatorIcon,
    titleKey: 'chat.suggestions.calculate.title',
    labelKey: 'chat.suggestions.calculate.label',
    actionKey: 'chat.suggestions.calculate.action',
  },
  {
    icon: GlobeIcon,
    titleKey: 'chat.suggestions.whatCanShip.title',
    labelKey: 'chat.suggestions.whatCanShip.label',
    actionKey: 'chat.suggestions.whatCanShip.action',
  },
  {
    icon: MessageSquareIcon,
    titleKey: 'chat.suggestions.checkRates.title',
    labelKey: 'chat.suggestions.checkRates.label',
    actionKey: 'chat.suggestions.checkRates.action',
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerChildren = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function ChatWelcome({ language, onSuggestedAction }: ChatWelcomeProps) {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center min-h-[60vh] px-4"
      initial="hidden"
      animate="visible"
      variants={staggerChildren}
    >
      <motion.div 
        className="text-center mb-12 max-w-2xl"
        variants={fadeInUp}
      >
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {translate(language, 'chat.welcome.title')}
          </span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {translate(language, 'chat.welcome.subtitle')}
        </p>
      </motion.div>

      <motion.div 
        className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-2 w-full max-w-4xl"
        variants={staggerChildren}
      >
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.icon;
          return (
            <motion.button
              key={suggestion.titleKey}
              className="group relative overflow-hidden rounded-2xl border-2 border-primary/10 bg-gradient-to-br from-background via-background to-primary/5 p-6 text-left transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:-translate-y-1"
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              onClick={() => onSuggestedAction(translate(language, suggestion.actionKey))}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 text-primary ring-2 ring-primary/10">
                    <Icon className="size-6" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                    {translate(language, suggestion.titleKey)}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {translate(language, suggestion.labelKey)}
                  </p>
                  <div className="flex items-center text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Try this suggestion
                    <ArrowRightIcon className="ml-1 size-3" />
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      <motion.div 
        className="mt-12 text-center"
        variants={fadeInUp}
      >
        <p className="text-sm text-muted-foreground">
          Or type your question about shipping, logistics, or freight services
        </p>
      </motion.div>
    </motion.div>
  );
}
