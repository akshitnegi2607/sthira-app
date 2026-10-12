/**
 * Sthira — Exercise Media & Form Demonstration Registry
 * High-definition animated execution GIFs, start/finish position photos,
 * sports-science form cues, and tempo guidelines for beginners.
 */

export interface ExerciseMediaInfo {
  exerciseId: string;
  exerciseName: string;
  gifUrl: string;
  step0Url: string; // Starting setup position
  step1Url: string; // Peak contraction / finish position
  tempo: string; // e.g. "3-1-1-0" (eccentric - pause - concentric - pause)
  formCues: string[];
  beginnerTips: string;
  targetFocus: string;
}

export const EXERCISE_MEDIA_REGISTRY: Record<string, ExerciseMediaInfo> = {
  ex_chest_press_machine: {
    exerciseId: 'ex_chest_press_machine',
    exerciseName: 'Chest Press Machine',
    gifUrl: 'https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0577.gif',
    step0Url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Chest_Press/0.jpg',
    step1Url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Chest_Press/1.jpg',
    tempo: '2-0-1-0 (2s return, 1s press)',
    formCues: [
      'Adjust seat height so handles sit directly across your mid-chest.',
      'Pin your shoulder blades back against the seat before pressing.',
      'Press smoothly forward without locking your elbows violently.',
      'Control the 2-second return until you feel a comfortable stretch in your pecs.'
    ],
    beginnerTips: 'Avoid shrugging shoulders up toward your ears. Keep feet flat on the floor for stability.',
    targetFocus: 'Pectoralis Major & Front Deltoids'
  },
  ex_lat_pulldown: {
    exerciseId: 'ex_lat_pulldown',
    exerciseName: 'Lat Pulldown',
    gifUrl: 'https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/2330.gif',
    step0Url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Lat_Pulldown/0.jpg',
    step1Url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Lat_Pulldown/1.jpg',
    tempo: '2-1-1-0 (2s rise, 1s squeeze at chest)',
    formCues: [
      'Grip the bar just outside shoulder width with palms facing away.',
      'Lean back slightly (10–15°) and drive your elbows down toward your back pockets.',
      'Pull the bar down to touch your upper chest / collarbone.',
      'Let your arms fully stretch back up to the top while keeping tension on your lats.'
    ],
    beginnerTips: 'Do not swing your whole torso backward to yank the weight down. Focus on pulling with elbows, not biceps.',
    targetFocus: 'Lats (Back Width) & Upper Back'
  },
  ex_seated_cable_row: {
    exerciseId: 'ex_seated_cable_row',
    exerciseName: 'Seated Cable Row',
    gifUrl: 'https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0861.gif',
    step0Url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Cable_Rows/0.jpg',
    step1Url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Cable_Rows/1.jpg',
    tempo: '2-1-1-0 (2s release, 1s squeeze)',
    formCues: [
      'Sit tall with knees slightly bent; never lock knees completely.',
      'Pull handle toward your navel while keeping your chest up and proud.',
      'Squeeze your shoulder blades together like pinching a pencil between them.',
      'Return weight forward under control without rounding your lower back.'
    ],
    beginnerTips: 'Your torso should stay nearly stationary. Do not rock back and forth like a rowing boat.',
    targetFocus: 'Rhomboids, Lats & Mid-Back Thickness'
  },
  ex_db_shoulder_press: {
    exerciseId: 'ex_db_shoulder_press',
    exerciseName: 'Dumbbell Shoulder Press',
    gifUrl: 'https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0405.gif',
    step0Url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Shoulder_Press/0.jpg',
    step1Url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Shoulder_Press/1.jpg',
    tempo: '2-0-1-0 (2s descent, 1s overhead press)',
    formCues: [
      'Position bench upright or one notch back (~80 degrees).',
      'Keep elbows angled 30–45 degrees in front of your body (scapular plane).',
      'Press dumbbells overhead in a slight natural arc toward each other.',
      'Lower weights to ear level with complete control.'
    ],
    beginnerTips: 'Do not flare elbows straight out at 90 degrees, which pinches shoulder joints. Keep core braced.',
    targetFocus: 'Anterior & Lateral Deltoids'
  },
  ex_db_lateral_raise: {
    exerciseId: 'ex_db_lateral_raise',
    exerciseName: 'Dumbbell Lateral Raise',
    gifUrl: 'https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0334.gif',
    step0Url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Lateral_Raise/0.jpg',
    step1Url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Lateral_Raise/1.jpg',
    tempo: '2-1-1-0 (2s descent, 1s pause at top)',
    formCues: [
      'Maintain a slight bend in knees and elbows with a gentle forward lean.',
      'Raise dumbbells outward in the 30° scapular plane until parallel to the floor.',
      'Think of pouring water from pitchers at the top (thumbs neutral or slightly down).',
      'Lower weights smoothly over 2 seconds; do not drop them.'
    ],
    beginnerTips: 'Use lighter weights with clean form. Bouncing with hips robs the side delts of the stimulus.',
    targetFocus: 'Side Delts (Shoulder Width)'
  },
  ex_triceps_pushdown: {
    exerciseId: 'ex_triceps_pushdown',
    exerciseName: 'Triceps Cable Pushdown',
    gifUrl: 'https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0201.gif',
    step0Url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown/0.jpg',
    step1Url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown/1.jpg',
    tempo: '2-1-1-0 (2s release, 1s lockout squeeze)',
    formCues: [
      'Lock your upper arms and elbows firmly to the sides of your ribcage.',
      'Push the bar or rope down until your arms are straight.',
      'Hold and flex the triceps hard at full extension for 1 second.',
      'Control the return until your forearms are roughly parallel with the floor.'
    ],
    beginnerTips: 'Do not let your elbows drift forward or flare outwards. Your elbow joint is the sole hinge.',
    targetFocus: 'Triceps Brachii (All 3 Heads)'
  },
  ex_db_biceps_curl: {
    exerciseId: 'ex_db_biceps_curl',
    exerciseName: 'Dumbbell Biceps Curl',
    gifUrl: 'https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0294.gif',
    step0Url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Curl/0.jpg',
    step1Url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Curl/1.jpg',
    tempo: '2-1-1-0 (2s lowering, 1s curl)',
    formCues: [
      'Start with dumbbells at your sides, palms facing inwards.',
      'As you curl up, rotate your wrists (supination) so palms face your shoulders.',
      'Squeeze your biceps at the peak for 1 second.',
      'Lower under control for 2 seconds to full arm extension.'
    ],
    beginnerTips: 'Avoid swinging your torso or pulling elbows forward. Pure isolation creates arm growth.',
    targetFocus: 'Biceps Brachii'
  },
  ex_leg_press: {
    exerciseId: 'ex_leg_press',
    exerciseName: 'Leg Press',
    gifUrl: 'https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0739.gif',
    step0Url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press/0.jpg',
    step1Url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press/1.jpg',
    tempo: '3-0-1-0 (3s slow descent, 1s press)',
    formCues: [
      'Place feet shoulder-width apart in the center of the footplate.',
      'Keep your lower back and tailbone firmly pressed against the backrest.',
      'Lower sled smoothly until knees bend to roughly 90 degrees.',
      'Press through the mid-foot and heel to return to top without locking knees violently.'
    ],
    beginnerTips: 'CRITICAL: Never lock knees forcefully at the top. Never let your hips curl off the seat at the bottom.',
    targetFocus: 'Quadriceps, Glutes & Adductors'
  },
  ex_romanian_deadlift: {
    exerciseId: 'ex_romanian_deadlift',
    exerciseName: 'Romanian Deadlift',
    gifUrl: 'https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0085.gif',
    step0Url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Romanian_Deadlift/0.jpg',
    step1Url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Romanian_Deadlift/1.jpg',
    tempo: '3-1-1-0 (3s hinge back, 1s glute drive)',
    formCues: [
      'Stand tall, feet hip-width apart, holding weights close to thighs.',
      'Unlock knees slightly, then push your hips backwards like closing a door with your glutes.',
      'Slide the weights along your shins while keeping spine completely straight.',
      'When you feel a strong hamstring stretch (mid-shin), drive hips forward to stand.'
    ],
    beginnerTips: 'This is a HIP HINGE, not a squat. Your knees bend slightly but stay stationary while hips travel back.',
    targetFocus: 'Hamstrings & Gluteus Maximus'
  },
  ex_leg_curl: {
    exerciseId: 'ex_leg_curl',
    exerciseName: 'Leg Curl',
    gifUrl: 'https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0586.gif',
    step0Url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Leg_Curls/0.jpg',
    step1Url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Leg_Curls/1.jpg',
    tempo: '2-1-1-0 (2s lowering, 1s curl)',
    formCues: [
      'Lie face down on bench; adjust roller pad to rest just above your heels / Achilles tendon.',
      'Align knee joints directly with the machine pivot axis.',
      'Curl heels up toward your glutes smoothly and squeeze for 1 second.',
      'Lower the weight smoothly over 2–3 seconds without slamming the stack.'
    ],
    beginnerTips: 'Keep your hips glued to the bench pad. Avoid arching your lower back to yank the weight.',
    targetFocus: 'Hamstrings (Knee Flexion)'
  },
  ex_leg_extension: {
    exerciseId: 'ex_leg_extension',
    exerciseName: 'Leg Extension',
    gifUrl: 'https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0585.gif',
    step0Url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Extensions/0.jpg',
    step1Url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Extensions/1.jpg',
    tempo: '2-1-1-0 (2s lowering, 1s extension)',
    formCues: [
      'Set backrest so the backs of your knees sit comfortably against the seat edge.',
      'Position shin pad directly above your shoelaces / front ankles.',
      'Extend legs smoothly until straight, flexing quads hard at the top.',
      'Control the 2-second descent without letting weights crash.'
    ],
    beginnerTips: 'Hold the side handles firmly to prevent your hips from lifting out of the seat.',
    targetFocus: 'Quadriceps (Rectus Femoris & Vastus Muscles)'
  },
  ex_calf_raise: {
    exerciseId: 'ex_calf_raise',
    exerciseName: 'Calf Raise',
    gifUrl: 'https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0605.gif',
    step0Url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Seated_Calf_Raise/0.jpg',
    step1Url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Seated_Calf_Raise/1.jpg',
    tempo: '2-1-1-1 (2s drop, 1s deep stretch, 1s raise, 1s squeeze)',
    formCues: [
      'Place balls of feet on platform, heels hanging freely.',
      'Lower heels into a deep, full stretch and hold for 1 second.',
      'Drive up through the balls of big toes to full contraction.',
      'Hold at the very top for 1 full second to eliminate Achilles bounce recoil.'
    ],
    beginnerTips: 'Avoid fast bouncing. Calves respond best to slow eccentric control and a deliberate stretch pause.',
    targetFocus: 'Gastrocnemius & Soleus'
  },
  ex_plank_core: {
    exerciseId: 'ex_plank_core',
    exerciseName: 'Plank / Core Exercise',
    gifUrl: 'https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/2135.gif',
    step0Url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/0.jpg',
    step1Url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/1.jpg',
    tempo: 'Static hold (30–60s sustained)',
    formCues: [
      'Rest on forearms with elbows stacked directly beneath shoulders.',
      'Form a straight, rigid line from head to heels.',
      'Tuck pelvis slightly (posterior tilt) and squeeze glutes and abs hard.',
      'Maintain steady breathing without holding your breath.'
    ],
    beginnerTips: 'Never allow hips to sag downward, which stresses lower back. If fatigued, drop knees down for modified hold.',
    targetFocus: 'Transverse Abdominis & Deep Core Stability'
  },
  ex_incline_chest_press: {
    exerciseId: 'ex_incline_chest_press',
    exerciseName: 'Incline Chest Press',
    gifUrl: 'https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/1299.gif',
    step0Url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Incline_Chest_Press/0.jpg',
    step1Url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Incline_Chest_Press/1.jpg',
    tempo: '2-0-1-0 (2s lowering, 1s press)',
    formCues: [
      'Bench angle set at approximately 30 degrees (avoid steep 45° which stresses front delts).',
      'Plant feet flat and retract shoulder blades into pad.',
      'Press handles up and inward along machine arc.',
      'Lower under control to upper chest level with elbows tucked at 45 degrees.'
    ],
    beginnerTips: 'Keep chest high and proud throughout the movement to emphasize upper clavicular fibers.',
    targetFocus: 'Clavicular (Upper) Pectorals'
  },
  ex_one_arm_db_row: {
    exerciseId: 'ex_one_arm_db_row',
    exerciseName: 'One-Arm Dumbbell Row',
    gifUrl: 'https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0292.gif',
    step0Url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Dumbbell_Row/0.jpg',
    step1Url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Dumbbell_Row/1.jpg',
    tempo: '2-1-1-0 (2s lower, 1s row & squeeze)',
    formCues: [
      'Place supporting knee and hand flat on bench; other foot on floor for balance.',
      'Torso parallel to floor with spine neutral and core braced.',
      'Pull dumbbell back toward your hip pocket, leading with the elbow.',
      'Squeeze your lat at top for 1 second, then lower to full arm extension.'
    ],
    beginnerTips: 'Do not twist or rotate your spine to throw the dumbbell up. Keep shoulders square to the bench.',
    targetFocus: 'Latissimus Dorsi & Rhomboids'
  },
  ex_machine_shoulder_press: {
    exerciseId: 'ex_machine_shoulder_press',
    exerciseName: 'Machine Shoulder Press',
    gifUrl: 'https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0603.gif',
    step0Url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Shoulder_Press/0.jpg',
    step1Url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Shoulder_Press/1.jpg',
    tempo: '2-0-1-0 (2s lowering, 1s overhead press)',
    formCues: [
      'Adjust seat so handles are at or slightly above ear height.',
      'Sit with entire back and head supported against backrest.',
      'Press upward smoothly without locking elbows at the peak.',
      'Lower weight with 2-second eccentric control to ear level.'
    ],
    beginnerTips: 'Keep core tight and resist the urge to arch lower back off the pad.',
    targetFocus: 'Front & Side Deltoids'
  },
  ex_hammer_curl: {
    exerciseId: 'ex_hammer_curl',
    exerciseName: 'Hammer Curl',
    gifUrl: 'https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0313.gif',
    step0Url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hammer_Curls/0.jpg',
    step1Url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hammer_Curls/1.jpg',
    tempo: '2-1-1-0 (2s lowering, 1s curl)',
    formCues: [
      'Hold dumbbells with palms facing each other (neutral grip) throughout entire rep.',
      'Keep elbows pinned at sides with upper arms stationary.',
      'Curl dumbbells up toward shoulders and squeeze for 1 second.',
      'Lower slowly over 2 seconds to full extension.'
    ],
    beginnerTips: 'Neutral grip targets the brachialis muscle beneath your bicep, pushing arms to look thicker.',
    targetFocus: 'Brachialis, Brachioradialis & Forearms'
  },
  ex_hip_thrust: {
    exerciseId: 'ex_hip_thrust',
    exerciseName: 'Hip Thrust / Glute Bridge',
    gifUrl: 'https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/3562.gif',
    step0Url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hip_Thrust/0.jpg',
    step1Url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hip_Thrust/1.jpg',
    tempo: '2-2-1-0 (2s descent, 2s glute lock at top)',
    formCues: [
      'Rest upper back across bench right below shoulder blade tips.',
      'Position feet shoulder-width so shins are vertical at the top of the movement.',
      'Drive through your heels to extend hips until thighs and torso align horizontally.',
      'Tuck chin slightly and squeeze glutes maximally for 2 seconds at the top.'
    ],
    beginnerTips: 'Do not hyperextend lower back at the top. Motion comes from pivoting hips, not arching spine.',
    targetFocus: 'Gluteus Maximus (Peak Contraction)'
  }
};

