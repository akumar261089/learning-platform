export interface Course {
  id: string;
  name: string;
  description: string;
  path: string;
}

export interface Topic {
  hour: number;
  topic: string;
}

export interface DaySchedule {
  day: number;
  title: string;
  topics: Topic[];
}

export interface CourseContent {
  course_id: string;
  course_name: string;
  description: string;
  duration_days: number;
  schedule: DaySchedule[];
}

export interface TopicProgress {
  courseId: string;
  day: number;
  hour: number;
  completed: boolean;
  prompt?: string;
  response?: string;
  timestamp?: number;
  studyNotes?: string;
  keyTakeaways?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  timeSpent?: number;
  reviewCount?: number;
  lastReviewed?: number;
  masteryLevel?: number; // 0-100
}

export interface LLMSettings {
  provider: 'ollama' | 'openai' | 'gemini';
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

export interface LLMResponse {
  response: string;
  error?: string;
}

export interface StudySession {
  courseId: string;
  day: number;
  hour: number;
  startTime: number;
  endTime?: number;
  focusTime: number;
  breaks: number;
}

export interface LearningGoal {
  id: string;
  courseId: string;
  title: string;
  description: string;
  targetDate: string;
  completed: boolean;
  createdAt: number;
}