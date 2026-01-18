/* ========================================
   Data - Fitapp
   Default exercises and muscle groups
   ======================================== */

// Muscle Groups with German labels
const MUSCLE_GROUPS = {
    chest: { id: 'chest', name: 'Brust', color: '#000000' },
    back: { id: 'back', name: 'Rücken', color: '#3B82F6' },
    shoulders: { id: 'shoulders', name: 'Schultern', color: '#8B5CF6' },
    biceps: { id: 'biceps', name: 'Bizeps', color: '#EC4899' },
    triceps: { id: 'triceps', name: 'Trizeps', color: '#F97316' },
    quads: { id: 'quads', name: 'Quadrizeps', color: '#10B981' },
    hamstrings: { id: 'hamstrings', name: 'Beinbeuger', color: '#14B8A6' },
    glutes: { id: 'glutes', name: 'Gesäß', color: '#6366F1' },
    calves: { id: 'calves', name: 'Waden', color: '#06B6D4' },
    core: { id: 'core', name: 'Core', color: '#EAB308' }
};

// Default exercises (user can add more)
const DEFAULT_EXERCISES = [
    // Chest
    { id: 'ex_1', name: 'Bankdrücken', muscleGroup: 'chest', isFavorite: false, isCustom: false },
    { id: 'ex_2', name: 'Schrägbankdrücken', muscleGroup: 'chest', isFavorite: false, isCustom: false },
    { id: 'ex_3', name: 'Kurzhantel Flys', muscleGroup: 'chest', isFavorite: false, isCustom: false },
    { id: 'ex_4', name: 'Butterfly Maschine', muscleGroup: 'chest', isFavorite: false, isCustom: false },
    { id: 'ex_5', name: 'Dips', muscleGroup: 'chest', isFavorite: false, isCustom: false },
    { id: 'ex_6', name: 'Cable Crossover', muscleGroup: 'chest', isFavorite: false, isCustom: false },

    // Back
    { id: 'ex_10', name: 'Klimmzüge', muscleGroup: 'back', isFavorite: false, isCustom: false },
    { id: 'ex_11', name: 'Latzug', muscleGroup: 'back', isFavorite: false, isCustom: false },
    { id: 'ex_12', name: 'Rudern Langhantel', muscleGroup: 'back', isFavorite: false, isCustom: false },
    { id: 'ex_13', name: 'Rudern Kurzhantel', muscleGroup: 'back', isFavorite: false, isCustom: false },
    { id: 'ex_14', name: 'Rudern Kabelzug', muscleGroup: 'back', isFavorite: false, isCustom: false },
    { id: 'ex_15', name: 'T-Bar Rudern', muscleGroup: 'back', isFavorite: false, isCustom: false },
    { id: 'ex_16', name: 'Face Pulls', muscleGroup: 'back', isFavorite: false, isCustom: false },

    // Shoulders
    { id: 'ex_20', name: 'Schulterdrücken', muscleGroup: 'shoulders', isFavorite: false, isCustom: false },
    { id: 'ex_21', name: 'Seitheben', muscleGroup: 'shoulders', isFavorite: false, isCustom: false },
    { id: 'ex_22', name: 'Frontheben', muscleGroup: 'shoulders', isFavorite: false, isCustom: false },
    { id: 'ex_23', name: 'Reverse Flys', muscleGroup: 'shoulders', isFavorite: false, isCustom: false },
    { id: 'ex_24', name: 'Arnold Press', muscleGroup: 'shoulders', isFavorite: false, isCustom: false },
    { id: 'ex_25', name: 'Upright Row', muscleGroup: 'shoulders', isFavorite: false, isCustom: false },

    // Biceps
    { id: 'ex_30', name: 'Bizeps Curls Langhantel', muscleGroup: 'biceps', isFavorite: false, isCustom: false },
    { id: 'ex_31', name: 'Bizeps Curls Kurzhantel', muscleGroup: 'biceps', isFavorite: false, isCustom: false },
    { id: 'ex_32', name: 'Hammer Curls', muscleGroup: 'biceps', isFavorite: false, isCustom: false },
    { id: 'ex_33', name: 'Preacher Curls', muscleGroup: 'biceps', isFavorite: false, isCustom: false },
    { id: 'ex_34', name: 'Concentration Curls', muscleGroup: 'biceps', isFavorite: false, isCustom: false },
    { id: 'ex_35', name: 'Cable Curls', muscleGroup: 'biceps', isFavorite: false, isCustom: false },

    // Triceps
    { id: 'ex_40', name: 'Trizeps Pushdown', muscleGroup: 'triceps', isFavorite: false, isCustom: false },
    { id: 'ex_41', name: 'Trizeps Dips', muscleGroup: 'triceps', isFavorite: false, isCustom: false },
    { id: 'ex_42', name: 'Skull Crushers', muscleGroup: 'triceps', isFavorite: false, isCustom: false },
    { id: 'ex_43', name: 'Overhead Extension', muscleGroup: 'triceps', isFavorite: false, isCustom: false },
    { id: 'ex_44', name: 'Close Grip Bankdrücken', muscleGroup: 'triceps', isFavorite: false, isCustom: false },
    { id: 'ex_45', name: 'Kickbacks', muscleGroup: 'triceps', isFavorite: false, isCustom: false },

    // Quads
    { id: 'ex_50', name: 'Kniebeugen', muscleGroup: 'quads', isFavorite: false, isCustom: false },
    { id: 'ex_51', name: 'Beinpresse', muscleGroup: 'quads', isFavorite: false, isCustom: false },
    { id: 'ex_52', name: 'Ausfallschritte', muscleGroup: 'quads', isFavorite: false, isCustom: false },
    { id: 'ex_53', name: 'Leg Extension', muscleGroup: 'quads', isFavorite: false, isCustom: false },
    { id: 'ex_54', name: 'Hack Squat', muscleGroup: 'quads', isFavorite: false, isCustom: false },
    { id: 'ex_55', name: 'Bulgarian Split Squat', muscleGroup: 'quads', isFavorite: false, isCustom: false },

    // Hamstrings
    { id: 'ex_60', name: 'Beinbeuger liegend', muscleGroup: 'hamstrings', isFavorite: false, isCustom: false },
    { id: 'ex_61', name: 'Beinbeuger sitzend', muscleGroup: 'hamstrings', isFavorite: false, isCustom: false },
    { id: 'ex_62', name: 'Rumänisches Kreuzheben', muscleGroup: 'hamstrings', isFavorite: false, isCustom: false },
    { id: 'ex_63', name: 'Good Mornings', muscleGroup: 'hamstrings', isFavorite: false, isCustom: false },

    // Glutes
    { id: 'ex_70', name: 'Hip Thrust', muscleGroup: 'glutes', isFavorite: false, isCustom: false },
    { id: 'ex_71', name: 'Glute Bridge', muscleGroup: 'glutes', isFavorite: false, isCustom: false },
    { id: 'ex_72', name: 'Cable Kickback', muscleGroup: 'glutes', isFavorite: false, isCustom: false },
    { id: 'ex_73', name: 'Abduktion Maschine', muscleGroup: 'glutes', isFavorite: false, isCustom: false },

    // Calves
    { id: 'ex_80', name: 'Wadenheben stehend', muscleGroup: 'calves', isFavorite: false, isCustom: false },
    { id: 'ex_81', name: 'Wadenheben sitzend', muscleGroup: 'calves', isFavorite: false, isCustom: false },
    { id: 'ex_82', name: 'Wadenheben Beinpresse', muscleGroup: 'calves', isFavorite: false, isCustom: false },

    // Core
    { id: 'ex_90', name: 'Crunches', muscleGroup: 'core', isFavorite: false, isCustom: false },
    { id: 'ex_91', name: 'Plank', muscleGroup: 'core', isFavorite: false, isCustom: false },
    { id: 'ex_92', name: 'Hanging Leg Raises', muscleGroup: 'core', isFavorite: false, isCustom: false },
    { id: 'ex_93', name: 'Cable Crunch', muscleGroup: 'core', isFavorite: false, isCustom: false },
    { id: 'ex_94', name: 'Russian Twist', muscleGroup: 'core', isFavorite: false, isCustom: false },
    { id: 'ex_95', name: 'Ab Wheel Rollout', muscleGroup: 'core', isFavorite: false, isCustom: false }
];

// Helper to get muscle group info
function getMuscleGroup(id) {
    return MUSCLE_GROUPS[id] || { id, name: id, color: '#6B7280' };
}

// Get all muscle group IDs
function getMuscleGroupIds() {
    return Object.keys(MUSCLE_GROUPS);
}
