export interface VocabularyItem {
  arabic: string;
  transliteration: string;
  meaning: string;
  audio_url?: string;
}

export interface ExampleItem {
  arabic: string;
  translation: string;
  audio_url?: string;
}

export interface ExerciseItem {
  type: string;
  question: string;
  options?: string[];
  correct_answer: string;
}

export interface Lesson {
  id: string;
  level_code: string;
  module_number: number;
  number: number;
  title: string;
  objectives: string[];
  grammar_content: string;
  vocabulary?: VocabularyItem[];
  examples?: ExampleItem[];
  exercises?: ExerciseItem[];
  order: number;
}

export class LessonEntity {
  static async list(orderBy?: string): Promise<Lesson[]> {
    // Mock data for now - replace with actual API call
    const mockLessons: Lesson[] = [
      {
        id: '1',
        level_code: 'A1',
        module_number: 1,
        number: 1,
        title: 'Hello and Goodbye',
        objectives: [
          'Learn basic Arabic greetings',
          'Practice pronunciation of common words',
          'Understand cultural context of greetings'
        ],
        grammar_content: 'In this lesson, we will learn basic Arabic greetings.\n\nGreetings are essential for starting conversations in Arabic.',
        vocabulary: [
          { arabic: 'مرحبا', transliteration: 'marhaba', meaning: 'Hello', audio_url: '/audio/marhaba.mp3' },
          { arabic: 'مع السلامة', transliteration: 'ma\'a as-salaama', meaning: 'Goodbye', audio_url: '/audio/maasalaama.mp3' }
        ],
        examples: [
          { arabic: 'مرحبا، كيف حالك؟', translation: 'Hello, how are you?' },
          { arabic: 'أنا بخير، شكراً', translation: 'I am fine, thank you' }
        ],
        exercises: [
          {
            type: 'multiple_choice',
            question: 'What does "مرحبا" mean?',
            options: ['Goodbye', 'Hello', 'Thank you', 'Please'],
            correct_answer: 'Hello'
          }
        ],
        order: 1
      },
      {
        id: '2',
        level_code: 'A1',
        module_number: 1,
        number: 2,
        title: 'How are you?',
        objectives: [
          'Learn to ask about someone\'s well-being',
          'Practice responding to well-being questions',
          'Understand cultural expressions'
        ],
        grammar_content: 'Learn to ask and answer questions about well-being.\n\nThis is a fundamental conversation skill in Arabic.',
        vocabulary: [
          { arabic: 'كيف', transliteration: 'kayfa', meaning: 'How', audio_url: '/audio/kayfa.mp3' },
          { arabic: 'حالك', transliteration: 'haluk', meaning: 'Your condition/well-being', audio_url: '/audio/haluk.mp3' }
        ],
        examples: [
          { arabic: 'كيف حالك؟', translation: 'How are you?' },
          { arabic: 'أنا بخير، والحمد لله', translation: 'I am fine, praise be to God' }
        ],
        exercises: [
          {
            type: 'multiple_choice',
            question: 'How do you ask "How are you?" in Arabic?',
            options: ['مرحبا', 'كيف حالك؟', 'مع السلامة', 'شكراً'],
            correct_answer: 'كيف حالك؟'
          }
        ],
        order: 2
      }
    ];
    
    // Sort by order if specified
    if (orderBy === 'order') {
      return mockLessons.sort((a, b) => a.order - b.order);
    }
    
    return mockLessons;
  }

  static async get(id: string): Promise<Lesson | null> {
    const lessons = await this.list();
    // For now, using number as ID - in real app, you'd have a proper ID field
    return lessons.find(lesson => lesson.number.toString() === id) || null;
  }

  static async filter(criteria: Partial<Lesson>): Promise<Lesson[]> {
    const lessons = await this.list();
    return lessons.filter(lesson => {
      return Object.entries(criteria).every(([key, value]) => 
        lesson[key as keyof Lesson] === value
      );
    });
  }

  static async getByLevelAndModule(levelCode: string, moduleNumber: number): Promise<Lesson[]> {
    return this.filter({ level_code: levelCode, module_number: moduleNumber });
  }
}
