import React from 'react';
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Award,
  Lock,
  PlayCircle
} from 'lucide-react';

const CourseContentSidebar = ({ 
  courseContent = [], 
  currentItemId, 
  onItemSelect,
  userProgress = {},
  className = ""
}) => {
  const getItemIcon = (item) => {
    switch (item.type) {
      case 'video':
        return <PlayCircle className="w-5 h-5" />;
      case 'exam':
        return <Award className="w-5 h-5" />;
      case 'reading':
        return <FileText className="w-5 h-5" />;
      default:
        return <Play className="w-5 h-5" />;
    }
  };

  const getItemStatus = (itemId) => {
    const progress = userProgress[itemId];
    if (progress?.completed) return 'completed';
    if (progress?.started) return 'in-progress';
    return 'not-started';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${className}`}>
      <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Course Content</h3>
        <p className="text-gray-600 text-sm">
          {courseContent.length} lessons • {courseContent.filter(item => getItemStatus(item.id) === 'completed').length} completed
        </p>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {courseContent.map((item, index) => {
          const status = getItemStatus(item.id);
          const isActive = item.id === currentItemId;
          const isLocked = item.locked && status === 'not-started';

          return (
            <div
              key={item.id}
              onClick={() => !isLocked && onItemSelect?.(item)}
              className={`
                p-4 border-b border-gray-100 cursor-pointer transition-all duration-200
                ${isActive ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'}
                ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <div className="flex items-start gap-3">
                {/* Item Number */}
                <div className={`
                  flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                  ${isActive ? 'bg-blue-500 text-white' : status === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}
                `}>
                  {isLocked ? <Lock className="w-4 h-4" /> : index + 1}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-semibold text-sm mb-1 ${isActive ? 'text-blue-700' : 'text-gray-900'}`}>
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        {getItemIcon(item)}
                        <span className="capitalize">{item.type}</span>
                        {item.duration && (
                          <>
                            <span>•</span>
                            <span>{formatDuration(item.duration)}</span>
                          </>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Status Icon */}
                    <div className="flex-shrink-0">
                      {getStatusIcon(status)}
                    </div>
                  </div>

                  {/* Progress Bar for Videos */}
                  {item.type === 'video' && userProgress[item.id]?.progress > 0 && (
                    <div className="mt-2">
                      <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                          style={{ width: `${userProgress[item.id].progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.round(userProgress[item.id].progress)}% complete
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Course Progress Summary */}
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Overall Progress</span>
          <span className="font-semibold text-gray-900">
            {Math.round((courseContent.filter(item => getItemStatus(item.id) === 'completed').length / courseContent.length) * 100)}%
          </span>
        </div>
        <div className="mt-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
            style={{ 
              width: `${(courseContent.filter(item => getItemStatus(item.id) === 'completed').length / courseContent.length) * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseContentSidebar;
