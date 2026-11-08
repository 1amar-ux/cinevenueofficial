/**
 * CineVenue AI VIP Concierge Service
 * Powered by Google Gemini 2.5 Flash with Contextual Structured Action Dispatch
 */

export interface ConciergeResponse {
  success: boolean;
  text: string;
  isFallback?: boolean;
}

export const CINEVENUE_SYSTEM_INSTRUCTION = `You are the premium CineVenue VIP Event & Experience Concierge Assistant. 

ABOUT CINEVENUE:
CineVenue is India's premier integrated cinematic and luxury entertainment ecosystem, unifying 6 core pillars:
1. Movie Booking (/booking): Theatrical ticketing for IMAX, Dolby Atmos, 4K Laser, and VIP recliners across Hyderabad (Prasads IMAX, PVR Nexus), Vijayawada (PVP Square INOX, Capital Cinemas), and Guntur (Naaz Cinemas, Cinepolis Sudarshan).
2. Live Event Booking (/events): High-society event passes, EDM arenas, standup comedy, VIP celeb galas, and fan-premieres with instant QR vertical A4 PDF passes and live gate check-in.
3. Film Production Studio (/productions): Official 24 Crafts marketplace, verified creative talent, casting auditions, script pitching, and investor pitch decks.
4. Turnkey Event Management (/events): 11 event categories, 13 tech services (LED walls, line arrays, grandMA3, DG sets), and single-window police clearances.
5. Brand & Media Promotions (/submit-proposal): Multi-channel digital marketing, multiplex digital standees, viral social campaigns, and PR meets.
6. CineCoins Loyalty Vault (/cinecoins): Rewards store catalog, spin wheel, cashback wallet, and instant coin redemptions.

TOP MOVIES PLAYING:
- Coolie (Action / Thriller, Telugu/Tamil, UA16+, Rating 9.1, featuring IMAX & Dolby Atmos)
- Don't Trouble the Trouble (Comedy / Drama, Telugu, UA13+, Rating 8.4)
- Sigma (Action / Thriller, Telugu, UA16+, Rating 7.9)
- The Paradise (Action / Period Drama, Telugu, Rating 8.6)
- Avengers Endgame: Encore (Sci-Fi / Action, Telugu/Hindi/English, Rating 9.2)
- Thellakaagitham (Romantic Drama, Telugu)
- Baththa (Action / Crime, Tamil)

TOP LIVE EXPERIENCES & EVENTS:
- Alan Walker Sunburn Arena (Gachibowli Stadium, Hyderabad - VIP passes & DJ arena)
- Sufi Symphony Night (Vijayawada Convention Centre - live acoustic strings & VIP seating)
- Hyderabad Standup Fest (Shilpakala Hall, Hyderabad - top comedy lineup)
- Symphony Tours & VIP Celeb Pre-Release Galas

REDIRECT ACTIONS (CRITICAL):
When asked about CineVenue, or when recommending or asked about any movie, event, or platform service, you MUST append one or more structured action tags at the end of your response so the user can be redirected with a single click:
Tags format:
[[ACTION|movie|Movie Name|/booking?search=MovieName|Book Tickets for Movie Name|Genre & Sound Specs]]
[[ACTION|event|Event Name|/events?search=EventName|Book Passes for Event Name|Venue & Pass Highlights]]
[[ACTION|movies_portal|Movie Booking Engine|/booking|Browse All Now Showing Movies|IMAX, 4DX & Luxury Lounges]]
[[ACTION|events_portal|Live Events Portal|/events|Browse All Live Events|Concerts, Comedy & VIP Passes]]
[[ACTION|production|Film Production Studio|/productions|Launch Film Studio|24 Crafts & Casting Calls]]
[[ACTION|cinecoins|CineCoins Rewards|/cinecoins|Open CineCoins Vault|Cashback & Rewards Store]]

Keep responses conversational, helpful, sophisticated, and under 200 words. Always include the relevant [[ACTION|...]] tags.`;

