'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import useConversationStore, { AssistantMode } from '@/stores/useConversationStore';
import { Bot, Package, Zap } from 'lucide-react';

const assistantModes = [
  {
    value: 'general' as AssistantMode,
    label: 'General Assistant',
    icon: Bot,
    description: 'General purpose AI assistant',
  },
  {
    value: 'cargo' as AssistantMode,
    label: 'Cargo Pricing',
    icon: Package,
    description: 'Dexpell cargo shipping assistant',
  },
];

export function AssistantModeSelector() {
  const { assistantMode, setAssistantMode, resetConversation } = useConversationStore();

  const currentMode = assistantModes.find((mode) => mode.value === assistantMode);

  const handleModeChange = (mode: AssistantMode) => {
    if (mode !== assistantMode) {
      setAssistantMode(mode);
      resetConversation();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            {currentMode && <currentMode.icon className="h-4 w-4" />}
            {currentMode?.label}
          </Button>
        </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px]">
        {assistantModes.map((mode) => (
          <DropdownMenuItem
            key={mode.value}
            onClick={() => handleModeChange(mode.value)}
            className="flex items-start gap-2 p-3 cursor-pointer"
          >
            <mode.icon className="h-4 w-4 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-medium">{mode.label}</span>
              <span className="text-xs text-muted-foreground">
                {mode.description}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {assistantMode === 'cargo' && (
        <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
          <Zap className="h-3 w-3" />
          Auto-detected
        </div>
      )}
    </div>
  );
}
