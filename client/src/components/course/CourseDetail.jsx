import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import Badge from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import Input from '../ui/input';
import Label from '../ui/label';
import { useToast } from '../../hooks/use-toast';
import { 
  fetchCourseById, 
  selectCurrentCourse,
  selectCoursesLoading,
  selectCoursesError,
  clearCurrentCourse,
  clearError
} from '../../store/slices/courseSlice';
import { formatCourseDuration, formatCoursePrice } from '../../services/courseService';
import courseEnrollmentService from '../../services/courseEnrollmentService';
import { 
  Play, 
  Clock, 
  Users, 
  Star, 
  Phone, 
  Upload, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Lock,
  Unlock
} from 'lucide-react';

const CourseDetail = ({ userRole, userId, onEdit, onDelete, onDeactivate }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  
  // Local state
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [proofImage, setProofImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Redux selectors
  const course = useSelector(selectCurrentCourse);
  const loading = useSelector(selectCoursesLoading);
  const error = useSelector(selectCoursesError);

  useEffect(() => {
    if (id) {
      dispatch(fetchCourseById(id));
      checkEnrollmentStatus();
    }
    
    return () => {
      dispatch(clearCurrentCourse());
    };
  }, [id, dispatch]);

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

  // Check enrollment status
  const checkEnrollmentStatus = async () => {
    try {
      const response = await courseEnrollmentService.getEnrollmentStatus(id);
      setEnrollmentStatus(response.data);
    } catch (error) {
      console.error('Error checking enrollment status:', error);
    }
  };

  // Handle payment proof upload
  const handleProofUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      setProofImage(file);
    }
  };

  // Submit payment proof
  const handleSubmitProof = async () => {
    if (!proofImage) {
      toast({
        title: "Error",
        description: "Please select a payment proof image",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      const response = await courseEnrollmentService.uploadPaymentProof(id, proofImage);
      
      toast({
        title: "Success",
        description: response.data.message,
      });
      setIsUploadModalOpen(false);
      setProofImage(null);
      checkEnrollmentStatus(); // Refresh enrollment status
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to upload payment proof",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h2>
          <p className="text-gray-600 mb-6">The course you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/courses')}>Back to Courses</Button>
        </div>
      </div>
    );
  }

  const isCreator = course.createdBy?._id === userId;
  const canManage = userRole === 'admin' && isCreator;
  const isEnrolled = enrollmentStatus?.enrolled;
  const paymentStatus = enrollmentStatus?.enrollment?.paymentStatus;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Course Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {course.grade}
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {course.term}
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {course.subject}
              </Badge>
            </div>
            <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
            <p className="text-xl text-blue-100 mb-6">{course.description}</p>
            <div className="flex flex-wrap items-center gap-6 text-blue-100">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{formatCourseDuration(course.totalDuration)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">💰</span>
                <span>{formatCoursePrice(course.price)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>{course.totalEnrollments || 0} enrolled</span>
              </div>
            </div>
          </div>
          
          {canManage && (
            <div className="flex flex-col gap-3">
              <Button onClick={onEdit} variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                Edit Course
              </Button>
              <Button onClick={onDeactivate} variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                {course.isActive ? 'Deactivate' : 'Activate'}
              </Button>
              <Button onClick={onDelete} variant="destructive" className="bg-red-600 hover:bg-red-700">
                Delete Course
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Status Section */}
          {!isEnrolled && (
            <Card className="border-2 border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <Lock className="w-5 h-5" />
                  Course Locked - Payment Required
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-6 bg-white rounded-lg border-2 border-orange-300">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Please complete the payment via Vodafone Cash to access this course
                  </h3>
                  <div className="bg-orange-100 p-4 rounded-lg border-2 border-orange-400 mb-4">
                    <p className="text-sm text-orange-700 mb-2">Send payment to:</p>
                    <p className="text-3xl font-bold text-orange-800 tracking-wider">
                      01090385390
                    </p>
                  </div>
                  <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Payment Screenshot
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Upload Payment Proof</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="proofImage">Payment Screenshot</Label>
                          <Input
                            id="proofImage"
                            type="file"
                            accept="image/*"
                            onChange={handleProofUpload}
                            className="mt-1"
                          />
                        </div>
                        {proofImage && (
                          <div className="text-sm text-gray-600">
                            Selected: {proofImage.name}
                          </div>
                        )}
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => setIsUploadModalOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleSubmitProof}
                            disabled={!proofImage || uploading}
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            {uploading ? 'Uploading...' : 'Submit Proof'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Status Display */}
          {isEnrolled && (
            <Card className={`border-2 ${
              paymentStatus === 'approved' ? 'border-green-200 bg-green-50' :
              paymentStatus === 'rejected' ? 'border-red-200 bg-red-50' :
              'border-yellow-200 bg-yellow-50'
            }`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${
                  paymentStatus === 'approved' ? 'text-green-800' :
                  paymentStatus === 'rejected' ? 'text-red-800' :
                  'text-yellow-800'
                }`}>
                  {paymentStatus === 'approved' ? <CheckCircle className="w-5 h-5" /> :
                   paymentStatus === 'rejected' ? <XCircle className="w-5 h-5" /> :
                   <AlertCircle className="w-5 h-5" />}
                  Payment Status: {paymentStatus?.charAt(0).toUpperCase() + paymentStatus?.slice(1)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {paymentStatus === 'pending' && (
                  <p className="text-yellow-700">
                    Your payment proof has been submitted and is under review. You'll be notified once approved.
                  </p>
                )}
                {paymentStatus === 'rejected' && (
                  <p className="text-red-700">
                    Your payment proof was rejected. Please upload a new screenshot or contact support.
                  </p>
                )}
                {paymentStatus === 'approved' && (
                  <p className="text-green-700 font-medium">
                    ✅ Payment approved! You now have full access to this course.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Videos Section - Only visible after payment approval */}
          {isEnrolled && paymentStatus === 'approved' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Unlock className="w-5 h-5 text-green-600" />
                  Course Videos
                  <Badge variant="secondary" className="ml-2">
                    {course.videos?.length || 0} lessons
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {course.videos && course.videos.length > 0 ? (
                    course.videos.map((video, index) => (
                      <div key={video._id || index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-semibold text-sm">
                            {index + 1}
                          </div>
                          
                          {/* Video Thumbnail */}
                          <div className="w-20 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            {video.thumbnail ? (
                              <img 
                                src={video.thumbnail} 
                                alt={video.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <Play className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">{video.title || `Lesson ${index + 1}`}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                              {video.duration && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{formatCourseDuration(video.duration)}</span>
                                </div>
                              )}
                              {video.order !== undefined && (
                                <div className="flex items-center gap-1">
                                  <span>Order: {video.order + 1}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {video.url && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(video.url, '_blank')}
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Watch
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Play className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Videos Available</h3>
                      <p className="text-gray-500 mb-4">This course doesn't have any video content yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Course Preview Placeholder */}
          {!isEnrolled && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-orange-600" />
                  Course Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Lock className="w-16 h-16 mx-auto mb-4 text-orange-400" />
                    <p className="text-lg font-medium">Course Content Locked</p>
                    <p className="text-sm">Complete payment to unlock all course materials</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Course Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Enrollments</span>
                <span className="font-semibold">{course.totalEnrollments || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Rating</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{course.averageRating?.toFixed(1) || '0.0'}</span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(course.averageRating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Ratings</span>
                <span className="font-semibold">{course.totalRatings || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Course Status</span>
                <Badge variant={course.isActive ? "default" : "secondary"}>
                  {course.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Creator Info */}
          <Card>
            <CardHeader>
              <CardTitle>Course Creator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-lg">
                  {course.createdBy?.firstName?.charAt(0) || 'A'}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {course.createdBy?.firstName} {course.createdBy?.secondName}
                  </h4>
                  <p className="text-sm text-gray-500">{course.createdBy?.userEmail}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Instructions */}
          {!isEnrolled && (
            <Card className="border-2 border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-800">Payment Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-orange-700">
                  <p className="mb-2">To access this course:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Send {formatCoursePrice(course.price)} via Vodafone Cash</li>
                    <li>Use the number: <span className="font-bold">01090385390</span></li>
                    <li>Take a screenshot of the payment</li>
                    <li>Upload the screenshot here</li>
                    <li>Wait for admin approval</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enroll Button */}
          {!isEnrolled && (
            <Card>
              <CardContent className="pt-6">
                <Button 
                  className="w-full bg-orange-600 hover:bg-orange-700" 
                  size="lg"
                  onClick={() => setIsUploadModalOpen(true)}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Pay & Enroll
                </Button>
                <p className="text-sm text-gray-500 text-center mt-2">
                  Complete payment to unlock all course materials
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