export function getFallbackConciergeResponse(prompt: string, city: string = "Hyderabad"): string {
  const lowerP = (prompt || "").toLowerCase();
  let fallbackText = `Welcome to CineVenue! CineVenue is India's premier high-society entertainment ecosystem offering luxury Movie Booking with IMAX & Dolby Atmos lounges, exclusive VIP Concert & Event Passes, a Pan-India Film Production Studio (24 Crafts), and CineCoins rewards across Hyderabad, Vijayawada, and Guntur.`;
  let fallbackActions = `\n\n[[ACTION|movies_portal|Movie Booking Engine|/booking|Browse Now Showing Movies|IMAX, 4DX & VIP Lounges]][[ACTION|events_portal|Live Events Portal|/events|Browse Live Experiences|Concerts & Standup Comedy]][[ACTION|production|Film Production Studio|/productions|Launch 24 Crafts|Casting & Script Pitching]][[ACTION|cinecoins|CineCoins Rewards|/cinecoins|Open CineCoins Vault|Cashback & Points]]`;

  if (
    lowerP.includes("coolie") ||
    lowerP.includes("movie") ||
    lowerP.includes("kalki") ||
    lowerP.includes("ticket") ||
    lowerP.includes("cinema") ||
    lowerP.includes("theatre") ||
    lowerP.includes("film")
  ) {
    fallbackText = `CineVenue offers luxury theatrical reservations across Prasads IMAX Hyderabad, PVP Square INOX Vijayawada, and Naaz Cinemas Guntur. Top now showing titles include **Coolie** (Action/Thriller UA16+, Rating 9.1 in IMAX 3D) and **Don't Trouble the Trouble**. You can secure your luxury recliners directly with our ticket engine!`;
    fallbackActions = `\n\n[[ACTION|movie|Coolie|/booking?search=Coolie|Book Tickets for Coolie|Action / Thriller • IMAX & Dolby Atmos]][[ACTION|movies_portal|Now Showing Movies|/booking|Open Movie Ticket Engine|Browse All Theatres & Showtimes]]`;
  } else if (
    lowerP.includes("sunburn") ||
    lowerP.includes("alan walker") ||
    lowerP.includes("sufi") ||
    lowerP.includes("event") ||
    lowerP.includes("concert") ||
    lowerP.includes("standup") ||
    lowerP.includes("pass") ||
    lowerP.includes("arena")
  ) {
    fallbackText = `For live experiences in Andhra Pradesh and Telangana, top surge demand events include the **Alan Walker Sunburn Arena** at Gachibowli Stadium and the **Sufi Symphony Night** at Vijayawada Convention Hall. All passes come with vertical A4 printable passes, instant QR delivery, and valet gate access!`;
    fallbackActions = `\n\n[[ACTION|event|Alan Walker Sunburn Arena|/events?search=Alan%20Walker|Book VIP Pass for Sunburn|Gachibowli Stadium • Instant QR]][[ACTION|event|Sufi Symphony Night|/events?search=Sufi|Book Passes for Sufi Night|Vijayawada Convention Centre]][[ACTION|events_portal|All Live Events|/events|Explore Live Events Portal|Browse All Passes]]`;
  } else if (lowerP.includes("craft") || lowerP.includes("production") || lowerP.includes("crew") || lowerP.includes("director")) {
    fallbackText = `CineVenue Film Production Studio houses all 24 Crafts of Indian Cinema — including Direction, Cinematography, Sound Design, Editing, Stunt Choreography, and Art Direction. Connect with verified professionals, review union credentials, and manage service milestone proposals.`;
    fallbackActions = `\n\n[[ACTION|production|Film Production Studio|/productions|Explore 24 Crafts|Hire Verified Cinema Professionals]]`;
  } else if (lowerP.includes("coin") || lowerP.includes("loyalty") || lowerP.includes("reward") || lowerP.includes("wallet")) {
    fallbackText = `CineCoins is CineVenue's exclusive loyalty rewards currency! Earn coins with every movie and event reservation, unlock VIP seat upgrades, and redeem exciting platform perks in our Rewards Vault.`;
    fallbackActions = `\n\n[[ACTION|cinecoins|CineCoins Rewards|/cinecoins|Open CineCoins Vault|Explore Rewards & Cashback]]`;
  }

  return `${fallbackText}${fallbackActions}`;
}

export async function generateConciergeResponse(
  prompt: string,
  city: string = "Hyderabad"
): Promise<ConciergeResponse> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (apiKey) {
    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { systemInstruction: CINEVENUE_SYSTEM_INSTRUCTION, temperature: 0.7 }
      });
      if (response && response.text) {
        return { success: true, text: response.text, isFallback: false };
      }
    } catch (err: any) {
      console.warn("[ConciergeService] Gemini call failed or quota exceeded, using contextual fallback:", err?.message || err);
    }
  }

  return {
    success: true,
    text: getFallbackConciergeResponse(prompt, city),
    isFallback: true
  };
}

