import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, Loader2, CheckCircle, Circle, MessageSquare, Brain, BookOpen, Lightbulb, Star } from 'lucide-react';
import { llmService } from '../services/llm';
import { storageService } from '../services/storage';
import { TopicProgress } from '../types';
import { StudyTimer } from './StudyTimer';

interface TopicDetailProps {
  courseId: string;
  day: number;
  hour: number;
  topic: string;
  onBack: () => void;
}

export const TopicDetail: React.FC<TopicDetailProps> = ({
  courseId,
  day,
  hour,
  topic,
  onBack
}) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<TopicProgress | null>(null);
  const [studyNotes, setStudyNotes] = useState('');
  const [keyTakeaways, setKeyTakeaways] = useState<string[]>(['']);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [showStudyTools, setShowStudyTools] = useState(false);

  useEffect(() => {
    const existingProgress = storageService.getTopicProgress(courseId, day, hour);
    if (existingProgress) {
      setProgress(existingProgress);
      setPrompt(existingProgress.prompt || '');
      setResponse(existingProgress.response || '');
      setStudyNotes(existingProgress.studyNotes || '');
      setKeyTakeaways(existingProgress.keyTakeaways || ['']);
      setDifficulty(existingProgress.difficulty || 'medium');
    } else {
      // Set a default prompt based on the topic
      const defaultPrompt = `Explain "${topic}" in detail. Provide practical examples and key concepts that would be useful for learning.`;
      setPrompt(defaultPrompt);
    }
  }, [courseId, day, hour]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await llmService.generateResponse(prompt);
      
      if (result.error) {
        setError(result.error);
      } else {
        setResponse(result.response);
        
        // Save to localStorage
        storageService.updateTopicProgress(courseId, day, hour, {
          prompt: prompt.trim(),
          response: result.response,
          completed: progress?.completed || false,
          studyNotes,
          keyTakeaways: keyTakeaways.filter(t => t.trim()),
          difficulty
        });
        
        // Update local state
        const updatedProgress = storageService.getTopicProgress(courseId, day, hour);
        setProgress(updatedProgress || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = () => {
    const isCompleted = !progress?.completed;
    storageService.updateTopicProgress(courseId, day, hour, {
      completed: isCompleted,
      prompt: prompt.trim(),
      response,
      studyNotes,
      keyTakeaways: keyTakeaways.filter(t => t.trim()),
      difficulty,
      masteryLevel: isCompleted ? 100 : progress?.masteryLevel || 0
    });
    
    const updatedProgress = storageService.getTopicProgress(courseId, day, hour);
    setProgress(updatedProgress || null);
  };

  const handleStudyNotesChange = (notes: string) => {
    setStudyNotes(notes);
    storageService.updateTopicProgress(courseId, day, hour, {
      studyNotes: notes,
      keyTakeaways: keyTakeaways.filter(t => t.trim()),
      difficulty,
      completed: progress?.completed || false
    });
  };

  const handleTakeawayChange = (index: number, value: string) => {
    const newTakeaways = [...keyTakeaways];
    newTakeaways[index] = value;
    setKeyTakeaways(newTakeaways);
    
    storageService.updateTopicProgress(courseId, day, hour, {
      studyNotes,
      keyTakeaways: newTakeaways.filter(t => t.trim()),
      difficulty,
      completed: progress?.completed || false
    });
  };

  const addTakeaway = () => {
    setKeyTakeaways([...keyTakeaways, '']);
  };

  const removeTakeaway = (index: number) => {
    const newTakeaways = keyTakeaways.filter((_, i) => i !== index);
    setKeyTakeaways(newTakeaways.length > 0 ? newTakeaways : ['']);
  };

  const handleSessionComplete = (focusTime: number) => {
    storageService.updateTopicProgress(courseId, day, hour, {
      timeSpent: (progress?.timeSpent || 0) + focusTime,
      lastReviewed: Date.now(),
      reviewCount: (progress?.reviewCount || 0) + 1
    });
    
    const updatedProgress = storageService.getTopicProgress(courseId, day, hour);
    setProgress(updatedProgress || null);
  };

  const llmSettings = llmService.getSettings();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4 transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Course
        </button>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{topic}</h1>
              <p className="text-gray-600">Day {day}, Hour {hour}</p>
              {progress?.timeSpent && (
                <p className="text-sm text-blue-600">
                  Study time: {Math.round(progress.timeSpent / 60)} minutes
                </p>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowStudyTools(!showStudyTools)}
                className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Study Tools
              </button>
              <button
                onClick={toggleComplete}
                className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  progress?.completed
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {progress?.completed ? (
                  <CheckCircle className="h-5 w-5 mr-2" />
                ) : (
                  <Circle className="h-5 w-5 mr-2" />
                )}
                {progress?.completed ? 'Completed' : 'Mark Complete'}
              </button>
            </div>
          </div>
          
          {progress?.timestamp && (
            <div className="text-sm text-gray-500 mb-4">
              Last updated: {new Date(progress.timestamp).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {showStudyTools && (
        <div className="mb-6">
          <StudyTimer
            courseId={courseId}
            day={day}
            hour={hour}
            onSessionComplete={handleSessionComplete}
          />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Prompt Section */}
        <div className="xl:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <MessageSquare className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Your Question</h2>
          </div>
          
          <form onSubmit={handleSubmit}>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Ask a question about this topic..."
              disabled={loading}
            />
            
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Using {llmSettings.provider} ({llmSettings.model || 'default model'})
              </div>
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Generating...' : 'Ask AI'}
              </button>
            </div>
          </form>

          {/* AI Response */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center mb-4">
              <Brain className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">AI Response</h3>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            
            {response ? (
              <div className="prose prose-sm max-w-none">
                <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-gray-800 text-sm leading-relaxed">
                  {response}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Ask a question to get AI assistance on this topic</p>
              </div>
            )}
          </div>
        </div>

        {/* Study Tools Sidebar */}
        <div className="space-y-6">
          {/* Study Notes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <BookOpen className="h-5 w-5 text-purple-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Study Notes</h3>
            </div>
            <textarea
              value={studyNotes}
              onChange={(e) => handleStudyNotesChange(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
              placeholder="Write your notes about this topic..."
            />
          </div>

          {/* Key Takeaways */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Lightbulb className="h-5 w-5 text-yellow-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Key Takeaways</h3>
              </div>
              <button
                onClick={addTakeaway}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + Add
              </button>
            </div>
            <div className="space-y-2">
              {keyTakeaways.map((takeaway, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={takeaway}
                    onChange={(e) => handleTakeawayChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
                    placeholder="Key takeaway..."
                  />
                  {keyTakeaways.length > 1 && (
                    <button
                      onClick={() => removeTakeaway(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Difficulty Rating */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Star className="h-5 w-5 text-orange-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Difficulty</h3>
            </div>
            <div className="flex space-x-2">
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    difficulty === level
                      ? level === 'easy'
                        ? 'bg-green-100 text-green-700'
                        : level === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};