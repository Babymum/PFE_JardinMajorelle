const express = require("express");
const router = express.Router();
const Zone = require("../models/zone.model");

// Cache en mémoire des zones pour optimiser le chatbot (évite le scan de table complet)
let cachedZones = null;
let lastCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const { tavily } = require("@tavily/core");

const tvly = tavily({
  apiKey: process.env.TAVILY_API_KEY,
});

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

const detectLanguage = (message) => {
  if (message.includes("Respond only in English")) {
    return "en";
  }
  if (message.includes("الرجاء الرد باللغة العربية")) {
    return "ar";
  }
  return "fr";
};

const zoneGuideContent = {
  en: {
    villa_bleue: {
      name: 'Blue Villa',
      description: "The Blue Villa is one of the most striking symbols of the Jardin Majorelle. Its vivid cobalt facade, elegant balconies, and lush surroundings create a landmark that immediately captures attention. Inspired by Moroccan craftsmanship and artistic vision, it reflects a meeting point between creativity, refinement, and cultural heritage. Every architectural detail speaks to Jacques Majorelle's imagination and his affection for Marrakech. It is a place of wonder and contemplation, inviting visitors to step into the artistic world of the garden and discover the history behind this unforgettable site.",
    },
    jardin_cactus: {
      name: 'Cactus Garden',
      description: "The Cactus Garden reveals a fascinating collection of plants from arid regions around the world. Sculptural forms, surprising textures, and majestic silhouettes make each cactus feel like a work of living art. The space creates a striking contrast between the raw strength of desert plants and the artistic softness of the garden's design. It is a place of wonder and contemplation where visitors can admire rare and exotic species while experiencing the unique botanical atmosphere that defines the Jardin Majorelle.",
    },
    bassin: {
      name: 'Central Pond',
      description: "At the heart of the garden, the pond brings an immediate sense of calm and freshness. Its still waters reflect the brilliant shades of Majorelle blue, the silhouettes of palm trees, and the lush vegetation around it. The gentle sound of water accompanies visitors through a moment of serenity where nature and poetry seem to speak together in harmony. The central pond is a true haven of peace inside the Jardin Majorelle, inviting contemplation and quiet reflection. Water lilies, lotus flowers, and other aquatic plants add mystery and beauty to this emblematic space.",
    },
    musee_berbere: {
      name: 'Berber Museum',
      description: "The Berber Museum invites visitors to discover the richness and diversity of Amazigh culture through an exceptional collection of traditional objects, jewelry, textiles, and handcrafted works. More than a museum, it is a journey into the history, craftsmanship, and ancestral traditions of Morocco. Located in the former home of painter Jacques Majorelle, the museum offers an intimate and authentic setting to explore the treasures of Berber art. Each displayed piece tells a story, reflecting the creativity and identity of a people proud of their heritage. It is an essential cultural stop within the Jardin Majorelle, helping visitors understand the roots and influences that shaped this unique garden.",
    },
    jardin_bambou: {
      name: 'Bamboo Garden',
      description: "In the Bamboo Garden, the atmosphere becomes almost mysterious. Tall, slender stems filter the light softly and create a shaded walk where the rustle of the wind accompanies every step. This space invites visitors to slow down, listen, and feel the quiet presence of a living, soothing nature. It is a place of serenity where you can lose yourself in the simple elegance of bamboo while enjoying a peaceful moment at the heart of the Jardin Majorelle.",
    },
    allee_jardin: {
      name: 'Garden Pathways',
      description: "The garden pathways guide visitors through a succession of colors, scents, and exotic landscapes. Lined with rare plants and majestic trees, they offer an immersive walk where every turn reveals a new perspective, a play of shadow, or a fascinating architectural detail. More than simple routes, the paths of the Jardin Majorelle act as the thread that connects the sensory and aesthetic experience of the garden, inviting discovery and wonder at every step. They link the different zones while offering unique views of the botanical and artistic treasures that make the garden famous.",
    },
    cafe_majorelle: {
      name: 'Café Majorelle',
      description: "Café Majorelle offers a delicious pause in an elegant and green setting. Blending Moroccan flavors with refined ambiance, it invites visitors to extend their garden experience over mint tea, coffee, or dishes inspired by local traditions. It is the ideal place to relax after the visit while enjoying the lush plants and iconic architecture of the Jardin Majorelle. Café Majorelle is a true haven of peace where visitors can enjoy moments of comfort and conviviality in this unique garden.",
    },
    cafe_bousafsaf: {
      name: 'Café Bousafsaf',
      description: "Tucked away in a peaceful part of the garden, Café Bousafsaf charms with its intimate and authentic atmosphere. Beneath the trees and surrounded by the calm of the place, it offers the perfect moment to relax and enjoy the tranquility of the Jardin Majorelle. The café serves refreshing drinks and Moroccan-inspired treats, ideal for a well-deserved break after exploring the garden's highlights. It is a warm and welcoming place where visitors can recharge in the heart of this emblematic site.",
    },
    boutique: {
      name: 'Boutique',
      description: "The garden boutique brings together a refined selection of objects inspired by Moroccan art, design, and the world of the Jardin Majorelle. Books, handcrafted creations, accessories, and souvenirs extend the visitor experience through elegant, culturally rich pieces. It is a place of discovery where unique treasures can be found to bring a piece of the garden's magic home. The boutique is a true showcase of creativity, celebrating the aesthetic and spirit of the Jardin Majorelle while supporting local artisans and preserving Moroccan artistic traditions.",
    },
    librairie: {
      name: 'Bookstore',
      description: "The bookstore is a space dedicated to art, history, botany, and Moroccan culture. Visitors discover carefully selected works that allow them to explore the world of the Jardin Majorelle more deeply, along with its artistic legacy and the inspirations that shaped this unique place. It is an ideal stop for readers and culture lovers, offering a rich and varied collection that perfectly complements the garden visit. The Jardin Majorelle bookstore is a true treasure for those who want to extend their experience and deepen their understanding of this iconic place and its fascinating cultural context.",
    },
  },
  ar: {
    villa_bleue: {
      name: 'الفيلا الزرقاء',
      description: 'تُعد الفيلا الزرقاء أحد أبرز رموز حديقة ماجوريل، فواجهتها الزرقاء الكوبالتية الجريئة وشرفاتها الأنيقة وحدائقها المحيطة تمنح المكان حضورًا لا يُنسى. تستلهم هذه المعلمة من الحرفية المغربية والرؤية الفنية، لتجسد لقاءً بين الإبداع والرقي والتراث الثقافي. كل تفصيل فيها يعكس خيال جاك ماجوريل وحبه لمراكش. إنها مساحة للتأمل والانبهار، تدعو الزوار إلى دخول العالم الفني للحديقة واكتشاف تاريخ هذا المكان الاستثنائي.',
    },
    jardin_cactus: {
      name: 'حديقة الصبار',
      description: 'تكشف حديقة الصبار عن مجموعة مدهشة من النباتات القادمة من المناطق الجافة حول العالم. فالأشكال النحتية والملمس المفاجئ والظلال المهيبة تجعل كل صبار يبدو كقطعة فنية حية. يخلق هذا الفضاء تباينًا جميلًا بين قوة نباتات الصحراء الخام ونعومة التصميم الفني للحديقة. إنها مساحة اكتشاف وإعجاب، حيث يمكن للزوار التأمل في أنواع نادرة وغريبة مع الإحساس بالجو النباتي الفريد الذي يميز حديقة ماجوريل.',
    },
    bassin: {
      name: 'الحوض المركزي',
      description: 'في قلب الحديقة يمنح الحوض إحساسًا فوريًا بالهدوء والانتعاش. تعكس مياهه الهادئة درجات الأزرق الماجوريل الزاهية، وظلال النخيل، والنباتات الكثيفة المحيطة به. يرافق خرير الماء الزائرين في لحظة من السكينة حيث يبدو أن الطبيعة والشعر يتحاوران بتناغم. يُعد الحوض المركزي ملاذًا حقيقيًا للطمأنينة داخل حديقة ماجوريل، ويدعو إلى التأمل والهدوء. كما تحتضنه زنابق الماء ونباتات مائية أخرى تضيف لمسة من الغموض والجمال إلى هذا المكان الرمزي.',
    },
    musee_berbere: {
      name: 'المتحف الأمازيغي',
      description: 'يدعو المتحف الأمازيغي الزوار إلى اكتشاف ثراء وتنوع الثقافة الأمازيغية عبر مجموعة استثنائية من القطع التقليدية والمجوهرات والمنسوجات والأعمال الحرفية. وهو أكثر من مجرد متحف، بل رحلة إلى عمق تاريخ المغرب وحِرفه وتقاليده العريقة. يقع في المنزل السابق للفنان جاك ماجوريل، ويقدم فضاءً حميمًا وأصيلًا لاستكشاف كنوز الفن الأمازيغي. كل قطعة معروضة تروي قصة، وتعكس الإبداع والهوية لدى شعب يعتز بإرثه. إنه محطة ثقافية أساسية داخل حديقة ماجوريل تساعد الزوار على فهم الجذور والتأثيرات التي شكّلت هذه الحديقة الفريدة.',
    },
    jardin_bambou: {
      name: 'حديقة الخيزران',
      description: 'في حديقة الخيزران يصبح الجو شبه غامض. فالأعمدة الطويلة الرفيعة ترشح الضوء بلطف وتخلق ممشى مظللًا ترافقه همسات الرياح مع كل خطوة. هذه المساحة تدعو الزائر إلى التمهل، والاستماع، والشعور بسكينة الطبيعة الحية والمريحة. إنها مكان للهدوء يمكن فيه للزوار أن يذوبوا في جمال الخيزران البسيط والأنيق مع الاستمتاع بلحظة هدوء في قلب حديقة ماجوريل.',
    },
    allee_jardin: {
      name: 'ممرات الحديقة',
      description: 'تقود ممرات الحديقة الزوار عبر تتابع من الألوان والروائح والمناظر الغريبة. وتحيط بها النباتات النادرة والأشجار المهيبة، فتمنحهم جولة غامرة يكشف فيها كل منعطف منظورًا جديدًا أو لعبة ظل أو تفصيلة معمارية آسرة. إن ممرات حديقة ماجوريل أكثر من مجرد طرق، فهي الخيط الذي يربط التجربة الحسية والجمالية للحديقة، وتدعو إلى الاكتشاف والدهشة في كل خطوة. كما تصل بين المناطق المختلفة وتتيح إطلالات فريدة على الكنوز النباتية والفنية التي جعلت الحديقة مشهورة.',
    },
    cafe_majorelle: {
      name: 'مقهى ماجوريل',
      description: 'يقدم مقهى ماجوريل استراحة لذيذة في أجواء أنيقة وخضراء. إذ يجمع بين النكهات المغربية والأجواء الراقية، ويدعو الزوار إلى إطالة تجربة الحديقة مع شاي النعناع أو القهوة أو أطباق مستوحاة من التقاليد المحلية. إنه المكان المثالي للاسترخاء بعد الجولة مع الاستمتاع بالنباتات الكثيفة والهندسة المعمارية الأيقونية لحُديقة ماجوريل. ويُعد المقهى ملاذًا حقيقيًا للراحة حيث يمكن للزوار قضاء لحظات من الألفة والهدوء داخل هذه الحديقة الفريدة.',
    },
    cafe_bousafsaf: {
      name: 'مقهى بوصفصاف',
      description: 'يقع مقهى بوصفصاف في جزء هادئ من الحديقة ويتميز بأجوائه الحميمة والأصيلة. وتحت ظلال الأشجار وبحضور سكينة المكان، يوفر لحظة مثالية للاسترخاء والاستمتاع بهدوء حديقة ماجوريل. يقدم المقهى مشروبات منعشة وحلويات مستوحاة من النكهات المغربية، وهي مناسبة تمامًا لاستراحة مستحقة بعد اكتشاف معالم الحديقة. إنه مكان دافئ ومرحب يتيح للزوار استعادة نشاطهم في قلب هذا الموقع الرمزي.',
    },
    boutique: {
      name: 'المتجر',
      description: 'يجمع متجر الحديقة مجموعة راقية من القطع المستوحاة من الفن المغربي والتصميم وعالم حديقة ماجوريل. فهناك الكتب والإبداعات الحرفية والإكسسوارات والتذكارات التي تُكمل تجربة الزائر من خلال قطع أنيقة ومفعمة بالثقافة. إنه مكان للاكتشاف يمكن فيه العثور على كنوز فريدة تأخذ معك شيئًا من سحر الحديقة إلى البيت. ويعد المتجر واجهة حقيقية للإبداع تحتفي بجمال وروح حديقة ماجوريل، مع دعم الحرفيين المحليين والحفاظ على التقاليد الفنية المغربية.',
    },
    librairie: {
      name: 'المكتبة',
      description: 'المكتبة فضاء مخصص للفن والتاريخ وعلم النبات والثقافة المغربية. يكتشف الزوار فيها كتبًا مختارة بعناية تتيح لهم استكشاف عالم حديقة ماجوريل بعمق أكبر، إلى جانب إرثها الفني والإلهامات التي شكّلت هذا المكان الفريد. إنها محطة multimedia لعشاق القراءة والثقافة، وتقدم مجموعة غنية ومتنوعة تكمل زيارة الحديقة بشكل ممتاز. تُعد مكتبة حديقة ماجوريل كنزًا حقيقيًا لمن يرغب في مواصلة التجربة وتعميق معرفته بهذا المكان الرمزي وسياقه الثقافي المدهش.',
    },
  }
};

