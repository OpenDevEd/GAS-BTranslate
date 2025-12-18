
const settings = {
  Anthropic: {
    arrayAllModels: [
      "claude-opus-4-5-20251101",
      "claude-sonnet-4-5-20250929",
      "claude-haiku-4-5-20251001"
    ],
    maxTokens: { min: 0, max: 64000, step: 1 },
    maxTokensForModel: [64000, 64000, 64000],  // Updated for Opus 4.5
    temperature: { min: 0, max: 1, step: 0.1 },
    useDefaultPrompt: true,
    defaultPrompt: 'Translate from <S> to <T>. Return only translation.'
  },
  OpenAI: {
    arrayAllModels: [
      "gpt-5.2",
      "gpt-5",
      "gpt-5-mini",
      "gpt-5-nano"
    ],
    maxTokens: { min: 0, max: 128000, step: 1 },
    maxTokensForModel: [128000, 32768, 32768, 32768],
    temperature: { min: 0, max: 2, step: 0.01 },
    useDefaultPrompt: true,
    defaultPrompt: 'Translate from <S> to <T>. Return only translation.'
  }
};

const DEFAULT_OPENAI_MODEL = {
  "model": "gpt-5.2",
  "temperature": 0,
  "maxTokens": 128000,
  "customPrompt": 'Translate from <S> to <T>. Return only translation.',
  "name": "GPT-5-2",
  "useDefaultPrompt": false
};

const DEFAULT_ANTHROPIC_MODEL = {
  "model": "claude-sonnet-4-5-20250929",
  "temperature": 0,
  "maxTokens": 64000,
  "customPrompt": 'Translate from <S> to <T>. Return only translation.',
  "name": "SONNET-4-5",
  "useDefaultPrompt": false
};