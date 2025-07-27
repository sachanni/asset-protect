import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Heart, AlertTriangle, Clock, Phone, Eye } from "lucide-react";

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  pendingAlerts: number;
  pendingValidations: number;
}

interface UserWithNominees {
  id: string;
  fullName: string;
  profileImageUrl?: string;
  lastWellBeingCheck: string;
  wellBeingCounter: number;
  maxWellBeingLimit: number;
  nominees: Array<{
    id: string;
    fullName: string;
    relationship: string;
    mobileNumber: string;
    email?: string;
  }>;
}

export default function AdminDashboard() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: pendingValidations, isLoading: validationsLoading } = useQuery<UserWithNominees[]>({
    queryKey: ["/api/admin/pending-validations"],
    enabled: isAuthenticated,
    retry: false,
  });

  const approveValidationMutation = useMutation({
    mutationFn: async ({ userId, notes }: { userId: string; notes: string }) => {
      await apiRequest("POST", "/api/admin/approve-death-validation", { userId, notes });
    },
    onSuccess: () => {
      toast({
        title: "Validation Approved",
        description: "Death validation has been approved and notifications will be sent to nominees.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-validations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">SecureVault Admin</span>
              </div>
              <nav className="hidden md:flex space-x-8">
                <a href="#" className="text-primary-500 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Dashboard</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Users</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Alerts</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Validations</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-primary-500" />
                <span className="text-sm font-medium text-gray-700">Admin User</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor users and manage validation workflows</p>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-green-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.activeUsers || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.pendingAlerts || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-red-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Validations</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.pendingValidations || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Validations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Pending Death Validations</CardTitle>
            <p className="text-gray-600">Users requiring verification before nominee notification</p>
          </CardHeader>
          <CardContent>
            {validationsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingValidations?.map((user) => (
                  <div key={user.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={user.profileImageUrl} className="object-cover" />
                          <AvatarFallback>{user.fullName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-gray-900">{user.fullName}</h3>
                          <p className="text-sm text-gray-500">
                            Last response: {new Date(user.lastWellBeingCheck).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            Missed alerts: {user.wellBeingCounter}/{user.maxWellBeingLimit}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => approveValidationMutation.mutate({ 
                            userId: user.id, 
                            notes: "Death validation approved by admin" 
                          })}
                          disabled={approveValidationMutation.isPending}
                          size="sm"
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          Contact Nominees
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">Nominee Contacts:</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {user.nominees.map((nominee) => (
                          <div key={nominee.id} className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>{nominee.fullName[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">
                                {nominee.fullName} ({nominee.relationship})
                              </p>
                              <p className="text-xs text-gray-500">{nominee.mobileNumber}</p>
                              {nominee.email && (
                                <p className="text-xs text-gray-500">{nominee.email}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )) || (
                  <p className="text-gray-500 text-center py-8">No pending validations</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Admin Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Death validation approved for user #12847</p>
                  <p className="text-xs text-gray-500">Notifications sent to 3 nominees</p>
                </div>
                <span className="text-xs text-gray-500">2 hours ago</span>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Well-being alert escalated for user #18394</p>
                  <p className="text-xs text-gray-500">Customer care contacted nominees</p>
                </div>
                <span className="text-xs text-gray-500">5 hours ago</span>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">New user registration: John Anderson</p>
                  <p className="text-xs text-gray-500">Account verification completed</p>
                </div>
                <span className="text-xs text-gray-500">1 day ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
