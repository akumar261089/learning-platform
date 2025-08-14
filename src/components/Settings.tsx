import React, { useState, useEffect } from 'react';
import { Save, TestTube, AlertCircle, CheckCircle } from 'lucide-react';
import { llmService } from '../services/llm';
import { storageService } from '../services/storage';
import { LLMSettings } from '../types';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<LLMSettings>({
    provider: 'ollama',
    baseUrl: 'http://localhost:11434',
    model: 'llama2'
  });
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const currentSettings = storageService.getLLMSettings();
    setSettings(currentSettings);
  }, []);

  const handleSave = () => {
    llmService.updateSettings(settings);
    storageService.saveLLMSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const result = await llmService.generateResponse("Hello! This is a test. Please respond with a simple confirmation that you're working.");
      
      if (result.error) {
        setTestResult(`Error: ${result.error}`);
      } else {
        setTestResult(`Success: ${result.response.substring(0, 100)}...`);
      }
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">LLM Settings</h1>
        
        <div className="space-y-6">
          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LLM Provider
            </label>
            <select
              value={settings.provider}
              onChange={(e) => setSettings({ ...settings, provider: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ollama">Ollama (Local)</option>
              <option value="openai">OpenAI</option>
              <option value="gemini">Google Gemini</option>
            </select>
          </div>

          {/* Ollama Settings */}
          {settings.provider === 'ollama' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base URL
                </label>
                <input
                  type="text"
                  value={settings.baseUrl || ''}
                  onChange={(e) => setSettings({ ...settings, baseUrl: e.target.value })}
                  placeholder="http://localhost:11434"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Default Ollama server URL. Make sure Ollama is running locally.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model Name
                </label>
                <input
                  type="text"
                  value={settings.model || ''}
                  onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                  placeholder="llama2, codellama, mistral, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          {/* OpenAI Settings */}
          {settings.provider === 'openai' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={settings.apiKey || ''}
                  onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model
                </label>
                <select
                  value={settings.model || 'gpt-3.5-turbo'}
                  onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-4-turbo-preview">GPT-4 Turbo</option>
                </select>
              </div>
            </>
          )}

          {/* Gemini Settings */}
          {settings.provider === 'gemini' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={settings.apiKey || ''}
                onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                placeholder="Your Gemini API key"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Test Connection */}
          <div className="border-t pt-6">
            <button
              onClick={handleTest}
              disabled={testing}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed mr-4"
            >
              <TestTube className="h-4 w-4 mr-2" />
              {testing ? 'Testing...' : 'Test Connection'}
            </button>
            
            <button
              onClick={handleSave}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {saved ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saved ? 'Saved!' : 'Save Settings'}
            </button>
          </div>

          {/* Test Result */}
          {testResult && (
            <div className={`p-4 rounded-md ${
              testResult.startsWith('Error') 
                ? 'bg-red-50 border border-red-200' 
                : 'bg-green-50 border border-green-200'
            }`}>
              <div className="flex">
                {testResult.startsWith('Error') ? (
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" />
                )}
                <p className={`text-sm ${
                  testResult.startsWith('Error') ? 'text-red-700' : 'text-green-700'
                }`}>
                  {testResult}
                </p>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="font-medium text-blue-900 mb-2">Setup Instructions:</h3>
            <div className="text-sm text-blue-800 space-y-1">
              {settings.provider === 'ollama' && (
                <>
                  <p>1. Install Ollama from <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="underline">ollama.ai</a></p>
                  <p>2. Run: <code className="bg-blue-100 px-1 rounded">ollama pull llama2</code></p>
                  <p>3. Start the server: <code className="bg-blue-100 px-1 rounded">ollama serve</code></p>
                </>
              )}
              {settings.provider === 'openai' && (
                <p>Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">OpenAI Platform</a></p>
              )}
              {settings.provider === 'gemini' && (
                <p>Get your API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a></p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};