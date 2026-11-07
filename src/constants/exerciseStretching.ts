/**
 * Sthira — Exercise Stretching & Mobility Registry
 * Sports-science backed Pre-Workout Dynamic Warm-Up and Post-Workout Static Cool-Down
 * stretching protocols tailored for each exercise and muscle group.
 */

export interface StretchDrill {
  name: string;
  durationOrReps: string; // e.g. "10–12 reps" or "30s hold"
  instructions: string;
  targetArea: string;
}

export interface ExerciseStretchingInfo {
  exerciseId?: string;
  exerciseName?: string;
  preWorkout: {
    title: string;
    focus: string;
    whyItHelps: string;
    drills: StretchDrill[];
  };
  postWorkout: {
    title: string;
    focus: string;
    whyItHelps: string;
    drills: StretchDrill[];
  };
}

export const EXERCISE_STRETCHING_REGISTRY: Record<string, ExerciseStretchingInfo> = {
  // 1. CHEST PRESS MACHINE
  ex_chest_press_machine: {
    exerciseId: 'ex_chest_press_machine',
    exerciseName: 'Chest Press Machine',
    preWorkout: {
      title: 'Dynamic Chest & Anterior Shoulder Prep',
      focus: 'Joint lubrication & pectoral muscle activation without fatiguing strength',
      whyItHelps: 'Warmsup the shoulder capsule, opens anterior chest, and primes the nervous system for pressing load.',
      drills: [
        {
          name: 'Dynamic Arm Crossings',
          durationOrReps: '12–15 reps',
          instructions: 'Stand tall, swing arms wide open until you feel a gentle chest stretch, then cross arms over chest alternating which arm is on top.',
          targetArea: 'Pectoralis Major & Biceps Tendon',
        },
        {
          name: 'Doorway Dynamic Pec Stretch',
          durationOrReps: '8–10 gentle pulses per side',
          instructions: 'Place forearm against a doorframe or machine pillar with elbow at 90°. Gently step through to feel a dynamic stretch in the chest, pulse lightly without holding.',
          targetArea: 'Pectoralis Major & Minor',
        },
        {
          name: 'Band Pull-Aparts / Scapular Squeezes',
          durationOrReps: '10–12 reps',
          instructions: 'Pinch shoulder blades back and down to ensure scapulae can support heavy pressing against the seat backrest.',
          targetArea: 'Rhomboids & Rear Delts (Scapular Stabilizers)',
        },
      ],
    },
    postWorkout: {
      title: 'Pectoral & Front Delt Recovery Cool-Down',
      focus: 'Lengthen shortened chest fibers and restore resting posture',
      whyItHelps: 'Machine pressing tightens the chest and pulls shoulders forward. Static stretches restore thoracic openness and relieve shoulder impingement risk.',
      drills: [
        {
          name: 'Static Doorway / Pillar Pec Stretch',
          durationOrReps: '30s hold per arm',
          instructions: 'Rest forearm flat against pillar with elbow slightly higher than shoulder. Gently rotate torso away until a soothing stretch runs across the chest. Breathe deeply.',
          targetArea: 'Pectoralis Major (Sternal & Clavicular heads)',
        },
        {
          name: 'Behind-the-Back Chest Opener',
          durationOrReps: '25–30s hold',
          instructions: 'Interlace fingers behind lower back, gently straighten arms, roll shoulders back and lift chest upward.',
          targetArea: 'Anterior Deltoids & Upper Pectorals',
        },
      ],
    },
  },

  // 2. DUMBBELL FLAT BENCH PRESS
  ex_db_bench_press: {
    exerciseId: 'ex_db_bench_press',
    exerciseName: 'Dumbbell Flat Bench Press',
    preWorkout: {
      title: 'Rotator Cuff & Pec Mobility Prep',
      focus: 'Shoulder stability & free-weight plane control',
      whyItHelps: 'Dumbbells require substantial rotational stabilization. Dynamic warm-ups activate rotator cuff muscles to stabilize the weight overhead.',
      drills: [
        {
          name: 'Arm Circles & Forward-Backward Swings',
          durationOrReps: '15 small to large circles each direction',
          instructions: 'Perform controlled circles with arms extended to lubricate glenohumeral joints and warm up deltoids.',
          targetArea: 'Shoulder Capsule & Rotator Cuff',
        },
        {
          name: 'Band External Rotations',
          durationOrReps: '10–12 reps per arm',
          instructions: 'Keep elbow pinned to ribcage at 90°, rotate forearm outward against light resistance to wake up the infraspinatus and teres minor.',
          targetArea: 'Rotator Cuff (External Rotators)',
        },
        {
          name: 'Light Warm-Up Press',
          durationOrReps: '10 reps with 40% target weight',
          instructions: 'Practice setting shoulder blades flat on bench and feeling dumbbell balance in the hand.',
          targetArea: 'Pectorals & Triceps',
        },
      ],
    },
    postWorkout: {
      title: 'Chest & Shoulder Extension Static Cool-Down',
      focus: 'Decompress anterior shoulder and restore pec flexibility',
      whyItHelps: 'Counteracts dumbbell bench pec shortening and prevents rounded shoulder posture.',
      drills: [
        {
          name: 'Corner Chest Stretch',
          durationOrReps: '30s hold',
          instructions: 'Stand facing a room corner, place forearms against walls, step forward gently to stretch both pecs simultaneously.',
          targetArea: 'Pectoralis Major & Minor',
        },
        {
          name: 'Cross-Body Shoulder Stretch',
          durationOrReps: '25s hold per arm',
          instructions: 'Bring one arm across your chest, gently hug it with opposite forearm to stretch posterior capsule and delts.',
          targetArea: 'Rear Delts & Rotator Cuff',
        },
      ],
    },
  },

  // 3. BARBELL FLAT BENCH PRESS
  ex_barbell_bench_press: {
    exerciseId: 'ex_barbell_bench_press',
    exerciseName: 'Barbell Flat Bench Press',
    preWorkout: {
      title: 'Thoracic Extension & Wrist Mobility Prep',
      focus: 'Arch support, wrist extension, and shoulder blade retraction',
      whyItHelps: 'Heavy barbell bench pressing places intense extension stress on wrists and requires an active thoracic arch for shoulder safety.',
      drills: [
        {
          name: 'Wrist Circles & Palm Pulses',
          durationOrReps: '10 circles + 10 palm pulses',
          instructions: 'Place palms on wall or bench, gently lean forward to stretch wrists into extension, warming up flexor and extensor tendons.',
          targetArea: 'Forearms, Wrists & Hands',
        },
        {
          name: 'Thoracic Foam Roll or Spine Extensions',
          durationOrReps: '8–10 gentle extension pulses',
          instructions: 'Lie back over a foam roller or bench edge with hands behind head, gently arch upper back to unlock thoracic mobility.',
          targetArea: 'Thoracic Spine & Ribcage',
        },
        {
          name: 'Scapular Push-ups on Bench',
          durationOrReps: '10 reps',
          instructions: 'In a plank on bench, keep arms straight and pinch shoulder blades together, then push bench away to protract.',
          targetArea: 'Serratus Anterior & Rhomboids',
        },
      ],
    },
    postWorkout: {
      title: 'Thoracic Decompression & Pec Stretch',
      focus: 'Relieve spine and pec tension',
      whyItHelps: 'Heavy axial loads tighten the ribcage and pecs; gentle static holds restore relaxed diaphragmatic breathing and muscle length.',
      drills: [
        {
          name: 'Doorframe Single-Arm High Pec Stretch',
          durationOrReps: '30s hold per side',
          instructions: 'Place arm higher than shoulder (120° angle) against doorframe, rotate torso away to specifically target lower pec and sternal fibers.',
          targetArea: 'Pectoralis Major',
        },
        {
          name: 'Child’s Pose with Arms Outstretched',
          durationOrReps: '30–45s hold',
          instructions: 'Kneel on floor, sit hips onto heels, extend arms forward on mat and let chest sink toward the ground.',
          targetArea: 'Lats, Upper Back & Spine',
        },
      ],
    },
  },

  // 4. INCLINE CHEST PRESS
  ex_incline_chest_press: {
    exerciseId: 'ex_incline_chest_press',
    exerciseName: 'Incline Chest Press',
    preWorkout: {
      title: 'Upper Pec & Anterior Deltoid Mobility',
      focus: 'Warm up clavicular pec fibers and overhead angle mechanics',
      whyItHelps: 'Incline pressing stresses the front deltoids and clavicular pec head. Dynamic prep prevents impingement at the acromion.',
      drills: [
        {
          name: 'Wall Angels / Scapular Slides',
          durationOrReps: '10 smooth reps',
          instructions: 'Stand with back, head, and elbows against a wall. Slide arms overhead while keeping elbows and wrists in contact with wall.',
          targetArea: 'Thoracic Mobility & Lower Traps',
        },
        {
          name: 'Dynamic Overhead Arm Swings',
          durationOrReps: '12 reps',
          instructions: 'Swing arms from sides straight overhead, pausing momentarily at the top to stretch upper pecs.',
          targetArea: 'Clavicular Pec & Front Delts',
        },
      ],
    },
    postWorkout: {
      title: 'Upper Chest & Front Shoulder Cool-Down',
      focus: 'Elongate upper pec fibers and alleviate front delt tightness',
      whyItHelps: 'Prevents the common post-incline neck and upper shoulder tension.',
      drills: [
        {
          name: 'Low-Arm Doorframe Pec Stretch',
          durationOrReps: '30s hold per side',
          instructions: 'Place hand at hip height against frame and lean forward gently to target the upper clavicular fibers.',
          targetArea: 'Clavicular Pectoralis & Biceps Long Head',
        },
        {
          name: 'Overhead Triceps & Shoulder Reach',
          durationOrReps: '25s hold per arm',
          instructions: 'Reach one elbow overhead, pull gently with opposite hand while breathing into the side ribcage.',
          targetArea: 'Triceps & Upper Lats',
        },
      ],
    },
  },

  // 5. LAT PULLDOWN
  ex_lat_pulldown: {
    exerciseId: 'ex_lat_pulldown',
    exerciseName: 'Lat Pulldown',
    preWorkout: {
      title: 'Shoulder Mobility & Lat Activation Prep',
      focus: 'Overhead reach and scapular depression mobility',
      whyItHelps: 'Primes lats to pull with elbows rather than over-relying on biceps and forearm flexors.',
      drills: [
        {
          name: 'Dead Hang or Light Bar Stretch',
          durationOrReps: '15–20s gentle hang',
          instructions: 'Hold pulldown bar with arms fully extended overhead and let bodyweight lightly decompress shoulder joints.',
          targetArea: 'Latissimus Dorsi & Shoulder Capsule',
        },
        {
          name: 'Scapular Pull-Downs (Straight Arms)',
          durationOrReps: '10 reps with very light weight',
          instructions: 'Without bending elbows, depress shoulder blades downward toward hips, then release back up.',
          targetArea: 'Lower Trapezius & Lats',
        },
        {
          name: 'Arm Swings & Side Body Reach',
          durationOrReps: '8 reps per side',
          instructions: 'Reach one arm overhead and lean torso to opposite side to dynamically stretch the lat from pelvis to humerus.',
          targetArea: 'Latissimus Dorsi & Obliques',
        },
      ],
    },
    postWorkout: {
      title: 'Latissimus & Bicep Length Restoration',
      focus: 'Relieve compression in lats, rhomboids, and biceps',
      whyItHelps: 'Heavy pulling shortens the lats. Static stretches restore full overhead shoulder flexion.',
      drills: [
        {
          name: 'Doorframe Lat Stretch (Hips Back)',
          durationOrReps: '30s hold per side',
          instructions: 'Grip doorway at chest height with one hand, push hips backward and drop head between shoulders until you feel a deep side-back stretch.',
          targetArea: 'Latissimus Dorsi & Teres Major',
        },
        {
          name: 'Child’s Pose with Side Walk',
          durationOrReps: '25s per side',
          instructions: 'In child’s pose, walk both hands 45° to the left to stretch right lat, then walk to the right.',
          targetArea: 'Lats & Quadratus Lumborum',
        },
      ],
    },
  },

  // 6. SEATED CABLE ROW
  ex_seated_cable_row: {
    exerciseId: 'ex_seated_cable_row',
    exerciseName: 'Seated Cable Row',
    preWorkout: {
      title: 'Mid-Back & Hamstring Dynamic Prep',
      focus: 'Neutral spine awareness and scapular retraction',
      whyItHelps: 'Prepares the rhomboids and rear delts while loosening hamstrings for upright seated posture.',
      drills: [
        {
          name: 'Cat-Cow Mobility Flow',
          durationOrReps: '8–10 smooth breaths',
          instructions: 'On hands and knees, alternate between arching upper back (cat) and lifting chest (cow) to mobilize the entire vertebral column.',
          targetArea: 'Thoracic & Lumbar Spine',
        },
        {
          name: 'Thoracic Rotations (Thread the Needle)',
          durationOrReps: '6 reps per side',
          instructions: 'From all fours, slide one arm under torso to touch shoulder to ground, then rotate upward toward ceiling.',
          targetArea: 'Mid-Back Rhomboids & Thoracic Spine',
        },
      ],
    },
    postWorkout: {
      title: 'Rhomboid, Trap & Spinal Decompression',
      focus: 'Release tension in mid-back and lumbar erectors',
      whyItHelps: 'Sustained isometric back contraction can leave mid-back muscles tight; gentle decompression restores disc space.',
      drills: [
        {
          name: 'Cross-Arm Upper Back Hug',
          durationOrReps: '30s hold',
          instructions: 'Wrap arms around your shoulders like giving yourself a tight hug, round upper back gently and breathe into shoulder blades.',
          targetArea: 'Rhomboids, Middle Traps & Rear Delts',
        },
        {
          name: 'Seated Forward Fold Stretch',
          durationOrReps: '30s relaxed hold',
          instructions: 'Sit tall, extend legs with soft knees, reach forward toward toes and let upper back gently round.',
          targetArea: 'Erector Spinae & Hamstrings',
        },
      ],
    },
  },

  // 7. DUMBBELL SHOULDER PRESS & MACHINE SHOULDER PRESS
  ex_db_shoulder_press: {
    exerciseId: 'ex_db_shoulder_press',
    exerciseName: 'Dumbbell Shoulder Press',
    preWorkout: {
      title: 'Glenohumeral & Rotator Cuff Activation',
      focus: 'Overhead mobility and shoulder stability',
      whyItHelps: 'Overhead pressing requires unrestricted acromioclavicular and scapulothoracic rhythm to avoid pinching tendons.',
      drills: [
        {
          name: 'Arm Swings & Overhead Reaches',
          durationOrReps: '12 reps',
          instructions: 'Swing arms up overhead in scapular plane (30° in front of body) to warm up anterior and lateral deltoids.',
          targetArea: 'Anterior Deltoids & Supraspinatus',
        },
        {
          name: 'Band Dislocates / Shoulder Pass-Throughs',
          durationOrReps: '10 smooth passes',
          instructions: 'Hold a light band or broomstick with wide grip, move it in a continuous arc from hips overhead to behind back.',
          targetArea: 'Shoulder Capsule, Pecs & Lats',
        },
      ],
    },
    postWorkout: {
      title: 'Deltoid & Upper Trap Release Cool-Down',
      focus: 'De-escalate tension in neck, upper traps, and shoulders',
      whyItHelps: 'Heavy overhead pressing can trigger tension headaches if upper traps stay contracted. Gentle stretches soothe the neck and shoulders.',
      drills: [
        {
          name: 'Cross-Body Shoulder Stretch',
          durationOrReps: '30s hold per side',
          instructions: 'Gently pull arm across chest with opposite hand, keeping shoulders dropped away from ears.',
          targetArea: 'Posterior & Lateral Deltoids',
        },
        {
          name: 'Upper Trap & Levator Scapulae Neck Stretch',
          durationOrReps: '20s hold per side',
          instructions: 'Tilt right ear toward right shoulder, look down toward right armpit, gently rest right hand on head for light assistance.',
          targetArea: 'Upper Trapezius & Levator Scapulae',
        },
      ],
    },
  },

  // 8. DUMBBELL LATERAL RAISE & CABLE LATERAL RAISE
  ex_db_lateral_raise: {
    exerciseId: 'ex_db_lateral_raise',
    exerciseName: 'Dumbbell Lateral Raise',
    preWorkout: {
      title: 'Lateral Deltoid & Scapular Plane Prep',
      focus: 'Side delt activation without trap shrugging',
      whyItHelps: 'Prepares the side deltoids to fire independently of the dominant upper traps.',
      drills: [
        {
          name: 'Empty-Hand Lateral Arc Pulses',
          durationOrReps: '15 reps',
          instructions: 'Raise empty hands out to 45° and 90° in the scapular plane, feeling side delts contract without weights.',
          targetArea: 'Lateral Deltoids',
        },
        {
          name: 'Shoulder Rolls (Backward & Forward)',
          durationOrReps: '10 in each direction',
          instructions: 'Roll shoulders up, back, and down to reset posture before picking up dumbbells.',
          targetArea: 'Traps & Scapular Elevators',
        },
      ],
    },
    postWorkout: {
      title: 'Side Delt & Neck Cool-Down',
      focus: 'Elongate shoulder cap and relax upper neck muscles',
      whyItHelps: 'Reduces post-workout soreness in shoulder caps and prevents trap spasms.',
      drills: [
        {
          name: 'Behind-Back Wrist Pull Neck Stretch',
          durationOrReps: '25s hold per side',
          instructions: 'Reach hands behind back, hold left wrist with right hand and pull gently to the right while tilting head to the right.',
          targetArea: 'Lateral Deltoids & Upper Trapezius',
        },
        {
          name: 'Overhead Side Reach',
          durationOrReps: '20s hold per side',
          instructions: 'Extend arm overhead and curve torso slightly sideways to lengthen side deltoid and serratus.',
          targetArea: 'Side Body & Shoulders',
        },
      ],
    },
  },

  // 9. TRICEPS CABLE PUSHDOWN
  ex_triceps_pushdown: {
    exerciseId: 'ex_triceps_pushdown',
    exerciseName: 'Triceps Cable Pushdown',
    preWorkout: {
      title: 'Elbow Joint Lubrication & Triceps Warm-Up',
      focus: 'Tendon readiness and elbow hinge mobility',
      whyItHelps: 'The triceps tendon at the olecranon process requires adequate blood flow to withstand heavy extension without tendinitis.',
      drills: [
        {
          name: 'Elbow Flexion-Extension Circles',
          durationOrReps: '15 reps',
          instructions: 'Bend and straighten elbows in circular patterns with empty hands to increase synovial fluid in the hinge joint.',
          targetArea: 'Elbow Joint & Olecranon Tendon',
        },
        {
          name: 'Light Triceps Extension Set',
          durationOrReps: '15 reps with 30% weight',
          instructions: 'Perform high-rep light extensions focusing strictly on feeling the triceps muscle contract.',
          targetArea: 'Triceps Brachii (All 3 Heads)',
        },
      ],
    },
    postWorkout: {
      title: 'Overhead Triceps Static Cool-Down',
      focus: 'Restore triceps long head length and elbow comfort',
      whyItHelps: 'The long head of the triceps crosses the shoulder joint; stretching overhead restores full arm mobility.',
      drills: [
        {
          name: 'Overhead Triceps & Elbow Stretch',
          durationOrReps: '30s hold per arm',
          instructions: 'Raise arm overhead, bend elbow so hand rests behind neck, gently pull elbow backward with other hand.',
          targetArea: 'Triceps Brachii (Long Head)',
        },
        {
          name: 'Forearm & Wrist Flexor Stretch',
          durationOrReps: '20s hold per hand',
          instructions: 'Extend arm forward with palm facing up, gently pull fingers down and back toward body.',
          targetArea: 'Forearm Flexors & Triceps Insertions',
        },
      ],
    },
  },

  // 10. DUMBBELL BICEPS CURL & HAMMER CURL
  ex_db_biceps_curl: {
    exerciseId: 'ex_db_biceps_curl',
    exerciseName: 'Dumbbell Biceps Curl',
    preWorkout: {
      title: 'Biceps Tendon & Wrist Supination Prep',
      focus: 'Wrist rotation mobility and distal biceps tendon prep',
      whyItHelps: 'Curling involves both elbow flexion and wrist supination. Warming up the tendon prevents distal bicep strain.',
      drills: [
        {
          name: 'Wrist Supination & Pronation Flips',
          durationOrReps: '15 smooth flips',
          instructions: 'Keep elbows at sides at 90°, rotate hands from palms down to palms up repeatedly.',
          targetArea: 'Pronator & Supinator Muscles, Biceps Tendon',
        },
        {
          name: 'Biceps Arm Swings',
          durationOrReps: '12 gentle swings',
          instructions: 'Swing arms lightly front to back, flexing biceps slightly at the top to draw blood into arm flexors.',
          targetArea: 'Biceps Brachii & Brachialis',
        },
      ],
    },
    postWorkout: {
      title: 'Biceps & Anterior Arm Wall Stretch',
      focus: 'Lengthen bicep belly and open front of arms',
      whyItHelps: 'Counteracts constant elbow flexion posture from typing and lifting.',
      drills: [
        {
          name: 'Wall Palm-Back Biceps Stretch',
          durationOrReps: '30s hold per arm',
          instructions: 'Place palm flat against wall at shoulder height with thumb pointing up, gently rotate body away from wall until a stretch runs down the bicep.',
          targetArea: 'Biceps Brachii & Chest Attachment',
        },
        {
          name: 'Reverse Wrist Extension Stretch',
          durationOrReps: '20s hold per hand',
          instructions: 'Extend arm with palm facing body, gently pull back of hand toward wrist.',
          targetArea: 'Forearm Extensors & Brachioradialis',
        },
      ],
    },
  },

  // 11. LEG PRESS
  ex_leg_press: {
    exerciseId: 'ex_leg_press',
    exerciseName: 'Leg Press',
    preWorkout: {
      title: 'Hip, Knee & Ankle Triple-Flexion Warm-Up',
      focus: 'Deep hip hinge, quad activation, and ankle dorsiflexion',
      whyItHelps: 'Leg press loads hips and knees heavily. Dynamic mobilization prevents lower back rounding (butt wink) at the bottom of the sled.',
      drills: [
        {
          name: 'Bodyweight Air Squats with Pause',
          durationOrReps: '10–12 controlled reps',
          instructions: 'Squat down slowly, pause for 1 second at parallel, feel knees track over toes, then drive up through heels.',
          targetArea: 'Quads, Glutes & Hip Capsule',
        },
        {
          name: 'Ankle Dorsiflexion Rocking',
          durationOrReps: '10 pulses per foot against wall',
          instructions: 'Place toes against baseboard, drive knee forward over big toe without letting heel lift off floor.',
          targetArea: 'Achilles Tendon & Ankle Mobility',
        },
        {
          name: 'Hip Opener / Butterfly Pulses',
          durationOrReps: '12 gentle pulses',
          instructions: 'Sit on bench or mat, press soles of feet together, gently pulse knees downward.',
          targetArea: 'Adductors & Inner Thighs',
        },
      ],
    },
    postWorkout: {
      title: 'Quad, Hip Flexor & Glute Recovery Cool-Down',
      focus: 'Lengthen quadriceps and relieve hip joint compression',
      whyItHelps: 'Reduces patellar tendon tension and releases tight hips after heavy leg volume.',
      drills: [
        {
          name: 'Standing Quad Stretch (Flamingo Hold)',
          durationOrReps: '30s hold per leg',
          instructions: 'Stand tall holding a stable support, bend one knee and grab ankle, gently pull heel toward glute while keeping knees aligned and hips tucked.',
          targetArea: 'Quadriceps (Rectus Femoris) & Hip Flexors',
        },
        {
          name: 'Seated Figure-4 Glute Stretch',
          durationOrReps: '30s hold per leg',
          instructions: 'Sit tall, cross left ankle over right knee, gently lean chest forward with a flat back until a stretch forms in outer left glute.',
          targetArea: 'Gluteus Medius & Piriformis',
        },
      ],
    },
  },

  // 12. ROMANIAN DEADLIFT (RDL)
  ex_romanian_deadlift: {
    exerciseId: 'ex_romanian_deadlift',
    exerciseName: 'Romanian Deadlift',
    preWorkout: {
      title: 'Posterior Chain & Hamstring Hinge Prep',
      focus: 'Hip-hinge pattern grooving and hamstring elongation',
      whyItHelps: 'Prepares the hamstring muscle bellies to stretch under eccentric load without straining the lumbar spine.',
      drills: [
        {
          name: 'Bodyweight Good Mornings',
          durationOrReps: '10–12 smooth reps',
          instructions: 'Hands behind head, soft knees. Push hips back as if touching a wall 2 feet behind you until hamstrings tighten, then drive hips forward.',
          targetArea: 'Hamstrings, Glutes & Erector Spinae',
        },
        {
          name: 'Dynamic Leg Swings (Front to Back)',
          durationOrReps: '10 swings per leg',
          instructions: 'Hold a wall for balance, swing leg forward and back smoothly, gradually increasing range of motion.',
          targetArea: 'Hamstrings & Hip Flexors',
        },
        {
          name: 'Cat-Cow Spine Reset',
          durationOrReps: '6–8 breaths',
          instructions: 'Mobilize the lower lumbar spine to ensure you can maintain a rigid neutral back under weight.',
          targetArea: 'Lumbar Spine & Core',
        },
      ],
    },
    postWorkout: {
      title: 'Hamstring & Lower Back Decompression Cool-Down',
      focus: 'Restore resting hamstring length and relieve erector strain',
      whyItHelps: 'Prevents acute lower back tightness and hamstring cramping following heavy hip hinging.',
      drills: [
        {
          name: 'Standing Single-Leg Hamstring Stretch',
          durationOrReps: '30s hold per leg',
          instructions: 'Elevate one heel on a low bench or step, keep leg straight, hinge forward from hips with a flat back until hamstrings stretch deeply.',
          targetArea: 'Hamstrings (Biceps Femoris & Semitendinosus)',
        },
        {
          name: 'Knees-to-Chest Lumbar Stretch',
          durationOrReps: '30–45s hold',
          instructions: 'Lie on back, hug both knees into chest, gently rock side to side to massage lumbar muscles against the floor.',
          targetArea: 'Lower Back Erector Spinae & Sacroiliac Joint',
        },
      ],
    },
  },

  // 13. LEG CURL & LYING LEG CURL
  ex_leg_curl: {
    exerciseId: 'ex_leg_curl',
    exerciseName: 'Leg Curl',
    preWorkout: {
      title: 'Hamstring Knee-Flexion Activation',
      focus: 'Knee joint warming and distal hamstring firing',
      whyItHelps: 'Leg curls isolate the knee flexion function of the hamstrings. Dynamic knee flexion prevents cramping.',
      drills: [
        {
          name: 'Bodyweight Butt-Kicks / Standing Knee Flexions',
          durationOrReps: '15 reps per leg',
          instructions: 'Stand tall, kick heel upward toward glute rapidly, feeling hamstring engage at peak contraction.',
          targetArea: 'Hamstrings (Distal Fibers)',
        },
        {
          name: 'Standing Hamstring Sweep',
          durationOrReps: '8 sweeps per leg',
          instructions: 'Step one foot forward with heel down and toes up, hinge hips back and sweep hands toward ground.',
          targetArea: 'Hamstrings & Calves',
        },
      ],
    },
    postWorkout: {
      title: 'Hamstring & Calf Release Cool-Down',
      focus: 'Prevent cramp lockup and restore knee extension',
      whyItHelps: 'Direct hamstring isolation can cause sharp cramping post-set; slow static stretches calm neuromuscular excitability.',
      drills: [
        {
          name: 'Seated Single-Leg Hamstring Reach',
          durationOrReps: '30s hold per leg',
          instructions: 'Sit on floor, extend one leg, tuck other foot into inner thigh, reach chest gently toward toes with long spine.',
          targetArea: 'Hamstrings & Posterior Knee Joint',
        },
        {
          name: 'Downward-Facing Dog Calf & Hamstring Pedal',
          durationOrReps: '30s hold with gentle heel pedals',
          instructions: 'In inverted V position, press heels alternately toward floor to stretch back of legs.',
          targetArea: 'Hamstrings, Calves & Achilles',
        },
      ],
    },
  },

  // 14. LEG EXTENSION
  ex_leg_extension: {
    exerciseId: 'ex_leg_extension',
    exerciseName: 'Leg Extension',
    preWorkout: {
      title: 'Patellar Tendon & Quad Activation Prep',
      focus: 'Knee tracking, rectus femoris priming, and fluid circulation',
      whyItHelps: 'Open-chain knee extension places high shear stress on the patellofemoral joint. Warm-ups lubricate the patella.',
      drills: [
        {
          name: 'Quad Air Squat Pulses',
          durationOrReps: '10 light pulses',
          instructions: 'Perform shallow quarter-squats to warm up quadriceps tendon and patella safely.',
          targetArea: 'Quadriceps (Vastus Medialis & Lateralis)',
        },
        {
          name: 'Gentle Standing Quad Stretch Dynamic',
          durationOrReps: '6 pulses per leg',
          instructions: 'Pull heel to glute for 2 seconds, release, repeat dynamically.',
          targetArea: 'Rectus Femoris',
        },
      ],
    },
    postWorkout: {
      title: 'Deep Quad & Hip Flexor Static Cool-Down',
      focus: 'Relieve anterior knee pressure and stretch rectus femoris',
      whyItHelps: 'Releases the intense pump in the quads and prevents knee joint stiffness.',
      drills: [
        {
          name: 'Half-Kneeling Hip Flexor & Quad Lunge',
          durationOrReps: '30s hold per leg',
          instructions: 'Kneel on one knee, step other foot forward in 90/90 stance. Tuck tailbone under and lean gently forward into front hip.',
          targetArea: 'Psoas, Iliacus & Rectus Femoris',
        },
        {
          name: 'Prone Quad Stretch (Lying on Mat)',
          durationOrReps: '25s hold per side',
          instructions: 'Lie face down, reach back to grab ankle, gently pull toward glute keeping hips pressed into mat.',
          targetArea: 'Quadriceps',
        },
      ],
    },
  },

  // 15. CALF RAISES (ALL VARIATIONS)
  ex_calf_raise: {
    exerciseId: 'ex_calf_raise',
    exerciseName: 'Calf Raise',
    preWorkout: {
      title: 'Achilles Tendon & Ankle Dorsiflexion Prep',
      focus: 'Ankle mobility and calf tendon elasticity',
      whyItHelps: 'Prevents Achilles tendon strain during heavy seated or standing calf loads.',
      drills: [
        {
          name: 'Ankle Alphabet Circles',
          durationOrReps: '10 circles each foot',
          instructions: 'Lift foot off floor, trace circles and alphabet letters with big toe to activate all ankle stabilizers.',
          targetArea: 'Ankle Joint & Peroneals',
        },
        {
          name: 'Bodyweight Calf Bounce & Drop',
          durationOrReps: '15 light pulses on floor',
          instructions: 'Lightly rise onto toes and lower under control to warm up calf muscle fibers.',
          targetArea: 'Gastrocnemius & Soleus',
        },
      ],
    },
    postWorkout: {
      title: 'Deep Wall Calf & Soleus Static Cool-Down',
      focus: 'Lengthen gastrocnemius (straight leg) and soleus (bent knee)',
      whyItHelps: 'Calves are dense postural muscles prone to severe delayed soreness (DOMS) without thorough cool-down stretching.',
      drills: [
        {
          name: 'Straight-Leg Wall Calf Stretch (Gastrocnemius)',
          durationOrReps: '30s hold per leg',
          instructions: 'Step one leg back with heel pinned to floor and knee locked straight, lean hands into wall.',
          targetArea: 'Gastrocnemius (Upper Calf)',
        },
        {
          name: 'Bent-Knee Wall Calf Stretch (Soleus)',
          durationOrReps: '30s hold per leg',
          instructions: 'From the same wall stance, bend the back knee slightly while keeping heel glued down.',
          targetArea: 'Soleus (Deep Calf) & Achilles Tendon',
        },
      ],
    },
  },

  // 16. PLANK / CORE EXERCISES
  ex_plank_core: {
    exerciseId: 'ex_plank_core',
    exerciseName: 'Plank / Core Exercise',
    preWorkout: {
      title: 'Pelvic Neutrality & Deep Core Priming',
      focus: 'Transverse abdominis activation and lumbar protection',
      whyItHelps: 'Wakes up deep abdominal stabilizers so the lower back does not sag or absorb spinal shear during holds.',
      drills: [
        {
          name: 'Cat-Cow Breathing Flow',
          durationOrReps: '8 full breathing cycles',
          instructions: 'Mobilize spine and feel abdominal wall contract inward on the exhale during Cat pose.',
          targetArea: 'Abdominals & Erector Spinae',
        },
        {
          name: 'Bird-Dog Dynamic Reaches',
          durationOrReps: '6 reps per side',
          instructions: 'From all fours, extend opposite arm and leg straight out without rotating hips. Pause for 2s, switch.',
          targetArea: 'Transverse Abdominis, Glutes & Multifidus',
        },
        {
          name: 'Deadbug Core Activation',
          durationOrReps: '8 reps total',
          instructions: 'Lie on back, press lumbar spine flat against mat, alternate extending opposite arm and leg.',
          targetArea: 'Deep Core Stabilizers',
        },
      ],
    },
    postWorkout: {
      title: 'Abdominal & Hip Flexor Decompression',
      focus: 'Release abdominal contraction and open front torso',
      whyItHelps: 'Continuous static bracing compresses the abdomen and flexors; gentle opening restores deep diaphragmatic breathing.',
      drills: [
        {
          name: 'Cobra / Upward-Facing Dog Stretch',
          durationOrReps: '25–30s gentle hold',
          instructions: 'Lie prone, place hands under shoulders, gently push chest upward while keeping hips on mat and shoulders relaxed away from ears.',
          targetArea: 'Rectus Abdominis & Transverse Abdominis',
        },
        {
          name: 'Extended Child’s Pose',
          durationOrReps: '30s hold with deep breaths',
          instructions: 'Drop hips back onto heels, reach arms forward, breathe deeply into lower back to completely release core tension.',
          targetArea: 'Lower Back & Pelvic Floor',
        },
      ],
    },
  },

  // 17. HIP THRUST / GLUTE BRIDGE
  ex_hip_thrust: {
    exerciseId: 'ex_hip_thrust',
    exerciseName: 'Hip Thrust / Glute Bridge',
    preWorkout: {
      title: 'Glute Activation & Hip Extension Prep',
      focus: 'Wake up gluteus maximus without quadriceps or lower back compensation',
      whyItHelps: 'Prolonged sitting causes "glute amnesia". Dynamic glute bridges ensure the glutes drive the hip extension.',
      drills: [
        {
          name: 'Bodyweight Glute Bridges with 2s Squeeze',
          durationOrReps: '12 reps',
          instructions: 'Lie on back, drive through heels to lift hips, squeeze glutes hard at the top for 2 seconds before lowering.',
          targetArea: 'Gluteus Maximus',
        },
        {
          name: 'Side-Lying Clamshells or Band Abductions',
          durationOrReps: '10 reps per side',
          instructions: 'Lie on side with knees bent at 90°, open top knee like a clamshell while keeping feet together.',
          targetArea: 'Gluteus Medius (Pelvic Stabilizer)',
        },
      ],
    },
    postWorkout: {
      title: 'Deep Glute & Hip Flexor Static Cool-Down',
      focus: 'Lengthen glutes and anterior hips',
      whyItHelps: 'Prevents sciatic nerve compression and releases piriformis tightness after heavy hip thrusting.',
      drills: [
        {
          name: 'Pigeon Pose (or Reclined Pigeon on Back)',
          durationOrReps: '30s hold per side',
          instructions: 'Bring front shin across mat, extend back leg long, fold torso gently forward over front leg.',
          targetArea: 'Gluteus Maximus, Piriformis & Outer Hips',
        },
        {
          name: 'Kneeling Hip Flexor Stretch',
          durationOrReps: '30s hold per side',
          instructions: 'Kneel on one knee, tuck pelvis, lean forward into front hip to stretch opposite psoas.',
          targetArea: 'Iliopsoas & Rectus Femoris',
        },
      ],
    },
  },
};

