/**
 * Sthira — Ekadashi & Spiritual Fasting Service
 * Provides precise Panchang-aligned Ekadashi calendar dates (2026–2027),
 * countdown calculations, and athletic fasting guidance for Jay's lean bulk regimen.
 */

export interface EkadashiEvent {
  date: string; // YYYY-MM-DD
  name: string;
  paksha: 'Krishna' | 'Shukla';
  significance: string;
  paranaDate?: string;
  recommendedActivity: string;
  nutritionTip: string;
}

export const EKADASHI_CALENDAR: EkadashiEvent[] = [
  // 2026
  {
    date: '2026-01-14',
    name: 'Shattila Ekadashi',
    paksha: 'Krishna',
    significance: 'Uses sesame seeds for cleansing and charity.',
    recommendedActivity: 'Light stretching or gentle yoga flow',
    nutritionTip: 'Phalahar with sesame seeds, fruits, and warm herbal water.',
  },
  {
    date: '2026-01-29',
    name: 'Jaya Ekadashi',
    paksha: 'Shukla',
    significance: 'Removes negative karmic baggage and elevates mental clarity.',
    recommendedActivity: 'Rest or 20-min mindful walking',
    nutritionTip: 'Fresh fruit bowl, coconut water, makhana (fox nuts).',
  },
  {
    date: '2026-02-13',
    name: 'Vijaya Ekadashi',
    paksha: 'Krishna',
    significance: 'Bestows victory over internal obstacles and mental lethargy.',
    recommendedActivity: 'Joint mobility & pranayama breathing',
    nutritionTip: 'Boiled sweet potato, fruits, soaked almonds.',
  },
  {
    date: '2026-02-27',
    name: 'Amalaki Ekadashi',
    paksha: 'Shukla',
    significance: 'Honors the sacred Amla tree, powerhouse of rejuvenation.',
    recommendedActivity: 'Active rest or restorative mobility',
    nutritionTip: 'Amla juice/fruit, coconut water, fresh fruits, curd.',
  },
  {
    date: '2026-03-15',
    name: 'Papamochani Ekadashi',
    paksha: 'Krishna',
    significance: 'Liberates the mind from guilt and past errors.',
    recommendedActivity: 'Gentle walk & recovery breathing',
    nutritionTip: 'Hydrate with lemon water, fresh papaya, apple slices.',
  },
  {
    date: '2026-03-29',
    name: 'Kamada Ekadashi',
    paksha: 'Shukla',
    significance: 'Chaitra Shukla Ekadashi fulfilling noble inner aspirations.',
    recommendedActivity: 'Full physical rest day',
    nutritionTip: 'Sabudana / fruit phalahar, tender coconut water.',
  },
  {
    date: '2026-04-13',
    name: 'Varuthini Ekadashi',
    paksha: 'Krishna',
    significance: 'Brings protective energy, good fortune, and bodily vigor.',
    recommendedActivity: '30-min low-intensity walk',
    nutritionTip: 'Watermelon, muskmelon, electrolytes.',
  },
  {
    date: '2026-04-27',
    name: 'Mohini Ekadashi',
    paksha: 'Shukla',
    significance: 'Frees from attachment and excessive cravings.',
    recommendedActivity: 'Yoga nidra & mobility flow',
    nutritionTip: 'Phalahar: bananas, apples, soaked walnuts and seeds.',
  },
  {
    date: '2026-05-13',
    name: 'Apara Ekadashi',
    paksha: 'Krishna',
    significance: 'Endows limitless merit and digestive purification.',
    recommendedActivity: 'Active rest or gentle stroll',
    nutritionTip: 'Cucumber, tender coconut water, roasted makhana.',
  },
  {
    date: '2026-05-27',
    name: 'Padmini Ekadashi',
    paksha: 'Shukla',
    significance: 'Adhik Maas auspicious Ekadashi for deep devotion.',
    recommendedActivity: 'Meditation & gentle spinal decompression',
    nutritionTip: 'Fruit-based fasting, rock salt (sendha namak) fruits.',
  },
  {
    date: '2026-06-11',
    name: 'Parama Ekadashi',
    paksha: 'Krishna',
    significance: 'Adhik Maas Ekadashi granting spiritual and physical renewal.',
    recommendedActivity: 'Rest from heavy gym lifts',
    nutritionTip: 'Coconut water, seasonal fruits, lemon water with mint.',
  },
  {
    date: '2026-06-25',
    name: 'Nirjala Ekadashi',
    paksha: 'Shukla',
    significance: 'The king of Ekadashis (Jyeshtha Shukla); profound detox.',
    recommendedActivity: 'Strict rest day, avoid strenuous workouts',
    nutritionTip: 'Water fast or water & electrolytes only.',
  },
  {
    date: '2026-07-10',
    name: 'Yogini Ekadashi',
    paksha: 'Krishna',
    significance: 'Cures physical ailments and restores cellular homeostasis.',
    recommendedActivity: 'Yoga asanas and joint circles',
    nutritionTip: 'Papaya, pomegranate, warm water with rock salt.',
  },
  {
    date: '2026-07-25',
    name: 'Devshayani Ekadashi',
    paksha: 'Shukla',
    significance: 'Commencement of Chaturmas; spiritual introspection.',
    recommendedActivity: 'Gentle mobility and core breathwork',
    nutritionTip: 'Light satvik phalahar, boiled potatoes with cumin.',
  },
  {
    date: '2026-08-09',
    name: 'Kamika Ekadashi',
    paksha: 'Krishna',
    significance: 'Shravana month Krishna Ekadashi granting spiritual bliss.',
    recommendedActivity: 'Rest from heavy resistance training',
    nutritionTip: 'Fresh fruits, milk or almond milk, roasted seeds.',
  },
  {
    date: '2026-08-23',
    name: 'Shravana Putrada Ekadashi',
    paksha: 'Shukla',
    significance: 'Shravana Shukla Ekadashi bringing prosperity.',
    recommendedActivity: 'Light walking or evening yoga',
    nutritionTip: 'Fresh seasonal fruits, tender coconut, curd/buttermilk.',
  },
  {
    date: '2026-09-07',
    name: 'Aja Ekadashi',
    paksha: 'Krishna',
    significance: 'Bhadrapada Krishna Ekadashi cleansing mind and senses.',
    recommendedActivity: 'Gentle walk, spinal mobility',
    nutritionTip: 'Apple, pear, electrolyte-rich lemon water.',
  },
  {
    date: '2026-09-22',
    name: 'Parsva Ekadashi',
    paksha: 'Shukla',
    significance: 'Lord Vishnu changes sides in Yogic sleep (Vamana Jayanti).',
    recommendedActivity: 'Active recovery, parasympathetic breathing',
    nutritionTip: 'Phalahar: fruits, makhana, sweet potato.',
  },
  {
    date: '2026-10-06',
    name: 'Indira Ekadashi',
    paksha: 'Krishna',
    significance: 'Pitru Paksha Ekadashi offering peace to ancestors.',
    recommendedActivity: 'Rest day or gentle evening walk',
    nutritionTip: 'Light phalahar, bananas, soaked almonds.',
  },
  {
    date: '2026-10-21',
    name: 'Pashankusha Ekadashi',
    paksha: 'Shukla',
    significance: 'Ashwina Shukla Ekadashi controlling senses like an elephant goad.',
    recommendedActivity: 'Rest from heavy lifting, prioritize prayer & mobility',
    nutritionTip: 'Phalahar: fruits, roasted makhana, coconut water.',
  },
  {
    date: '2026-10-22',
    name: 'Pashankusha Ekadashi (Parana)',
    paksha: 'Shukla',
    significance: 'Fast-breaking day (Parana morning) & Vaishnava observance.',
    recommendedActivity: 'Light morning walk, resume regular routine after Parana',
    nutritionTip: 'Break fast with light fruit, warm water, and gentle meal.',
  },
  {
    date: '2026-11-05',
    name: 'Rama Ekadashi',
    paksha: 'Krishna',
    significance: 'Kartika Krishna Ekadashi before Diwali bringing light and prosperity.',
    recommendedActivity: 'Skip heavy gym compound lifts, focus on yoga & meditation',
    nutritionTip: 'Satvik phalahar, fresh fruits, curd, coconut water, makhana.',
  },
  {
    date: '2026-11-20',
    name: 'Devutthana / Prabodhini Ekadashi',
    paksha: 'Shukla',
    significance: 'Awakening of the Divine; conclusion of Chaturmas.',
    recommendedActivity: 'Full rest or gentle evening walk',
    nutritionTip: 'Sugarcane, water chestnut (singhara), fruits, warm milk.',
  },
  {
    date: '2026-12-04',
    name: 'Utpanna Ekadashi',
    paksha: 'Krishna',
    significance: 'Birth of Goddess Ekadashi; foundational spiritual fasting.',
    recommendedActivity: 'Joint mobility, deep stretching',
    nutritionTip: 'Seasonal fruits, warm herbal water, soaked nuts.',
  },
  {
    date: '2026-12-20',
    name: 'Mokshada Ekadashi (Gita Jayanti)',
    paksha: 'Shukla',
    significance: 'Liberation of consciousness and advent of the Bhagavad Gita.',
    recommendedActivity: 'Gentle walking and reflection; skip heavy lifting',
    nutritionTip: 'Phalahar, warm ginger-lemon water, fresh seasonal fruits.',
  },

  // 2027
  {
    date: '2027-01-03',
    name: 'Saphala Ekadashi',
    paksha: 'Krishna',
    significance: 'Pausha Krishna Ekadashi making all noble efforts fruitful.',
    recommendedActivity: 'Rest from heavy training',
    nutritionTip: 'Tender coconut, pomegranates, roasted makhana.',
  },
  {
    date: '2027-01-18',
    name: 'Pausha Putrada Ekadashi',
    paksha: 'Shukla',
    significance: 'Fulfills inner purpose and brings auspicious family harmony.',
    recommendedActivity: 'Gentle mobility & breathwork',
    nutritionTip: 'Fruit-rich phalahar, curd, soaked almonds.',
  },
  {
    date: '2027-02-02',
    name: 'Shattila Ekadashi',
    paksha: 'Krishna',
    significance: 'Purification through sesame seeds and winter nourishing fruits.',
    recommendedActivity: 'Active rest or gentle walk',
    nutritionTip: 'Sesame-infused phalahar, bananas, warm water.',
  },
  {
    date: '2027-02-17',
    name: 'Jaya Ekadashi',
    paksha: 'Shukla',
    significance: 'Victory over negative thought patterns and lethargy.',
    recommendedActivity: 'Light stretching or yoga flow',
    nutritionTip: 'Apples, oranges, coconut water.',
  },
  {
    date: '2027-03-03',
    name: 'Vijaya Ekadashi',
    paksha: 'Krishna',
    significance: 'Overcomes obstacles with inner calm and discipline.',
    recommendedActivity: 'Rest day from gym',
    nutritionTip: 'Boiled sweet potato, fresh fruits, lime water.',
  },
  {
    date: '2027-03-18',
    name: 'Amalaki Ekadashi',
    paksha: 'Shukla',
    significance: 'Celebration of Amla and immune system rejuvenation.',
    recommendedActivity: 'Gentle mobility flow',
    nutritionTip: 'Amla, citrus fruits, coconut water.',
  },
  {
    date: '2027-04-02',
    name: 'Papamochani Ekadashi',
    paksha: 'Krishna',
    significance: 'Relief from physical fatigue and mental clutter.',
    recommendedActivity: 'Light walking, restorative rest',
    nutritionTip: 'Fresh watermelon, papaya, electrolytes.',
  },
  {
    date: '2027-04-17',
    name: 'Kamada Ekadashi',
    paksha: 'Shukla',
    significance: 'Bestower of pure vitality and focused willpower.',
    recommendedActivity: 'Rest day',
    nutritionTip: 'Seasonal fruits, sabudana phalahar, coconut water.',
  },
  {
    date: '2027-05-01',
    name: 'Varuthini Ekadashi',
    paksha: 'Krishna',
    significance: 'Shield of health, vitality, and digestive reset.',
    recommendedActivity: 'Active recovery stroll',
    nutritionTip: 'Hydrate generously, rock salt fruits.',
  },
  {
    date: '2027-05-16',
    name: 'Mohini Ekadashi',
    paksha: 'Shukla',
    significance: 'Freedom from emotional agitation and sensory cravings.',
    recommendedActivity: 'Pranayama and light stretching',
    nutritionTip: 'Fresh fruits, tender coconut water.',
  },
  {
    date: '2027-05-31',
    name: 'Apara Ekadashi',
    paksha: 'Krishna',
    significance: 'Limitless rejuvenation and metabolic cleanse.',
    recommendedActivity: 'Gentle stroll, rest from lifting',
    nutritionTip: 'Cucumber, watermelon, mint-lemon water.',
  },
  {
    date: '2027-06-14',
    name: 'Nirjala Ekadashi',
    paksha: 'Shukla',
    significance: 'Waterless austerity day; ultimate annual reset.',
    recommendedActivity: 'Strict rest; no workouts',
    nutritionTip: 'Complete fast or water & minerals only.',
  },
  {
    date: '2027-06-30',
    name: 'Yogini Ekadashi',
    paksha: 'Krishna',
    significance: 'Cellular rejuvenation and bodily harmony.',
    recommendedActivity: 'Yoga flow and hip openers',
    nutritionTip: 'Papaya, pomegranate, warm water.',
  },
  {
    date: '2027-07-14',
    name: 'Devshayani Ekadashi',
    paksha: 'Shukla',
    significance: 'Beginning of Chaturmas.',
    recommendedActivity: 'Gentle mobility and breathwork',
    nutritionTip: 'Light satvik phalahar, curd, fruits.',
  },
  {
    date: '2027-08-08',
    name: 'Kamika Ekadashi',
    paksha: 'Krishna',
    significance: 'Shravana month devotional fasting.',
    recommendedActivity: 'Rest day from gym',
    nutritionTip: 'Seasonal fruits, warm milk, roasted makhana.',
  },
  {
    date: '2027-08-22',
    name: 'Shravana Putrada Ekadashi',
    paksha: 'Shukla',
    significance: 'Brings mental peace and emotional grounding.',
    recommendedActivity: 'Light walk or stretching',
    nutritionTip: 'Fresh fruits, buttermilk, tender coconut.',
  },
  {
    date: '2027-09-06',
    name: 'Aja Ekadashi',
    paksha: 'Krishna',
    significance: 'Cleanses senses and digestive tract.',
    recommendedActivity: 'Joint mobility, gentle stroll',
    nutritionTip: 'Apples, pears, lemon water.',
  },
  {
    date: '2027-09-21',
    name: 'Parsva Ekadashi',
    paksha: 'Shukla',
    significance: 'Mid-Chaturmas auspicious turn.',
    recommendedActivity: 'Active recovery, deep breathing',
    nutritionTip: 'Phalahar: fruits, roasted seeds, sweet potato.',
  },
  {
    date: '2027-10-06',
    name: 'Indira Ekadashi',
    paksha: 'Krishna',
    significance: 'Ancestral homage and internal quietude.',
    recommendedActivity: 'Rest day',
    nutritionTip: 'Bananas, soaked nuts, light fruits.',
  },
  {
    date: '2027-10-20',
    name: 'Pashankusha Ekadashi',
    paksha: 'Shukla',
    significance: 'Mastery over the senses and digestive renewal.',
    recommendedActivity: 'Gentle walk & recovery breathing',
    nutritionTip: 'Phalahar: fruits, makhana, coconut water.',
  },
  {
    date: '2027-11-04',
    name: 'Rama Ekadashi',
    paksha: 'Krishna',
    significance: 'Kartika auspiciousness before Diwali.',
    recommendedActivity: 'Skip heavy compound lifting, practice yoga',
    nutritionTip: 'Satvik phalahar, curd, fresh fruits, coconut water.',
  },
  {
    date: '2027-11-19',
    name: 'Devutthana / Prabodhini Ekadashi',
    paksha: 'Shukla',
    significance: 'Conclusion of Chaturmas; spiritual dawn.',
    recommendedActivity: 'Full rest or light evening walk',
    nutritionTip: 'Sugarcane, water chestnut, fresh fruits.',
  },
  {
    date: '2027-12-04',
    name: 'Utpanna Ekadashi',
    paksha: 'Krishna',
    significance: 'Foundational spiritual energy renewal.',
    recommendedActivity: 'Gentle stretching, yoga nidra',
    nutritionTip: 'Seasonal fruits, warm herbal tea, soaked nuts.',
  },
  {
    date: '2027-12-20',
    name: 'Mokshada Ekadashi',
    paksha: 'Shukla',
    significance: 'Gita Jayanti day of wisdom and liberation.',
    recommendedActivity: 'Gentle walk and meditation',
    nutritionTip: 'Phalahar, warm ginger water, seasonal fruits.',
  },
];