/**
 * Returns media and form guide for an exercise ID or fallback fuzzy matching by name.
 */
export function getExerciseMedia(exerciseId: string, exerciseName?: string): ExerciseMediaInfo {
  if (EXERCISE_MEDIA_REGISTRY[exerciseId]) {
    return EXERCISE_MEDIA_REGISTRY[exerciseId];
  }

  // Fuzzy match by name if custom or different ID
  const name = (exerciseName || '').toLowerCase();
  for (const item of Object.values(EXERCISE_MEDIA_REGISTRY)) {
    if (
      name.includes(item.exerciseName.toLowerCase()) ||
      item.exerciseName.toLowerCase().includes(name)
    ) {
      return item;
    }
  }

  // Keyword fallbacks
  if (name.includes('chest') || name.includes('press') || name.includes('bench')) {
    return EXERCISE_MEDIA_REGISTRY.ex_chest_press_machine;
  }
  if (name.includes('lat') || name.includes('pulldown') || name.includes('pull-up')) {
    return EXERCISE_MEDIA_REGISTRY.ex_lat_pulldown;
  }
  if (name.includes('row')) {
    return EXERCISE_MEDIA_REGISTRY.ex_seated_cable_row;
  }
  if (name.includes('shoulder') || name.includes('overhead')) {
    return EXERCISE_MEDIA_REGISTRY.ex_db_shoulder_press;
  }
  if (name.includes('lateral') || name.includes('raise')) {
    return EXERCISE_MEDIA_REGISTRY.ex_db_lateral_raise;
  }
  if (name.includes('tricep') || name.includes('pushdown')) {
    return EXERCISE_MEDIA_REGISTRY.ex_triceps_pushdown;
  }
  if (name.includes('bicep') || name.includes('curl')) {
    return EXERCISE_MEDIA_REGISTRY.ex_db_biceps_curl;
  }
  if (name.includes('squat') || name.includes('leg press')) {
    return EXERCISE_MEDIA_REGISTRY.ex_leg_press;
  }
  if (name.includes('deadlift') || name.includes('rdl') || name.includes('hamstring')) {
    return EXERCISE_MEDIA_REGISTRY.ex_romanian_deadlift;
  }
  if (name.includes('curl') && name.includes('leg')) {
    return EXERCISE_MEDIA_REGISTRY.ex_leg_curl;
  }
  if (name.includes('extension') && name.includes('leg')) {
    return EXERCISE_MEDIA_REGISTRY.ex_leg_extension;
  }
  if (name.includes('calf')) {
    return EXERCISE_MEDIA_REGISTRY.ex_calf_raise;
  }
  if (name.includes('core') || name.includes('ab') || name.includes('plank')) {
    return EXERCISE_MEDIA_REGISTRY.ex_plank_core;
  }

  // Default fallback
  return EXERCISE_MEDIA_REGISTRY.ex_chest_press_machine;
}
