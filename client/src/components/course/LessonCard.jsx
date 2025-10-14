import React from 'react';
import { motion } from 'framer-motion';
import { Play, CheckCircle, Clock, Lock, Trophy, FileText } from 'lucide-react';
import Button from '../ui/button';
import Badge from '../ui/badge';

const LessonCard = ({ lesson, isSelected, onSelect, index }) => {
  const formatDuration = (minutes) => {
    if (!minutes) return '0 min';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const isCompleted = lesson.progress?.isCompleted || false;
  const hasQuiz = lesson.quiz && lesson.quiz.questions && lesson.quiz.questions.length > 0;
  const quizCompleted = lesson.quizResult && lesson.quizResult.completedAt;
  const quizPassed = lesson.quizResult?.passed || false;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg' 
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md'
      }`}
      onClick={onSelect}
    >
      {/* Progress Bar */}
      {lesson.progress && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
          <div 
            className={`h-full transition-all duration-300 ${getProgressColor(lesson.progress.watchPercentage)}`}
            style={{ width: `${lesson.progress.watchPercentage}%` }}
          />
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              isCompleted 
                ? 'bg-green-500 text-white' 
                : isSelected 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}>
              {isCompleted ? <CheckCircle className="w-4 h-4" /> : index}
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold text-sm leading-tight ${
                isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'
              }`}>
                {lesson.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="w-3 h-3" />
                  {formatDuration(lesson.duration)}
                </div>
                {hasQuiz && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <FileText className="w-3 h-3" />
                    Quiz
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex flex-col gap-1">
            {isCompleted && (
              <Badge variant="default" className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            )}
            {quizCompleted && (
              <Badge 
                variant={quizPassed ? "default" : "destructive"} 
                className="text-xs px-2 py-1"
              >
                <Trophy className="w-3 h-3 mr-1" />
                {quizPassed ? 'Passed' : 'Failed'}
              </Badge>
            )}
          </div>
        </div>

        {/* Progress Info */}
        {lesson.progress && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{lesson.progress.watchPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all duration-300 ${getProgressColor(lesson.progress.watchPercentage)}`}
                style={{ width: `${lesson.progress.watchPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-1">
              <span>{lesson.progress.formattedWatchedDuration}</span>
              <span>{lesson.progress.formattedTotalDuration}</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button
          variant={isSelected ? "default" : "outline"}
          size="sm"
          className={`w-full text-xs ${
            isSelected 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          <Play className="w-3 h-3 mr-2" />
          {isCompleted ? 'Review Lesson' : 'Start Lesson'}
        </Button>

        {/* Quiz Status */}
        {hasQuiz && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">Quiz Status</span>
              {quizCompleted ? (
                <div className="flex items-center gap-1">
                  <Trophy className={`w-3 h-3 ${quizPassed ? 'text-green-500' : 'text-red-500'}`} />
                  <span className={`text-xs font-medium ${quizPassed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {lesson.quizResult.score}%
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Not taken</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LessonCard;
