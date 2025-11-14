"use client";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useConversationStore from "@/stores/useConversationStore";

// Import Assistant without SSR to avoid hydration mismatch
const Assistant = dynamic(() => import("@/components/assistant"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen">
      <div className="text-muted-foreground">Loading...</div>
    </div>
  ),
});

export default function ChatPage() {
  const router = useRouter();
  const { resetConversation } = useConversationStore();

  // After OAuth redirect, reinitialize the conversation so the next turn
  // uses the connector-enabled server configuration immediately
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isConnected = new URLSearchParams(window.location.search).get("connected");
    if (isConnected === "1") {
      resetConversation();
      router.replace("/chat", { scroll: false });
    }
  }, [router, resetConversation]);

  return <Assistant />;
}
