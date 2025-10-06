'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Anchor,
  Plane,
  Truck,
  Package,
  Globe,
  Brain,
  CheckCircle,
  Zap,
  Shield,
  Clock,
  Map,
  Network,
  Play,
  X,
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { useState } from 'react';
import { translate, messages, type SupportedLanguage } from '@/lib/i18n';

interface Agent {
  key: string;
  icon: React.ElementType;
  iconColor: string;
  bgGradient: string;
  available?: boolean;
  launchDate?: string;
  videoUrl?: string;
}

interface DigitalAgentsSectionProps {
  language: SupportedLanguage;
}

const agents: Agent[] = [
  {
    key: 'nova',
    icon: Package,
    iconColor: 'text-orange-600 dark:text-orange-400',
    bgGradient: 'from-orange-500/10 to-amber-500/10',
    available: true,
    videoUrl: '/videos/nova-cargo.mp4'
  }
];

const featureIcons = [CheckCircle, Zap, Shield, Clock, Map];

export function DigitalAgentsSection({ language }: DigitalAgentsSectionProps) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Layout: Only Nova agent
  const novaAgent = agents[0]; // Nova

  const handleAgentClick = (agent: Agent) => {
    if (agent.available) {
      setSelectedAgent(agent);
      setShowVideoModal(true);
    }
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
    setSelectedAgent(null);
  };

  const renderAgentCard = (agent: Agent, index: number) => {
    const Icon = agent.icon;
    const name = translate(language, `digitalTeam.agents.${agent.key}.name`);
    const title = translate(language, `digitalTeam.agents.${agent.key}.title`);
    const description = translate(language, `digitalTeam.agents.${agent.key}.description`);
    const features = messages[language]?.digitalTeam?.agents?.[agent.key]?.features || [];
    
    return (
      <motion.div
        key={agent.key}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="flex justify-center w-full"
      >
        <Card 
                      className={`group relative size-full min-h-[400px] sm:min-h-[450px] max-w-sm overflow-hidden border-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
            !agent.available 
              ? 'border-dashed opacity-80 cursor-not-allowed' 
              : 'hover:border-primary/50 cursor-pointer'
          }`}
          onClick={() => handleAgentClick(agent)}
        >
          {/* Background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${agent.bgGradient} opacity-50 transition-opacity group-hover:opacity-70`} />
          
          {/* Play button overlay for available agents */}
          {agent.available && (
            <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
              <div className="rounded-full bg-black/60 p-4 backdrop-blur-sm">
                <Play className="size-8 text-white fill-white" />
              </div>
            </div>
          )}
          
          {/* Coming soon badge */}
          {!agent.available && (
            <div className="absolute right-3 top-3 z-10 rounded-full bg-orange-500 px-2 py-1 text-xs font-semibold text-white sm:right-4 sm:top-4 sm:px-3">
              Launching {agent.launchDate}
            </div>
          )}
          
          <div className="relative z-10 flex h-full flex-col p-4 sm:p-6">
            {/* Agent icon and info */}
            <div className="mb-4 text-center sm:mb-6">
              <div className={`mx-auto mb-3 flex size-16 items-center justify-center rounded-full bg-white shadow-lg transition-transform group-hover:scale-110 dark:bg-gray-900 sm:mb-4 sm:size-20 overflow-hidden`}>
                {agent.key === 'nova' ? (
                  <img 
                    src="/videos/nova-pp.png" 
                    alt={`${name} profile`}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <Icon className={`size-8 sm:size-10 ${agent.iconColor}`} />
                )}
              </div>
              <h3 className="mb-1 text-lg font-bold sm:text-xl">{name}</h3>
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">{title}</p>
              {agent.available && (
                <p className="mt-2 text-xs text-primary">{translate(language, 'digitalTeam.modal.clickToWatch')}</p>
              )}
            </div>
            
            {/* Description */}
            <p className="mb-4 text-center text-xs leading-relaxed text-muted-foreground sm:mb-6 sm:text-sm">
              {description}
            </p>
            
            {/* Features */}
            <div className="mt-auto space-y-1.5 sm:space-y-2">
              {features.map((feature: string, idx: number) => {
                const FeatureIcon = featureIcons[idx % featureIcons.length];
                return (
                  <div key={idx} className="flex items-start gap-2">
                    <FeatureIcon className={`mt-0.5 size-3 shrink-0 sm:size-4 ${agent.iconColor}`} />
                    <span className="text-xs sm:text-sm">{feature}</span>
                  </div>
                );
              })}
            </div>
            
            {/* Tech indicators */}
            <div className="mt-4 flex justify-center gap-1.5 sm:mt-6 sm:gap-2">
              <Brain className="size-3 text-muted-foreground sm:size-4" />
              <Network className="size-3 text-muted-foreground sm:size-4" />
              <Zap className="size-3 text-muted-foreground sm:size-4" />
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <section id="digital-agents" className="relative overflow-hidden py-12 sm:py-16 lg:py-20">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-0 top-0 size-64 sm:size-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl" />
        <div className="absolute right-0 bottom-0 size-64 sm:size-96 translate-x-1/2 translate-y-1/2 rounded-full bg-gradient-to-r from-green-500/20 to-cyan-500/20 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8 sm:mb-12 text-center"
        >
          <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold">
            {translate(language, 'digitalTeam.heading')}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground px-2 sm:px-0">
            {translate(language, 'digitalTeam.subtitle')}
          </p>
          <p className="mt-2 text-xs sm:text-sm text-primary">
            {translate(language, 'digitalTeam.clickPrompt')}
          </p>
        </motion.div>

        {/* Nova Agent (centered) */}
        <div className="flex justify-center">
          {renderAgentCard(novaAgent, 0)}
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {showVideoModal && selectedAgent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={closeVideoModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative mx-2 sm:mx-4 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative rounded-2xl bg-background border border-primary/20 overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className={`flex size-10 sm:size-12 items-center justify-center rounded-full bg-white shadow-lg dark:bg-gray-900 shrink-0 overflow-hidden`}>
                      {selectedAgent.key === 'nova' ? (
                        <img 
                          src="/videos/nova-pp.png" 
                          alt={`${translate(language, `digitalTeam.agents.${selectedAgent.key}.name`)} profile`}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <selectedAgent.icon className={`size-5 sm:size-6 ${selectedAgent.iconColor}`} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold truncate">{translate(language, `digitalTeam.agents.${selectedAgent.key}.name`)}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{translate(language, `digitalTeam.agents.${selectedAgent.key}.title`)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={closeVideoModal}
                    className="rounded-full"
                  >
                    <X className="size-4" />
                  </Button>
                </div>

                {/* Video Content */}
                <div className="aspect-video bg-muted/20 flex items-center justify-center p-4 sm:p-8">
                  {selectedAgent.key === 'nova' ? (
                    <video 
                      controls 
                      className="w-full h-full rounded-lg"
                      autoPlay
                      muted
                    >
                      <source src={selectedAgent.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    /* Placeholder for other agents */
                    <div className="text-center space-y-3 sm:space-y-4 max-w-md mx-auto">
                      <div className="mx-auto size-16 sm:size-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <Play className="size-6 sm:size-8 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-base sm:text-lg font-semibold mb-2">{translate(language, 'digitalTeam.modal.videoComingSoon')}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground px-2">
                          {translate(language, `digitalTeam.agents.${selectedAgent.key}.name`)}{translate(language, 'digitalTeam.modal.videoDescription')}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {translate(language, 'digitalTeam.modal.videoUrl')} {selectedAgent.videoUrl}
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 sm:p-6 border-t border-border">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {translate(language, `digitalTeam.agents.${selectedAgent.key}.description`)}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
