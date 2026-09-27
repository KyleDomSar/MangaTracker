import type { Arc, StoryEvent, Character, Location } from '../models/types';

// CURATED DEMO DATA - Story Timeline
// This data is manually curated for demonstration purposes.
// It is clearly labeled as demo data and not sourced from any official API.
// In production, this would come from a backend database or community contributions.

export interface SeriesTimeline {
  seriesId: number;
  seriesTitle: string;
  arcs: Arc[];
  events: StoryEvent[];
  characters: Character[];
  locations: Location[];
}

export const DEMO_TIMELINE_DATA: Record<number, SeriesTimeline> = {
  // Solo Leveling (AniList ID: 56516)
  56516: {
    seriesId: 56516,
    seriesTitle: 'Solo Leveling',
    arcs: [
      {
        id: 'sl-arc-1',
        seriesId: 56516,
        title: 'Double Dungeon Arc',
        description: 'Sung Jin-Woo faces the terrifying Double Dungeon and receives the System.',
        startChapter: 1,
        endChapter: 3,
        order: 1,
      },
      {
        id: 'sl-arc-2',
        seriesId: 56516,
        title: 'Reawakening Arc',
        description: 'Jin-Woo discovers his new abilities and begins his journey as a player.',
        startChapter: 4,
        endChapter: 15,
        order: 2,
      },
      {
        id: 'sl-arc-3',
        seriesId: 56516,
        title: 'Dungeon & Raid Arc',
        description: 'Jin-Woo starts taking on dungeons and raids with other hunters.',
        startChapter: 16,
        endChapter: 35,
        order: 3,
      },
      {
        id: 'sl-arc-4',
        seriesId: 56516,
        title: 'Red Gate Arc',
        description: 'A mysterious red gate traps hunters in an alternate dungeon.',
        startChapter: 36,
        endChapter: 50,
        order: 4,
      },
      {
        id: 'sl-arc-5',
        seriesId: 56516,
        title: 'Job Change Quest Arc',
        description: 'Jin-Woo completes a special quest to change his class.',
        startChapter: 51,
        endChapter: 65,
        order: 5,
      },
    ],
    events: [
      {
        id: 'sl-event-1',
        arcId: 'sl-arc-1',
        seriesId: 56516,
        title: 'The Double Dungeon Incident',
        description: 'Sung Jin-Woo and his party explore a low-rank dungeon that hides a terrifying secret — a Double Dungeon with powerful statues that come to life.',
        chapter: 1,
        characters: ['Sung Jin-Woo', 'Song Chi-Yi'],
        location: 'Double Dungeon',
        importance: 'MAJOR',
        spoilerLevel: 0,
      },
      {
        id: 'sl-event-2',
        arcId: 'sl-arc-1',
        seriesId: 56516,
        title: 'The System Appears',
        description: 'On the brink of death, Jin-Woo receives a mysterious message — "You have met the requirements to become a Player." The System is born.',
        chapter: 3,
        characters: ['Sung Jin-Woo'],
        location: 'Double Dungeon',
        importance: 'MAJOR',
        spoilerLevel: 0,
      },
      {
        id: 'sl-event-3',
        arcId: 'sl-arc-2',
        seriesId: 56516,
        title: 'Daily Quest Begins',
        description: 'Jin-Woo receives his first daily quest: 100 push-ups, 100 sit-ups, 100 squats, and 10km run. Failure means being sent to a penalty zone.',
        chapter: 5,
        characters: ['Sung Jin-Woo'],
        location: 'Seoul',
        importance: 'MINOR',
        spoilerLevel: 0,
      },
      {
        id: 'sl-event-4',
        arcId: 'sl-arc-2',
        seriesId: 56516,
        title: 'Penalty Zone Survival',
        description: 'Failing to complete the daily quest, Jin-Woo is transported to a desert filled with giant centipedes. He must survive for 4 hours.',
        chapter: 8,
        characters: ['Sung Jin-Woo'],
        location: 'Penalty Zone',
        importance: 'MAJOR',
        spoilerLevel: 0,
      },
      {
        id: 'sl-event-5',
        arcId: 'sl-arc-2',
        seriesId: 56516,
        title: 'First Level-Up',
        description: 'After weeks of completing daily quests, Jin-Woo finally levels up for the first time, gaining stat points and a sense of his potential.',
        chapter: 12,
        characters: ['Sung Jin-Woo'],
        location: 'Seoul',
        importance: 'MAJOR',
        spoilerLevel: 1,
      },
      {
        id: 'sl-event-6',
        arcId: 'sl-arc-3',
        seriesId: 56516,
        title: 'Instant Dungeon',
        description: 'Jin-Woo discovers an instant dungeon in his home and enters it alone, facing increasingly dangerous monsters.',
        chapter: 17,
        characters: ['Sung Jin-Woo'],
        location: 'Instant Dungeon',
        importance: 'MINOR',
        spoilerLevel: 1,
      },
      {
        id: 'sl-event-7',
        arcId: 'sl-arc-4',
        seriesId: 56516,
        title: 'The Red Gate',
        description: 'A mysterious red gate appears, trapping Jin-Woo and other hunters inside. They must work together to survive and find the boss.',
        chapter: 36,
        characters: ['Sung Jin-Woo', 'Choi Jong-In'],
        location: 'Red Gate',
        importance: 'ARC_START',
        spoilerLevel: 2,
      },
      {
        id: 'sl-event-8',
        arcId: 'sl-arc-5',
        seriesId: 56516,
        title: 'Job Change Quest',
        description: 'Jin-Woo receives a special quest that will determine his future class. He must survive a series of deadly trials.',
        chapter: 51,
        characters: ['Sung Jin-Woo'],
        location: 'Job Change Dungeon',
        importance: 'ARC_START',
        spoilerLevel: 3,
      },
    ],
    characters: [
      {
        id: 'sl-char-1',
        seriesId: 56516,
        name: 'Sung Jin-Woo',
        image: null,
        description: 'The protagonist. Initially known as the weakest hunter, he gains the unique ability to level up through the System.',
        firstAppearance: 1,
      },
      {
        id: 'sl-char-2',
        seriesId: 56516,
        name: 'Song Chi-Yi',
        image: null,
        description: 'A member of Jin-Woo\'s initial party during the Double Dungeon incident.',
        firstAppearance: 1,
      },
      {
        id: 'sl-char-3',
        seriesId: 56516,
        name: 'Choi Jong-In',
        image: null,
        description: 'An S-Rank hunter who encounters Jin-Woo during the Red Gate incident.',
        firstAppearance: 36,
      },
    ],
    locations: [
      {
        id: 'sl-loc-1',
        seriesId: 56516,
        name: 'Double Dungeon',
        description: 'A hidden dungeon within a low-rank gate containing terrifying statues that come to life.',
        relatedEvents: ['sl-event-1', 'sl-event-2'],
      },
      {
        id: 'sl-loc-2',
        seriesId: 56516,
        name: 'Seoul',
        description: 'The main city where hunters operate and gates appear.',
        relatedEvents: ['sl-event-3', 'sl-event-5'],
      },
      {
        id: 'sl-loc-3',
        seriesId: 56516,
        name: 'Penalty Zone',
        description: 'A harsh desert dimension where players are sent for failing daily quests.',
        relatedEvents: ['sl-event-4'],
      },
      {
        id: 'sl-loc-4',
        seriesId: 56516,
        name: 'Red Gate',
        description: 'A mysterious gate that traps hunters inside and cannot be exited until the boss is defeated.',
        relatedEvents: ['sl-event-7'],
      },
    ],
  },

  // Tower of God (AniList ID: 14890)
  14890: {
    seriesId: 14890,
    seriesTitle: 'Tower of God',
    arcs: [
      {
        id: 'tog-arc-1',
        seriesId: 14890,
        title: 'Season 1: The Floor of Tests',
        description: 'Twenty-Fifth Bam enters the Tower to find his friend Rachel and faces the first tests.',
        startChapter: 1,
        endChapter: 20,
        order: 1,
      },
      {
        id: 'tog-arc-2',
        seriesId: 14890,
        title: 'Season 1: Workshop Battle',
        description: 'Bam and his team face challenges in the Workshop Battle.',
        startChapter: 21,
        endChapter: 40,
        order: 2,
      },
    ],
    events: [
      {
        id: 'tog-event-1',
        arcId: 'tog-arc-1',
        seriesId: 14890,
        title: 'Bam Enters the Tower',
        description: 'Twenty-Fifth Bam, who has lived his entire life in a dark cave, enters the Tower to follow his friend Rachel.',
        chapter: 1,
        characters: ['Twenty-Fifth Bam', 'Rachel'],
        location: 'The Tower Entrance',
        importance: 'MAJOR',
        spoilerLevel: 0,
      },
      {
        id: 'tog-event-2',
        arcId: 'tog-arc-1',
        seriesId: 14890,
        title: 'The Headon Test',
        description: 'Bam faces the first test administered by Headon, the guardian of the First Floor.',
        chapter: 5,
        characters: ['Twenty-Fifth Bam', 'Headon'],
        location: 'First Floor - Hidden Floor',
        importance: 'MAJOR',
        spoilerLevel: 0,
      },
      {
        id: 'tog-event-3',
        arcId: 'tog-arc-2',
        seriesId: 14890,
        title: 'Workshop Battle Begins',
        description: 'Teams compete in the Workshop Battle, a tournament-style test on the Second Floor.',
        chapter: 21,
        characters: ['Twenty-Fifth Bam', 'Khun', 'Rak'],
        location: 'Second Floor - Workshop',
        importance: 'ARC_START',
        spoilerLevel: 1,
      },
    ],
    characters: [
      {
        id: 'tog-char-1',
        seriesId: 14890,
        name: 'Twenty-Fifth Bam',
        image: null,
        description: 'The protagonist who enters the Tower to find Rachel. He possesses mysterious powers.',
        firstAppearance: 1,
      },
      {
        id: 'tog-char-2',
        seriesId: 14890,
        name: 'Rachel',
        image: null,
        description: 'Bam\'s closest friend who entered the Tower first. Her true motivations are mysterious.',
        firstAppearance: 1,
      },
      {
        id: 'tog-char-3',
        seriesId: 14890,
        name: 'Khun Aguero Agnis',
        image: null,
        description: 'A clever and strategic Regular who becomes Bam\'s close ally.',
        firstAppearance: 8,
      },
    ],
    locations: [
      {
        id: 'tog-loc-1',
        seriesId: 14890,
        name: 'The Tower',
        description: 'A massive structure where all desires can be fulfilled. Each floor presents new challenges.',
        relatedEvents: ['tog-event-1'],
      },
      {
        id: 'tog-loc-2',
        seriesId: 14890,
        name: 'First Floor',
        description: 'The entrance floor of the Tower, guarded by Headon.',
        relatedEvents: ['tog-event-2'],
      },
    ],
  },

  // Omniscient Reader's Viewpoint (AniList ID: 126548)
  126548: {
    seriesId: 126548,
    seriesTitle: 'Omniscient Reader\'s Viewpoint',
    arcs: [
      {
        id: 'orv-arc-1',
        seriesId: 126548,
        title: 'Demon King Selection Arc',
        description: 'The world transforms as the scenarios begin. Kim Dokja must survive as the only reader of the novel.',
        startChapter: 1,
        endChapter: 15,
        order: 1,
      },
      {
        id: 'orv-arc-2',
        seriesId: 126548,
        title: 'Goblin Dungeon Arc',
        description: 'Survivors face their first major scenario in a dungeon filled with dangers.',
        startChapter: 16,
        endChapter: 30,
        order: 2,
      },
    ],
    events: [
      {
        id: 'orv-event-1',
        arcId: 'orv-arc-1',
        seriesId: 126548,
        title: 'The World Ends',
        description: 'Kim Dokja, the sole reader of "Three Ways to Survive the Apocalypse," watches as the novel\'s events begin to manifest in reality.',
        chapter: 1,
        characters: ['Kim Dokja'],
        location: 'Seoul',
        importance: 'MAJOR',
        spoilerLevel: 0,
      },
      {
        id: 'orv-event-2',
        arcId: 'orv-arc-1',
        seriesId: 126548,
        title: 'First Scenario: Proof of Value',
        description: 'The Dokkaebi announces the first scenario — survivors must prove their value or face elimination.',
        chapter: 3,
        characters: ['Kim Dokja', 'Dokkaebi'],
        location: 'Seoul Subway',
        importance: 'MAJOR',
        spoilerLevel: 0,
      },
      {
        id: 'orv-event-3',
        arcId: 'orv-arc-2',
        seriesId: 126548,
        title: 'Meeting Yoo Joonghyuk',
        description: 'Kim Dokja encounters the novel\'s protagonist, Yoo Joonghyuk, in person for the first time.',
        chapter: 16,
        characters: ['Kim Dokja', 'Yoo Joonghyuk'],
        location: 'Seoul',
        importance: 'MAJOR',
        spoilerLevel: 1,
      },
    ],
    characters: [
      {
        id: 'orv-char-1',
        seriesId: 126548,
        name: 'Kim Dokja',
        image: null,
        description: 'The sole reader of a web novel that becomes reality. He uses his knowledge of the story to survive.',
        firstAppearance: 1,
      },
      {
        id: 'orv-char-2',
        seriesId: 126548,
        name: 'Yoo Joonghyuk',
        image: null,
        description: 'The protagonist of the original novel. A powerful regressor on his third turn.',
        firstAppearance: 16,
      },
    ],
    locations: [
      {
        id: 'orv-loc-1',
        seriesId: 126548,
        name: 'Seoul',
        description: 'The city where the apocalypse begins, now filled with scenarios and monsters.',
        relatedEvents: ['orv-event-1', 'orv-event-3'],
      },
      {
        id: 'orv-loc-2',
        seriesId: 126548,
        name: 'Seoul Subway',
        description: 'Where the first scenario takes place, with survivors trapped underground.',
        relatedEvents: ['orv-event-2'],
      },
    ],
  },
};

// Helper functions
export function getTimelineForSeries(seriesId: number): SeriesTimeline | null {
  return DEMO_TIMELINE_DATA[seriesId] || null;
}

export function getEventsForSeries(seriesId: number): StoryEvent[] {
  const timeline = DEMO_TIMELINE_DATA[seriesId];
  return timeline?.events || [];
}

export function getArcsForSeries(seriesId: number): Arc[] {
  const timeline = DEMO_TIMELINE_DATA[seriesId];
  return timeline?.arcs || [];
}

export function getCharactersForSeries(seriesId: number): Character[] {
  const timeline = DEMO_TIMELINE_DATA[seriesId];
  return timeline?.characters || [];
}

export function getLocationsForSeries(seriesId: number): Location[] {
  const timeline = DEMO_TIMELINE_DATA[seriesId];
  return timeline?.locations || [];
}

export function getEventById(seriesId: number, eventId: string): StoryEvent | null {
  const timeline = DEMO_TIMELINE_DATA[seriesId];
  return timeline?.events.find((e) => e.id === eventId) || null;
}

export function getArcById(seriesId: number, arcId: string): Arc | null {
  const timeline = DEMO_TIMELINE_DATA[seriesId];
  return timeline?.arcs.find((a) => a.id === arcId) || null;
}

export function hasTimelineData(seriesId: number): boolean {
  return seriesId in DEMO_TIMELINE_DATA;
}

export function getSeriesWithTimelines(): number[] {
  return Object.keys(DEMO_TIMELINE_DATA).map(Number);
}
