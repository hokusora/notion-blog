// Fallback data when Contentful credentials are not provided or API request fails

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

const createRichTextDoc = (paragraphs, heading, quote) => ({
  nodeType: "document",
  data: {},
  content: [
    {
      nodeType: "paragraph",
      data: {},
      content: [
        {
          nodeType: "text",
          value: paragraphs[0] || "",
          marks: [],
          data: {},
        },
      ],
    },
    ...(heading
      ? [
          {
            nodeType: "heading-2",
            data: {},
            content: [
              {
                nodeType: "text",
                value: heading,
                marks: [],
                data: {},
              },
            ],
          },
        ]
      : []),
    ...(quote
      ? [
          {
            nodeType: "quote",
            data: {},
            content: [
              {
                nodeType: "paragraph",
                data: {},
                content: [
                  {
                    nodeType: "text",
                    value: quote,
                    marks: [],
                    data: {},
                  },
                ],
              },
            ],
          },
        ]
      : []),
    ...(paragraphs.slice(1).map((p) => ({
      nodeType: "paragraph",
      data: {},
      content: [
        {
          nodeType: "text",
          value: p,
          marks: [],
          data: {},
        },
      ],
    }))),
  ],
});

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
      content: createRichTextDoc(
        [
          "When starting your journey in learning Korean, one of the most critical foundational concepts is understanding how speech levels reflect social hierarchy, closeness, and respect.",
          "Jondaetmal (존댓말) is the formal and polite speech register used when speaking to elders, strangers, colleagues, and customers. In contrast, banmal (반말) is reserved strictly for very close friends of the exact same age or younger family members.",
          "A common mistake among beginners is switching to banmal too early because of closeness felt through friendship. In Korean social etiquette, asking '우리 말 놓을까요?' (Shall we drop formal speech?) is a respectful transition that strengthens mutual bonds."
        ],
        "Why Nuance Matters in Daily Interactions",
        "Language in Korea is deeply intertwined with social awareness (눈치 - nunchi). Choosing the right honorific ending conveys empathy and attentiveness."
      ),
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
      content: createRichTextDoc(
        [
          "From Seoul to Busan, towering apartment complexes dominate the skyline. In Korean, the word '아파트' (Apateu) represents far more than just residential units—it is the epicentre of modern family life and urban convenience.",
          "Equipped with heated ondol flooring, smart home automation, security gates, and self-contained community facilities (kindergartens, fitness centers, and study cafes), modern complexes provide unparalleled convenience.",
          "Understanding the Apateu phenomenon offers a deep window into Korea's rapid economic development and contemporary community dynamics."
        ],
        "The Cultural Meaning Behind the Towers",
        "For generations of Koreans, moving into a newly constructed complex symbolized stability, progress, and educational opportunity for their children."
      ),
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
      content: createRichTextDoc(
        [
          "The term Chaebol (재벌) refers to large, family-controlled corporate conglomerates that spearheaded South Korea's post-war 'Miracle on the Han River'.",
          "From electronics and semiconductors to automotive manufacturing and entertainment, household names like Samsung, Hyundai, LG, and SK have driven economic vitality across the globe.",
          "Today, these conglomerates balance traditional family leadership with global corporate governance, fostering world-class technology while shaping modern business culture."
        ],
        "Tradition Meets Innovation",
        "The story of chaebols is tightly interwoven with Korea's national resilience, industrial discipline, and technological ambition."
      ),
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
      content: createRichTextDoc(
        [
          "Walking down any street in Yeonnam-dong or Seongsu-dong, you will encounter coffee shops that double as architectural exhibitions. In Korea, cafes represent the quintessential 'third place'.",
          "With lightning-fast Wi-Fi, power outlets at every seat, and curated playlists, cafes are where students study, remote workers design, and friends unwind over signature iced Americanos.",
          "Even in the depths of winter, the phrase 'Eol-juk-ah' (얼죽아 - freezing to death, but still iced Americano) illustrates the enduring love Koreans harbor for their chilled brews."
        ],
        "The Aesthetic Third Place",
        "A cafe in Korea is never just about coffee; it is a canvas of light, music, and peaceful focus."
      ),
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
      content: createRichTextDoc(
        [
          "Learners studying both Korean and Japanese frequently remark on how intimately similar their syntactic skeletons feel. Both languages belong to the agglutinative typology and follow a Subject-Object-Verb (SOV) order.",
          "Particles in Korean like 은/는 (topic marker), 이/가 (subject marker), and 을/를 (object marker) align seamlessly with Japanese は (wa), が (ga), and を (o).",
          "Furthermore, thousands of Sino-Korean (한자어) and Sino-Japanese (漢語) roots are nearly homophonous, allowing multilingual learners to rapidly compound their vocabulary retention."
        ],
        "A Bridge Between East Asian Languages",
        "Mastering one language provides an exceptional springboard and intuitive mental model for acquiring the other."
      ),
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
      content: createRichTextDoc(
        [
          "Consistency triumphs over intensity when acquiring a new language. Designing a study regimen that sparks curiosity will sustain your momentum through intermediate plateaus.",
          "Pairing Anki spaced repetition decks with authentic native content—such as webtoons, variety shows, and short essay collections—anchors abstract grammar rules into memorable contexts.",
          "Keep an active digital journal: try writing 3 sentences every evening summarizing your day in simple Korean. Within months, fluid expression will become second nature."
        ],
        "Sustainable Daily Habits",
        "Small, mindful micro-sessions of 15 minutes each day yield far greater fluency than sporadic weekend marathons."
      ),
    },
  },
];
