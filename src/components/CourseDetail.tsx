import React, { useState, useEffect } from "react";
import { Course, CourseContent, DaySchedule } from "../types";
import { courseService } from "../services/courses";
import { storageService } from "../services/storage";
import { TopicDetail } from "./TopicDetail";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface CourseDetailProps {
  course: Course;
  onBack: () => void;
}

export const CourseDetail: React.FC<CourseDetailProps> = ({
  course,
  onBack,
}) => {
  const [courseContent, setCourseContent] = useState<CourseContent | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<{
    day: number;
    hour: number;
    topic: string;
  } | null>(null);

  useEffect(() => {
    const loadCourseContent = async () => {
      try {
        setLoading(true);
        const content = await courseService.getCourseContent(course.path);
        setCourseContent(content);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load course content"
        );
      } finally {
        setLoading(false);
      }
    };

    loadCourseContent();
  }, [course.path]);

  const getTopicProgress = (day: number, hour: number) => {
    return storageService.getTopicProgress(course.id, day, hour);
  };

  const handleTopicClick = (day: number, hour: number, topic: string) => {
    setSelectedTopic({ day, hour, topic });
  };

  const handleTopicComplete = (day: number, hour: number) => {
    const progress = storageService.getCourseProgress(course.id);
    const updatedProgress = progress.map((p) =>
      p.day === day && p.hour === hour ? { ...p, completed: !p.completed } : p
    );

    if (!progress.find((p) => p.day === day && p.hour === hour)) {
      updatedProgress.push({
        courseId: course.id,
        day,
        hour,
        completed: true,
        timestamp: Date.now(),
      });
    }

    storageService.saveProgress(updatedProgress);
    // Force re-render by updating state
    setSelectedTopic((prev) => (prev ? { ...prev } : null));
  };

  if (selectedTopic && courseContent) {
    return (
      <TopicDetail
        courseId={course.id}
        courseContent={courseContent}
        day={selectedTopic.day}
        hour={selectedTopic.hour}
        topic={selectedTopic.topic}
        onBack={() => setSelectedTopic(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading course content...</p>
        </div>
      </div>
    );
  }

  if (error || !courseContent) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2">Failed to load course content</p>
          <p className="text-gray-500 text-sm">{error}</p>
          <button
            onClick={onBack}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const progress = storageService.getCourseProgress(course.id);
  const completedTopics = progress.filter((p) => p.completed).length;
  const totalTopics = courseContent.schedule.reduce(
    (sum, day) => sum + day.topics.length,
    0
  );
  const progressPercentage =
    totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4 transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </button>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {courseContent.course_name}
          </h1>
          <p className="text-gray-600 mb-4">{courseContent.description}</p>

          <div className="flex items-center space-x-6 mb-4">
            <div className="flex items-center text-gray-500">
              <Calendar className="h-5 w-5 mr-2" />
              <span>{courseContent.duration_days} days</span>
            </div>
            <div className="flex items-center text-gray-500">
              <Clock className="h-5 w-5 mr-2" />
              <span>{totalTopics} topics</span>
            </div>
          </div>

          <div className="flex items-center">
            <div className="flex-1 bg-gray-200 rounded-full h-3 mr-4">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-700">
              {progressPercentage}% complete
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {courseContent.schedule.map((day: DaySchedule) => (
          <div
            key={day.day}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Day {day.day}: {day.title}
              </h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {day.topics.map((topic) => {
                  const topicProgress = getTopicProgress(day.day, topic.hour);
                  const isCompleted = topicProgress?.completed || false;

                  return (
                    <div
                      key={topic.hour}
                      onClick={() =>
                        handleTopicClick(day.day, topic.hour, topic.topic)
                      }
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-300 group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-medium text-blue-600">
                          Hour {topic.hour}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTopicComplete(day.day, topic.hour);
                          }}
                          className="text-gray-400 hover:text-green-500 transition-colors duration-200"
                        >
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      <h3
                        className={`text-sm font-medium group-hover:text-blue-600 transition-colors duration-200 ${
                          isCompleted
                            ? "text-gray-500 line-through"
                            : "text-gray-900"
                        }`}
                      >
                        {topic.topic}
                      </h3>
                      {topicProgress?.response && (
                        <div className="mt-2 text-xs text-green-600">
                          ✓ AI Response Available
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
