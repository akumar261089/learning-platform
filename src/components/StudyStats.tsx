import React, { useState, useEffect } from 'react';
import { BarChart3, Clock, Target, Flame, TrendingUp, Calendar } from 'lucide-react';
import { storageService } from '../services/storage';

interface StudyStatsProps {
  courseId?: string;
}

export const StudyStats: React.FC<StudyStatsProps> = ({ courseId }) => {
  const [stats, setStats] = useState({
    totalStudyTime: 0,
    sessionsCount: 0,
    averageSessionTime: 0,
    streakDays: 0
  });
  const [weeklyData, setWeeklyData] = useState<number[]>([]);

  useEffect(() => {
    loadStats();
  }, [courseId]);

  const loadStats = () => {
    const studyStats = storageService.getStudyStats(courseId);
    setStats(studyStats);
    
    // Generate weekly data (last 7 days)
    const sessions = storageService.getStudySessions();
    const filteredSessions = courseId 
      ? sessions.filter(s => s.courseId === courseId)
      : sessions;
    
    const weekData = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dayStart = date.getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      
      const dayStudyTime = filteredSessions
        .filter(s => s.startTime >= dayStart && s.startTime < dayEnd)
        .reduce((sum, s) => sum + s.focusTime, 0);
      
      weekData.push(Math.round(dayStudyTime / 60)); // Convert to minutes
    }
    
    setWeeklyData(weekData);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getWeekDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekDays = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      weekDays.push(days[date.getDay()]);
    }
    
    return weekDays;
  };

  const maxWeeklyTime = Math.max(...weeklyData, 1);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Study Statistics</h3>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Time</p>
              <p className="text-2xl font-bold text-blue-900">
                {formatTime(stats.totalStudyTime)}
              </p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Sessions</p>
              <p className="text-2xl font-bold text-green-900">
                {stats.sessionsCount}
              </p>
            </div>
            <Target className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Avg Session</p>
              <p className="text-2xl font-bold text-purple-900">
                {formatTime(stats.averageSessionTime)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Streak</p>
              <p className="text-2xl font-bold text-orange-900">
                {stats.streakDays} days
              </p>
            </div>
            <Flame className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          Last 7 Days (minutes)
        </h4>
        <div className="flex items-end justify-between h-32 bg-gray-50 rounded-lg p-4">
          {weeklyData.map((minutes, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div
                className="bg-blue-500 rounded-t w-8 transition-all duration-300 hover:bg-blue-600"
                style={{
                  height: `${Math.max((minutes / maxWeeklyTime) * 80, minutes > 0 ? 4 : 0)}px`
                }}
                title={`${minutes} minutes`}
              ></div>
              <div className="text-xs text-gray-600 mt-2">
                {getWeekDays()[index]}
              </div>
              <div className="text-xs text-gray-500">
                {minutes}m
              </div>
            </div>
          ))}
        </div>
      </div>

      {stats.totalStudyTime === 0 && (
        <div className="text-center py-4 text-gray-500">
          <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Start studying to see your statistics</p>
        </div>
      )}
    </div>
  );
};