export interface EkadashiStatus {
  isToday: boolean;
  todayEvent: EkadashiEvent | null;
  isTomorrow: boolean;
  tomorrowEvent: EkadashiEvent | null;
  nextEvent: EkadashiEvent;
  daysUntilNext: number;
  upcomingEvents: EkadashiEvent[];
}

/**
 * Calculates current Ekadashi status for any given date string (YYYY-MM-DD).
 * If no date passed, defaults to the current day.
 */
export function getEkadashiStatus(referenceDateStr?: string): EkadashiStatus {
  let refDate: Date;
  if (referenceDateStr) {
    const [y, m, d] = referenceDateStr.split('-').map(Number);
    refDate = new Date(y, m - 1, d);
  } else {
    refDate = new Date();
  }
  refDate.setHours(0, 0, 0, 0);

  const todayStr = [
    refDate.getFullYear(),
    String(refDate.getMonth() + 1).padStart(2, '0'),
    String(refDate.getDate()).padStart(2, '0'),
  ].join('-');

  const tomorrow = new Date(refDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = [
    tomorrow.getFullYear(),
    String(tomorrow.getMonth() + 1).padStart(2, '0'),
    String(tomorrow.getDate()).padStart(2, '0'),
  ].join('-');

  // Check if today or tomorrow is Ekadashi
  const todayEvent = EKADASHI_CALENDAR.find((e) => e.date === todayStr) || null;
  const tomorrowEvent = EKADASHI_CALENDAR.find((e) => e.date === tomorrowStr) || null;

  // Find next upcoming Ekadashi (today or in future)
  const futureEvents = EKADASHI_CALENDAR.filter((e) => e.date >= todayStr).sort(
    (a, b) => a.date.localeCompare(b.date)
  );

  const nextEvent = futureEvents.length > 0 ? futureEvents[0] : EKADASHI_CALENDAR[EKADASHI_CALENDAR.length - 1];

  // Days until next
  const [ny, nm, nd] = nextEvent.date.split('-').map(Number);
  const targetDate = new Date(ny, nm - 1, nd);
  targetDate.setHours(0, 0, 0, 0);
  const diffTime = targetDate.getTime() - refDate.getTime();
  const daysUntilNext = Math.max(0, Math.round(diffTime / (1000 * 60 * 60 * 24)));

  return {
    isToday: todayEvent !== null,
    todayEvent,
    isTomorrow: tomorrowEvent !== null,
    tomorrowEvent,
    nextEvent,
    daysUntilNext,
    upcomingEvents: futureEvents.slice(0, 5),
  };
}

/**
 * Formats date label for Ekadashi (e.g. "Thu, Nov 5, 2026")
 */
export function formatEkadashiDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  } catch {
    return dateStr;
  }
}
