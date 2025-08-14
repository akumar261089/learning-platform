import React, { useState, useEffect } from 'react';
import { BookOpen, Target, Clock, TrendingUp, Calendar, Award } from 'lucide-react';
import { storageService } from '../services/storage';
import { StudyStats } from './StudyStats';
import { LearningGoals } from './LearningGoals';

export const Dashboard: React.FC = () => {
  const [overallStats, setOverallStats] = useState({
    totalCourses: 0,
    completedTopics: 0,
    totalTopics: 0,
    studyStreak: 0,
    totalStudyTime: 0
  });

  useEffect(() => {
    loadOverallStats();
  }, []);

  const loadOverallStats = () => {
    const progress = storageService.getProgress();
    const studyStats = storageService.getStudyStats();
    
    // Get unique courses
    const uniqueCourses = new Set(progress.map(p => p.courseId));
    
    const completedTopics = progress.filter(p => p.completed).length;
    const totalTopics = progress.length;

    setOverallStats({
      totalCourses: uniqueCourses.size,
      completedTopics,
      totalTopics,
      studyStreak: studyStats.streakDays,
      totalStudyTime: studyStats.totalStudyTime
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getProgressPercentage = () => {
    if (overallStats.totalTopics === 0) return 0;
    return Math.round((overallStats.completedTopics / overallStats.totalTopics) * 100);
  };

  const getMotivationalMessage = () => {
    const percentage = getProgressPercentage();
    
    if (percentage === 0) {
      return "Ready to start your learning journey? 🚀";
    } else if (percentage < 25) {
      return "Great start! Keep building momentum! 💪";
    } else if (percentage < 50) {
      return "You're making excellent progress! 🌟";
    } else if (percentage < 75) {
      return "More than halfway there! Amazing work! 🔥";
    } else if (percentage < 100) {
      return "Almost there! You're doing fantastic! 🎯";
    } else {
      return "Congratulations! You're a learning champion! 🏆";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Dashboard</h1>
        <p className="text-gray-600">{getMotivationalMessage()}</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Active Courses</p>
              <p className="text-3xl font-bold">{overallStats.totalCourses}</p>
            </div>
            <BookOpen className="h-10 w-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Completed Topics</p>
              <p className="text-3xl font-bold">{overallStats.completedTopics}</p>
              <p className="text-green-100 text-xs">of {overallStats.totalTopics}</p>
            </div>
            <Target className="h-10 w-10 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Study Time</p>
              <p className="text-3xl font-bold">{formatTime(overallStats.totalStudyTime)}</p>
            </div>
            <Clock className="h-10 w-10 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Study Streak</p>
              <p className="text-3xl font-bold">{overallStats.studyStreak}</p>
              <p className="text-orange-100 text-xs">days</p>
            </div>
            <Award className="h-10 w-10 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
            Overall Progress
          </h2>
          <span className="text-2xl font-bold text-blue-600">{getProgressPercentage()}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-sm text-gray-600">
          <span>{overallStats.completedTopics} completed</span>
          <span>{overallStats.totalTopics - overallStats.completedTopics} remaining</span>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <StudyStats />
        <LearningGoals />
      </div>

      {/* Quick Tips */}
      <div className="mt-8 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-indigo-900 mb-3 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Learning Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-indigo-800">
          <div className="flex items-start">
            <span className="text-indigo-500 mr-2">•</span>
            <span>Use the Pomodoro Technique: 25 minutes focused study + 5 minute breaks</span>
          </div>
          <div className="flex items-start">
            <span className="text-indigo-500 mr-2">•</span>
            <span>Take notes and write key takeaways for better retention</span>
          </div>
          <div className="flex items-start">
            <span className="text-indigo-500 mr-2">•</span>
            <span>Set daily learning goals to maintain consistency</span>
          </div>
          <div className="flex items-start">
            <span className="text-indigo-500 mr-2">•</span>
            <span>Review completed topics regularly to reinforce learning</span>
          </div>
        </div>
      </div>
    </div>
  );
};