import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Playlist from './Playlist';
import ExamPage from '../../pages/ExamPage';

const PlaylistDemo = () => {
  // Sample playlist data
  const [playlist] = useState([
    {
      id: 1,
      type: "video",
      title: "Introduction to JavaScript",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      duration: 15,
      description: "Learn the basics of JavaScript programming language"
    },
    {
      id: 2,
      type: "video",
      title: "Variables and Data Types",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      duration: 20,
      description: "Understanding different data types in JavaScript"
    },
    {
      id: 3,
      type: "exam",
      title: "JavaScript Fundamentals Quiz",
      examId: "exam_123",
      description: "Test your knowledge of JavaScript basics"
    },
    {
      id: 4,
      type: "video",
      title: "Functions and Scope",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      duration: 25,
      description: "Learn about functions and variable scope"
    },
    {
      id: 5,
      type: "exam",
      title: "Advanced JavaScript Exam",
      examId: "exam_456",
      description: "Comprehensive exam covering advanced JavaScript concepts"
    }
  ]);

  const [videoProgress, setVideoProgress] = useState({});

  // Handle video progress updates
  const handleVideoProgress = (videoId, progressData) => {
    setVideoProgress(prev => ({
      ...prev,
      [videoId]: progressData
    }));
    console.log('Video progress updated:', videoId, progressData);
  };

  // Handle exam start
  const handleExamStart = (examItem) => {
    console.log('Exam started:', examItem);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Course Playlist Demo
          </h1>
          
          <Routes>
            <Route 
              path="/" 
              element={
                <Playlist
                  playlist={playlist}
                  courseId="course_123"
                  onVideoProgress={handleVideoProgress}
                  onExamStart={handleExamStart}
                />
              } 
            />
            <Route path="/exam/:examId" element={<ExamPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default PlaylistDemo;
