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

const normalizeText = (value) =>
  value
    ? value
        .toString()
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
    : "";

const getDeterministicGuideReply = (message) => {
  const normalized = normalizeText(message);

  if (
    normalized.includes("qui a cree") ||
    normalized.includes("createur") ||
    normalized.includes("fondateur") ||
    normalized.includes("jacques majorelle") ||
    normalized.includes("created the jardin majorelle") ||
    normalized.includes("who created") ||
    normalized.includes("who founded")
  ) {
    return "Le Jardin Majorelle a été créé par Jacques Majorelle en 1923. Yves Saint Laurent et Pierre Bergé l’ont ensuite restauré et préservé avec soin.";
  }

  if (
    normalized.includes("histoire") ||
    normalized.includes("restaur") ||
    normalized.includes("yves saint laurent") ||
    normalized.includes("pierre berge")
  ) {
    return "Le Jardin Majorelle a été créé par Jacques Majorelle en 1923, puis restauré par Yves Saint Laurent et Pierre Bergé.";
  }

  if (normalized.includes("bassin") || normalized.includes("pond")) {
    return "Le bassin central est une oasis paisible du jardin. Il accueille des nénuphars, des lotus et des plantes aquatiques qui apportent une atmosphère apaisante.";
  }

  if (normalized.includes("cactus") || normalized.includes("cacti")) {
    return "Le jardin de cactus rassemble une collection exceptionnelle de plantes grasses, d’agaves et d’aloès. Il met en avant des espèces issues de climats arides du monde entier.";
  }

  if (normalized.includes("villa") || normalized.includes("bleu")) {
    return "La Villa Bleue est l’un des symboles du Jardin Majorelle. Sa façade cobalt, ses balcons et ses jardins luxuriants en font un lieu très reconnaissable.";
  }

  if (normalized.includes("museum") || normalized.includes("berber")) {
    return "Le musée berbère expose des bijoux, des costumes et des objets traditionnels marocains. Il est installé dans l’ancienne maison du peintre Jacques Majorelle.";
  }

  if (normalized.includes("bamboo") || normalized.includes("bambou")) {
    return "La forêt de bambous forme une ambiance fraîche et ombragée. Ses tiges et ses feuilles créent un parcours très agréable dans le jardin.";
  }

  return null;
};

const getOfflineGuideReply = (query) => {
  const normalized = query.toLowerCase();

  if (normalized.includes("hello") || normalized.includes("hi") || normalized.includes("concierge") || normalized.includes("welcome")) {
    return "Bienvenue au Jardin Majorelle ! Je suis votre guide virtuel. Je peux vous parler de la Villa Bleue, du jardin de cactus, du musée berbère, du bassin central ou de la forêt de bambous.";
  }

  if (
    normalized.includes("history") ||
    normalized.includes("histoire") ||
    normalized.includes("yves") ||
    normalized.includes("saint laurent") ||
    normalized.includes("restor") ||
    normalized.includes("creat") ||
    normalized.includes("jacques")
  ) {
    return "Le Jardin Majorelle a été créé par Jacques Majorelle en 1923. Yves Saint Laurent et Pierre Bergé l’ont ensuite restauré et préservé avec soin.";
  }

  if (normalized.includes("villa") || normalized.includes("bleu") || normalized.includes("oasis")) {
    return "La Villa Bleue est l’un des symboles du Jardin Majorelle. Sa façade cobalt, ses balcons et ses jardins luxuriants en font un lieu très reconnaissable.";
  }

  if (normalized.includes("cactus") || normalized.includes("cacti") || normalized.includes("desert")) {
    return "Le jardin de cactus rassemble une collection exceptionnelle de plantes grasses, d’agaves et d’aloès. Il met en avant des espèces issues de climats arides du monde entier.";
  }

  if (normalized.includes("lilies") || normalized.includes("lily") || normalized.includes("pond") || normalized.includes("bassin")) {
    return "Le bassin central est une oasis paisible du jardin. Il accueille des nénuphars, des lotus et des plantes aquatiques qui apportent une atmosphère apaisante.";
  }

  if (normalized.includes("museum") || normalized.includes("berber") || normalized.includes("studio") || normalized.includes("bijou")) {
    return "Le musée berbère expose des bijoux, des costumes et des objets traditionnels marocains. Il est installé dans l’ancienne maison du peintre Jacques Majorelle.";
  }

  if (normalized.includes("bamboo") || normalized.includes("bambou") || normalized.includes("forest") || normalized.includes("canopy")) {
    return "La forêt de bambous forme une ambiance fraîche et ombragée. Ses tiges et ses feuilles créent un parcours très agréable dans le jardin.";
  }

  if (normalized.includes("allee") || normalized.includes("allée") || normalized.includes("chemin")) {
    return "Les allées du jardin relient les points forts du parc. Elles offrent de belles perspectives sur les plantes, les chemins et l’architecture du jardin.";
  }

  if (normalized.includes("cafe") || normalized.includes("cafes") || normalized.includes("coffee")) {
    return "Les cafés du Jardin Majorelle sont des lieux de pause agréables. Ils vous permettent de vous reposer au milieu des plantes et de l’architecture du jardin.";
  }

  if (normalized.includes("boutique") || normalized.includes("shop")) {
    return "La boutique propose des souvenirs inspirés par le Jardin Majorelle, le design et l’art marocain. C’est un bon endroit pour emporter une pièce du jardin.";
  }

  if (normalized.includes("librairie") || normalized.includes("book")) {
    return "La librairie propose une sélection de livres sur l’art, la botanique, la culture marocaine et l’histoire du Jardin Majorelle.";
  }

  if (normalized.includes("plant") || normalized.includes("plante") || normalized.includes("botan") || normalized.includes("species")) {
    return "Le Jardin Majorelle abrite une collection très riche de plantes. On y trouve des cactus, des palmiers, des bambous, des nénuphars et des bougainvilliers.";
  }

  return "Bienvenue au Jardin Majorelle ! Je peux vous renseigner sur la Villa Bleue, le musée berbère, le jardin de cactus, le bassin central, la forêt de bambous, les cafés, la boutique ou la librairie.";
};

