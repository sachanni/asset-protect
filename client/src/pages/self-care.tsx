import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Heart, 
  Brain, 
  Activity, 
  Users, 
  Clock, 
  CheckCircle,
  X,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Settings,
  Sparkles,
  Wind,
  Dumbbell,
  Utensils,
  Moon,
  BookOpen,
  Music
} from 'lucide-react';

interface SelfCareRecommendation {
  id: string;
  userId: string;
  recommendationType: string;
  title: string;
  description: string;
  instructions: string;
  durationMinutes: number;
  contextTrigger: string;
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  completedAt: string | null;
  feedback: string | null;
  createdAt: string;
}

interface WellnessPreferences {
  id: string;
  userId: string;
  preferredActivities: string[];
  availableTime: string;
  notificationFrequency: string;
  personalityType: string;
  stressIndicators: string[];
  calmingActivities: string[];
  energizingActivities: string[];
}

export default function SelfCarePage() {
  const [activeTab, setActiveTab] = useState('recommendations');
  const [selectedPreferences, setSelectedPreferences] = useState<Partial<WellnessPreferences>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: recommendations = [], isLoading: recommendationsLoading } = useQuery<SelfCareRecommendation[]>({
    queryKey: ['/api/self-care/recommendations'],
  });

  const { data: preferences } = useQuery<WellnessPreferences | null>({
    queryKey: ['/api/wellness/preferences'],
  });

  const generateRecommendationsMutation = useMutation({
    mutationFn: () => apiRequest('/api/self-care/generate', 'POST'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/self-care/recommendations'] });
      toast({ title: 'New recommendations generated!' });
    },
  });

  const updateRecommendationMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<SelfCareRecommendation> }) =>
      apiRequest(`/api/self-care/recommendations/${id}`, 'PATCH', updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/self-care/recommendations'] });
    },
  });

  const deleteRecommendationMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/self-care/recommendations/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/self-care/recommendations'] });
      toast({ title: 'Recommendation removed' });
    },
  });

  const savePreferencesMutation = useMutation({
    mutationFn: (prefs: Partial<WellnessPreferences>) => {
      if (preferences) {
        return apiRequest('/api/wellness/preferences', 'PATCH', prefs);
      } else {
        return apiRequest('/api/wellness/preferences', 'POST', prefs);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wellness/preferences'] });
      toast({ title: 'Preferences saved successfully!' });
    },
  });

  const markCompleted = (id: string) => {
    updateRecommendationMutation.mutate({
      id,
      updates: { isCompleted: true, completedAt: new Date().toISOString() }
    });
  };

  const provideFeedback = (id: string, feedback: 'helpful' | 'not_helpful') => {
    updateRecommendationMutation.mutate({
      id,
      updates: { feedback }
    });
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'breathing': return <Wind className="w-5 h-5" />;
      case 'exercise': return <Dumbbell className="w-5 h-5" />;
      case 'meditation': return <Brain className="w-5 h-5" />;
      case 'social': return <Users className="w-5 h-5" />;
      case 'nutrition': return <Utensils className="w-5 h-5" />;
      case 'sleep': return <Moon className="w-5 h-5" />;
      case 'reading': return <BookOpen className="w-5 h-5" />;
      case 'music': return <Music className="w-5 h-5" />;
      default: return <Heart className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const activeRecommendations = recommendations.filter(r => !r.isCompleted);
  const completedRecommendations = recommendations.filter(r => r.isCompleted);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Self-Care Hub</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => generateRecommendationsMutation.mutate()}
                disabled={generateRecommendationsMutation.isPending}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {generateRecommendationsMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Generate New Suggestions
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Personalized Self-Care
          </h1>
          <p className="text-gray-600">Contextual wellness recommendations based on your mood and preferences</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-6">
            {recommendationsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
              </div>
            ) : activeRecommendations.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No active recommendations</h3>
                  <p className="text-gray-600 mb-4">Generate personalized self-care suggestions based on your current mood and preferences.</p>
                  <Button
                    onClick={() => generateRecommendationsMutation.mutate()}
                    disabled={generateRecommendationsMutation.isPending}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeRecommendations.map((recommendation) => (
                  <Card key={recommendation.id} className="hover-lift border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                            {getRecommendationIcon(recommendation.recommendationType)}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                            <Badge className={getPriorityColor(recommendation.priority)}>{recommendation.priority}</Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteRecommendationMutation.mutate(recommendation.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-600">{recommendation.description}</p>
                      
                      {recommendation.instructions && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-800">{recommendation.instructions}</p>
                        </div>
                      )}

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{recommendation.durationMinutes} min</span>
                        </div>
                        <Badge variant="outline">{recommendation.contextTrigger}</Badge>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => provideFeedback(recommendation.id, 'helpful')}
                            className={recommendation.feedback === 'helpful' ? 'text-green-600' : ''}
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => provideFeedback(recommendation.id, 'not_helpful')}
                            className={recommendation.feedback === 'not_helpful' ? 'text-red-600' : ''}
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button
                          onClick={() => markCompleted(recommendation.id)}
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Complete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            {completedRecommendations.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No completed activities yet</h3>
                  <p className="text-gray-600">Your completed self-care activities will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedRecommendations.map((recommendation) => (
                  <Card key={recommendation.id} className="border-green-200 bg-green-50/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                          {getRecommendationIcon(recommendation.recommendationType)}
                        </div>
                        <div>
                          <CardTitle className="text-lg text-green-800">{recommendation.title}</CardTitle>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-600">Completed</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm">{recommendation.description}</p>
                      <div className="mt-3 text-xs text-gray-500">
                        Completed on {new Date(recommendation.completedAt!).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Wellness Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <Label>Available Time (minutes)</Label>
                    <Select
                      value={selectedPreferences.availableTime || preferences?.availableTime || '15'}
                      onValueChange={(value) => setSelectedPreferences(prev => ({ ...prev, availableTime: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Personality Type</Label>
                    <Select
                      value={selectedPreferences.personalityType || preferences?.personalityType || ''}
                      onValueChange={(value) => setSelectedPreferences(prev => ({ ...prev, personalityType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="introvert">Introvert</SelectItem>
                        <SelectItem value="extrovert">Extrovert</SelectItem>
                        <SelectItem value="ambivert">Ambivert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Preferred Activities</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['meditation', 'exercise', 'reading', 'music', 'breathing', 'social', 'nutrition', 'sleep'].map((activity) => (
                      <div key={activity} className="flex items-center space-x-2">
                        <Checkbox
                          checked={(selectedPreferences.preferredActivities || preferences?.preferredActivities || []).includes(activity)}
                          onCheckedChange={(checked) => {
                            const currentActivities = selectedPreferences.preferredActivities || preferences?.preferredActivities || [];
                            if (checked) {
                              setSelectedPreferences(prev => ({
                                ...prev,
                                preferredActivities: [...currentActivities, activity]
                              }));
                            } else {
                              setSelectedPreferences(prev => ({
                                ...prev,
                                preferredActivities: currentActivities.filter(a => a !== activity)
                              }));
                            }
                          }}
                        />
                        <Label className="capitalize">{activity}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => savePreferencesMutation.mutate(selectedPreferences)}
                  disabled={savePreferencesMutation.isPending}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}