const express = require("express");
const router = express.Router();
const Zone = require("../models/zone.model");

// Cache en mémoire des zones pour optimiser le chatbot (évite le scan de table complet)
let cachedZones = null;
let lastCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getZonesCached = async () => {
  const now = Date.now();
  if (!cachedZones || (now - lastCacheTime > CACHE_DURATION)) {
    console.log("⏳ [AI Guide Chat Cache] Rafraîchissement du cache en mémoire...");
    cachedZones = await Zone.find({}).lean();
    lastCacheTime = now;
  }
  return cachedZones;
};

// AI Chatbot Route for Jardin Majorelle
router.post("/", async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const queryLower = message.toLowerCase();
  let reply = "";
  let matched = false;

  // 1. Instant Static Keyword Matcher (Local fallback for 0ms latency)
  const localReplies = {
    welcome: "Welcome to Jardin Majorelle! I am your digital concierge. How can I help you explore the iconic Blue Villa, Cactus Gardens, or the Berber Museum today?",
    history: "Jardin Majorelle was created by French painter Jacques Majorelle starting in 1923. In 1980, the fashion designer Yves Saint Laurent and Pierre Bergé purchased the garden to save it from demolition, fully restoring its heritage.",
    villa: "The famous Villa Oasis (Villa Bleue) is painted in a striking, cobalt-based 'Majorelle Blue', contrasted beautifully with lemon yellow planters. It stands as a vibrant tribute to Art Deco and Moroccan architecture.",
    cactus: "The Cactus Garden features a world-renowned collection of structural dry-climate plants, including giant cacti, agaves, and aloes compiled from dry-zone deserts globally.",
    lilies: "The central water lily pond is a peaceful oasis filled with floating water lilies, lotus flowers, and elegant papyrus plants. The ambient trickling water offers refreshing cool air.",
    museum: "The Berber Museum, located inside the painter's former studio, houses an extraordinary collection of indigenous Moroccan Berber jewelry, armor, costumes, and weaving curated by Pierre Bergé and Yves Saint Laurent.",
    bamboo: "The Bamboo Forest forms a dense, cooling green canopy over the garden walkways. Its rustling leaves create natural ambient white-noise, keeping the garden refreshing and shaded.",
    plants: "The garden hosts over 300 plant species from five continents, including a majestic collection of cacti, palms, cooling bamboo, water lilies, and bougainvillea curated over forty years."
  };

  // Exact or keyword mapping
  if (queryLower.includes("hello") || queryLower.includes("hi") || queryLower.includes("concierge") || queryLower.includes("welcome")) {
    reply = localReplies.welcome;
    matched = true;
  } else if (queryLower.includes("history") || queryLower.includes("yves") || queryLower.includes("saint laurent") || queryLower.includes("restor")) {
    reply = localReplies.history;
    matched = true;
  } else if (queryLower.includes("villa") || queryLower.includes("bleu") || queryLower.includes("oasis")) {
    reply = localReplies.villa;
    matched = true;
  } else if (queryLower.includes("cactus") || queryLower.includes("cacti") || queryLower.includes("desert")) {
    reply = localReplies.cactus;
    matched = true;
  } else if (queryLower.includes("lilies") || queryLower.includes("lily") || queryLower.includes("pond") || queryLower.includes("bassin")) {
    reply = localReplies.lilies;
    matched = true;
  } else if (queryLower.includes("museum") || queryLower.includes("berber") || queryLower.includes("studio") || queryLower.includes("bijou")) {
    reply = localReplies.museum;
    matched = true;
  } else if (queryLower.includes("bamboo") || queryLower.includes("bambou") || queryLower.includes("forest") || queryLower.includes("canopy")) {
    reply = localReplies.bamboo;
    matched = true;
  } else if (queryLower.includes("plant") || queryLower.includes("botan") || queryLower.includes("species")) {
    reply = localReplies.plants;
    matched = true;
  }

  if (matched) {
    console.log(`[AI Guide] Instant keyword match triggered for query: "${message}"`);
    return res.json({ reply });
  }

  try {
    // 2. Dynamic Zone Search in Database (Local MongoDB fallback - fast, offline-capable)
    const zones = await getZonesCached();
    
    // Attempt database match on zone names
    let matchedZone = null;
    for (const z of zones) {
      if (queryLower.includes(z.nom.toLowerCase()) || 
          (z.typeZone && queryLower.includes(z.typeZone.replace('_', ' ')))) {
        matchedZone = z;
        break;
      }
    }

    if (matchedZone) {
      console.log(`[AI Guide] DB Zone match triggered: ${matchedZone.nom}`);
      return res.json({
        reply: `The ${matchedZone.nom} is a stunning zone in the garden. ${matchedZone.description ? matchedZone.description : "It represents a core cultural and natural landmark."} It features standard ${matchedZone.typeZone ? matchedZone.typeZone.replace('_', ' ') : 'botanical'} attributes.`
      });
    }

    // 3. Fallback: Query Pollinations AI (with AbortController for short 1.8s fast timeout per model)
    let zoneContext = "Jardin Majorelle: A stunning historical and botanical garden in Marrakech, Morocco, featuring the Blue Villa (Villa Oasis), Berber Museum, Cacti collections, water lilies, and bamboo walkways.";
    if (zones && zones.length > 0) {
      zoneContext = zones
        .slice(0, 5) // keep context light
        .map((z) => `- ${z.nom}: ${z.description ? z.description.substring(0, 100) : "A beautiful part of the garden"}`)
        .join("\n");
    }

    const systemPrompt = `You are the digital concierge for Jardin Majorelle. Respond in under 3 sentences. Be polite, extremely concise, and mobile-friendly. Garden Context:\n${zoneContext}`;

    const models = ["openai", "mistral", "llama", "qwen"];
    let success = false;

    for (const model of models) {
      try {
        console.log(`[AI Guide] Querying pollinations with model: ${model}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1800); // 1.8 seconds timeout!

        const response = await fetch("https://text.pollinations.ai/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: message },
            ],
            model: model,
            jsonMode: false,
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          reply = await response.text();
          if (reply && reply.trim().length > 0) {
            success = true;
            console.log(`[AI Guide] Success with model: ${model}`);
            break;
          }
        }
      } catch (err) {
        console.warn(`[AI Guide] Model ${model} failed or timed out:`, err.message);
      }
    }

    if (!success) {
      console.warn("[AI Guide] All AI models failed or timed out. Returning smart general concierge reply.");
      reply = "Welcome to Jardin Majorelle! The garden features the famous Blue Villa (Villa Oasis), Berber Museum, Cacti collection, Water Lilies, and Bamboo walks. Let me know if you would like details on any of these beautiful locations!";
    }

    res.json({ reply: reply.trim() });
  } catch (error) {
    console.error("[AI Guide Error] Chat route failed:", error);
    res.json({
      reply: "Welcome to Jardin Majorelle! The garden features the famous Blue Villa (Villa Oasis), Berber Museum, Cacti collection, Water Lilies, and Bamboo walks. Let me know if you would like details on any of these beautiful locations!"
    });
  }
});

module.exports = router;
