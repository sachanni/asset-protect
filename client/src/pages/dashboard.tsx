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
import { Shield, Coins, Users, Heart, Cloud, Plus, ChevronDown, LogOut } from "lucide-react";
import WellBeingAlert from "@/components/well-being-alert";
import AssetCard from "@/components/asset-card";
import NomineeCard from "@/components/nominee-card";

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <Coins className="w-6 h-6 text-primary-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Assets</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalAssets || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Nominees</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalNominees || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-orange-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Last Check-in</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.lastCheckin ? new Date(stats.lastCheckin).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Cloud className="w-6 h-6 text-blue-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Storage</p>
                  <p className="text-2xl font-bold text-gray-900">95%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Well-being Check Alert */}
        {showWellBeingAlert && (
          <WellBeingAlert 
            onConfirm={() => wellBeingMutation.mutate()}
            isLoading={wellBeingMutation.isPending}
          />
        )}

        {/* Recent Assets and Nominees */}
        <div className="grid lg:grid-cols-2 gap-8">
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
            <CardContent>
              <div className="space-y-4">
                {stats?.recentAssets?.map((asset) => (
                  <AssetCard key={asset.id} asset={asset} />
                )) || (
                  <p className="text-gray-500 text-center py-8">No assets added yet</p>
                )}
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => setActiveTab("assets")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Asset
                </Button>
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
            <CardContent>
              <div className="space-y-4">
                {stats?.nominees?.map((nominee) => (
                  <NomineeCard key={nominee.id} nominee={nominee} />
                )) || (
                  <p className="text-gray-500 text-center py-8">No nominees added yet</p>
                )}
                <Button 
                  className="w-full bg-green-500 hover:bg-green-600"
                  onClick={() => setActiveTab("nominees")}
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
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Asset management functionality coming soon</p>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add New Asset
          </Button>
        </div>
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
                <Button variant="outline">Configure Alerts</Button>
              </div>
            </CardContent>
          </Card>
        </div>
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
                <span className="text-xl font-bold text-gray-900">SecureVault</span>
              </div>
              <nav className="hidden md:flex space-x-8">
                <button 
                  onClick={() => setActiveTab("dashboard")}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "dashboard" 
                      ? "text-primary-500 hover:text-primary-600" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => setActiveTab("assets")}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "assets" 
                      ? "text-primary-500 hover:text-primary-600" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Assets
                </button>
                <button 
                  onClick={() => setActiveTab("nominees")}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "nominees" 
                      ? "text-primary-500 hover:text-primary-600" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Nominees
                </button>
                <button 
                  onClick={() => setActiveTab("settings")}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "settings" 
                      ? "text-primary-500 hover:text-primary-600" 
                      : "text-gray-600 hover:text-gray-900"
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