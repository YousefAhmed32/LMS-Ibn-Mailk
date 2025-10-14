import React from 'react';
import Button from '../ui/button';
import Badge from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BookOpen, GraduationCap, BarChart3, Clock, DollarSign, Edit, Trash2, Eye, Video, Play } from 'lucide-react';
import { formatCurrency, formatDate } from '../../services/adminService';

const CourseCard = ({ course, onEdit, onDelete, onView }) => {
  const videoCount = course.videos?.length || 0;
  const totalDuration = course.videos?.reduce((total, video) => total + (video.duration || 0), 0) || 0;

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 overflow-hidden">
      {/* Course Image */}
      <div className="h-48 bg-gray-100 relative overflow-hidden">
        {course.imageUrl ? (
          <img 
            src={course.imageUrl} 
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <BookOpen className="h-16 w-16 text-blue-400" />
          </div>
        )}
        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            course.isActive !== false
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {course.isActive !== false ? 'نشط' : 'غير نشط'}
          </span>
        </div>
        
        {/* Video Count Badge */}
        {videoCount > 0 && (
          <div className="absolute bottom-2 left-2">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center gap-1">
              <Video className="h-3 w-3" />
              {videoCount} {videoCount === 1 ? 'فيديو' : 'فيديوهات'}
            </span>
          </div>
        )}
      </div>
      
      {/* Course Info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
          {course.title}
        </h3>
        
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
            <span>{course.subject}</span>
          </div>
          
          <div className="flex items-center">
            <GraduationCap className="h-4 w-4 mr-2 text-green-500" />
            <span>الصف {course.grade}</span>
          </div>
          
          <div className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2 text-purple-500" />
            <span>
              {course.level === 'beginner' ? 'مبتدئ' : 
               course.level === 'intermediate' ? 'متوسط' : 
               course.level === 'advanced' ? 'متقدم' : 'مبتدئ'}
            </span>
          </div>
          
          {/* Video Information */}
          {videoCount > 0 && (
            <div className="flex items-center">
              <Video className="h-4 w-4 mr-2 text-blue-500" />
              <span className="flex items-center gap-2">
                <span>{videoCount} {videoCount === 1 ? 'درس' : 'دروس'}</span>
                {totalDuration > 0 && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {totalDuration} دقيقة
                    </span>
                  </>
                )}
              </span>
            </div>
          )}
          
          {course.duration > 0 && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-orange-500" />
              <span>{course.duration} دقيقة</span>
            </div>
          )}
          
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-2 text-green-500" />
            <span className="font-semibold text-green-600">
              {formatCurrency(course.price)}
            </span>
          </div>
        </div>
        
        {course.description && (
          <p className="text-gray-500 text-sm mt-3 line-clamp-2">
            {course.description}
          </p>
        )}
        
        {/* Video Preview (if available) */}
        {videoCount > 0 && (
          <div className="mt-3 p-2 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-600 mb-2">أحدث الدروس:</div>
            <div className="space-y-1">
              {course.videos.slice(0, 2).map((video, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-medium">
                    {index + 1}
                  </div>
                  <span className="text-gray-700 truncate flex-1">
                    {video.title || `درس ${index + 1}`}
                  </span>
                  {video.duration && (
                    <span className="text-gray-500 text-xs">
                      {video.duration}m
                    </span>
                  )}
                </div>
              ))}
              {videoCount > 2 && (
                <div className="text-xs text-gray-500 text-center pt-1">
                  +{videoCount - 2} المزيد
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
          {onView && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onView(course)}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-1" />
              عرض
            </Button>
          )}
          {onEdit && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(course)}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-1" />
              تعديل
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(course._id)}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              حذف
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
