import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../ui/button';
import Input from '../ui/input';
import Label from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { getCourseFilters } from '../../services/courseService';
import { 
  setFilters, 
  clearFilters, 
  selectCoursesFilters 
} from '../../store/slices/courseSlice';

const CourseFilters = ({ onFiltersChange, onReset, onSearch, showAdvancedFilters = true }) => {
  const dispatch = useDispatch();
  const currentFilters = useSelector(selectCoursesFilters);
  
  const [searchTerm, setSearchTerm] = useState(currentFilters.searchTerm || '');
  const [localFilters, setLocalFilters] = useState({
    grade: currentFilters.grade || 'all',
    term: currentFilters.term || 'all',
    subject: currentFilters.subject || 'all',
    priceRange: currentFilters.priceRange || 'all'
  });

  const courseFilters = getCourseFilters();

  useEffect(() => {
    // Sync local state with Redux state
    setLocalFilters({
      grade: currentFilters.grade || 'all',
      term: currentFilters.term || 'all',
      subject: currentFilters.subject || 'all',
      priceRange: currentFilters.priceRange || 'all'
    });
    setSearchTerm(currentFilters.searchTerm || '');
  }, [currentFilters]);

  const handleFilterChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
    
    // Convert "all" to empty string for Redux store
    const reduxFilters = { ...newFilters };
    if (value === 'all') {
      reduxFilters[field] = '';
    }
    
    // Update Redux state
    dispatch(setFilters(reduxFilters));
    
    // Notify parent component
    if (onFiltersChange) {
      onFiltersChange(reduxFilters);
    }
  };

  const handleSearch = () => {
    const newFilters = { ...localFilters, searchTerm };
    dispatch(setFilters(newFilters));
    
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  const handleReset = () => {
    setLocalFilters({
      grade: 'all',
      term: 'all',
      subject: 'all',
      priceRange: 'all'
    });
    setSearchTerm('');
    
    // Clear Redux filters
    dispatch(clearFilters());
    
    if (onReset) {
      onReset();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const hasActiveFilters = Object.values(localFilters).some(value => value !== 'all') || searchTerm !== '';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Filter Courses</CardTitle>
        <p className="text-sm text-gray-600">Find the courses that match your criteria</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="search" className="sr-only">Search courses</Label>
            <Input
              id="search"
              placeholder="Search by title, description, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full"
            />
          </div>
          <Button onClick={handleSearch} type="button">
            Search
          </Button>
        </div>

        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Grade Filter */}
            <div className="space-y-2">
              <Label htmlFor="grade-filter">Grade</Label>
              <Select value={localFilters.grade} onValueChange={(value) => handleFilterChange('grade', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Grades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {courseFilters.grades.map((grade) => (
                    <SelectItem key={grade.value} value={grade.value}>
                      {grade.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Term Filter */}
            <div className="space-y-2">
              <Label htmlFor="term-filter">Term</Label>
              <Select value={localFilters.term} onValueChange={(value) => handleFilterChange('term', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Terms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Terms</SelectItem>
                  {courseFilters.terms.map((term) => (
                    <SelectItem key={term.value} value={term.value}>
                      {term.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject Filter */}
            <div className="space-y-2">
              <Label htmlFor="subject-filter">المادة</Label>
              <Select value={localFilters.subject} onValueChange={(value) => handleFilterChange('subject', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع المواد" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المواد</SelectItem>
                  {courseFilters.subjects.map((subject) => (
                    <SelectItem key={subject.value} value={subject.value}>
                      {subject.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-2">
              <Label htmlFor="price-filter">Price Range</Label>
              <Select value={localFilters.priceRange} onValueChange={(value) => handleFilterChange('priceRange', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Prices" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="0-50">$0 - $50</SelectItem>
                  <SelectItem value="50-100">$50 - $100</SelectItem>
                  <SelectItem value="100-200">$100 - $200</SelectItem>
                  <SelectItem value="200+">$200+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
            <span className="text-sm text-gray-600">Active filters:</span>
            
            {localFilters.grade && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Grade: {localFilters.grade}
                <button
                  onClick={() => handleFilterChange('grade', '')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            
            {localFilters.term && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Term: {localFilters.term}
                <button
                  onClick={() => handleFilterChange('term', '')}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            
            {localFilters.subject && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Subject: {localFilters.subject}
                <button
                  onClick={() => handleFilterChange('subject', '')}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}
            
            {localFilters.priceRange && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Price: {localFilters.priceRange}
                <button
                  onClick={() => handleFilterChange('priceRange', '')}
                  className="ml-1 text-yellow-600 hover:text-yellow-800"
                >
                  ×
                </button>
              </span>
            )}
            
            {searchTerm && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-1 text-gray-600 hover:text-gray-800"
                >
                  ×
                </button>
              </span>
            )}
            
            <Button onClick={handleReset} variant="outline" size="sm" className="ml-2">
              Clear All
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseFilters;
