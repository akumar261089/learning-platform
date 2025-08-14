import React from 'react';
import { Course } from '../types';
import { BookOpen, Calendar, CheckCircle } from 'lucide-react';
import { storageService } from '../services/storage';

interface CourseCardProps {
  course: Course;
  onClick: () => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  const progress = storageService.getCourseProgress(course.id);
  const completedTopics = progress.filter(p => p.completed).length;
  const totalTopics = progress.length || 1; // Avoid division by zero
  const progressPercentage = Math.round((completedTopics / totalTopics) * 100);

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border border-gray-200 hover:border-blue-300"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <BookOpen className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{course.name}</h3>
          </div>
          {completedTopics > 0 && (
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
          )}
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-500 text-sm">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Course</span>
          </div>
          
          {progress.length > 0 && (
            <div className="flex items-center">
              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500">{progressPercentage}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};