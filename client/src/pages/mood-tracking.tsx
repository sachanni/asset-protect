import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MoodTracker from '@/components/mood-tracker';
import { useLocation } from 'wouter';
import { ArrowLeft, TrendingUp, Calendar } from 'lucide-react';

interface MoodEntry {
  id: string;
  mood: string;
  emoji: string;
  notes?: string;
  createdAt: string;
}

export default function MoodTrackingPage() {
  const [, setLocation] = useLocation();

  // Fetch recent mood entries
  const { data: moodEntries = [], isLoading } = useQuery({
    queryKey: ['/api/mood/entries'],
  }) as { data: MoodEntry[]; isLoading: boolean };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMoodStats = () => {
    const last7Days = moodEntries.slice(0, 7);
    const moodCounts = last7Days.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommon = Object.entries(moodCounts)
      .sort(([,a], [,b]) => b - a)[0];
    
    return {
      totalEntries: last7Days.length,
      mostCommonMood: mostCommon ? mostCommon[0] : 'No data',
      streak: calculateStreak(),
    };
  };

  const calculateStreak = () => {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < moodEntries.length; i++) {
      const entryDate = new Date(moodEntries[i].createdAt);
      entryDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const stats = getMoodStats();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mood Tracking</h1>
            <p className="text-gray-600">Track and understand your emotional well-being</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tracking Streak</p>
                <p className="text-2xl font-bold text-gray-900">{stats.streak} days</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEntries} entries</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-xl">😊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Most Common</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">{stats.mostCommonMood}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Mood Tracker */}
        <MoodTracker />

        {/* Recent Entries */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Mood Entries</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : moodEntries.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl mb-2 block">😊</span>
                <p className="text-gray-500">No mood entries yet</p>
                <p className="text-sm text-gray-400">Start tracking your mood to see entries here</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {moodEntries.map((entry) => (
                  <div key={entry.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border">
                      <span className="text-lg">{entry.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 capitalize">{entry.mood}</p>
                        <span className="text-sm text-gray-500">{formatDate(entry.createdAt)}</span>
                      </div>
                      {entry.notes && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{entry.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}