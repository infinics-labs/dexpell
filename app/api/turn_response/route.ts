import { getDeveloperPrompt, MODEL } from "@/config/constants";
import { getCargoDeveloperPrompt } from "@/config/cargo-prompt";
import { getTools } from "@/lib/tools/tools";
import { detectCargoInConversation } from "@/lib/cargo-detector";
import OpenAI from "openai";

// Set max duration for this route (Vercel Pro plan required for >10s)
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { messages, toolsState, assistantMode = 'general' } = await request.json();

    const tools = await getTools(toolsState);

    console.log("Tools:", tools);
    console.log("Assistant Mode:", assistantMode);
    console.log("Received messages:", messages);

    const openai = new OpenAI();

    // Auto-detect cargo conversations if not explicitly set
    let effectiveMode = assistantMode;
    if (assistantMode === 'general') {
      const cargoDetection = detectCargoInConversation(messages);
      if (cargoDetection.isCargo && cargoDetection.confidence !== 'low') {
        effectiveMode = 'cargo';
        console.log("Auto-detected cargo conversation:", cargoDetection);
      }
    }

    // Detect language from conversation for cargo mode
    let detectedLanguage: 'en' | 'tr' | undefined = undefined;
    if (effectiveMode === 'cargo' && messages.length > 0) {
      const turkishWords = ['kargo', 'gönderi', 'kutu', 'kilogram', 'boyut', 'fiyat', 'türkiye', 'almanya', 'gönderim', 'teslim', 'ücret', 'genel', 'tahmini', 'günü', 'ağırlığında', 'boyutlarında', 'için', 'şu', 'taşıyıcılardan', 'teklifleri', 'istiyorum'];
      
      // Check all user messages for Turkish keywords
      for (const message of messages) {
        if (message.role === 'user' && typeof message.content === 'string') {
          const contentLower = message.content.toLowerCase();
          for (const word of turkishWords) {
            if (contentLower.includes(word)) {
              detectedLanguage = 'tr';
              break;
            }
          }
          if (detectedLanguage) break;
        }
      }
      
      if (!detectedLanguage) {
        detectedLanguage = 'en'; // Default to English if no Turkish detected
      }
      
      console.log("Detected language for cargo conversation:", detectedLanguage);
      //console.log("Turkish words found in messages:", messages.filter(m => m.role === 'user').map(m => m.content));
    }

    // Use cargo prompt if in cargo mode (manual or auto-detected)
    const instructions = effectiveMode === 'cargo' 
      ? getCargoDeveloperPrompt(detectedLanguage) 
      : getDeveloperPrompt();

    console.log("Effective Mode:", effectiveMode);

    const events = await openai.responses.create({
      model: MODEL,
      input: messages,
      instructions,
      tools,
      stream: true,
      parallel_tool_calls: false,
    });

    // Create a ReadableStream that emits SSE data
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of events) {
            // Sending all events to the client
            const data = JSON.stringify({
              event: event.type,
              data: event,
            });
            controller.enqueue(`data: ${data}\n\n`);
          }
          // End of stream
          controller.close();
        } catch (error) {
          console.error("Error in streaming loop:", error);
          controller.error(error);
        }
      },
    });

    // Return the ReadableStream as SSE
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error in POST handler:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
}
