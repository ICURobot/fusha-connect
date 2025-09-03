export interface Lesson {
  id: string;
  title: string;
  description?: string;
  completed?: boolean;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  canDoStatement: string;
  lessons: Lesson[];
  completed?: boolean;
}

export interface Level {
  id: string;
  code: string;
  title: string;
  description: string;
  goal: string;
  primarySources: string[];
  modules: Module[];
  color: string;
  textColor: string;
  completed?: boolean;
}

export const curriculum: Level[] = [
  {
    id: "a1",
    code: "A1",
    title: "Foundational Arabic",
    description: "Build a solid foundation in core vocabulary and basic sentence structures",
    goal: "Build a solid foundation in core vocabulary and basic sentence structures",
    primarySources: ["Mastering Arabic 1", "Al-Kitaab Part One (Ch. 1-4)"],
    color: "from-green-100 to-green-200",
    textColor: "text-green-700",
    modules: [
      {
        id: "a1-m1",
        title: "Introductions & The Nominal Sentence",
        description: "Master basic greetings and sentence structures",
        canDoStatement: "I can greet people, introduce myself, and form simple descriptive sentences about myself and others.",
        lessons: [
          { id: "a1-m1-l1", title: "Greetings & Basic Phrases", description: "Formal and informal greetings. Common classroom phrases." },
          { id: "a1-m1-l2", title: "The Nominal Sentence", description: "Understanding sentences without verbs (e.g., 'The student is new'). Subject pronouns (ana, anta, anti, huwa, hiya)." },
          { id: "a1-m1-l3", title: "Gender, Agreement, and Demonstratives", description: "Learn about gender in Arabic nouns and adjectives, and how to use demonstrative pronouns like 'this' and 'that'." },
          { id: "a1-m1-l4", title: "The Definite Article", description: "Learn how to say 'the' in Arabic and master the rules of Sun and Moon letters." }
        ]
      },
      {
        id: "a1-m2",
        title: "Identity & Possession",
        description: "Learn about nationalities and possession structures",
        canDoStatement: "I can state my nationality, talk about where I am from, and describe possessions using both attached pronouns and the idaafa.",
        lessons: [
          { id: "a1-m2-l1", title: "Countries & Nationalities", description: "Vocabulary for common countries. Forming nisba adjectives (e.g., misr -> misriyy)." },
          { id: "a1-m2-l2", title: "'This is...' & Question Words", description: "Learn to ask fundamental questions about people and objects using demonstratives and question words." },
          { id: "a1-m2-l3", title: "Attached Pronouns (Possession)", description: "Attaching -i, -ka, -ki, -hu, -ha to nouns to show possession (my, your, his, her)." },
          { id: "a1-m2-l4", title: "The Idaafa Construction", description: "Introduction to the core concept of possession (e.g., bayt al-rajul - 'the man's house')." }
        ]
      }
    ]
  },
  {
    id: "a2",
    code: "A2",
    title: "Building Independence",
    description: "Master basic verb conjugations and begin to narrate events in the past and present",
    goal: "Master basic verb conjugations and begin to narrate events in the past and present",
    primarySources: ["Mastering Arabic 2", "Al-Kitaab Part One (Ch. 5-13)"],
    color: "from-cyan-100 to-cyan-200",
    textColor: "text-cyan-700",
    modules: [
      {
        id: "a2-m3",
        title: "Daily Life & The Present Tense",
        description: "Learn to describe daily routines and present activities",
        canDoStatement: "I can describe my daily routine, talk about my studies or work, and describe the regular activities of others.",
        lessons: [
          { id: "a2-m3-l1", title: "The Verbal Sentence", description: "Introduction to Subject-Verb-Object structure." },
          { id: "a2-m3-l2", title: "Present Tense Conjugation (Singular)", description: "Conjugating regular verbs for ana, anta, anti, huwa, hiya." },
          { id: "a2-m3-l3", title: "Plurals", description: "Sound masculine (-uun) and sound feminine (-aat) plurals. Introduction to broken plurals." },
          { id: "a2-m3-l4", title: "Present Tense Conjugation (Plural)", description: "Conjugating for nahnu, antum, antunna, hum, hunna." },
          { id: "a2-m3-l5", title: "Negating the Present Tense", description: "Using laa for simple negation." }
        ]
      },
      {
        id: "a2-m4",
        title: "The Past & Narration",
        description: "Master past tense and storytelling",
        canDoStatement: "I can talk about what I did yesterday or last weekend and ask others about their past activities.",
        lessons: [
          { id: "a2-m4-l1", title: "The Past Tense (Singular)", description: "Conjugating regular past-tense verbs for singular pronouns." },
          { id: "a2-m4-l2", title: "The Past Tense (Plural)", description: "Completing the past-tense conjugation paradigm." },
          { id: "a2-m4-l3", title: "Object Pronouns", description: "Attaching pronouns to verbs to indicate the object (e.g., 'I saw him' - ra'aytuhu)." },
          { id: "a2-m4-l4", title: "Negating the Past Tense", description: "Using maa for simple past negation." },
          { id: "a2-m4-l5", title: "Numbers 1-10", description: "Cardinal numbers and their agreement rules with nouns." }
        ]
      }
    ]
  },
  {
    id: "b1",
    code: "B1",
    title: "The Intermediate Threshold",
    description: "Gain confidence with more complex sentence structures and a wider range of vocabulary",
    goal: "Gain confidence with more complex sentence structures and a wider range of vocabulary",
    primarySources: ["Al-Kitaab Part Two (Ch. 1-7)"],
    color: "from-amber-100 to-amber-200",
    textColor: "text-amber-700",
    modules: [
      {
        id: "b1-m5",
        title: "Modality & The Future",
        description: "Express future plans and possibilities",
        canDoStatement: "I can discuss my future plans, express what I want or need to do, and use a more formal style of negation for the past.",
        lessons: [
          { id: "b1-m5-l1", title: "The Future Tense", description: "Using sa- and sawfa to talk about the future." },
          { id: "b1-m5-l2", title: "The Subjunctive Mood", description: "Using an, li-, hatta to express purpose, desire, or possibility. Negating the future with lan." },
          { id: "b1-m5-l3", title: "The Jussive Mood", description: "Using lam to negate the past tense more formally than maa." },
          { id: "b1-m5-l4", title: "The Verbal Noun (Masdar)", description: "Understanding and using the masdar (e.g., 'I like to read' -> 'I like reading')." }
        ]
      },
      {
        id: "b1-m6",
        title: "Connecting Ideas",
        description: "Create complex sentences and comparisons",
        canDoStatement: "I can create more complex sentences, compare two or more things, and correctly use numbers up to 99 in context.",
        lessons: [
          { id: "b1-m6-l1", title: "Relative Clauses", description: "Using alladhii, allatii, etc., to connect sentences (e.g., 'The man who I saw...')." },
          { id: "b1-m6-l2", title: "Weak Verbs I (Hollow & Assimilated)", description: "Introduction to conjugating verbs with a weak middle or first root letter." },
          { id: "b1-m6-l3", title: "Comparatives & Superlatives", description: "Forming and using comparative (af'al min) and superlative adjectives." },
          { id: "b1-m6-l4", title: "Numbers 11-99", description: "Rules for compound numbers and noun agreement." },
          { id: "b1-m6-l5", title: "Your Most Powerful Tool - Using a Root-Based Dictionary", description: "Learn the essential skill that unlocks independent Arabic reading and vocabulary building." }
        ]
      }
    ]
  },
  {
    id: "b2",
    code: "B2",
    title: "Upper Intermediate",
    description: "Engage with authentic texts and express nuanced opinions on a variety of topics",
    goal: "Engage with authentic texts and express nuanced opinions on a variety of topics",
    primarySources: ["Al-Kitaab Part Two (Ch. 8-13)"],
    color: "from-gray-200 to-gray-300",
    textColor: "text-gray-700",
    modules: [
      {
        id: "b2-m7",
        title: "Advanced Structures & Media Arabic",
        description: "Master passive voice and media language",
        canDoStatement: "I can understand the main ideas of news articles, describe events using the passive voice, and express more complex ideas using sentence modifiers.",
        lessons: [
          { id: "b2-m7-l1", title: "The Verb Form System I (Forms I-V)", description: "Understanding the foundational verb forms and their patterns." },
          { id: "b2-m7-l2", title: "The Verb Form System II (Forms VI-X)", description: "Mastering the advanced verb forms and their applications." },
          { id: "b2-m7-l3", title: "The Passive Voice", description: "Forming and using the passive in both past and present tenses." },
          { id: "b2-m7-l4", title: "Weak Verbs II (Defective & Doubled)", description: "Mastering the remaining categories of weak and irregular verbs." },
          { id: "b2-m7-l5", title: "Inna and Her Sisters", description: "Using sentence modifiers like inna, anna, laakinna." },
          { id: "b2-m7-l6", title: "Introduction to Media Arabic", description: "Analyzing headlines and short news clips. Vocabulary for politics and current events." }
        ]
      },
      {
        id: "b2-m8",
        title: "Expressing Nuance & Culture",
        description: "Read authentic texts and discuss cultural topics",
        canDoStatement: "I can read short, unvowelled texts on familiar topics, understand conditional sentences, and discuss basic cultural and historical subjects with some fluency.",
        lessons: [
          { id: "b2-m8-l1", title: "The Concept of I'raab (Case)", description: "A simplified introduction to the three cases (nominative, accusative, genitive) to aid in reading formal texts." },
          { id: "b2-m8-l2", title: "Conditional Sentences", description: "Using idhaa and law to talk about hypothetical situations." },
          { id: "b2-m8-l3", title: "Reading Unvowelled Texts", description: "Strategies and practice for reading authentic texts without short vowels." },
          { id: "b2-m8-l4", title: "Cultural Topics", description: "Reading and listening comprehension exercises based on short essays about Arab history, literature, and cinema." }
        ]
      }
    ]
  }
];
