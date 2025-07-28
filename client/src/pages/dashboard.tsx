import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Shield, Coins, Users, Heart, Cloud, Plus, ChevronDown, LogOut, Bell, BarChart3 } from "lucide-react";
import WellBeingAlert from "@/components/well-being-alert";
import AssetCard from "@/components/asset-card";
import NomineeCard from "@/components/nominee-card";
import MoodTracker from "@/components/mood-tracker";

interface DashboardStats {
  totalAssets: number;
  totalNominees: number;
  lastCheckin: string;
  wellBeingCounter: number;
  recentAssets: Array<{
    id: string;
    assetType: string;
    title: string;
    value: string;
    currency: string;
  }>;
  nominees: Array<{
    id: string;
    fullName: string;
    relationship: string;
    isVerified: boolean;
  }>;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth() as { 
    user: User | undefined, 
    isAuthenticated: boolean, 
    isLoading: boolean 
  };
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Redirect to home if not authenticated
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

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    enabled: isAuthenticated,
  });

  // Add all required queries at top level
  const { data: assetsData = [] } = useQuery<any[]>({
    queryKey: ["/api/assets"],
    enabled: isAuthenticated,
  });

  const { data: nomineesData = [] } = useQuery<any[]>({
    queryKey: ["/api/nominees"],
    enabled: isAuthenticated,
  });

  const wellBeingMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/wellbeing/confirm", {});
    },
    onSuccess: () => {
      toast({
        title: "Well-being Confirmed",
        description: "Your status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
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

  const showWellBeingAlert = stats && stats.wellBeingCounter > 10;

  function renderContent() {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "assets":
        return renderAssets();
      case "nominees":
        return renderNominees();
      case "settings":    
        return renderSettings();
      default:
        return renderDashboard();
    }
  }

  function renderDashboard() {
    return (
      <>
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName || user?.fullName?.split(' ')[0]}!
          </h1>
          <p className="text-gray-600">Manage your digital assets and well-being status</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
          <Card>
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <Coins className="w-4 h-4 md:w-6 md:h-6 text-primary-500" />
                </div>
                <div className="ml-2 md:ml-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600">Total Assets</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{stats?.totalAssets || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 md:w-6 md:h-6 text-green-500" />
                </div>
                <div className="ml-2 md:ml-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600">Nominees</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{stats?.totalNominees || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Bell className="w-4 h-4 md:w-6 md:h-6 text-orange-500" />
                </div>
                <div className="ml-2 md:ml-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600">Alert Frequency</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900 capitalize">
                    {user?.alertFrequency || 'Daily'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 md:w-6 md:h-6 text-green-500" />
                </div>
                <div className="ml-2 md:ml-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600">Last Response</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">
                    {stats?.lastCheckin ? 'Just now' : 'Never'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2 md:col-span-1">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-center md:justify-start">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Cloud className="w-4 h-4 md:w-6 md:h-6 text-blue-500" />
                </div>
                <div className="ml-2 md:ml-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600">Storage</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">95%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Well-being Check Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                <div className="flex items-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
                  </div>
                  <div className="ml-3 md:ml-4">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">Well-being Check</h3>
                    <p className="text-sm md:text-base text-gray-600">
                      Your next check is scheduled based on your {user?.alertFrequency || 'daily'} frequency
                    </p>
                  </div>
                </div>
                <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-3">
                  <Button 
                    onClick={() => wellBeingMutation.mutate()}
                    disabled={wellBeingMutation.isPending}
                    className="bg-green-500 hover:bg-green-600 text-white text-sm md:text-base"
                    size="sm"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    {wellBeingMutation.isPending ? "Confirming..." : "I'm Okay"}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setLocation("/well-being-settings")}
                    size="sm"
                    className="text-sm md:text-base"
                  >
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Mood Tracker */}
          <MoodTracker compact={true} />
        </div>

        {/* Well-being Check Alert - Only show when needed */}
        {showWellBeingAlert && (
          <WellBeingAlert 
            onConfirm={() => wellBeingMutation.mutate()}
            isLoading={wellBeingMutation.isPending}
          />
        )}

        {/* Recent Assets and Nominees */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Assets</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary-500 hover:text-primary-600"
                  onClick={() => setActiveTab("assets")}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="space-y-3 md:space-y-4">
                {assetsData.length > 0 ? (
                  assetsData.slice(0, 3).map((asset) => (
                    <AssetCard key={asset._id} asset={asset} />
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-6 md:py-8 text-sm md:text-base">No assets added yet</p>
                )}
                <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                  <Button 
                    className="flex-1 text-sm md:text-base" 
                    variant="outline"
                    onClick={() => setLocation("/assets")}
                    size="sm"
                  >
                    <Coins className="w-4 h-4 mr-2" />
                    View Portfolio
                  </Button>
                  <Button 
                    className="flex-1 text-sm md:text-base" 
                    variant="outline"
                    onClick={() => setLocation("/add-asset")}
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Asset
                  </Button>
                  <Button 
                    className="flex-1 text-sm md:text-base" 
                    variant="outline"
                    onClick={() => setLocation("/wellness-dashboard")}
                    size="sm"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Nominees</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary-500 hover:text-primary-600"
                  onClick={() => setActiveTab("nominees")}
                >
                  Manage
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="space-y-3 md:space-y-4">
                {nomineesData.length > 0 ? (
                  nomineesData.slice(0, 3).map((nominee) => (
                    <NomineeCard key={nominee._id} nominee={nominee} />
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-6 md:py-8 text-sm md:text-base">No nominees added yet</p>
                )}
                <Button 
                  className="w-full bg-green-500 hover:bg-green-600 text-sm md:text-base"
                  onClick={() => setLocation("/add-nominee")}
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Nominee
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }



  function renderAssets() {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Assets</h1>
          <p className="text-gray-600">Manage your digital assets</p>
        </div>
        
        {assetsData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No assets added yet</p>
            <Button onClick={() => setLocation("/add-asset")}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Asset
            </Button>
          </div>
        ) : (
          <div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
              {assetsData.map((asset: any) => (
                <AssetCard key={asset._id} asset={asset} />
              ))}
            </div>
            <Button onClick={() => setLocation("/add-asset")}>
              <Plus className="w-4 h-4 mr-2" />
              Add Another Asset
            </Button>
          </div>
        )}
      </div>
    );
  }

  function renderNominees() {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Nominees</h1>
          <p className="text-gray-600">Manage your nominated family members</p>
        </div>
        
        {nomineesData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No nominees added yet</p>
            <Button 
              className="bg-green-500 hover:bg-green-600"
              onClick={() => setLocation("/add-nominee")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Nominee
            </Button>
          </div>
        ) : (
          <div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
              {nomineesData.map((nominee: any) => (
                <NomineeCard key={nominee._id} nominee={nominee} />
              ))}
            </div>
            <Button 
              className="bg-green-500 hover:bg-green-600"
              onClick={() => setLocation("/add-nominee")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Nominee
            </Button>
          </div>
        )}
      </div>
    );
  }

  function renderSettings() {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Configure your account and preferences</p>
        </div>
        <div className="grid gap-6 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <p className="text-gray-900">{user?.fullName || `${user?.firstName} ${user?.lastName}`}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{user?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Well-being Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Frequency</label>
                  <p className="text-gray-600">Configure how often you want to receive well-being check alerts</p>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => setLocation("/well-being-settings")}
                >
                  Configure Alerts
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">SecureVault</span>
              </div>
              <nav className="hidden md:flex space-x-2">
                <button 
                  onClick={() => setActiveTab("dashboard")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === "dashboard" 
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                  }`}
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => setActiveTab("assets")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === "assets" 
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                  }`}
                >
                  Assets
                </button>
                <button 
                  onClick={() => setActiveTab("nominees")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === "nominees" 
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                  }`}
                >
                  Nominees
                </button>
                <button 
                  onClick={() => setActiveTab("settings")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === "settings" 
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                  }`}
                >
                  Settings
                </button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {/* Well-being Status */}
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Active
              </Badge>
              {/* Admin Panel Access */}
              {user?.isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation("/admin")}
                  className="border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  <Shield className="w-4 h-4 mr-1" />
                  Admin Panel
                </Button>
              )}
              {/* Profile and Logout */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.profileImageUrl || undefined} className="object-cover" />
                    <AvatarFallback>{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-700">{user?.fullName || `${user?.firstName} ${user?.lastName}`}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = "/api/logout"}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
}