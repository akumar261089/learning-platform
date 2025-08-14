import { TopicProgress, LLMSettings, StudySession, LearningGoal } from '../types';

class StorageService {
  private readonly PROGRESS_KEY = 'learning_progress';
  private readonly LLM_SETTINGS_KEY = 'llm_settings';
  private readonly STUDY_SESSIONS_KEY = 'study_sessions';
  private readonly LEARNING_GOALS_KEY = 'learning_goals';

  getProgress(): TopicProgress[] {
    const stored = localStorage.getItem(this.PROGRESS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  saveProgress(progress: TopicProgress[]): void {
    localStorage.setItem(this.PROGRESS_KEY, JSON.stringify(progress));
  }

  updateTopicProgress(courseId: string, day: number, hour: number, updates: Partial<TopicProgress>): void {
    const progress = this.getProgress();
    const existingIndex = progress.findIndex(
      p => p.courseId === courseId && p.day === day && p.hour === hour
    );

    const updatedItem: TopicProgress = {
      courseId,
      day,
      hour,
      completed: false,
      timestamp: Date.now(),
      ...updates
    };

    if (existingIndex >= 0) {
      progress[existingIndex] = { ...progress[existingIndex], ...updatedItem };
    } else {
      progress.push(updatedItem);
    }

    this.saveProgress(progress);
  }

  getTopicProgress(courseId: string, day: number, hour: number): TopicProgress | undefined {
    const progress = this.getProgress();
    return progress.find(p => p.courseId === courseId && p.day === day && p.hour === hour);
  }

  getCourseProgress(courseId: string): TopicProgress[] {
    const progress = this.getProgress();
    return progress.filter(p => p.courseId === courseId);
  }

  getLLMSettings(): LLMSettings {
    const stored = localStorage.getItem(this.LLM_SETTINGS_KEY);
    return stored ? JSON.parse(stored) : {
      provider: 'ollama',
      baseUrl: 'http://localhost:11434',
      model: 'llama2'
    };
  }

  saveLLMSettings(settings: LLMSettings): void {
    localStorage.setItem(this.LLM_SETTINGS_KEY, JSON.stringify(settings));
  }

  exportData(): string {
    const data = {
      progress: this.getProgress(),
      llmSettings: this.getLLMSettings(),
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      if (data.progress) {
        this.saveProgress(data.progress);
      }
      if (data.llmSettings) {
        this.saveLLMSettings(data.llmSettings);
      }
    } catch (error) {
      throw new Error('Invalid import data format');
    }
  }

  clearAllData(): void {
    localStorage.removeItem(this.PROGRESS_KEY);
    localStorage.removeItem(this.LLM_SETTINGS_KEY);
    localStorage.removeItem(this.STUDY_SESSIONS_KEY);
    localStorage.removeItem(this.LEARNING_GOALS_KEY);
  }

  // Study Sessions
  getStudySessions(): StudySession[] {
    const stored = localStorage.getItem(this.STUDY_SESSIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  saveStudySession(session: StudySession): void {
    const sessions = this.getStudySessions();
    sessions.push(session);
    localStorage.setItem(this.STUDY_SESSIONS_KEY, JSON.stringify(sessions));
  }

  // Learning Goals
  getLearningGoals(): LearningGoal[] {
    const stored = localStorage.getItem(this.LEARNING_GOALS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  saveLearningGoal(goal: LearningGoal): void {
    const goals = this.getLearningGoals();
    const existingIndex = goals.findIndex(g => g.id === goal.id);
    
    if (existingIndex >= 0) {
      goals[existingIndex] = goal;
    } else {
      goals.push(goal);
    }
    
    localStorage.setItem(this.LEARNING_GOALS_KEY, JSON.stringify(goals));
  }

  deleteLearningGoal(goalId: string): void {
    const goals = this.getLearningGoals();
    const filtered = goals.filter(g => g.id !== goalId);
    localStorage.setItem(this.LEARNING_GOALS_KEY, JSON.stringify(filtered));
  }

  // Analytics
  getStudyStats(courseId?: string): {
    totalStudyTime: number;
    sessionsCount: number;
    averageSessionTime: number;
    streakDays: number;
  } {
    const sessions = this.getStudySessions();
    const filteredSessions = courseId 
      ? sessions.filter(s => s.courseId === courseId)
      : sessions;

    const totalStudyTime = filteredSessions.reduce((sum, s) => sum + s.focusTime, 0);
    const sessionsCount = filteredSessions.length;
    const averageSessionTime = sessionsCount > 0 ? totalStudyTime / sessionsCount : 0;

    // Calculate streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let streakDays = 0;
    let currentDate = new Date(today);

    while (true) {
      const dayStart = currentDate.getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      
      const hasSessionThisDay = filteredSessions.some(s => 
        s.startTime >= dayStart && s.startTime < dayEnd
      );
      
      if (hasSessionThisDay) {
        streakDays++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      totalStudyTime,
      sessionsCount,
      averageSessionTime,
      streakDays
    };
  }
}

export const storageService = new StorageService();