const getDeterministicGuideReply = (message) => {
  const lang = detectLanguage(message);
  const normalized = normalizeText(message);

  if (lang === "en") {
    if (
      normalized.includes("who created") ||
      normalized.includes("creator") ||
      normalized.includes("founder") ||
      normalized.includes("jacques majorelle") ||
      normalized.includes("who founded")
    ) {
      return "The Jardin Majorelle was created by Jacques Majorelle in 1923. Yves Saint Laurent and Pierre Bergé later restored and carefully preserved it.";
    }

    if (
      normalized.includes("history") ||
      normalized.includes("restor") ||
      normalized.includes("yves saint laurent") ||
      normalized.includes("pierre berge")
    ) {
      return "The Jardin Majorelle was created by Jacques Majorelle in 1923, then restored by Yves Saint Laurent and Pierre Bergé.";
    }

    if (/\bponds?\b/.test(normalized) || normalized.includes("bassin") || normalized.includes("lily") || normalized.includes("lilies")) {
      return "The central pond is a peaceful oasis of the garden. It features water lilies, lotus flowers, and aquatic plants that bring a soothing atmosphere.";
    }

    if (normalized.includes("cactus") || normalized.includes("cacti")) {
      return "The cactus garden gathers an exceptional collection of succulents, agaves, and aloes. It highlights species from arid climates around the world.";
    }

    if (normalized.includes("villa") || normalized.includes("blue")) {
      return "The Blue Villa is one of the symbols of the Jardin Majorelle. Its cobalt facade, its balconies, and its lush gardens make it a very recognizable place.";
    }

    if (normalized.includes("museum") || normalized.includes("berber")) {
      return "The Berber museum displays jewelry, costumes, and traditional Moroccan objects. It is housed in the former home of the painter Jacques Majorelle.";
    }

    if (normalized.includes("bamboo") || normalized.includes("forest")) {
      return "The bamboo forest creates a cool and shaded atmosphere. Its stems and leaves create a very pleasant walk in the garden.";
    }
  } else if (lang === "ar") {
    if (
      normalized.includes("من انشا") ||
      normalized.includes("منش") ||
      normalized.includes("مؤسس") ||
      normalized.includes("جاك ماجوريل") ||
      normalized.includes("صاحب")
    ) {
      return "تم إنشاء حديقة ماجوريل على يد جاك ماجوريل في عام 1923. وقام إيف سان لوران وبيير بيرجي لاحقًا بترميمها والحفاظ عليها بعناية.";
    }

    if (
      normalized.includes("تاريخ") ||
      normalized.includes("رمم") ||
      normalized.includes("ترميم") ||
      normalized.includes("إيف سان لوران") ||
      normalized.includes("بيير بيرجي")
    ) {
      return "تم إنشاء حديقة ماجوريل على يد جاك ماجوريل في عام 1923، ثم رممها إيف سان لوران وبيير بيرجي.";
    }

    if (normalized.includes("حوض") || normalized.includes("بحر") || normalized.includes("زنبق") || normalized.includes("مياه")) {
      return "الحوض المركزي هو واحة هادئة في الحديقة. ويحتوي على زنابق الماء، وأزهار اللوتس، والنباتات المائية التي تضفي جوًا مهدئًا.";
    }

    if (normalized.includes("صبار") || normalized.includes("شوكي") || normalized.includes("نباتات شوكية")) {
      return "تجمع حديقة الصبار مجموعة استثنائية من النباتات النضرة والصبار والآلوة. وتسلط الضوء على الأنواع من المناخات القاحلة حول العالم.";
    }

    if (normalized.includes("فيلا") || normalized.includes("زرقاء") || normalized.includes("الازرق")) {
      return "تعد الفيلا الزرقاء أحد رموز حديقة ماجوريل. واجهتها الكوبالتية وشرفاتها وحدائقها الخصبة تجعلها معلمًا مميزًا للغاية.";
    }

    if (normalized.includes("متحف") || normalized.includes("بربر") || normalized.includes("أمازيغ")) {
      return "يعرض المتحف الأمازيغي مجوهرات وأزياء وقطعًا مغربية تقليدية. ويقع في المنزل السابق للرسام جاك ماجوريل.";
    }

    if (normalized.includes("خيزران") || normalized.includes("غابة")) {
      return "تشكل غابة الخيزران جوًا باردًا ومظللًا. وتخلق سيقانها وأوراقها مسارًا لطيفًا للغاية في الحديقة.";
    }
  } else {
    // French rules
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

    if (normalized.includes("bassin") || /\bponds?\b/.test(normalized)) {
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
  }

  return null;
};

const getOfflineGuideReply = (query) => {
  const lang = detectLanguage(query);
  const normalized = normalizeText(query);

  if (lang === "en") {
    if (normalized.includes("hello") || /\bhi\b/.test(normalized) || normalized.includes("concierge") || normalized.includes("welcome")) {
      return "Welcome to Jardin Majorelle! I am your virtual guide. I can tell you about the Blue Villa, the cactus garden, the Berber museum, the central pond, or the bamboo forest.";
    }

    if (
      normalized.includes("history") ||
      normalized.includes("yves") ||
      normalized.includes("saint laurent") ||
      normalized.includes("restor") ||
      normalized.includes("creat") ||
      normalized.includes("jacques")
    ) {
      return "The Jardin Majorelle was created by Jacques Majorelle in 1923. Yves Saint Laurent and Pierre Bergé later restored and carefully preserved it.";
    }

    if (normalized.includes("villa") || normalized.includes("blue") || normalized.includes("oasis")) {
      return "The Blue Villa is one of the symbols of the Jardin Majorelle. Its cobalt facade, its balconies, and its lush gardens make it a very recognizable place.";
    }

    if (normalized.includes("cactus") || normalized.includes("cacti") || normalized.includes("desert")) {
      return "The cactus garden gathers an exceptional collection of succulents, agaves, and aloes. It highlights species from arid climates around the world.";
    }

    if (normalized.includes("lilies") || normalized.includes("lily") || /\bponds?\b/.test(normalized) || normalized.includes("bassin")) {
      return "The central pond is a peaceful oasis of the garden. It features water lilies, lotus flowers, and aquatic plants that bring a soothing atmosphere.";
    }

    if (normalized.includes("museum") || normalized.includes("berber") || normalized.includes("studio") || normalized.includes("bijou")) {
      return "The Berber museum displays jewelry, costumes, and traditional Moroccan objects. It is housed in the former home of the painter Jacques Majorelle.";
    }

    if (normalized.includes("bamboo") || normalized.includes("bambou") || normalized.includes("forest") || normalized.includes("canopy")) {
      return "The bamboo forest creates a cool and shaded atmosphere. Its stems and leaves create a very pleasant walk in the garden.";
    }

    if (normalized.includes("allee") || normalized.includes("chemin") || normalized.includes("path")) {
      return "The garden pathways connect the highlights of the park. They offer beautiful perspectives of the plants, paths, and architecture of the garden.";
    }

    if (normalized.includes("cafe") || normalized.includes("cafes") || normalized.includes("coffee")) {
      return "The cafés of the Jardin Majorelle are pleasant places for a break. They allow you to rest amidst the plants and architecture of the garden.";
    }

    if (normalized.includes("boutique") || normalized.includes("shop")) {
      return "The boutique offers souvenirs inspired by the Jardin Majorelle, design, and Moroccan art. It is a good place to take home a piece of the garden.";
    }

    if (normalized.includes("librairie") || normalized.includes("book")) {
      return "The bookstore offers a selection of books on art, botany, Moroccan culture, and the history of the Jardin Majorelle.";
    }

    if (normalized.includes("plant") || normalized.includes("botan") || normalized.includes("species")) {
      return "The Jardin Majorelle houses a very rich collection of plants. You can find cacti, palm trees, bamboo, water lilies, and bougainvillea.";
    }

    return "Welcome to Jardin Majorelle! I can tell you about the Blue Villa, the Berber museum, the cactus garden, the central pond, the bamboo forest, the cafés, the boutique, or the bookstore.";
  } else if (lang === "ar") {
    if (normalized.includes("مرحبا") || normalized.includes("اهلا") || normalized.includes("اهلاً") || normalized.includes("سلام") || normalized.includes("ترحيب")) {
      return "مرحبًا بكم في حديقة ماجوريل! أنا مرشدكم الافتراضي. يمكنني أن أحدثكم عن الفيلا الزرقاء، حديقة الصبار، المتحف الأمازيغي، الحوض المركزي، أو غابة الخيزران.";
    }

    if (
      normalized.includes("تاريخ") ||
      normalized.includes("انشا") ||
      normalized.includes("مؤسس") ||
      normalized.includes("جاك") ||
      normalized.includes("إيف") ||
      normalized.includes("سان لوران") ||
      normalized.includes("رمم")
    ) {
      return "تم إنشاء حديقة ماجوريل على يد جاك ماجوريل في عام 1923. وقام إيف سان لوران وبيير بيرجي لاحقًا بترميمها والحفاظ عليها بعناية.";
    }

    if (normalized.includes("فيلا") || normalized.includes("زرقاء") || normalized.includes("الازرق")) {
      return "تعد الفيلا الزرقاء أحد رموز حديقة ماجوريل. واجهتها الكوبالتية وشرفاتها وحدائقها الخصبة تجعلها معلمًا مميزًا للغاية.";
    }

    if (normalized.includes("صبار") || normalized.includes("شوكي") || normalized.includes("صحراء")) {
      return "تجمع حديقة الصبار مجموعة استثنائية من النباتات النضرة والصبار والآلوة. وتسلط الضوء على الأنواع من المناخات القاحلة حول العالم.";
    }

    if (normalized.includes("حوض") || normalized.includes("بحر") || normalized.includes("زنبق") || normalized.includes("مياه")) {
      return "الحوض المركزي هو واحة هادئة في الحديقة. ويحتوي على زنابق الماء، وأزهار اللوتس، والنباتات المائية التي تضفي جوًا مهدئًا.";
    }

    if (normalized.includes("متحف") || normalized.includes("بربر") || normalized.includes("مجوهرات") || normalized.includes("أمازيغ")) {
      return "يعرض المتحف الأمازيغي مجوهرات وأزياء وقطعًا مغربية تقليدية. ويقع في المنزل السابق للرسام جاك ماجوريل.";
    }

    if (normalized.includes("خيزران") || normalized.includes("غابة") || normalized.includes("بامبو")) {
      return "تشكل غابة الخيزران جوًا باردًا ومظللًا. وتخلق سيقانها وأوراقها مسارًا لطيفًا للغاية في الحديقة.";
    }

    if (normalized.includes("ممر") || normalized.includes("طريق") || normalized.includes("سكة")) {
      return "تربط ممرات الحديقة بين المعالم البارزة في المنتزه. وتوفر مناظر جميلة للنباتات والمسارات والهندسة المعمارية للحديقة.";
    }

    if (normalized.includes("مقهى") || normalized.includes("قهوة") || normalized.includes("شاي")) {
      return "تعتبر مقاهي حديقة ماجوريل أماكن لطيفة للاستراحة. وتتيح لك الراحة وسط النباتات والهندسة المعمارية للحديقة.";
    }

    if (normalized.includes("متجر") || normalized.includes("دكان") || normalized.includes("شراء")) {
      return "يقدم المتجر هدايا تذكارية مستوحاة من حديقة ماجوريل والتصميم والفن المغربي. إنه مكان جيد لأخذ قطعة من الحديقة معك.";
    }

    if (normalized.includes("مكتبة") || normalized.includes("كتاب") || normalized.includes("كتب")) {
      return "تقدم المكتبة مجموعة مختارة من الكتب حول الفن وعلم النبات والثقافة المغربية وتاريخ حديقة ماجوريل.";
    }

    if (normalized.includes("نبات") || normalized.includes("عشب") || normalized.includes("فصيلة")) {
      return "تضم حديقة ماجوريل مجموعة غنية جدًا من النباتات. يمكنك العثور على الصبار، وأشجار النخيل، والخيزران، وزنابق الماء، والجهنمية.";
    }

    return "مرحبًا بكم في حديقة ماجوريل! يمكنني إفادتكم بمعلومات عن الفيلا الزرقاء، المتحف الأمازيغي، حديقة الصبار، الحوض المركزي، غابة الخيزران، المقاهي، المتجر، أو المكتبة.";
  } else {
    // French rules
    if (normalized.includes("hello") || /\bhi\b/.test(normalized) || normalized.includes("concierge") || normalized.includes("welcome")) {
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

    if (normalized.includes("lilies") || normalized.includes("lily") || /\bponds?\b/.test(normalized) || normalized.includes("bassin")) {
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
  }
};

// AI Chatbot Route for Jardin Majorelle
router.post("/", async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  // 1. Try deterministic guide replies first (Local fallback for 0ms latency)
  const directReply = getDeterministicGuideReply(message);
  if (directReply) {
    console.log(`[AI Guide] Deterministic reply match triggered for: "${message}"`);
    return res.json({ reply: directReply });
  }

  const queryLower = message.toLowerCase();

  try {
    // 2. Dynamic Zone Search in Database (Local MongoDB fallback - fast, offline-capable)
    const zones = await getZonesCached();
    
    // Attempt database match on zone names
    let matchedZone = null;
    for (const z of zones) {
      // Direct DB French name/type match
      const nameMatchFr = queryLower.includes(z.nom.toLowerCase());
      const typeMatch = z.typeZone && queryLower.includes(z.typeZone.replace('_', ' '));
      
      // Localized name match
      let nameMatchEn = false;
      let nameMatchAr = false;
      
      if (z.typeZone) {
        const enZone = zoneGuideContent.en[z.typeZone];
        if (enZone) {
          nameMatchEn = queryLower.includes(enZone.name.toLowerCase());
        }
        const arZone = zoneGuideContent.ar[z.typeZone];
        if (arZone) {
          nameMatchAr = queryLower.includes(arZone.name.toLowerCase());
        }
      }

      if (nameMatchFr || typeMatch || nameMatchEn || nameMatchAr) {
        matchedZone = z;
        break;
      }
    }

    if (matchedZone) {
      console.log(`[AI Guide] DB Zone match triggered: ${matchedZone.nom}`);
      
      const lang = detectLanguage(message);
      if (lang === "en" && zoneGuideContent.en[matchedZone.typeZone]) {
        const localized = zoneGuideContent.en[matchedZone.typeZone];
        return res.json({
          reply: `The ${localized.name} is a beautiful area of the garden. ${localized.description}`
        });
      } else if (lang === "ar" && zoneGuideContent.ar[matchedZone.typeZone]) {
        const localized = zoneGuideContent.ar[matchedZone.typeZone];
        return res.json({
          reply: `تعد ${localized.name} منطقة جميلة في الحديقة. ${localized.description}`
        });
      } else {
        return res.json({
          reply: `Le/La ${matchedZone.nom} est une magnifique zone du jardin. ${matchedZone.description ? matchedZone.description : "Elle représente un point d'intérêt culturel et naturel."}`
        });
      }
    }

    console.log(`[AI Guide] General query, routing to Tavily search...`);
    // 3. Non-zone query: search Tavily and query Gemini
    let searchResult = null;
    try {
      searchResult = await tvly.search(message, {
        search_depth: "advanced",
        max_results: 5
      });
    } catch (err) {
      console.warn("Tavily error:", err.message);
    }

    const webContext = searchResult?.results
      ? JSON.stringify(searchResult.results)
      : "Aucun résultat web disponible.";

    let zoneContext = "Jardin Majorelle : jardin historique et botanique à Marrakech, au Maroc, avec la Villa Bleue, le musée berbère, le jardin de cactus, les nénuphars, la forêt de bambous et les allées du jardin.";
    if (zones && zones.length > 0) {
      zoneContext = zones
        .slice(0, 5) // keep context light
        .map((z) => `- ${z.nom}: ${z.description ? z.description.substring(0, 120) : "Une zone emblématique du jardin"}`)
        .join("\n");
    }

    const lang = detectLanguage(message);
    let systemPrompt = "";
    
    if (lang === "en") {
      systemPrompt = `
You are the digital concierge for Jardin Majorelle.

Internal information about the garden:
${zoneContext}

Web search results (Tavily):
${webContext}

Respond in English in a warm, natural, and unique manner using this information.
`;
    } else if (lang === "ar") {
      systemPrompt = `
أنت المرشد الرقمي لحديقة ماجوريل.

معلومات داخلية عن الحديقة:
${zoneContext}

نتائج البحث على الويب (Tavily):
${webContext}

أجب باللغة العربية بطريقة ودية وطبيعية وفريدة من نوعها باستخدام هذه المعلومات.
`;
    } else {
      systemPrompt = `
Tu es le concierge numérique du Jardin Majorelle.

Informations internes sur le jardin :
${zoneContext}

Résultats de recherche web (Tavily) :
${webContext}

Réponds en français de manière chaleureuse, naturelle et unique en t'aidant de ces informations.
`;
    }

    // Call Google Gemini 2.5 Flash API
    let reply = "";
    let success = false;

    if (process.env.GEMINI_API_KEY) {
      try {
        console.log(`[AI Guide] Querying Google Gemini 2.5 Flash...`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout for Gemini

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemPrompt }]
            },
            contents: [
              {
                parts: [{ text: message }]
              }
            ],
            generationConfig: {
              maxOutputTokens: 500,
              temperature: 0.7
            }
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedText && generatedText.trim().length > 0) {
            reply = generatedText;
            success = true;
            console.log(`[AI Guide] Success with Gemini 2.5 Flash`);
          }
        } else {
          const errData = await response.json().catch(() => ({}));
          console.warn("[AI Guide] Gemini API returned error status:", response.status, errData.error?.message);
        }
      } catch (err) {
        console.warn("[AI Guide] Gemini API call failed or timed out:", err.message);
      }
    } else {
      console.warn("[AI Guide] GEMINI_API_KEY is not defined in .env");
    }

    if (!success) {
      console.warn("[AI Guide] Gemini AI failed. Falling back to offline replies.");
      reply = getOfflineGuideReply(message);
    }

    res.json({ reply: reply.trim() });
  } catch (error) {
    console.error("[AI Guide Error] Chat route failed:", error);
    res.json({
      reply: getOfflineGuideReply(message)
    });
  }
});

module.exports = router;
