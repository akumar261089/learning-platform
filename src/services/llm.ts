import { LLMSettings, LLMResponse } from '../types';

class LLMService {
  private settings: LLMSettings;

  constructor() {
    this.settings = this.getSettings();
  }

  private getSettings(): LLMSettings {
    const saved = localStorage.getItem('llm_settings');
    return saved ? JSON.parse(saved) : {
      provider: 'ollama',
      baseUrl: 'http://localhost:11434',
      model: 'llama2'
    };
  }

  updateSettings(settings: LLMSettings) {
    this.settings = settings;
    localStorage.setItem('llm_settings', JSON.stringify(settings));
  }

  async generateResponse(prompt: string): Promise<LLMResponse> {
    try {
      switch (this.settings.provider) {
        case 'ollama':
          return await this.callOllama(prompt);
        case 'openai':
          return await this.callOpenAI(prompt);
        case 'gemini':
          return await this.callGemini(prompt);
        default:
          throw new Error('Unknown LLM provider');
      }
    } catch (error) {
      return {
        response: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async callOllama(prompt: string): Promise<LLMResponse> {
    if (!this.settings.baseUrl) {
      throw new Error('Ollama base URL not configured');
    }

    const response = await fetch(`${this.settings.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.settings.model || 'llama2',
        prompt: prompt,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return { response: data.response };
  }

  private async callOpenAI(prompt: string): Promise<LLMResponse> {
    if (!this.settings.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.settings.apiKey}`
      },
      body: JSON.stringify({
        model: this.settings.model || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return { response: data.choices[0].message.content };
  }

  private async callGemini(prompt: string): Promise<LLMResponse> {
    if (!this.settings.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.settings.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    return { response: data.candidates[0].content.parts[0].text };
  }

  getSettings(): LLMSettings {
    return { ...this.settings };
  }
}

export const llmService = new LLMService();