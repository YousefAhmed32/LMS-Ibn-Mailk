import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Button from "../ui/button";
import Badge from "../ui/badge";
import { Play, Clock, Users, Star } from "lucide-react";
import { formatCourseDuration, formatCoursePrice } from "../../services/courseService";

const CourseCard = ({ 
  course, 
  onView, 
  onEdit, 
  onDelete, 
  onDeactivate, 
  isCreator = false,
  showActions = true 
}) => {
  const navigate = useNavigate();
  
  const {
    _id,
    title,
    description,
    grade,
    term,
    subject,
    price,
    videos,
    totalEnrollments,
    averageRating,
    totalRatings,
    isActive,
    createdBy
  } = course;

  const totalDuration = videos?.reduce((total, video) => total + (video.duration || 0), 0) || 0;
  const videoCount = videos?.length || 0;

  const handleViewCourse = () => {
    navigate(`/courses/${_id}`);
  };

  return (
    <Card className={`w-full transition-all duration-200 hover:shadow-lg cursor-pointer ${!isActive ? 'opacity-75' : ''}`} onClick={handleViewCourse}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {title}
            </CardTitle>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="secondary" className="text-xs">
                {grade}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {term}
              </Badge>
              <Badge variant="default" className="text-xs bg-blue-100 text-blue-800">
                {subject}
              </Badge>
              {!isActive && (
                <Badge variant="destructive" className="text-xs">
                  Inactive
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right ml-4">
            <div className="text-2xl font-bold text-green-600">
              {formatCoursePrice(price)}
            </div>
            <div className="text-sm text-gray-500">
              {videoCount} {videoCount === 1 ? 'lesson' : 'lessons'}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {description}
        </p>

        {/* Video Preview Section */}
        {videoCount > 0 && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Play className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Course Content</span>
            </div>
            <div className="space-y-2">
              {videos.slice(0, 3).map((video, index) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 truncate">{video.title || `Lesson ${index + 1}`}</p>
                  </div>
                  {video.duration && (
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">{video.duration}m</span>
                    </div>
                  )}
                </div>
              ))}
              {videoCount > 3 && (
                <div className="text-xs text-gray-500 text-center pt-1">
                  +{videoCount - 3} more lessons
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">{formatCourseDuration(totalDuration)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">{totalEnrollments || 0} students</span>
          </div>
        </div>

        {averageRating > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {averageRating.toFixed(1)} ({totalRatings} reviews)
            </span>
          </div>
        )}

        {createdBy && (
          <div className="text-xs text-gray-500 mb-4">
            Created by: {createdBy.firstName} {createdBy.secondName}
          </div>
        )}

        {showActions && (
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleViewCourse}
              className="flex-1"
            >
              View Course
            </Button>
            
            {isCreator && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onEdit(_id)}
                  className="flex-1"
                >
                  Edit
                </Button>
                {isActive ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onDeactivate(_id)}
                    className="text-orange-600 border-orange-200 hover:bg-orange-50"
                  >
                    Deactivate
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onEdit(_id)}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    Reactivate
                  </Button>
                )}
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => onDelete(_id)}
                  className="px-3"
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseCard;
