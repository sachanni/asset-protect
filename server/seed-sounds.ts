import { db } from './db';
import { soundLibrary, soundPlaylists } from '@shared/schema';
import { nanoid } from 'nanoid';

const sampleSounds = [
  {
    title: 'Forest Rain',
    description: 'Gentle rain falling on forest leaves with distant thunder',
    category: 'nature',
    moodTags: ['calm', 'stressed', 'anxious', 'tired'],
    audioUrl: 'https://www.soundjay.com/misc/sounds/rain-01.wav',
    duration: 300, // 5 minutes
    isLoop: true,
    volume: '0.60',
    thumbnailUrl: null,
  },
  {
    title: 'Ocean Waves',
    description: 'Peaceful ocean waves lapping against the shore',
    category: 'nature',
    moodTags: ['calm', 'tired', 'stressed'],
    audioUrl: 'https://www.soundjay.com/nature/sounds/ocean-waves.wav',
    duration: 480, // 8 minutes
    isLoop: true,
    volume: '0.55',
    thumbnailUrl: null,
  },
  {
    title: 'Mountain Stream',
    description: 'Bubbling mountain stream with birds chirping',
    category: 'nature',
    moodTags: ['calm', 'happy', 'focused'],
    audioUrl: 'https://www.soundjay.com/nature/sounds/stream.wav',
    duration: 360, // 6 minutes
    isLoop: true,
    volume: '0.50',
    thumbnailUrl: null,
  },
  {
    title: 'Deep Space Ambient',
    description: 'Ethereal ambient sounds for deep relaxation',
    category: 'ambient',
    moodTags: ['calm', 'tired', 'meditative'],
    audioUrl: 'https://www.soundjay.com/misc/sounds/ambient-1.wav',
    duration: 600, // 10 minutes
    isLoop: true,
    volume: '0.45',
    thumbnailUrl: null,
  },
  {
    title: 'Tibetan Singing Bowls',
    description: 'Resonant singing bowls for meditation and mindfulness',
    category: 'meditation',
    moodTags: ['stressed', 'anxious', 'meditative', 'calm'],
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-1.wav',
    duration: 420, // 7 minutes
    isLoop: true,
    volume: '0.50',
    thumbnailUrl: null,
  },
  {
    title: 'White Noise',
    description: 'Pure white noise for concentration and sleep',
    category: 'focus',
    moodTags: ['focused', 'tired', 'stressed'],
    audioUrl: 'https://www.soundjay.com/misc/sounds/white-noise.wav',
    duration: 900, // 15 minutes
    isLoop: true,
    volume: '0.40',
    thumbnailUrl: null,
  },
  {
    title: 'Campfire Crackling',
    description: 'Warm campfire crackling with occasional pops',
    category: 'ambient',
    moodTags: ['calm', 'cozy', 'tired'],
    audioUrl: 'https://www.soundjay.com/nature/sounds/fire-1.wav',
    duration: 240, // 4 minutes
    isLoop: true,
    volume: '0.55',
    thumbnailUrl: null,
  },
  {
    title: 'Night Cricket Symphony',
    description: 'Peaceful cricket sounds on a summer evening',
    category: 'nature',
    moodTags: ['calm', 'tired', 'peaceful'],
    audioUrl: 'https://www.soundjay.com/nature/sounds/crickets.wav',
    duration: 540, // 9 minutes
    isLoop: true,
    volume: '0.45',
    thumbnailUrl: null,
  },
  {
    title: 'Guided Breathing',
    description: '4-7-8 breathing exercise with gentle guidance',
    category: 'meditation',
    moodTags: ['stressed', 'anxious', 'focused'],
    audioUrl: 'https://www.soundjay.com/misc/sounds/breathing.wav',
    duration: 180, // 3 minutes
    isLoop: false,
    volume: '0.60',
    thumbnailUrl: null,
  },
  {
    title: 'Pink Noise',
    description: 'Soothing pink noise for better sleep quality',
    category: 'sleep',
    moodTags: ['tired', 'calm', 'stressed'],
    audioUrl: 'https://www.soundjay.com/misc/sounds/pink-noise.wav',
    duration: 1800, // 30 minutes
    isLoop: true,
    volume: '0.35',
    thumbnailUrl: null,
  }
];

const samplePlaylists = [
  {
    name: 'Stress Relief',
    description: 'Calming sounds to reduce stress and anxiety',
    moodContext: 'stressed',
    soundIds: [], // Will be populated after sounds are created
    isDefault: true,
    createdBy: null,
  },
  {
    name: 'Sleep Aid',
    description: 'Peaceful sounds to help you fall asleep',
    moodContext: 'tired',
    soundIds: [],
    isDefault: true,
    createdBy: null,
  },
  {
    name: 'Focus & Concentration',
    description: 'Background sounds for better concentration',
    moodContext: 'focused',
    soundIds: [],
    isDefault: true,
    createdBy: null,
  },
  {
    name: 'Meditation & Mindfulness',
    description: 'Sounds for meditation and mindful moments',
    moodContext: 'calm',
    soundIds: [],
    isDefault: true,
    createdBy: null,
  }
];

export async function seedSounds() {
  console.log('Seeding sound library...');
  
  try {
    // Insert sample sounds
    const createdSounds = [];
    for (const sound of sampleSounds) {
      const [createdSound] = await db.insert(soundLibrary).values({
        ...sound,
        id: nanoid(),
      }).returning();
      createdSounds.push(createdSound);
    }
    
    console.log(`Created ${createdSounds.length} sounds`);

    // Create playlists with appropriate sound IDs
    for (const playlist of samplePlaylists) {
      let relevantSounds: string[] = [];
      
      switch (playlist.moodContext) {
        case 'stressed':
          relevantSounds = createdSounds
            .filter(s => s.moodTags.includes('stressed') || s.moodTags.includes('calm'))
            .map(s => s.id)
            .slice(0, 4);
          break;
        case 'tired':
          relevantSounds = createdSounds
            .filter(s => s.moodTags.includes('tired') || s.category === 'sleep')
            .map(s => s.id)
            .slice(0, 4);
          break;
        case 'focused':
          relevantSounds = createdSounds
            .filter(s => s.moodTags.includes('focused') || s.category === 'focus')
            .map(s => s.id)
            .slice(0, 3);
          break;
        case 'calm':
          relevantSounds = createdSounds
            .filter(s => s.moodTags.includes('calm') || s.category === 'meditation')
            .map(s => s.id)
            .slice(0, 4);
          break;
      }

      await db.insert(soundPlaylists).values({
        ...playlist,
        id: nanoid(),
        soundIds: relevantSounds,
      });
    }
    
    console.log(`Created ${samplePlaylists.length} playlists`);
    console.log('Sound library seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding sound library:', error);
    throw error;
  }
}

// Run the seeding function
seedSounds()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });