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
  { mood: 'happy', emoji: '😊', label: 'Happy', color: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300' },
  { mood: 'excited', emoji: '🤩', label: 'Excited', color: 'bg-orange-100 hover:bg-orange-200 border-orange-300' },
  { mood: 'calm', emoji: '😌', label: 'Calm', color: 'bg-blue-100 hover:bg-blue-200 border-blue-300' },
  { mood: 'content', emoji: '😐', label: 'Content', color: 'bg-gray-100 hover:bg-gray-200 border-gray-300' },
  { mood: 'tired', emoji: '😴', label: 'Tired', color: 'bg-purple-100 hover:bg-purple-200 border-purple-300' },
  { mood: 'stressed', emoji: '😰', label: 'Stressed', color: 'bg-red-100 hover:bg-red-200 border-red-300' },
  { mood: 'sad', emoji: '😢', label: 'Sad', color: 'bg-blue-100 hover:bg-blue-200 border-blue-300' },
  { mood: 'anxious', emoji: '😟', label: 'Anxious', color: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300' },
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
      const response = await apiRequest('/api/mood/entries', 'POST', data);
      console.log('Mood response:', response);
      return response;
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
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                <span className="text-lg">{latestMood?.emoji || '😊'}</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-gray-900">Current Mood</h3>
                <p className="text-xs text-gray-600 capitalize">
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
                    className={`w-8 h-8 p-0 ${selectedMood?.mood === mood.mood ? mood.color : ''}`}
                    onClick={() => {
                      setSelectedMood(mood);
                      moodMutation.mutate({
                        mood: mood.mood,
                        emoji: mood.emoji,
                      });
                    }}
                    disabled={moodMutation.isPending}
                  >
                    <span className="text-sm">{mood.emoji}</span>
                  </Button>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-gray-500 h-6"
                onClick={() => {
                  window.location.href = '/mood-tracking';
                }}
              >
                View All →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="text-lg mr-2">😊</span>
          How are you feeling today?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mood Selection Grid */}
        <div className="grid grid-cols-4 gap-3">
          {moodOptions.map((mood) => (
            <Button
              key={mood.mood}
              variant="outline"
              className={`h-16 flex flex-col items-center justify-center space-y-1 ${
                selectedMood?.mood === mood.mood ? mood.color : ''
              }`}
              onClick={() => setSelectedMood(mood)}
            >
              <span className="text-2xl">{mood.emoji}</span>
              <span className="text-xs font-medium">{mood.label}</span>
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
                className="flex-1"
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