const queryWikipedia = async (query, lang = "fr") => {
  try {
    const cleanQuery = query
      .replace(/[\?!\.,]/g, "")
      .replace(/\b(de|la|le|du|des|un|une|les|en|sur|pour|qui|est|comment|pourquoi|quel|quelle)\b/gi, "")
      .trim();

    const wikiLang = lang === "ar" ? "ar" : (lang === "en" ? "en" : "fr");
    const searchUrl = `https://${wikiLang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanQuery)}&utf8=&format=json`;
    
    console.log(`[AI Guide Wikipedia Search] Querying Wikipedia (${wikiLang}): "${cleanQuery}"`);
    const res = await fetch(searchUrl, { headers: { "User-Agent": "JardinMajorelleApp/1.0" } });
    const data = await res.json();
    const results = data?.query?.search || [];
    if (results.length > 0) {
      return results
        .slice(0, 3)
        .map(r => `[Wikipedia] ${r.title}: ${r.snippet.replace(/<[^>]*>/g, '').trim()}`)
        .join("\n");
    }
  } catch (err) {
    console.warn(`[AI Guide Wikipedia Search] Error querying wikipedia (${lang}):`, err.message);
  }
  return "";
};

// AI Chatbot Route for Jardin Majorelle
router.post("/", async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const queryLower = message.toLowerCase();
  
  // Heuristic language detection
  let queryLang = "fr";
  if (/[\u0600-\u06FF]/.test(message)) {
    queryLang = "ar";
  } else {
    const englishWords = /\b(the|and|is|who|how|why|what|where|garden|blue|cacti|cactus|museum)\b/i;
    if (englishWords.test(message)) {
      queryLang = "en";
    }
  }

  try {
    // 1. Dynamic Zone Search in Database (Local MongoDB context)
    const zones = await getZonesCached();
    let matchedZone = null;
    for (const z of zones) {
      if (queryLower.includes(z.nom.toLowerCase()) || 
          (z.typeZone && queryLower.includes(z.typeZone.replace('_', ' ')))) {
        matchedZone = z;
        break;
      }
    }

    // 2. Fetch Wikipedia context if online
    const wikiContext = await queryWikipedia(message, queryLang);

    // 3. Assemble dynamic context for the LLM
    let zoneContext = "Jardin Majorelle : jardin historique et botanique à Marrakech, au Maroc, avec la Villa Bleue, le musée berbère, le jardin de cactus, les nénuphars, la forêt de bambous et les allées du jardin.";
    if (matchedZone) {
      zoneContext = `Zone d'intérêt spécifique identifiée : ${matchedZone.nom}. Description : ${matchedZone.description}`;
    } else if (zones && zones.length > 0) {
      zoneContext = zones
        .slice(0, 5)
        .map((z) => `- ${z.nom}: ${z.description ? z.description.substring(0, 120) : "Une zone du jardin"}`)
        .join("\n");
    }

    // Choose system prompt based on language
    let systemPrompt = "";
    if (queryLang === "ar") {
      systemPrompt = `أنت المساعد الرقمي لحديقة ماجوريل في مراكش. يرجى الإجابة باللغة العربية فقط في أقل من 3 جمل بشكل مهذب ومناسب للهاتف المحمول. السياق المتوفر :\n${zoneContext}\nمعلومات إضافية :\n${wikiContext}`;
    } else if (queryLang === "en") {
      systemPrompt = `You are the digital concierge for Jardin Majorelle in Marrakech. Respond only in English, under 3 sentences, with a polite, concise tone suitable for mobile. Context:\n${zoneContext}\nAdditional Info:\n${wikiContext}`;
    } else {
      systemPrompt = `Tu es le concierge numérique du Jardin Majorelle à Marrakech. Réponds en français, en moins de 3 phrases, avec un ton poli, concis et adapté à mobile. Contexte :\n${zoneContext}\nInfos supplémentaires :\n${wikiContext}`;
    }

    // 4. Query Pollinations AI (with AbortController for reasonable 6s timeout)
    const models = ["openai", "mistral", "llama", "qwen"];
    let reply = "";
    let success = false;

    for (const model of models) {
      try {
        console.log(`[AI Guide] Querying pollinations with model: ${model} (Timeout: 6s)`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 seconds timeout!

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

    if (success) {
      return res.json({ reply: reply.trim() });
    }

    // 5. Fallback 1: Try deterministic match offline
    console.warn("[AI Guide] LLM failed. Attempting deterministic offline matching...");
    const directReply = getDeterministicGuideReply(message);
    if (directReply) {
      return res.json({ reply: directReply });
    }

    // 6. Fallback 2: General offline reply
    if (matchedZone) {
      return res.json({
        reply: `Le/La ${matchedZone.nom} est une magnifique zone du jardin. ${matchedZone.description ? matchedZone.description : "Elle représente un point d'intérêt culturel et naturel."}`
      });
    }

    return res.json({ reply: getOfflineGuideReply(message) });

  } catch (error) {
    console.error("[AI Guide Error] Chat route failed:", error);
    // Last resort fallback
    const directReply = getDeterministicGuideReply(message);
    if (directReply) {
      return res.json({ reply: directReply });
    }
    res.json({
      reply: getOfflineGuideReply(message)
    });
  }
});

module.exports = router;
