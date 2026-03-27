import { invokeLLM, Message } from "./_core/llm";
import { getShelters } from "./db";

const RECYCLING_ASSISTANT_PROMPT = `You are RecycleBot, a friendly and knowledgeable AI assistant for the National Recycling Directory (recyclish.info). Your role is to help users find recycling facilities and answer recycling questions.

You can help with:
1. **Finding Recycling Facilities**: When users ask about locations near a city or state, use the facility context provided to give specific, accurate answers with names and addresses.
2. **Sharps Disposal** (needles, syringes, lancets for GLP-1 medications like Ozempic, Wegovy, Mounjaro, etc.):
   - NEVER throw loose sharps in regular trash or recycling bins
   - Use FDA-cleared sharps containers or sturdy plastic containers (like laundry detergent bottles)
   - When container is 3/4 full, seal it and take to a drop-off location
   - Drop-off locations include: pharmacies (CVS, Walgreens), hospitals, health departments, and municipal collection centers
   - Some areas offer mail-back programs for sharps disposal
3. **General Recycling Guidance**:
   - Electronics: Best Buy, Staples, and certified e-waste recyclers accept old devices
   - Batteries: Many retailers have battery recycling bins; never throw in regular trash
   - Glass: Most curbside programs accept glass; check local guidelines for colors
   - Plastics: Check the number inside the recycling symbol; #1 and #2 are most widely accepted
   - Paper/Cardboard: Flatten boxes, remove tape; no greasy pizza boxes
   - Textiles: Donate wearable items; some facilities accept worn textiles for recycling
   - Hazardous waste: Paint, chemicals, motor oil need special disposal at HHW facilities
4. **Using the Directory**:
   - Users can search by location, facility type, or materials accepted
   - The "Sharps Disposal" category shows needle disposal locations
   - Users can filter by state and material type
   - Each facility card shows address, phone, and accepted materials

Be helpful, concise, and encouraging. When you have facility data in your context, always mention specific facilities by name and address. If you don't have specific location data, suggest users use the directory's search and filter features at recyclish.info/directory.

Always prioritize safety, especially for sharps disposal. Keep responses friendly but informative. Use bullet points for lists.`;

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

/**
 * Extract location and material hints from the user's message
 * to fetch relevant facility context from the database.
 */
