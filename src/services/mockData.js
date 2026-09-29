// Fallback data for Notion blog when integration credentials are not configured or during previews
import { slugify, slugsMatch } from "../utils/slugify.js";

export const MOCK_CATEGORIES = [
  {
    sys: { id: "cat-korean" },
    fields: {
      title: "Korean",
      slug: "korean",
    },
  },
  {
    sys: { id: "cat-korea" },
    fields: {
      title: "Korea",
      slug: "korea",
    },
  },
  {
    sys: { id: "cat-chaebol" },
    fields: {
      title: "Chaebol",
      slug: "chaebol",
    },
  },
  {
    sys: { id: "cat-apateu" },
    fields: {
      title: "Apateu",
      slug: "apateu",
    },
  },
  {
    sys: { id: "cat-japanese" },
    fields: {
      title: "Japanese",
      slug: "japanese",
    },
  },
  {
    sys: { id: "cat-content" },
    fields: {
      title: "Content",
      slug: "content",
    },
  },
];

export const MOCK_ARTICLES = [
  {
    sys: { id: "post-1", createdAt: "2026-03-10T09:00:00.000Z" },
    fields: {
      title: "Mastering Essential Korean Honorifics: 존댓말 vs 반말",
      slug: "mastering-korean-honorifics",
      excerpt: "Understanding the subtle nuances of polite speech in Korean culture and how to avoid conversational faux pas.",
      date: "2026-03-10",
      tags: ["KOREAN", "GRAMMAR", "CULTURE"],
      coverImage: {
        fields: {
          file: {
            url: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1200&auto=format&fit=crop",
          },
        },
      },
      category: {
        fields: {
          title: "Korean",
          slug: "korean",
        },
      },
      fontClass: "font-korean",
      textColor: "#30a6a6",
      content: `When starting your journey in learning Korean, one of the most critical foundational concepts is understanding how speech levels reflect social hierarchy, closeness, and respect.

Jondaetmal (존댓말) is the formal and polite speech register used when speaking to elders, strangers, colleagues, and customers. In contrast, banmal (반말) is reserved strictly for very close friends of the exact same age or younger family members.

## Why Nuance Matters in Daily Interactions

Language in Korea is deeply intertwined with social awareness (눈치 - *nunchi*). Choosing the right honorific ending conveys empathy and attentiveness:

### Speech Levels Breakdown

- **합쇼체 (Hasipsyo-che):** Formal, courteous endings such as ~습니다 / ~습니까, commonly heard in news broadcasting, official business announcements, and military speeches.
- **해요체 (Haeyo-che):** Polite, conversational endings (~아/어요), universally loved in polite everyday banter with acquaintances, store clerks, and colleagues.
- **해체 (Hae-che):** Casual banmal with no polite markers (~아/어), used among bosom friends.

> "To learn a language is to have one more window from which to look at the world. In Korean, honorifics open a window directly into communal respect."

## Navigating Social Etiquette

A common mistake among beginners is switching to banmal too early because of mutual warmth felt through friendship.

### Asking to Drop Formalities

In Korean social etiquette, asking:

\`\`\`korean
우리 말 놓을까요?
(Shall we speak comfortably / drop formal speech?)
\`\`\`

is a respectful rite of passage that cements genuine companionship.

### Video Demonstration

Watch a quick conversational guide demonstrating natural tone shifts:

[Pronunciation and Etiquette Video](https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4)

## Practical Summary for Learners

1. Respect age and social hierarchy upon first meetings.
2. Listen carefully for your conversation partner's cues.
3. When in doubt, polite *haeyo-che* is always your safest approach.`,
    },
  },
  {
    sys: { id: "post-2", createdAt: "2026-03-05T14:30:00.000Z" },
    fields: {
      title: "The Architecture of Korean Apartments: Why 'Apateu' Shapes Modern Living",
      slug: "architecture-of-korean-apartments-apateu",
      excerpt: "Explore how high-rise residential complexes transformed Korea's post-war urban landscape and community lifestyle.",
      date: "2026-03-05",
      tags: ["APATEU", "URBAN", "LIFESTYLE"],
      coverImage: {
        fields: {
          file: {
            url: "https://images.unsplash.com/photo-1546874177-9e664107314e?q=80&w=1200&auto=format&fit=crop",
          },
        },
      },
      category: {
        fields: {
          title: "Apateu",
          slug: "apateu",
        },
      },
      fontClass: "font-korean",
      textColor: "#30a6a6",
      content: `From Seoul to Busan, towering apartment complexes dominate the skyline. In Korean, the word **'아파트' (Apateu)** represents far more than just residential concrete units—it is the epicenter of modern family life, educational mobility, and urban design.

Equipped with heated *ondol* (온돌) floor warming systems, centralized recycling centers, contactless keycards, and self-contained community facilities (kindergartens, gyms, study libraries, and senior lounges), modern *danji* (단지 - complexes) provide unparalleled daily convenience.

## The Cultural Meaning Behind the Towers

For generations of Koreans, moving into a newly constructed apartment complex symbolized stability, economic progress, and secure futures for their children:

- **Safety & Community:** Enclosed vehicle-free pedestrian walkways where young children play safely.
- **Smart Tech Integration:** Automated elevator calls from wall pads, smartphone home control, and real-time package delivery lockers.
- **Underfloor Heating:** The continuation of ancient thousand-year ondol stone hearth warmth in 30-floor modern sky homes.

> "Apateu is not just an architectural format; it is South Korea's social canvas for community and urban efficiency."

## Architectural Blueprint & Research Paper

For an in-depth demographic analysis of modern residential towers, consult our architectural report:

[Korean Urban Architecture Report.pdf](https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf)

Below is an aerial perspective of complex layout planning:

[Korean Danji Aerial Masterplan.webp](https://images.unsplash.com/photo-1546874177-9e664107314e?q=80&w=1200&auto=format&fit=crop)`,
    },
  },
  {
    sys: { id: "post-3", createdAt: "2026-02-28T11:15:00.000Z" },
    fields: {
      title: "Inside the Chaebol Dynamics: Family Dynasties and Economic Might",
      slug: "inside-chaebol-dynamics-and-economy",
      excerpt: "An objective dive into the history, structure, and global footprint of South Korea's family-owned industrial conglomerates.",
      date: "2026-02-28",
      tags: ["CHAEBOL", "ECONOMY", "HISTORY"],
      coverImage: {
        fields: {
          file: {
            url: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?q=80&w=1200&auto=format&fit=crop",
          },
        },
      },
      category: {
        fields: {
          title: "Chaebol",
          slug: "chaebol",
        },
      },
      fontClass: "font-korean",
      textColor: "#30a6a6",
      content: `The term **Chaebol (재벌)** refers to large, family-controlled corporate conglomerates that spearheaded South Korea's post-war rapid transformation—widely celebrated as the *'Miracle on the Han River'*.

From microchips and OLED displays to automotive design, shipbuilding, and global entertainment, household conglomerates like Samsung, Hyundai, LG, and SK have defined national economic power.

## Tradition Meets Innovation

The story of chaebols is tightly interwoven with Korea's national resilience, industrial discipline, and technological ambition:

- **Speed & Decisive Investment:** Concentrated family ownership enabled multi-billion dollar early commitments into semiconductor foundries and EV batteries years before competitors.
- **Global Brand Evolution:** Transitioning from OEM commodity manufacturing in the 1970s to world-defining luxury electronics, automobiles, and cultural export powerhouses.

> "Understanding Korea's economic development requires looking into the unique ecosystem where government policy, industrial ambition, and entrepreneurial resilience converged."`,
    },
  },
  {
    sys: { id: "post-4", createdAt: "2026-02-20T08:00:00.000Z" },
    fields: {
      title: "Seoul Cafe Culture: Aesthetics, Specialty Roasts, and Quiet Study Havens",
      slug: "seoul-cafe-culture-aesthetics-and-study",
      excerpt: "Why coffee shops in Korea are third spaces for productivity, visual design, and social rituals.",
      date: "2026-02-20",
      tags: ["KOREA", "LIFESTYLE", "SEOUL"],
      coverImage: {
        fields: {
          file: {
            url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop",
          },
        },
      },
      category: {
        fields: {
          title: "Korea",
          slug: "korea",
        },
      },
      fontClass: "font-korean",
      textColor: "#30a6a6",
      content: `Walking through the trendy backstreets of Yeonnam-dong, Seongsu-dong, or Euljiro, you will encounter hundreds of coffee shops that double as architectural exhibitions. In Korea, cafes represent the quintessential *'third place'*.

With ultra-fast Wi-Fi, discreet power outlets at nearly every seat, and curated ambient playlists, cafes are where students study, remote workers code, and friends unwind over signature iced Americanos.

## The Aesthetic Third Place

- **얼죽아 (Eol-juk-ah):** The famous Korean slang abbreviation for *"freezing to death, but still drinking iced Americano!"* Even in mid-January snowstorms, chilled iced coffees dominate orders.
- **Architectural Curations:** Brutalist concrete restorations, renovated traditional hanoks, and minimalist glass pavilions create spaces where design enthusiasts feel immediately inspired.

> "A cafe in Korea is never just about coffee; it is a serene sanctuary of light, music, and quiet focus."`,
    },
  },
  {
    sys: { id: "post-5", createdAt: "2026-02-14T16:20:00.000Z" },
    fields: {
      title: "Comparative Linguistics: Grammar Parallels Between Korean and Japanese",
      slug: "grammar-parallels-korean-and-japanese",
      excerpt: "SOV word order, particle systems, and shared Chinese-derived Sino vocabularies explored side by side.",
      date: "2026-02-14",
      tags: ["JAPANESE", "KOREAN", "LINGUISTICS"],
      coverImage: {
        fields: {
          file: {
            url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1200&auto=format&fit=crop",
          },
        },
      },
      category: {
        fields: {
          title: "Japanese",
          slug: "japanese",
        },
      },
      fontClass: "font-japanese",
      textColor: "#30a6a6",
      content: `Learners studying both Korean and Japanese frequently remark on how intimately similar their syntactic skeletons feel. Both languages belong to an agglutinative typological framework and adhere strictly to a **Subject-Object-Verb (SOV)** word order.

## Syntactic Twins: Particles

Particles in Korean align seamlessly with Japanese grammatical equivalents:

- **Topic Markers:** Korean 은/는 (*eun/neun*) corresponds directly to Japanese は (*wa*).
- **Subject Markers:** Korean 이/가 (*i/ga*) mirrors Japanese が (*ga*).
- **Object Markers:** Korean 을/를 (*eul/reul*) corresponds to Japanese を (*o*).

## Shared Sino Vocabulary Roots

Thousands of Sino-Korean (**한자어**) and Sino-Japanese (**漢語**) cognates sound almost identical:

- **Promise:** 약속 (*yaksok*) ↔ 約束 (*yakusoku*)
- **Preparation:** 준비 (*junbi*) ↔ 準備 (*junbi*)
- **Simple:** 간단 (*gandan*) ↔ 簡単 (*kantan*)

> "Mastering one language provides an exceptional springboard and intuitive mental model for acquiring the other."`,
    },
  },
  {
    sys: { id: "post-6", createdAt: "2026-02-05T10:00:00.000Z" },
    fields: {
      title: "Creating Engaging Study Routines: Digital Notes & Korean Flashcards",
      slug: "creating-engaging-study-routines-korean",
      excerpt: "Practical methods to integrate spaced repetition, K-drama immersion, and authentic reading into everyday routines.",
      date: "2026-02-05",
      tags: ["CONTENT", "STUDY", "PRODUCTIVITY"],
      coverImage: {
        fields: {
          file: {
            url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1200&auto=format&fit=crop",
          },
        },
      },
      category: {
        fields: {
          title: "Content",
          slug: "content",
        },
      },
      fontClass: "font-vietnamese",
      textColor: "#30a6a6",
      content: `Consistency triumphs over intensity when acquiring any language. Designing a study regimen that sparks genuine curiosity will sustain your momentum through intermediate plateaus.

Pairing Anki spaced repetition decks with authentic native content—such as webtoons, variety shows, and short essay collections—anchors abstract grammar rules into memorable, living contexts.

## Three Pillars of Sustainable Fluency

1. **Active Spaced Repetition:** 10 minutes of daily flashcards reviewing high-frequency verb conjugations.
2. **Contextual Comprehensible Input:** Shadowing dialogs from slice-of-life dramas with dual Korean-English subtitles.
3. **Daily Micro-Journaling:** Writing just three concise sentences every evening summarizing your day in simple Korean.

> "Small, mindful micro-sessions of 15 minutes each day yield far greater fluency than sporadic weekend marathons."`,
    },
  },
  {
    sys: { id: "post-nihonshi", createdAt: "2026-03-15T10:00:00.000Z" },
    fields: {
      title: "Nihonshi: An Introduction to Japanese Historical Eras",
      slug: "nihonshi",
      excerpt: "Explore the sweeping chronicle of Japanese history—from early Asuka foundations to the samurai shogunates and cultural renaissances.",
      date: "2026-03-15",
      tags: ["JAPANESE", "HISTORY", "NIHONSHI"],
      coverImage: {
        fields: {
          file: {
            url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop",
          },
        },
      },
      category: {
        fields: {
          title: "Japanese",
          slug: "japanese",
        },
      },
      fontClass: "font-japanese",
      textColor: "#30a6a6",
      breadcrumbs: [
        { title: "Home", path: "/" },
        { title: "Japanese", path: "/category/japanese" },
        { title: "Nihonshi", path: "/japanese/nihonshi" },
      ],
      blocks: [
        {
          id: "blk-nihonshi-intro-1",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: { content: "Japanese history (日本史 - Nihonshi) represents one of the world's most captivating journeys of cultural synthesis, political transformation, and artistic refinement. From the introduction of Buddhism in the Asuka period to the rise of feudal samurai clans, each era forged distinctive philosophical and literary milestones." },
              },
            ],
          },
        },
        {
          id: "blk-nihonshi-h2-1",
          type: "heading_2",
          heading_2: {
            rich_text: [{ type: "text", text: { content: "The Chronological Tapestry" } }],
          },
        },
        {
          id: "blk-nihonshi-p-2",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: { content: "To comprehend modern Japanese society, language, and aesthetics, one must trace the timeline through its pivotal golden ages. Court nobility defined the Heian era, while martial honor dominated the Kamakura and Muromachi periods." },
              },
            ],
          },
        },
        {
          id: "blk-nihonshi-callout-1",
          type: "callout",
          callout: {
            icon: { type: "emoji", emoji: "⛩️" },
            rich_text: [
              {
                type: "text",
                text: { content: "Key Historical Insight: The shift from civilian imperial courts in Kyoto to military warrior rule (Bakufu) in Kamakura and Edo fundamentally reorganized Japanese administrative law and social structure." },
              },
            ],
          },
        },
        {
          id: "blk-nihonshi-img-1",
          type: "image",
          image: {
            type: "external",
            external: {
              url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1200&auto=format&fit=crop",
            },
            caption: [{ plain_text: "Traditional pagoda and mountain landscape of ancient capital Kyoto" }],
          },
        },
        {
          id: "blk-nihonshi-p-3",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: { content: "Following centuries of Sengoku civil warfare, Japan entered an unprecedented 250-year epoch of domestic peace and cultural explosion under the Tokugawa Shogunate in Edo (modern Tokyo)." },
              },
            ],
          },
        },
        {
          id: "blk-nihonshi-child-asuka",
          type: "child_page",
          child_page: {
            title: "Part 1: The Asuka Era (飛鳥時代) — Dawn of Buddhism & Classical Arts",
            slug: "part-1-the-asuka-era",
            cover: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop",
            icon: "⛩️",
            excerpt: "Tracing the introduction of Mahayana Buddhism, Prince Shōtoku's diplomacy, and the cultural transformation of Yamato court.",
          },
        },
        {
          id: "blk-nihonshi-child-edo",
          type: "child_page",
          child_page: {
            title: "Edo Period: Two and a Half Centuries of Pax Tokugawa",
            slug: "edo-period",
            cover: "https://images.unsplash.com/photo-1528164344705-475426879c0d?q=80&w=1200&auto=format&fit=crop",
            icon: "🏯",
            excerpt: "Deep dive into the Tokugawa Shogunate (1603–1867), Sakoku foreign seclusion policy, and urban merchant culture in Edo.",
          },
        },
        {
          id: "blk-nihonshi-h2-2",
          type: "heading_2",
          heading_2: {
            rich_text: [{ type: "text", text: { content: "Reflections on Historical Memory" } }],
          },
        },
        {
          id: "blk-nihonshi-quote-1",
          type: "quote",
          quote: {
            rich_text: [
              {
                type: "text",
                text: { content: "The sound of the Gion Shoja bells echoes the impermanence of all things; the color of the sala flowers reveals the truth that the prosperous must decline. — The Tale of the Heike" },
              },
            ],
          },
        },
        {
          id: "blk-nihonshi-p-4",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: { content: "Explore the dedicated chapters above to discover how classical Buddhist diplomacy and urban merchant arts flourished across Japan's transformative eras." },
              },
            ],
          },
        },
      ],
      content: `Japanese history (日本史 - Nihonshi) represents one of the world's most captivating journeys of cultural synthesis, political transformation, and artistic refinement. From the introduction of Buddhism in the Asuka period to the rise of feudal samurai clans, each era forged distinctive philosophical and literary milestones.

## The Chronological Tapestry

To comprehend modern Japanese society, language, and aesthetics, one must trace the timeline through its pivotal golden ages. Court nobility defined the Heian era, while martial honor dominated the Kamakura and Muromachi periods.

> ⛩️ **Key Historical Insight:** The shift from civilian imperial courts in Kyoto to military warrior rule (Bakufu) in Kamakura and Edo fundamentally reorganized Japanese administrative law and social structure.

![Traditional pagoda and mountain landscape of ancient capital Kyoto](https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1200&auto=format&fit=crop)

[child_page:Part 1: The Asuka Era (飛鳥時代) — Dawn of Buddhism & Classical Arts](part-1-the-asuka-era)

Following centuries of Sengoku civil warfare, Japan entered an unprecedented 250-year epoch of domestic peace and cultural explosion under the Tokugawa Shogunate in Edo (modern Tokyo).

[child_page:Edo Period: Two and a Half Centuries of Pax Tokugawa](edo-period)

## Reflections on Historical Memory

> "The sound of the Gion Shoja bells echoes the impermanence of all things; the color of the sala flowers reveals the truth that the prosperous must decline." — The Tale of the Heike

Explore the dedicated chapters above to discover how classical Buddhist diplomacy and urban merchant arts flourished across Japan's transformative eras.`,
    },
  },
  {
    sys: { id: "post-edo-period", createdAt: "2026-03-15T11:00:00.000Z" },
    fields: {
      title: "Edo Period: Two and a Half Centuries of Pax Tokugawa",
      slug: "nihonshi/edo-period",
      parentSlug: "nihonshi",
      excerpt: "Deep dive into the Tokugawa Shogunate (1603–1867), Sakoku foreign seclusion policy, and urban merchant culture in Edo.",
      date: "2026-03-15",
      tags: ["JAPANESE", "EDO", "HISTORY", "TOKUGAWA"],
      coverImage: {
        fields: {
          file: {
            url: "https://images.unsplash.com/photo-1528164344705-475426879c0d?q=80&w=1200&auto=format&fit=crop",
          },
        },
      },
      category: {
        fields: {
          title: "Japanese",
          slug: "japanese",
        },
      },
      fontClass: "font-japanese",
      textColor: "#30a6a6",
      breadcrumbs: [
        { title: "Home", path: "/" },
        { title: "Japanese", path: "/category/japanese" },
        { title: "Nihonshi", path: "/japanese/nihonshi" },
        { title: "Edo Period", path: "/japanese/nihonshi/edo-period" },
      ],
      blocks: [
        {
          id: "blk-edo-intro",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: { content: "Established by Tokugawa Ieyasu after the decisive Battle of Sekigahara (1600), the Edo period (江戸時代 - Edo Jidai) ushered in more than 250 years of uninterrupted domestic stability, strict social stratification, and thriving commercial enterprise." },
              },
            ],
          },
        },
        {
          id: "blk-edo-h2-1",
          type: "heading_2",
          heading_2: {
            rich_text: [{ type: "text", text: { content: "The Four-Tier Social Order (Shinōkōshō)" } }],
          },
        },
        {
          id: "blk-edo-p-classes",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: { content: "Under neo-Confucian ideals, the shogunate codified society into four distinct hereditary classes: samurai warriors (shi), agricultural farmers (nō), artisans and craftsmen (kō), and town merchants (shō)." },
              },
            ],
          },
        },
        {
          id: "blk-edo-list-1",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Samurai (士): Governed as bureaucrats, scholars, and administrators rather than battlefield warriors." } }],
          },
        },
        {
          id: "blk-edo-list-2",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Farmers (農): Reified as primary food producers carrying heavy rice taxation burdens." } }],
          },
        },
        {
          id: "blk-edo-list-3",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Artisans & Merchants (工・商): Formed the wealthy Chōnin (townspeople) whose patronage birthed popular arts." } }],
          },
        },
        {
          id: "blk-edo-img-1",
          type: "image",
          image: {
            type: "external",
            external: {
              url: "https://images.unsplash.com/photo-1528164344705-475426879c0d?q=80&w=1200&auto=format&fit=crop",
            },
            caption: [{ plain_text: "Mount Fuji viewed with blooming spring blossoms, immortalized by Edo artists" }],
          },
        },
        {
          id: "blk-edo-h2-2",
          type: "heading_2",
          heading_2: {
            rich_text: [{ type: "text", text: { content: "The Sakoku Seclusion & Urban Renaissance" } }],
          },
        },
        {
          id: "blk-edo-p-urban",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: { content: "While foreign contact was heavily restricted through the isolated port of Dejima in Nagasaki, Edo grew into one of the largest metropolitan capitals in the world, surpassing 1 million inhabitants by the early 18th century." },
              },
            ],
          },
        },
        {
          id: "blk-edo-child-genroku",
          type: "child_page",
          child_page: {
            title: "Genroku Culture: The Golden Age of Arts & Floating World",
            slug: "genroku-culture",
            cover: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop",
            icon: "🎭",
            excerpt: "The vibrant explosion of Ukiyo-e woodblock prints, Kabuki drama, and Matsuo Bashō's poetic journey in the Genroku era.",
          },
        },
        {
          id: "blk-edo-callout-1",
          type: "callout",
          callout: {
            icon: { type: "emoji", emoji: "🏮" },
            rich_text: [
              {
                type: "text",
                text: { content: "Sankin-kōtai (Alternate Attendance): Daimyo lords were required to reside alternate years in Edo and leave their families as political hostages, spurring high-speed highway systems like the 53 stations of Tōkaidō." },
              },
            ],
          },
        },
      ],
      content: `Established by Tokugawa Ieyasu after the decisive Battle of Sekigahara (1600), the Edo period (江戸時代 - Edo Jidai) ushered in more than 250 years of uninterrupted domestic stability, strict social stratification, and thriving commercial enterprise.

## The Four-Tier Social Order (Shinōkōshō)

Under neo-Confucian ideals, the shogunate codified society into four distinct hereditary classes: samurai warriors (shi), agricultural farmers (nō), artisans and craftsmen (kō), and town merchants (shō).

- **Samurai (士):** Governed as bureaucrats, scholars, and administrators rather than battlefield warriors.
- **Farmers (農):** Reified as primary food producers carrying heavy rice taxation burdens.
- **Artisans & Merchants (工・商):** Formed the wealthy Chōnin (townspeople) whose patronage birthed popular arts.

![Mount Fuji viewed with blooming spring blossoms, immortalized by Edo artists](https://images.unsplash.com/photo-1528164344705-475426879c0d?q=80&w=1200&auto=format&fit=crop)

## The Sakoku Seclusion & Urban Renaissance

While foreign contact was heavily restricted through the isolated port of Dejima in Nagasaki, Edo grew into one of the largest metropolitan capitals in the world, surpassing 1 million inhabitants by the early 18th century.

[child_page:Genroku Culture: The Golden Age of Arts & Floating World](genroku-culture)

> 🏮 **Sankin-kōtai (Alternate Attendance):** Daimyo lords were required to reside alternate years in Edo and leave their families as political hostages, spurring high-speed highway systems like the 53 stations of Tōkaidō.`,
    },
  },
  {
    sys: { id: "post-genroku-culture", createdAt: "2026-03-15T12:00:00.000Z" },
    fields: {
      title: "Genroku Culture: The Golden Age of Arts & Floating World",
      slug: "nihonshi/edo-period/genroku-culture",
      parentSlug: "nihonshi/edo-period",
      excerpt: "The vibrant explosion of Ukiyo-e woodblock prints, Kabuki drama, and Matsuo Bashō's poetic journey in the Genroku era.",
      date: "2026-03-15",
      tags: ["JAPANESE", "ARTS", "GENROKU", "UKIYO-E"],
      coverImage: {
        fields: {
          file: {
            url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop",
          },
        },
      },
      category: {
        fields: {
          title: "Japanese",
          slug: "japanese",
        },
      },
      fontClass: "font-japanese",
      textColor: "#30a6a6",
      breadcrumbs: [
        { title: "Home", path: "/" },
        { title: "Japanese", path: "/category/japanese" },
        { title: "Nihonshi", path: "/japanese/nihonshi" },
        { title: "Edo Period", path: "/japanese/nihonshi/edo-period" },
        { title: "Genroku Culture", path: "/japanese/nihonshi/edo-period/genroku-culture" },
      ],
      blocks: [
        {
          id: "blk-genroku-intro",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: { content: "Reaching its zenith between 1688 and 1704, the Genroku era (元禄時代) represented the golden age of early modern Japanese culture. Unlike earlier aristocratic or military patronage, Genroku arts were driven by the vibrant aspirations and disposable wealth of the urban merchant bourgeoisie (Chōnin)." },
              },
            ],
          },
        },
        {
          id: "blk-genroku-h2-1",
          type: "heading_2",
          heading_2: {
            rich_text: [{ type: "text", text: { content: "The Concept of 'Ukiyo' — The Floating World" } }],
          },
        },
        {
          id: "blk-genroku-p-floating",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: { content: "Originally a Buddhist term signifying the sorrowful transience of mortal existence, Genroku artists redefined 'Ukiyo' (浮世) as celebrating the fleeting pleasures of beauty, theater, music, and seasonal feasts in designated entertainment quarters like Yoshiwara in Edo and Gion in Kyoto." },
              },
            ],
          },
        },
        {
          id: "blk-genroku-quote-1",
          type: "quote",
          quote: {
            rich_text: [
              {
                type: "text",
                text: { content: "Living only for the moment, turning our full attention to the pleasures of the moon, the snow, the cherry blossoms and the maple leaves... floating along with the river current: this is what we call the Floating World. — Asai Ryōi" },
              },
            ],
          },
        },
        {
          id: "blk-genroku-img-1",
          type: "image",
          image: {
            type: "external",
            external: {
              url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop",
            },
            caption: [{ plain_text: "Intricate Japanese artisan crafts and traditional textile motifs" }],
          },
        },
        {
          id: "blk-genroku-h2-2",
          type: "heading_2",
          heading_2: {
            rich_text: [{ type: "text", text: { content: "Literary Giants: Bashō, Saikaku, and Chikamatsu" } }],
          },
        },
        {
          id: "blk-genroku-list-1",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Matsuo Bashō (松尾芭蕉): Elevated haiku into spiritual landscape meditations, immortalized in 'Oku no Hosomichi' (The Narrow Road to the Deep North)." } }],
          },
        },
        {
          id: "blk-genroku-list-2",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Ihara Saikaku (井原西鶴): Authored satirical novels depicting the fortunes, romantic escapades, and shrewd accounting of merchant life." } }],
          },
        },
        {
          id: "blk-genroku-list-3",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Chikamatsu Monzaemon (近松門左衛門): Revered as the 'Shakespeare of Japan', pioneering dramatic bunraku puppet theater and tragic love suicides (Shinjū)." } }],
          },
        },
        {
          id: "blk-genroku-code-1",
          type: "code",
          code: {
            language: "haiku",
            rich_text: [
              {
                type: "text",
                text: { content: "古池や (Furuike ya) \n蛙飛びこむ (Kawazu tobikomu) \n水の音 (Mizu no oto)\n\nOld pond—\nA frog leaps into water,\nA splash of silence." },
              },
            ],
          },
        },
      ],
      content: `Reaching its zenith between 1688 and 1704, the Genroku era (元禄時代) represented the golden age of early modern Japanese culture. Unlike earlier aristocratic or military patronage, Genroku arts were driven by the vibrant aspirations and disposable wealth of the urban merchant bourgeoisie (Chōnin).

## The Concept of 'Ukiyo' — The Floating World

Originally a Buddhist term signifying the sorrowful transience of mortal existence, Genroku artists redefined 'Ukiyo' (浮世) as celebrating the fleeting pleasures of beauty, theater, music, and seasonal feasts in designated entertainment quarters like Yoshiwara in Edo and Gion in Kyoto.

> "Living only for the moment, turning our full attention to the pleasures of the moon, the snow, the cherry blossoms and the maple leaves... floating along with the river current: this is what we call the Floating World." — Asai Ryōi

![Intricate Japanese artisan crafts and traditional textile motifs](https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop)

## Literary Giants: Bashō, Saikaku, and Chikamatsu

- **Matsuo Bashō (松尾芭蕉):** Elevated haiku into spiritual landscape meditations, immortalized in *'Oku no Hosomichi'* (The Narrow Road to the Deep North).
- **Ihara Saikaku (井原西鶴):** Authored satirical novels depicting the fortunes, romantic escapades, and shrewd accounting of merchant life.
- **Chikamatsu Monzaemon (近松門左衛門):** Revered as the 'Shakespeare of Japan', pioneering dramatic bunraku puppet theater and tragic love suicides (*Shinjū*).

\`\`\`haiku
古池や (Furuike ya) 
蛙飛びこむ (Kawazu tobikomu) 
水の音 (Mizu no oto)

Old pond—
A frog leaps into water,
A splash of silence.
\`\`\``,
    },
  },
  {
    sys: { id: "post-asuka-era", createdAt: "2026-03-16T08:00:00.000Z" },
    fields: {
      title: "Part 1: The Asuka Era (飛鳥時代) — Dawn of Buddhism & Classical Arts",
      slug: "nihonshi/part-1-the-asuka-era",
      parentSlug: "nihonshi",
      parentTitle: "Japanese History: Epochs & Cultural Heritage (日本史)",
      excerpt: "Tracing the introduction of Mahayana Buddhism, Prince Shōtoku's diplomatic diplomacy, and the cultural transformation of Yamato court.",
      date: "2026-03-16",
      tags: ["JAPANESE", "ASUKA", "BUDDHISM", "HISTORY"],
      coverImage: {
        fields: {
          file: {
            url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop",
          },
        },
      },
      category: {
        fields: {
          title: "Japanese",
          slug: "japanese",
        },
      },
      fontClass: "font-japanese",
      textColor: "#30a6a6",
      breadcrumbs: [
        { title: "Home", path: "/" },
        { title: "Japanese", path: "/category/japanese" },
        { title: "Nihonshi", path: "/japanese/nihonshi" },
        { title: "Part 1: The Asuka Era", path: "/japanese/nihonshi/part-1-the-asuka-era" },
      ],
      blocks: [
        {
          id: "blk-asuka-intro",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: { content: "The Asuka period (飛鳥時代, 538–710 AD) marked a monumental watershed in Japanese civilization. Centered in the Asuka region of Yamato province, the era witnessed the official transmission of Buddhism from Baekje, the codification of imperial law, and active statecraft relations with Sui and Tang Dynasty China." },
              },
            ],
          },
        },
        {
          id: "blk-asuka-h2-1",
          type: "heading_2",
          heading_2: {
            rich_text: [{ type: "text", text: { content: "Prince Shōtoku & Political Centralization" } }],
          },
        },
        {
          id: "blk-asuka-p-shotoku",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: { content: "Serving as regent under Empress Suiko, Prince Shōtoku (聖徳太子) promulgated the Twelve Level Cap and Rank System and dispatched official diplomatic missions (Kenzōshi) across the East China Sea." },
              },
            ],
          },
        },
        {
          id: "blk-asuka-child-constitution",
          type: "child_page",
          child_page: {
            title: "The 17-Article Constitution (十七条憲法)",
            slug: "seventeen-article-constitution",
            cover: null,
            icon: "📜",
            excerpt: "The moral and ethical compass enacted in 604 AD emphasizing harmony (Wa), Buddhist reverence, and public justice.",
          },
        },
        {
          id: "blk-asuka-img-1",
          type: "image",
          image: {
            type: "external",
            external: {
              url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop",
            },
            caption: [{ plain_text: "Ancient pagoda and sacred courtyard architecture of the Yamato cradle" }],
          },
        },
      ],
      content: `The Asuka period (飛鳥時代, 538–710 AD) marked a monumental watershed in Japanese civilization. Centered in the Asuka region of Yamato province, the era witnessed the official transmission of Buddhism from Baekje, the codification of imperial law, and active statecraft relations with Sui and Tang Dynasty China.

## Prince Shōtoku & Political Centralization

Serving as regent under Empress Suiko, Prince Shōtoku (聖徳太子) promulgated the Twelve Level Cap and Rank System and dispatched official diplomatic missions (Kenzōshi) across the East China Sea.

[child_page:The 17-Article Constitution (十七条憲法)](seventeen-article-constitution)

![Ancient pagoda and sacred courtyard architecture of the Yamato cradle](https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop)`,
    },
  },
  {
    sys: { id: "post-constitution", createdAt: "2026-03-16T09:30:00.000Z" },
    fields: {
      title: "The 17-Article Constitution (十七条憲法)",
      slug: "nihonshi/part-1-the-asuka-era/seventeen-article-constitution",
      parentSlug: "nihonshi/part-1-the-asuka-era",
      parentTitle: "Part 1: The Asuka Era (飛鳥時代) — Dawn of Buddhism & Classical Arts",
      excerpt: "The moral and ethical compass enacted in 604 AD emphasizing harmony (Wa), Buddhist reverence, and public justice.",
      date: "2026-03-16",
      tags: ["JAPANESE", "PHILOSOPHY", "LAW", "CONSTITUTION"],
      coverImage: null, // Sub-page without cover to verify clean gradient placeholder
      icon: "📜",
      category: {
        fields: {
          title: "Japanese",
          slug: "japanese",
        },
      },
      fontClass: "font-japanese",
      textColor: "#30a6a6",
      breadcrumbs: [
        { title: "Home", path: "/" },
        { title: "Japanese", path: "/category/japanese" },
        { title: "Nihonshi", path: "/japanese/nihonshi" },
        { title: "Part 1: The Asuka Era", path: "/japanese/nihonshi/part-1-the-asuka-era" },
        { title: "The 17-Article Constitution", path: "/japanese/nihonshi/part-1-the-asuka-era/seventeen-article-constitution" },
      ],
      blocks: [
        {
          id: "blk-const-intro",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: { content: "Enacted in 604 AD by Prince Shōtoku, the Seventeen-Article Constitution (十七条憲法, Jūshichijō Kenpō) was not an administrative penal code, but rather a profoundly philosophical charter setting out moral principles and statecraft codes for government ministers and court officials." },
              },
            ],
          },
        },
        {
          id: "blk-const-h2-1",
          type: "heading_2",
          heading_2: {
            rich_text: [{ type: "text", text: { content: "Article I: Harmony Above All" } }],
          },
        },
        {
          id: "blk-const-quote-1",
          type: "quote",
          quote: {
            rich_text: [
              {
                type: "text",
                text: { content: "和を以て貴しと為し、忤ふこと無きを宗とせよ (Harmony is to be valued, and an avoidance of wanton opposition to be honoured.) — Article I" },
              },
            ],
          },
        },
        {
          id: "blk-const-p-buddhism",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: { content: "Article II commanded sincere reverence for the Three Treasures of Buddhism: the Buddha, the Dharma (the Law), and the Sangha (the Monastic Community), viewing spiritual enlightenment as the true remedy for societal discord." },
              },
            ],
          },
        },
      ],
      content: `Enacted in 604 AD by Prince Shōtoku, the Seventeen-Article Constitution (十七条憲法, Jūshichijō Kenpō) was not an administrative penal code, but rather a profoundly philosophical charter setting out moral principles and statecraft codes for government ministers and court officials.

## Article I: Harmony Above All

> "和を以て貴しと為し、忤ふこと無きを宗とせよ (Harmony is to be valued, and an avoidance of wanton opposition to be honoured.)" — Article I

Article II commanded sincere reverence for the Three Treasures of Buddhism: the Buddha, the Dharma (the Law), and the Sangha (the Monastic Community), viewing spiritual enlightenment as the true remedy for societal discord.`,
    },
  },
];

