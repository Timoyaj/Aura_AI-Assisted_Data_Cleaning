
import { GoogleGenAI, Type } from "@google/genai";
import type { CsvData, Suggestion } from '../types';

const getApiKey = (): string => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable not set.");
  }
  return apiKey;
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

const suggestionSchema = {
  type: Type.OBJECT,
  properties: {
    suggestion_type: {
      type: Type.STRING,
      description: "Type of cleaning suggestion. E.g., 'STANDARDIZE_TEXT', 'FLAG_OUTLIER', 'FIX_FORMAT', 'IMPUTE_MISSING'.",
      enum: ['STANDARDIZE_TEXT', 'FLAG_OUTLIER', 'FIX_FORMAT', 'IMPUTE_MISSING', 'REMOVE_DUPLICATE'],
    },
    column_name: {
      type: Type.STRING,
      description: "The name of the column where the issue is found."
    },
    row_index: {
      type: Type.INTEGER,
      description: "The zero-based index of the specific row if the issue is in a single cell. If the suggestion applies to multiple rows (e.g. standardizing all 'N/A' to null), omit this field.",
      nullable: true
    },
    description: {
      type: Type.STRING,
      description: "A user-friendly, one-sentence description of the suggested change."
    },
    rationale: {
      type: Type.STRING,
      description: "A clear, concise explanation of why this suggestion is being made (Explainable AI)."
    },
    original_value: {
      type: Type.STRING,
      description: "The original value that needs changing. Required for STANDARDIZE_TEXT.",
      nullable: true,
    },
    suggested_value: {
      type: Type.STRING,
      description: "The proposed new value. Can be an empty string for deletions.",
      nullable: true,
    },
  },
  required: ["suggestion_type", "column_name", "description", "rationale"]
};

export const getCleaningSuggestions = async (csvData: CsvData): Promise<Suggestion[]> => {
  // Take header + first 20 rows as a sample to send to the AI
  const sampleData = [csvData.header, ...csvData.rows.slice(0, 20)];
  const csvSample = sampleData.map(row => row.join(',')).join('\n');

  const prompt = `
    You are an expert data analyst specializing in data cleaning for social science and market research survey data.
    Your goal is to identify common data quality issues and suggest corrections.
    Analyze the following CSV data sample and provide a list of cleaning suggestions.

    Focus on these common issues:
    1.  Inconsistent text responses that should be standardized (e.g., "USA", "U.S.A.", "United States" should all be "USA").
    2.  Clear data entry errors or typos.
    3.  Structural errors or formatting issues (e.g., inconsistent date formats).
    4.  Statistical outliers in numerical columns that might be errors.

    Return your findings as a JSON array of suggestion objects. Each object must conform to the provided schema.
    Only return suggestions for clear, unambiguous issues. If the data looks clean, return an empty array.

    Data Sample:
    ---
    ${csvSample}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: suggestionSchema,
        },
      },
    });
    
    const jsonString = response.text.trim();
    if (!jsonString) {
        return [];
    }
    const suggestions: Suggestion[] = JSON.parse(jsonString);
    return suggestions;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // In case of API error, return an empty array to prevent app crash
    return [];
  }
};
