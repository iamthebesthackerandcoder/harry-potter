
import { GoogleGenerativeAI, GenerateContentResponse } from "@google/generative-ai";
// Fix: Add HOGWARTS_HOUSES to the import
import { Answer, GeminiQuestionResponse, GeminiHouseResponse, GeminiProfileResponse, HogwartsHouse } from '../types';
import { TOTAL_QUESTIONS, GEMINI_TEXT_MODEL, HOGWARTS_HOUSES } from '../constants';

// Initialize with null, will be set in initializeGoogleAI
let ai: GoogleGenerativeAI | null = null;

export const initializeGoogleAI = (): boolean => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('No API key found. Please set VITE_GEMINI_API_KEY in your environment variables.');
      return false;
    }
    
    if (!ai) {
      try {
        ai = new GoogleGenerativeAI(apiKey);
      } catch (error) {
        console.error("Failed to initialize Google AI:", error);
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error("Error initializing Google AI:", error);
    return false;
  }
};

const parseGeminiJsonResponse = <T,>(responseText: string): T | null => {
  let jsonStr = responseText.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }

  try {
    return JSON.parse(jsonStr) as T;
  } catch (error) {
    console.error("Failed to parse JSON response:", error, "Raw response:", responseText);
    // Fallback for non-fenced, but potentially problematic JSON (e.g. just "Gryffindor" for house)
    if (typeof responseText === 'string' && !responseText.startsWith('{') && !responseText.startsWith('[')) {
        // This is a crude fallback, specific to certain expected simple string returns if JSON parsing fails.
        // For house, it might just return the string.
        if (jsonStr === "Gryffindor" || jsonStr === "Hufflepuff" || jsonStr === "Ravenclaw" || jsonStr === "Slytherin") {
             // Attempt to wrap it into the expected structure
            if (typeof ({ house: jsonStr } as GeminiHouseResponse) === 'object' && 'house' in ({ house: jsonStr } as GeminiHouseResponse)) {
                 return { house: jsonStr } as unknown as T; // Be careful with this type assertion
            }
        }
    }
    return null;
  }
};


export const generateQuestion = async (
  previousAnswers: Answer[],
  currentQuestionNumber: number
): Promise<GeminiQuestionResponse | null> => {
  if (!ai && !initializeGoogleAI()) {
    throw new Error("Failed to initialize Google Gemini AI. Please check your API key.");
  }

  const previousAnswersText = previousAnswers.length > 0 
    ? previousAnswers.map((pa, index) => `Previous Q${index+1}: ${pa.question}\nPrevious A${index+1}: ${pa.answer}`).join('\n\n')
    : "This is the first question.";

  const prompt = `
You are the Hogwarts Sorting Hat, an expert in discerning a student's true nature to sort them into one of the four Hogwarts houses: Gryffindor, Hufflepuff, Ravenclaw, or Slytherin.
You are crafting a ${TOTAL_QUESTIONS}-question quiz. This is question number ${currentQuestionNumber} of ${TOTAL_QUESTIONS}.

${previousAnswersText}

Based on any previous answers (if available), generate a new, insightful, and engaging multiple-choice question. This question should help further distinguish which Hogwarts house the student might belong to.
The question should be thought-provoking and related to scenarios, choices, or values relevant to the Hogwarts world.
Provide the question text and 3-4 distinct, plausible answer options.

Return your response ONLY as a valid JSON object with the following structure:
{
  "question": "Your generated question here?",
  "options": ["Option A", "Option B", "Option C", "Option D (if applicable)"]
}
Do not include any text outside of this JSON object.
`;

  try {
    if (!ai) throw new Error("AI instance not initialized");
    const model = ai.getGenerativeModel({ model: GEMINI_TEXT_MODEL });
    const result = await model.generateContent(prompt, {
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.8, // Slightly more creative questions
      }
    });
    const response = await result.response;
    const text = response.text();
    return parseGeminiJsonResponse<GeminiQuestionResponse>(text);
  } catch (error) {
    console.error("Error generating question:", error);
    throw error; // Re-throw to be caught by UI
  }
};

export const determineHouse = async (answers: Answer[]): Promise<GeminiHouseResponse | null> => {
  if (!ai && !initializeGoogleAI()) {
    throw new Error("Failed to initialize Google Gemini AI. Please check your API key.");
  }

  const answersText = answers.map((a, i) => `${i + 1}. Q: ${a.question}\n   A: ${a.answer}`).join('\n\n');

  const prompt = `
You are the Hogwarts Sorting Hat. You have profound wisdom and insight into character.
Based on the following ${TOTAL_QUESTIONS} questions and the student's answers, you must determine which single Hogwarts house they best fit into: Gryffindor, Hufflepuff, Ravenclaw, or Slytherin.
Analyze their choices, values, and leanings displayed in their answers.

Questions and Answers:
${answersText}

Make your final decision. Return your response ONLY as a valid JSON object with the following structure:
{
  "house": "ChosenHouseName" 
}
Replace "ChosenHouseName" with one of: "Gryffindor", "Hufflepuff", "Ravenclaw", or "Slytherin".
Do not include any text outside of this JSON object.
`;

  try {
    if (!ai) throw new Error("AI instance not initialized");
    const model = ai.getGenerativeModel({ model: GEMINI_TEXT_MODEL });
    const result = await model.generateContent(prompt, {
      generationConfig: {
        responseMimeType: "application/json"
      }
    });
    const response = await result.response;
    const text = response.text();
    const parsed = parseGeminiJsonResponse<GeminiHouseResponse>(text);
    if (parsed && parsed.house && HOGWARTS_HOUSES.includes(parsed.house as HogwartsHouse)) {
        return parsed;
    }
    console.error("Invalid house received from Gemini or parsing failed:", parsed);
    // Fallback or re-attempt logic could be added here. For now, return null or throw.
    // If Gemini returns just the house name as string, the parseGeminiJsonResponse might handle it.
    if (typeof text === 'string' && HOGWARTS_HOUSES.includes(text as HogwartsHouse)) {
      return { house: text as HogwartsHouse };
    }
    return null; 
  } catch (error) {
    console.error("Error determining house:", error);
    throw error;
  }
};

export const generateCharacterProfile = async (answers: Answer[], house: HogwartsHouse): Promise<GeminiProfileResponse | null> => {
  if (!ai && !initializeGoogleAI()) {
    throw new Error("Failed to initialize Google Gemini AI. Please check your API key.");
  }

  const answersText = answers.map((a, i) => `${i + 1}. Q: ${a.question}\n   A: ${a.answer}`).join('\n\n');

  const prompt = `
You are a wise Hogwarts professor, like Dumbledore or McGonagall, with deep insight into student personalities.
A student has just been sorted into ${house}.
Their answers to the sorting quiz were:
${answersText}

Based on their confirmed house (${house}) and their specific answers, write a unique and insightful character archetype or persona description for this student.
This description should be 1-2 paragraphs long, capturing their likely strengths, tendencies, and potential role within the Hogwarts universe.
Make it engaging, personalized, and fitting for the world of Harry Potter.

Return your response ONLY as a valid JSON object with the following structure:
{
  "profile": "Your generated character profile description here..."
}
Do not include any text outside of this JSON object.
`;

  try {
    if (!ai) throw new Error("AI instance not initialized");
    const model = ai.getGenerativeModel({ model: GEMINI_TEXT_MODEL });
    const result = await model.generateContent(prompt, {
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7
      }
    });
    const response = await result.response;
    const text = response.text();
    return parseGeminiJsonResponse<GeminiProfileResponse>(text);
  } catch (error) {
    console.error("Error generating character profile:", error);
    throw error;
  }
};