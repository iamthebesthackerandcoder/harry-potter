
export enum QuizState {
  NOT_STARTED = 'NOT_STARTED',
  LOADING_QUESTION = 'LOADING_QUESTION',
  SHOWING_QUESTION = 'SHOWING_QUESTION',
  LOADING_RESULTS = 'LOADING_RESULTS',
  SHOWING_RESULTS = 'SHOWING_RESULTS',
  ERROR = 'ERROR',
  API_KEY_MISSING = 'API_KEY_MISSING'
}

export interface Answer {
  question: string;
  answer: string;
}

export type HogwartsHouse = 'Gryffindor' | 'Hufflepuff' | 'Ravenclaw' | 'Slytherin';

export interface QuestionWithOptions {
  question: string;
  options: string[];
}

export interface GeminiQuestionResponse {
  question: string;
  options: string[];
}

export interface GeminiHouseResponse {
  house: HogwartsHouse;
}

export interface GeminiProfileResponse {
  profile: string;
}
