import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface MoodOption {
  mood: string;
  emoji: string;
  label: string;
  color: string;
}

const moodOptions: MoodOption[] = [
  { mood: 'happy', emoji: '😊', label: 'Happy', color: 'mood-happy hover:scale-105 border-yellow-300' },
  { mood: 'excited', emoji: '🤩', label: 'Excited', color: 'mood-excited hover:scale-105 border-orange-300' },
  { mood: 'calm', emoji: '😌', label: 'Calm', color: 'mood-calm hover:scale-105 border-blue-300' },
  { mood: 'content', emoji: '😐', label: 'Content', color: 'mood-content hover:scale-105 border-purple-300' },
  { mood: 'tired', emoji: '😴', label: 'Tired', color: 'mood-tired hover:scale-105 border-red-300' },
  { mood: 'stressed', emoji: '😰', label: 'Stressed', color: 'mood-stressed hover:scale-105 border-pink-300' },
  { mood: 'sad', emoji: '😢', label: 'Sad', color: 'mood-sad hover:scale-105 border-teal-300' },
  { mood: 'anxious', emoji: '😟', label: 'Anxious', color: 'mood-anxious hover:scale-105 border-orange-300' },
];

interface MoodTrackerProps {
  compact?: boolean;
}

export default function MoodTracker({ compact = false }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [notes, setNotes] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch latest mood entry
  const { data: latestMood } = useQuery({
    queryKey: ['/api/mood/latest'],
    enabled: compact, // Only fetch for compact view
  }) as { data: { emoji?: string; mood?: string } | undefined };

  // Create mood entry mutation
  const moodMutation = useMutation({
    mutationFn: async (data: { mood: string; emoji: string; notes?: string }) => {
      console.log('Sending mood data:', data);
      const response = await apiRequest('POST', '/api/mood/entries', data);
      console.log('Mood response:', response);
      return await response.json();
    },
    onSuccess: (data) => {
      console.log('Mood mutation success:', data);
      toast({
        title: "Mood recorded!",
        description: "Your mood has been successfully tracked.",
      });
      setSelectedMood(null);
      setNotes('');
      queryClient.invalidateQueries({ queryKey: ['/api/mood/entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mood/latest'] });
    },
    onError: (error: any) => {
      console.error('Mood mutation error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to record mood. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleMoodSubmit = () => {
    if (!selectedMood) return;
    
    moodMutation.mutate({
      mood: selectedMood.mood,
      emoji: selectedMood.emoji,
      notes: notes.trim() || undefined,
    });
  };

  if (compact) {
    return (
      <Card className="hover-lift border-0 shadow-lg bg-gradient-mood">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">{latestMood?.emoji || '😊'}</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-gray-800">Current Mood</h3>
                <p className="text-sm text-gray-600 capitalize font-medium">
                  {latestMood?.mood || 'Not set today'}
                </p>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <div className="flex space-x-2">
                {moodOptions.slice(0, 4).map((mood) => (
                  <Button
                    key={mood.mood}
                    variant="outline"
                    size="sm"
                    className={`w-10 h-10 p-0 border-2 bg-white/70 backdrop-blur-sm transition-all duration-200 hover:scale-110 ${
                      selectedMood?.mood === mood.mood 
                        ? `${mood.color} border-white shadow-lg` 
                        : 'hover:bg-white/90 border-gray-200'
                    }`}
                    onClick={() => {
                      setSelectedMood(mood);
                      moodMutation.mutate({
                        mood: mood.mood,
                        emoji: mood.emoji,
                      });
                    }}
                    disabled={moodMutation.isPending}
                  >
                    <span className="text-lg">{mood.emoji}</span>
                  </Button>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-gray-600 hover:text-gray-800 h-6 transition-colors duration-200"
                onClick={() => {
                  window.location.href = '/mood-tracking';
                }}
              >
                View All Moods →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover-lift border-0 shadow-lg bg-gradient-mood">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center text-xl font-bold text-gray-800">
          <span className="text-2xl mr-3">😊</span>
          How are you feeling today?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mood Selection Grid */}
        <div className="grid grid-cols-4 gap-3">
          {moodOptions.map((mood) => (
            <Button
              key={mood.mood}
              variant="outline"
              className={`h-20 flex flex-col items-center justify-center border-2 bg-white/70 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                selectedMood?.mood === mood.mood 
                  ? `${mood.color} border-white shadow-xl scale-105` 
                  : 'hover:bg-white/90 border-gray-200'
              }`}
              onClick={() => setSelectedMood(mood)}
            >
              <span className="text-3xl mb-1">{mood.emoji}</span>
              <span className="text-xs font-semibold text-gray-700">{mood.label}</span>
            </Button>
          ))}
        </div>

        {/* Notes Section */}
        {selectedMood && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How are you feeling? (Optional)
              </label>
              <Textarea
                placeholder="Tell us more about your mood today..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={handleMoodSubmit}
                disabled={moodMutation.isPending}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg transition-all duration-200 hover:scale-105"
              >
                {moodMutation.isPending ? "Recording..." : "Record Mood"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedMood(null);
                  setNotes('');
                }}
                disabled={moodMutation.isPending}
                className="border-gray-300 hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Selected Mood Preview */}
        {selectedMood && (
          <div className="bg-gray-50 rounded-lg p-3 border">
            <div className="flex items-center">
              <span className="text-2xl mr-3">{selectedMood.emoji}</span>
              <div>
                <p className="font-medium text-gray-900">Feeling {selectedMood.label}</p>
                <p className="text-sm text-gray-600">Ready to record this mood?</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}