function extractSearchHints(message: string): { city?: string; state?: string; type?: string } {
  const lower = message.toLowerCase();

  // US state names mapped to abbreviations
  const stateMap: Record<string, string> = {
    "alabama": "AL", "alaska": "AK", "arizona": "AZ", "arkansas": "AR", "california": "CA",
    "colorado": "CO", "connecticut": "CT", "delaware": "DE", "florida": "FL", "georgia": "GA",
    "hawaii": "HI", "idaho": "ID", "illinois": "IL", "indiana": "IN", "iowa": "IA",
    "kansas": "KS", "kentucky": "KY", "louisiana": "LA", "maine": "ME", "maryland": "MD",
    "massachusetts": "MA", "michigan": "MI", "minnesota": "MN", "mississippi": "MS",
    "missouri": "MO", "montana": "MT", "nebraska": "NE", "nevada": "NV", "new hampshire": "NH",
    "new jersey": "NJ", "new mexico": "NM", "new york": "NY", "north carolina": "NC",
    "north dakota": "ND", "ohio": "OH", "oklahoma": "OK", "oregon": "OR", "pennsylvania": "PA",
    "rhode island": "RI", "south carolina": "SC", "south dakota": "SD", "tennessee": "TN",
    "texas": "TX", "utah": "UT", "vermont": "VT", "virginia": "VA", "washington": "WA",
    "west virginia": "WV", "wisconsin": "WI", "wyoming": "WY",
  };

  // Check for state abbreviations
  const stateAbbrMatch = lower.match(/\b(al|ak|az|ar|ca|co|ct|de|fl|ga|hi|id|il|in|ia|ks|ky|la|me|md|ma|mi|mn|ms|mo|mt|ne|nv|nh|nj|nm|ny|nc|nd|oh|ok|or|pa|ri|sc|sd|tn|tx|ut|vt|va|wa|wv|wi|wy)\b/);
  let state: string | undefined;
  if (stateAbbrMatch) {
    state = stateAbbrMatch[1].toUpperCase();
  } else {
    for (const [name, abbr] of Object.entries(stateMap)) {
      if (lower.includes(name)) {
        state = abbr;
        break;
      }
    }
  }

  // Extract city hint — look for "in [City]" or "near [City]" patterns
  const cityMatch = lower.match(/(?:in|near|around|close to)\s+([a-z][a-z\s]{2,20}?)(?:\s*,|\s+(?:al|ak|az|ar|ca|co|ct|de|fl|ga|hi|id|il|in|ia|ks|ky|la|me|md|ma|mi|mn|ms|mo|mt|ne|nv|nh|nj|nm|ny|nc|nd|oh|ok|or|pa|ri|sc|sd|tn|tx|ut|vt|va|wa|wv|wi|wy)\b|$)/);
  const city = cityMatch ? cityMatch[1].trim() : undefined;

  // Detect facility type from keywords
  let type: string | undefined;
  if (lower.includes("electronic") || lower.includes("e-waste") || lower.includes("computer") || lower.includes("phone") || lower.includes(" tv ")) {
    type = "E-Waste";
  } else if (lower.includes("hazardous") || lower.includes("paint") || lower.includes("chemical") || lower.includes("motor oil") || lower.includes("hhw")) {
    type = "Hazardous Waste";
  } else if (lower.includes("sharp") || lower.includes("needle") || lower.includes("syringe") || lower.includes("lancet") || lower.includes("ozempic") || lower.includes("wegovy") || lower.includes("mounjaro")) {
    type = "Sharps Disposal";
  } else if (lower.includes("compost") || lower.includes("organic") || lower.includes("food waste")) {
    type = "Composting";
  } else if (lower.includes("scrap metal") || lower.includes("metal recycl")) {
    type = "Scrap Metal";
  } else if (lower.includes("drop.?off") || lower.includes("drop off")) {
    type = "Drop-off Center";
  }

  return { city, state, type };
}

/**
 * Build a concise facility context string to inject into the system prompt.
 */
async function buildFacilityContext(message: string): Promise<string> {
  try {
    const hints = extractSearchHints(message);
    if (!hints.city && !hints.state && !hints.type) return "";

    const results = await getShelters({
      city: hints.city,
      state: hints.state,
      type: hints.type,
      limit: 5,
    });

    if (!results || results.length === 0) return "";

    const facilityLines = results.map((f) => {
      const addr = [f.addressLine1, f.city, f.state, f.zip].filter(Boolean).join(", ");
      const phone = f.phone ? ` | Phone: ${f.phone}` : "";
      const cat = f.shelterType ? ` | Type: ${f.shelterType}` : "";
      return `- ${f.name} — ${addr}${phone}${cat}`;
    });

    return `\n\n[LIVE DIRECTORY DATA — Facilities matching the user's query]\n${facilityLines.join("\n")}\n[Use this data to give specific, accurate answers. Always include the facility name and address.]`;
  } catch {
    return "";
  }
}

export async function generateChatResponse(
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  // Inject live facility context if the message has location/material hints
  const facilityContext = await buildFacilityContext(userMessage);
  const systemPrompt = RECYCLING_ASSISTANT_PROMPT + facilityContext;

  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    ...conversationHistory.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
    { role: "user", content: userMessage },
  ];

  try {
    const response = await invokeLLM({ messages });

    const assistantMessage = response.choices[0]?.message?.content;
    if (typeof assistantMessage === "string") {
      return assistantMessage;
    }

    // Handle array content (extract text)
    if (Array.isArray(assistantMessage)) {
      const textContent = assistantMessage.find((part) => part.type === "text");
      if (textContent && "text" in textContent) {
        return textContent.text;
      }
    }

    return "I apologize, but I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("[Chatbot] Error generating response:", error);
    throw new Error("Failed to generate chat response");
  }
}
