
import { HogwartsHouse } from './types';

export const TOTAL_QUESTIONS = 10;

export const HOGWARTS_HOUSES: HogwartsHouse[] = ['Gryffindor', 'Hufflepuff', 'Ravenclaw', 'Slytherin'];

export interface HouseTheme {
  name: string;
  color: string;
  textColor: string;
  borderColor: string;
  description: string;
  crest?: string; // Optional: path to an SVG or image
}

export const HOUSE_THEMES: Record<HogwartsHouse, HouseTheme> = {
  Gryffindor: { 
    name: 'Gryffindor', 
    color: 'bg-red-700', 
    textColor: 'text-yellow-300', 
    borderColor: 'border-yellow-400', 
    description: 'Known for bravery, daring, nerve, and chivalry.',
    crest: '🦁' // Placeholder emoji
  },
  Hufflepuff: { 
    name: 'Hufflepuff', 
    color: 'bg-yellow-500', 
    textColor: 'text-black', 
    borderColor: 'border-black', 
    description: 'Values hard work, dedication, patience, loyalty, and fair play.',
    crest: '🦡' // Placeholder emoji
  },
  Ravenclaw: { 
    name: 'Ravenclaw', 
    color: 'bg-blue-700', 
    textColor: 'text-indigo-200', // Adjusted for better contrast
    borderColor: 'border-gray-400', // Using gray for bronze-like feel
    description: 'Values intelligence, learning, wisdom, and wit.',
    crest: '🦅' // Placeholder emoji
  },
  Slytherin: { 
    name: 'Slytherin', 
    color: 'bg-green-700', 
    textColor: 'text-slate-300', 
    borderColor: 'border-slate-400', // Using slate for silver-like feel
    description: 'Values ambition, cunning, leadership, and resourcefulness.',
    crest: '🐍' // Placeholder emoji
  },
};

export const GEMINI_TEXT_MODEL = 'gemini-2.5-flash-preview-04-17';
