import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { apiRequest } from '@/lib/queryClient';
import { 
  Play, 
  Pause, 
  Heart, 
  HeartOff, 
  Star, 
  Volume2,
  Clock,
  Music,
  Headphones,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SoundLibraryItem {
  id: string;
  title: string;
  description: string;
  category: string;
  moodTags: string[];
  audioUrl: string;
  duration: number;
  isLoop: boolean;
  volume: string;
  thumbnailUrl?: string;
  createdAt: string;
}

interface UserSoundHistory {
  id: string;
  userId: string;
  soundId: string;
  playDuration: number;
  rating: number;
  isFavorite: boolean;
  playedAt: string;
}

export default function SoundLibrary() {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [volume, setVolume] = useState([0.5]);
  const [playbackTime, setPlaybackTime] = useState<{ [key: string]: number }>({});
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all sounds
  const { data: sounds = [], isLoading } = useQuery({
    queryKey: ['/api/sounds'],
  });

  // Fetch recommended sounds
  const { data: recommendations = [] } = useQuery({
    queryKey: ['/api/sounds/recommendations'],
  });

  // Fetch favorite sounds
  const { data: favorites = [] } = useQuery({
    queryKey: ['/api/sounds/favorites'],
  });

  // Record sound play mutation
  const recordPlayMutation = useMutation({
    mutationFn: (data: { soundId: string; playDuration?: number }) =>
      apiRequest('/api/sounds/play', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sounds/history'] });
    },
  });

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: (soundId: string) =>
      apiRequest(`/api/sounds/${soundId}/favorite`, 'POST'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sounds/favorites'] });
      toast({
        title: "Success",
        description: "Favorite status updated",
      });
    },
  });

  // Rate sound mutation
  const rateSoundMutation = useMutation({
    mutationFn: ({ soundId, rating }: { soundId: string; rating: number }) =>
      apiRequest(`/api/sounds/${soundId}/rate`, 'POST', { rating }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Rating saved",
      });
    },
  });

  const categories = ['all', 'nature', 'ambient', 'meditation', 'sleep', 'focus'];

  const filteredSounds = selectedCategory === 'all' 
    ? sounds 
    : sounds.filter((sound: SoundLibraryItem) => sound.category === selectedCategory);

  const togglePlayback = (sound: SoundLibraryItem) => {
    const audioKey = sound.id;
    
    if (currentlyPlaying === audioKey) {
      // Pause current sound
      if (audioRefs.current[audioKey]) {
        audioRefs.current[audioKey].pause();
        const currentTime = audioRefs.current[audioKey].currentTime;
        recordPlayMutation.mutate({ 
          soundId: sound.id, 
          playDuration: Math.floor(currentTime) 
        });
      }
      setCurrentlyPlaying(null);
    } else {
      // Stop any currently playing sound
      if (currentlyPlaying) {
        const currentAudio = audioRefs.current[currentlyPlaying];
        if (currentAudio) {
          currentAudio.pause();
        }
      }

      // Start new sound
      if (!audioRefs.current[audioKey]) {
        const audio = new Audio(sound.audioUrl);
        audio.loop = sound.isLoop;
        audio.volume = volume[0];
        audioRefs.current[audioKey] = audio;

        audio.addEventListener('ended', () => {
          setCurrentlyPlaying(null);
          recordPlayMutation.mutate({ 
            soundId: sound.id, 
            playDuration: sound.duration 
          });
        });

        audio.addEventListener('timeupdate', () => {
          setPlaybackTime(prev => ({
            ...prev,
            [audioKey]: audio.currentTime
          }));
        });
      }

      audioRefs.current[audioKey].volume = volume[0];
      audioRefs.current[audioKey].play().catch(console.error);
      setCurrentlyPlaying(audioKey);
    }
  };

  const toggleFavorite = (soundId: string) => {
    toggleFavoriteMutation.mutate(soundId);
  };

  const rateSoundEntry = (soundId: string, rating: number) => {
    rateSoundMutation.mutate({ soundId, rating });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isFavorite = (soundId: string) => {
    return favorites.some((fav: SoundLibraryItem) => fav.id === soundId);
  };

  // Update volume for all audio elements
  useEffect(() => {
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) {
        audio.volume = volume[0];
      }
    });
  }, [volume]);

  const SoundCard = ({ sound }: { sound: SoundLibraryItem }) => {
    const isPlaying = currentlyPlaying === sound.id;
    const currentTime = playbackTime[sound.id] || 0;

    return (
      <Card className="group hover:shadow-lg transition-all duration-200 border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-foreground">
                {sound.title}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-1">
                {sound.description}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="ml-2">
              {sound.category}
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {sound.moodTags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={isPlaying ? "default" : "outline"}
                onClick={() => togglePlayback(sound)}
                className="flex items-center gap-2"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => toggleFavorite(sound.id)}
                className="p-2"
              >
                {isFavorite(sound.id) ? 
                  <Heart className="h-4 w-4 fill-red-500 text-red-500" /> : 
                  <HeartOff className="h-4 w-4" />
                }
              </Button>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {isPlaying ? 
                `${formatDuration(currentTime)} / ${formatDuration(sound.duration)}` :
                formatDuration(sound.duration)
              }
            </div>
          </div>

          {isPlaying && (
            <div className="w-full bg-secondary h-1 rounded-full mb-4">
              <div 
                className="bg-primary h-1 rounded-full transition-all duration-300"
                style={{ width: `${(currentTime / sound.duration) * 100}%` }}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  size="sm"
                  variant="ghost"
                  className="p-1 h-auto"
                  onClick={() => rateSoundEntry(sound.id, rating)}
                >
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                </Button>
              ))}
            </div>
            
            <div className="text-xs text-muted-foreground">
              {sound.isLoop && "Loop"}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Headphones className="h-8 w-8" />
            Sound Library
          </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Headphones className="h-8 w-8" />
          Sound Library
        </h1>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            <Slider
              value={volume}
              onValueChange={setVolume}
              max={1}
              min={0}
              step={0.1}
              className="w-20"
            />
          </div>
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="recommendations">For You</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                size="sm"
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSounds.map((sound: SoundLibraryItem) => (
              <SoundCard key={sound.id} sound={sound} />
            ))}
          </div>

          {filteredSounds.length === 0 && (
            <div className="text-center py-12">
              <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No sounds found</h3>
              <p className="text-muted-foreground">
                {selectedCategory === 'all' ? 
                  'No sounds available at the moment' : 
                  `No sounds found in the ${selectedCategory} category`
                }
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Recommended for Your Mood</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((sound: SoundLibraryItem) => (
              <SoundCard key={sound.id} sound={sound} />
            ))}
          </div>

          {recommendations.length === 0 && (
            <div className="text-center py-12">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No recommendations yet</h3>
              <p className="text-muted-foreground">
                Track your mood to get personalized sound recommendations
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-red-500" />
            <h2 className="text-xl font-semibold">Your Favorite Sounds</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((sound: SoundLibraryItem) => (
              <SoundCard key={sound.id} sound={sound} />
            ))}
          </div>

          {favorites.length === 0 && (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No favorites yet</h3>
              <p className="text-muted-foreground">
                Heart sounds you love to add them to your favorites
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}