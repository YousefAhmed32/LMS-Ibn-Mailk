import CommonForm from "@/components/comm-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signInFormControls, signUpFormControls } from "@/config";
import { useAuth } from "@/contexts/AuthContext";
import { GraduationCap, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

function AuthPage() {
  const [activeTab, setActiveTab] = useState("signin");
  const navigate = useNavigate();
  const {
    signInFormData,
    setSignInFormData,
    signUpFormData,
    setSignUpFormData,
    handleRegisterUser,
    handleLoginUser,
    loading,
    error,
    clearError,
    isAuthenticated
  } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    // Get user role to redirect appropriately
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = userData?.role;
    
    if (userRole === 'admin') {
      navigate('/admin');
    } else if (userRole === 'parent') {
      navigate('/parent/dashboard');
    } else {
      navigate('/courses');
    }
    return null;
  }

  function handleTabChange(value) {
    setActiveTab(value);
    clearError();
  }

  function checkIfSignInFormIsValid() {
    return (
      signInFormData &&
      signInFormData.phoneNumber?.trim() !== "" &&
      signInFormData.password?.trim() !== ""
    );
  }

  function checkIfSignUpFormIsValid() {
    return (
      signUpFormData &&
      signUpFormData.firstName?.trim() !== "" &&
      signUpFormData.secondName?.trim() !== "" &&
      signUpFormData.thirdName?.trim() !== "" &&
      signUpFormData.fourthName?.trim() !== "" &&
      signUpFormData.phoneNumber?.trim() !== "" &&
      signUpFormData.password?.trim() !== "" &&
      signUpFormData.phoneStudent?.trim() !== "" &&
      signUpFormData.guardianPhone?.trim() !== "" &&
      signUpFormData.governorate?.trim() !== "" &&
      signUpFormData.grade?.trim() !== ""
    );
  }

  const handleSignIn = async (event) => {
    const result = await handleLoginUser(event);
    if (result.success) {
      toast({
        title: "Success!",
        description: result.message,
      });
      // Redirect based on user role
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userRole = userData?.role;
      
      if (userRole === 'admin') {
        navigate('/admin');
      } else if (userRole === 'parent') {
        navigate('/parent/dashboard');
      } else {
        navigate('/courses');
      }
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleSignUp = async (event) => {
    const result = await handleRegisterUser(event);
    if (result.success) {
      toast({
        title: "Success!",
        description: result.message,
      });
      // Redirect based on user role
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userRole = userData?.role;
      
      if (userRole === 'admin') {
        navigate('/admin');
      } else if (userRole === 'parent') {
        navigate('/parent/dashboard');
      } else {
        navigate('/courses');
      }
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        {/* <Link to="/" className="flex items-center justify-center">
          <GraduationCap className="h-8 w-8 mr-4" />
          <span className="font-extrabold text-xl">LMS LEARN</span>
        </Link> */}
      </header>

      {/* Auth Tabs */}
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full max-w-2xl">
          <TabsList className="grid w-full grid-cols-2 bg-gray-50 rounded-lg">
            <TabsTrigger value="signin">تسجيل الدخول</TabsTrigger>
            <TabsTrigger value="signup">إنشاء حساب</TabsTrigger>
          </TabsList>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Sign In */}
          <TabsContent value="signin">
            <Card className="p-6 space-y-4">
              <CardHeader>
                <CardTitle>تسجيل الدخول إلى حسابك</CardTitle>
                <CardDescription>
                  أدخل رقم هاتفك وكلمة المرور للوصول إلى حسابك
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CommonForm
                  formControls={signInFormControls}
                  buttonText={loading ? "جاري التحميل..." : "تسجيل الدخول"}
                  formData={signInFormData}
                  setFormData={setSignInFormData}
                  isButtonDisabled={!checkIfSignInFormIsValid() || loading}
                  handleSubmit={handleSignIn}
                />
              </CardContent>
            </Card>
          </TabsContent>
            
          {/* Sign Up */}
          <TabsContent value="signup">
            <Card className="p-6 space-y-4">
              <CardHeader>
                <CardTitle>إنشاء حساب جديد</CardTitle>
                <CardDescription>
                  أدخل بياناتك للبدء
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CommonForm
                  formControls={signUpFormControls}
                  buttonText={loading ? "جاري التحميل..." : "إنشاء حساب"}
                  formData={signUpFormData}
                  setFormData={setSignUpFormData}
                  isButtonDisabled={!checkIfSignUpFormIsValid() || loading}
                  handleSubmit={handleSignUp}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default AuthPage;
