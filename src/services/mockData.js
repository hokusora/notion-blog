// Fallback data for Notion blog when integration credentials are not configured or during previews

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
      content: `When starting your journey in learning Korean, one of the most critical foundational concepts is understanding how speech levels reflect social hierarchy, closeness, and respect.

Jondaetmal (존댓말) is the formal and polite speech register used when speaking to elders, strangers, colleagues, and customers. In contrast, banmal (반말) is reserved strictly for very close friends of the exact same age or younger family members.

## Why Nuance Matters in Daily Interactions

Language in Korea is deeply intertwined with social awareness (눈치 - *nunchi*). Choosing the right honorific ending conveys empathy and attentiveness:

- **합쇼체 (Hasipsyo-che):** Formal, courteous endings such as ~습니다 / ~습니까, commonly heard in news broadcasting, official business announcements, and military speeches.
- **해요체 (Haeyo-che):** Polite, conversational endings (~아/어요), universally loved in polite everyday banter with acquaintances, store clerks, and colleagues.
- **해체 (Hae-che):** Casual banmal with no polite markers (~아/어), used among bosom friends.

> "To learn a language is to have one more window from which to look at the world. In Korean, honorifics open a window directly into communal respect."

A common mistake among beginners is switching to banmal too early because of mutual warmth felt through friendship. In Korean social etiquette, asking:

\`\`\`korean
우리 말 놓을까요?
(Shall we speak comfortably / drop formal speech?)
\`\`\`

is a respectful rite of passage that cements genuine companionship.`,
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
      content: `From Seoul to Busan, towering apartment complexes dominate the skyline. In Korean, the word **'아파트' (Apateu)** represents far more than just residential concrete units—it is the epicenter of modern family life, educational mobility, and urban design.

Equipped with heated *ondol* (온돌) floor warming systems, centralized recycling centers, contactless keycards, and self-contained community facilities (kindergartens, gyms, study libraries, and senior lounges), modern *danji* (단지 - complexes) provide unparalleled daily convenience.

## The Cultural Meaning Behind the Towers

For generations of Koreans, moving into a newly constructed apartment complex symbolized stability, economic progress, and secure futures for their children:

- **Safety & Community:** Enclosed vehicle-free pedestrian walkways where young children play safely.
- **Smart Tech Integration:** Automated elevator calls from wall pads, smartphone home control, and real-time package delivery lockers.
- **Underfloor Heating:** The continuation of ancient thousand-year ondol stone hearth warmth in 30-floor modern sky homes.

> "Apateu is not just an architectural format; it is South Korea's social canvas for community and urban efficiency."`,
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
      content: `Consistency triumphs over intensity when acquiring any language. Designing a study regimen that sparks genuine curiosity will sustain your momentum through intermediate plateaus.

Pairing Anki spaced repetition decks with authentic native content—such as webtoons, variety shows, and short essay collections—anchors abstract grammar rules into memorable, living contexts.

## Three Pillars of Sustainable Fluency

1. **Active Spaced Repetition:** 10 minutes of daily flashcards reviewing high-frequency verb conjugations.
2. **Contextual Comprehensible Input:** Shadowing dialogs from slice-of-life dramas with dual Korean-English subtitles.
3. **Daily Micro-Journaling:** Writing just three concise sentences every evening summarizing your day in simple Korean.

> "Small, mindful micro-sessions of 15 minutes each day yield far greater fluency than sporadic weekend marathons."`,
    },
  },
];
