import { toast } from '../hooks/use-toast';

// Payment notification service
export const paymentNotificationService = {
  // Show payment submission success
  showPaymentSubmitted: () => {
    toast({
      title: 'تم إرسال طلب الدفع بنجاح',
      description: 'تم إرسال تفاصيل الدفع. يرجى انتظار موافقة الإدارة.',
      variant: 'success',
      duration: 6000
    });
  },

  // Show payment accepted
  showPaymentAccepted: (courseName) => {
    toast({
      title: 'تم قبول الدفع بنجاح',
      description: `تم قبول طلب الدفع لدورة "${courseName}". يمكنك الآن الوصول إلى محتوى الدورة.`,
      variant: 'success',
      duration: 8000
    });
  },

  // Show payment rejected
  showPaymentRejected: (courseName, reason) => {
    toast({
      title: 'تم رفض طلب الدفع',
      description: `تم رفض طلب الدفع لدورة "${courseName}". ${reason ? `السبب: ${reason}` : ''}`,
      variant: 'destructive',
      duration: 8000
    });
  },

  // Show payment error
  showPaymentError: (error) => {
    toast({
      title: 'خطأ في الدفع',
      description: error || 'حدث خطأ أثناء معالجة طلب الدفع',
      variant: 'destructive',
      duration: 6000
    });
  },

  // Show course enrollment success
  showEnrollmentSuccess: (courseName) => {
    toast({
      title: 'تم تسجيلك في الدورة بنجاح',
      description: `مرحباً بك في دورة "${courseName}". يمكنك الآن البدء في التعلم!`,
      variant: 'success',
      duration: 8000
    });
  },

  // Show course access granted
  showAccessGranted: (courseName) => {
    toast({
      title: 'تم تفعيل الوصول للدورة',
      description: `تم تفعيل وصولك لدورة "${courseName}". يمكنك الآن مشاهدة جميع المحتويات.`,
      variant: 'success',
      duration: 6000
    });
  },

  // Show general success
  showSuccess: (title, description) => {
    toast({
      title,
      description,
      variant: 'success',
      duration: 5000
    });
  },

  // Show general error
  showError: (title, description) => {
    toast({
      title,
      description,
      variant: 'destructive',
      duration: 6000
    });
  },

  // Show general info
  showInfo: (title, description) => {
    toast({
      title,
      description,
      variant: 'default',
      duration: 5000
    });
  },

  // Show warning
  showWarning: (title, description) => {
    toast({
      title,
      description,
      variant: 'destructive',
      duration: 5000
    });
  }
};

// Socket.io notification handler (if using real-time notifications)
export const handlePaymentNotifications = (socket, dispatch) => {
  if (!socket) return;

  // Listen for payment status updates
  socket.on('payment:accepted', (data) => {
    paymentNotificationService.showPaymentAccepted(data.courseName);
    
    // Update Redux state if needed
    if (dispatch) {
      // dispatch(updatePaymentStatus({ paymentId: data.paymentId, status: 'accepted' }));
    }
  });

  socket.on('payment:rejected', (data) => {
    paymentNotificationService.showPaymentRejected(data.courseName, data.reason);
    
    // Update Redux state if needed
    if (dispatch) {
      // dispatch(updatePaymentStatus({ paymentId: data.paymentId, status: 'rejected' }));
    }
  });

  socket.on('course:enrolled', (data) => {
    paymentNotificationService.showEnrollmentSuccess(data.courseName);
    
    // Update Redux state if needed
    if (dispatch) {
      // dispatch(addEnrolledCourse(data.course));
    }
  });

  socket.on('course:access_granted', (data) => {
    paymentNotificationService.showAccessGranted(data.courseName);
    
    // Update Redux state if needed
    if (dispatch) {
      // dispatch(updateCourseAccess({ courseId: data.courseId, hasAccess: true }));
    }
  });
};

export default paymentNotificationService;