/**
 * Fallback stretching generator for any exercise by muscle group and category.
 */
export function getExerciseStretching(
  exerciseId: string,
  exerciseName?: string,
  category?: string,
  primaryMuscle?: string
): ExerciseStretchingInfo {
  // 1. Direct registry lookup
  if (EXERCISE_STRETCHING_REGISTRY[exerciseId]) {
    return EXERCISE_STRETCHING_REGISTRY[exerciseId];
  }

  // 2. Fuzzy name lookup
  const cleanName = (exerciseName || exerciseId || '').toLowerCase();
  for (const [id, item] of Object.entries(EXERCISE_STRETCHING_REGISTRY)) {
    if (
      (cleanName && item.exerciseName && (cleanName.includes(item.exerciseName.toLowerCase()) || item.exerciseName.toLowerCase().includes(cleanName)))
    ) {
      return item;
    }
  }

  // 3. Category / Muscle group smart fallbacks
  const cat = (category || '').toLowerCase();
  const muscle = (primaryMuscle || '').toLowerCase();

  // Chest / Press exercises
  if (cleanName.includes('bench') || cat.includes('chest') || muscle.includes('pectoral')) {
    if (cleanName.includes('dumbbell') || cleanName.includes('db')) {
      return EXERCISE_STRETCHING_REGISTRY.ex_db_bench_press;
    }
    if (cleanName.includes('barbell') || cleanName.includes('bb')) {
      return EXERCISE_STRETCHING_REGISTRY.ex_barbell_bench_press;
    }
    if (cleanName.includes('incline')) {
      return EXERCISE_STRETCHING_REGISTRY.ex_incline_chest_press;
    }
    return EXERCISE_STRETCHING_REGISTRY.ex_chest_press_machine;
  }

  // Back / Pull
  if (cat.includes('back') || muscle.includes('lat') || cleanName.includes('pulldown') || cleanName.includes('pull-up')) {
    return EXERCISE_STRETCHING_REGISTRY.ex_lat_pulldown;
  }
  if (cleanName.includes('row') || muscle.includes('rhomboid')) {
    return EXERCISE_STRETCHING_REGISTRY.ex_seated_cable_row;
  }

  // Shoulders
  if (cleanName.includes('lateral') || cleanName.includes('raise')) {
    return EXERCISE_STRETCHING_REGISTRY.ex_db_lateral_raise;
  }
  if (cat.includes('shoulder') || cleanName.includes('overhead') || muscle.includes('deltoid')) {
    return EXERCISE_STRETCHING_REGISTRY.ex_db_shoulder_press;
  }

  // Arms
  if (cleanName.includes('tricep') || muscle.includes('triceps')) {
    return EXERCISE_STRETCHING_REGISTRY.ex_triceps_pushdown;
  }
  if (cleanName.includes('bicep') || cleanName.includes('curl') || muscle.includes('biceps')) {
    return EXERCISE_STRETCHING_REGISTRY.ex_db_biceps_curl;
  }

  // Legs / Glutes / Calves
  if (cleanName.includes('calf') || muscle.includes('gastrocnemius') || muscle.includes('soleus')) {
    return EXERCISE_STRETCHING_REGISTRY.ex_calf_raise;
  }
  if (cleanName.includes('thrust') || cleanName.includes('bridge') || muscle.includes('glute')) {
    return EXERCISE_STRETCHING_REGISTRY.ex_hip_thrust;
  }
  if (cleanName.includes('deadlift') || cleanName.includes('rdl')) {
    return EXERCISE_STRETCHING_REGISTRY.ex_romanian_deadlift;
  }
  if (cleanName.includes('curl') && (cat.includes('leg') || cleanName.includes('leg'))) {
    return EXERCISE_STRETCHING_REGISTRY.ex_leg_curl;
  }
  if (cleanName.includes('extension') && (cat.includes('leg') || cleanName.includes('leg'))) {
    return EXERCISE_STRETCHING_REGISTRY.ex_leg_extension;
  }
  if (cat.includes('leg') || cleanName.includes('squat') || cleanName.includes('press') || muscle.includes('quad') || muscle.includes('hamstring') || muscle.includes('thigh')) {
    return EXERCISE_STRETCHING_REGISTRY.ex_leg_press;
  }

  // Core / Plank
  if (cat.includes('core') || cleanName.includes('plank') || cleanName.includes('ab')) {
    return EXERCISE_STRETCHING_REGISTRY.ex_plank_core;
  }

  // Default
  return EXERCISE_STRETCHING_REGISTRY.ex_chest_press_machine;
}
