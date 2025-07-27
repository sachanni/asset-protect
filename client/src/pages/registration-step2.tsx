import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Lock, Eye, EyeOff, Check, RotateCcw } from "lucide-react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const step2Schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
  captcha: z.string().min(5, "Please enter the captcha code"),
  agreeToTerms: z.boolean().refine(val => val === true, "Please agree to the terms"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type Step2FormData = z.infer<typeof step2Schema>;

export default function RegistrationStep2() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [captchaCode] = useState("7K9X2");
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
  });

  const password = watch("password");

  const passwordRequirements = [
    { met: password?.length >= 8, text: "At least 8 characters" },
    { met: /[A-Z]/.test(password || ""), text: "One uppercase letter" },
    { met: /[0-9]/.test(password || ""), text: "One number" },
  ];

  const mutation = useMutation({
    mutationFn: async (data: Step2FormData) => {
      const response = await apiRequest("POST", "/api/register/step2", {
        email: data.email,
        password: data.password,
        captcha: data.captcha,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful!",
        description: "Your account has been created successfully.",
      });
      setLocation("/login");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: Step2FormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary-500">Step 2 of 2</span>
            <span className="text-sm text-gray-500">100% Complete</span>
          </div>
          <Progress value={100} className="h-2" />
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Secure Your Account</h2>
              <p className="text-gray-600 mt-2">Complete your registration with email and password</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="Enter your email address"
                  className="mt-2"
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-2">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="Create a strong password"
                    className="pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="mt-2 space-y-1">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs">
                      <Check className={`w-3 h-3 ${req.met ? 'text-green-500' : 'text-gray-300'}`} />
                      <span className={req.met ? 'text-green-600' : 'text-gray-500'}>{req.text}</span>
                    </div>
                  ))}
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                  placeholder="Confirm your password"
                  className="mt-2"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* CAPTCHA */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <Label>Security Verification</Label>
                  <button type="button" className="text-xs text-primary-500 hover:text-primary-600 flex items-center">
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Refresh
                  </button>
                </div>
                <div className="flex space-x-3 items-center">
                  <div className="bg-white border-2 border-dashed border-gray-300 rounded px-4 py-2 text-lg font-mono text-gray-700 tracking-widest">
                    {captchaCode}
                  </div>
                  <Input
                    {...register("captcha")}
                    placeholder="Enter code"
                    className="flex-1"
                  />
                </div>
                {errors.captcha && (
                  <p className="text-sm text-red-600 mt-1">{errors.captcha.message}</p>
                )}
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeToTerms"
                  onCheckedChange={(checked) => setValue("agreeToTerms", checked as boolean)}
                />
                <Label htmlFor="agreeToTerms" className="text-sm text-gray-600 leading-5">
                  I agree to the{" "}
                  <a href="#" className="text-primary-500 hover:text-primary-600">Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" className="text-primary-500 hover:text-primary-600">Privacy Policy</a>
                </Label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-sm text-red-600">{errors.agreeToTerms.message}</p>
              )}

              <div className="flex space-x-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setLocation("/register/step1")}
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Creating Account..." : "Create Account"}
                </Button>
              </div>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{" "}
              <button
                onClick={() => setLocation("/login")}
                className="text-primary-500 hover:text-primary-600 font-medium"
              >
                Sign in
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
