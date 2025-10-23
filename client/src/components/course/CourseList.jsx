import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import CourseCard from './CourseCard';
import CourseFilters from './CourseFilters';
import { useToast } from '../../hooks/use-toast';
import { 
  fetchAllCourses, 
  deleteCourse, 
  deactivateCourse,
  selectAllCourses,
  selectCoursesLoading,
  selectCoursesError,
  selectFilteredCourses,
  selectPaginatedCourses,
  selectCoursesPagination,
  setCurrentPage,
  clearError
} from '../../store/slices/courseSlice';

const CourseList = ({ userRole, userId, showCreateButton = false, onCreateCourse, showFilters = true, title = "All Courses" }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  
  // Redux selectors
  const courses = useSelector(selectAllCourses);
  const filteredCourses = useSelector(selectFilteredCourses);
  const paginatedCourses = useSelector(selectPaginatedCourses);
  const loading = useSelector(selectCoursesLoading);
  const error = useSelector(selectCoursesError);
  const pagination = useSelector(selectCoursesPagination);

  useEffect(() => {
    dispatch(fetchAllCourses());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      dispatch(clearError());
    }
  }, [error, toast, dispatch]);

  const handleFiltersChange = (newFilters) => {
    dispatch(fetchAllCourses(newFilters));
  };

  const handleResetFilters = () => {
    dispatch(fetchAllCourses());
  };

  const handleSearch = (searchTerm) => {
    dispatch(fetchAllCourses({ searchTerm }));
  };

  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
  };

  const handleDelete = async (courseId) => {
    try {
      await dispatch(deleteCourse(courseId)).unwrap();
      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error || "Failed to delete course",
        variant: "destructive",
      });
    }
  };

  const handleDeactivate = async (courseId) => {
    try {
      await dispatch(deactivateCourse(courseId)).unwrap();
      toast({
        title: "Success",
        description: "Course deactivated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error || "Failed to deactivate course",
        variant: "destructive",
      });
    }
  };

  if (loading && courses.length === 0) {
    return (
      <div className="space-y-4">
        {showFilters && (
          <CourseFilters
            onFiltersChange={handleFiltersChange}
            onReset={handleResetFilters}
            onSearch={handleSearch}
          />
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {showCreateButton && userRole === 'admin' && (
          <Button onClick={onCreateCourse} className="w-full sm:w-auto">
            Create New Course
          </Button>
        )}
      </div>

      {showFilters && (
        <CourseFilters
          onFiltersChange={handleFiltersChange}
          onReset={handleResetFilters}
          onSearch={handleSearch}
        />
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500 text-lg">No courses found</p>
            {userRole === 'admin' && (
              <Button onClick={onCreateCourse} className="mt-4">
                Create Your First Course
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedCourses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                onView={() => window.open(`/courses/${course._id}`, '_blank')}
                onEdit={() => window.open(`/courses/${course._id}/edit`, '_blank')}
                onEdit={() => navigate(`/admin/courses/${course?._id?.toString()}/edit`)}
                onDelete={() => handleDelete(course._id)}
                onDeactivate={() => handleDeactivate(course._id)}
                isCreator={course.createdBy?._id === userId}
                showActions={userRole === 'admin'}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                Previous
              </Button>
              
              <span className="text-sm text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CourseList;
