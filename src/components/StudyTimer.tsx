import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Coffee, Brain, Clock } from 'lucide-react';
import { storageService } from '../services/storage';
import { StudySession } from '../types';

interface StudyTimerProps {
  courseId: string;
  day: number;
  hour: number;
  onSessionComplete?: (focusTime: number) => void;
}

export const StudyTimer: React.FC<StudyTimerProps> = ({
  courseId,
  day,
  hour,
  onSessionComplete
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [focusTime, setFocusTime] = useState(0);
  const [breaks, setBreaks] = useState(0);
  const [sessionType, setSessionType] = useState<'focus' | 'break'>('focus');
  const [pomodoroCount, setPomodoroCount] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const sessionStartRef = useRef<number>(0);
  const focusStartRef = useRef<number>(0);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
        if (sessionType === 'focus') {
          setFocusTime(prev => prev + 1);
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, sessionType]);

  const startSession = () => {
    if (!isRunning) {
      sessionStartRef.current = Date.now();
      focusStartRef.current = Date.now();
    }
    setIsRunning(true);
    setIsPaused(false);
  };

  const pauseSession = () => {
    setIsPaused(true);
  };

  const stopSession = () => {
    if (isRunning && focusTime > 0) {
      const session: StudySession = {
        courseId,
        day,
        hour,
        startTime: sessionStartRef.current,
        endTime: Date.now(),
        focusTime,
        breaks
      };
      
      storageService.saveStudySession(session);
      onSessionComplete?.(focusTime);
    }
    
    resetTimer();
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeElapsed(0);
    setFocusTime(0);
    setBreaks(0);
    setSessionType('focus');
    setPomodoroCount(0);
  };

  const takeBreak = () => {
    if (sessionType === 'focus') {
      setSessionType('break');
      setBreaks(prev => prev + 1);
      setPomodoroCount(prev => prev + 1);
    } else {
      setSessionType('focus');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionColor = () => {
    return sessionType === 'focus' ? 'bg-blue-500' : 'bg-green-500';
  };

  const getSessionIcon = () => {
    return sessionType === 'focus' ? <Brain className="h-4 w-4" /> : <Coffee className="h-4 w-4" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Clock className="h-5 w-5 mr-2 text-blue-600" />
          Study Timer
        </h3>
        <div className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getSessionColor()}`}>
          <div className="flex items-center">
            {getSessionIcon()}
            <span className="ml-1 capitalize">{sessionType}</span>
          </div>
        </div>
      </div>

      <div className="text-center mb-6">
        <div className="text-4xl font-mono font-bold text-gray-800 mb-2">
          {formatTime(timeElapsed)}
        </div>
        <div className="text-sm text-gray-600">
          Focus Time: {formatTime(focusTime)} | Breaks: {breaks} | Pomodoros: {pomodoroCount}
        </div>
      </div>

      <div className="flex justify-center space-x-3 mb-4">
        {!isRunning ? (
          <button
            onClick={startSession}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            <Play className="h-4 w-4 mr-2" />
            Start
          </button>
        ) : (
          <>
            {isPaused ? (
              <button
                onClick={startSession}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                <Play className="h-4 w-4 mr-2" />
                Resume
              </button>
            ) : (
              <button
                onClick={pauseSession}
                className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200"
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </button>
            )}
            <button
              onClick={stopSession}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop
            </button>
          </>
        )}
        
        {isRunning && (
          <button
            onClick={takeBreak}
            className={`inline-flex items-center px-4 py-2 rounded-lg text-white transition-colors duration-200 ${
              sessionType === 'focus' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {sessionType === 'focus' ? (
              <>
                <Coffee className="h-4 w-4 mr-2" />
                Take Break
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Back to Focus
              </>
            )}
          </button>
        )}
      </div>

      <div className="text-xs text-gray-500 text-center">
        Use the Pomodoro Technique: 25min focus + 5min break cycles
      </div>
    </div>
  );
};