// Helper to look up an article or nested sub-page by path in mock data
export function findMockArticleByPath(slugOrPath) {
  if (!slugOrPath) return null;
  let clean = String(slugOrPath).trim().replace(/^\/+|\/+$/g, "");
  try {
    clean = decodeURIComponent(clean);
  } catch {
    // continue
  }
  const segments = clean.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  // 1. Direct match on full path (case-insensitive & slug-normalized)
  const directMatch = MOCK_ARTICLES.find(
    (a) =>
      slugsMatch(a.fields.slug, clean) ||
      a.fields.slug.toLowerCase() === clean.toLowerCase()
  );
  if (directMatch) return directMatch;

  // 2. If it's a nested path, match leaf slug with parent context
  if (segments.length > 1) {
    const parentSlug = segments.slice(0, -1).join("/");
    const leafSlug = segments[segments.length - 1];

    const nestedMatch = MOCK_ARTICLES.find((a) => {
      const artSlug = a.fields.slug || "";
      const artParent = a.fields.parentSlug || "";
      return (
        (slugsMatch(artSlug, clean) ||
          slugsMatch(artSlug, leafSlug) ||
          artSlug.endsWith(`/${leafSlug}`) ||
          slugsMatch(a.fields.title, leafSlug)) &&
        (!artParent ||
          slugsMatch(artParent, parentSlug) ||
          slugsMatch(artSlug, clean) ||
          artSlug.includes(slugify(parentSlug)))
      );
    });
    if (nestedMatch) return nestedMatch;
  }

  // 3. Fallback match on leaf slug or sys.id
  const leaf = segments[segments.length - 1];
  const matched =
    directMatch ||
    (segments.length > 1 ? MOCK_ARTICLES.find((a) => {
      const artSlug = a.fields.slug || "";
      const artParent = a.fields.parentSlug || "";
      const parentSlug = segments.slice(0, -1).join("/");
      return (
        (slugsMatch(artSlug, clean) ||
          slugsMatch(artSlug, leaf) ||
          artSlug.endsWith(`/${leaf}`) ||
          slugsMatch(a.fields.title, leaf)) &&
        (!artParent ||
          slugsMatch(artParent, parentSlug) ||
          slugsMatch(artSlug, clean) ||
          artSlug.includes(slugify(parentSlug)))
      );
    }) : null) ||
    MOCK_ARTICLES.find(
      (a) =>
        slugsMatch(a.fields.slug, leaf) ||
        slugsMatch(a.fields.title, leaf) ||
        a.fields.slug.endsWith(`/${leaf}`) ||
        a.sys.id === leaf
    ) ||
    null;

  if (matched && segments.length > 1) {
    const rootSlug = segments[0];
    const rootArt = MOCK_ARTICLES.find(
      (a) => slugsMatch(a.fields.slug, rootSlug) || a.sys.id === rootSlug
    );
    if (rootArt) {
      if (!matched.fields.fontClass || matched.fields.fontClass === "font-default") {
        matched.fields.fontClass = rootArt.fields.fontClass || "font-default";
      }
      if (!matched.fields.textColor || matched.fields.textColor === "#30a6a6") {
        matched.fields.textColor = rootArt.fields.textColor || "#30a6a6";
      }
    }
  }

  return matched;
}
