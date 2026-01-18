/* ========================================
   Data - Fitapp
   Muscle groups (exercises added by user)
   ======================================== */

// Muscle Groups with German labels
const MUSCLE_GROUPS = {
    chest: { id: 'chest', name: 'Brust', color: '#000000' },
    back: { id: 'back', name: 'Rücken', color: '#3B82F6' },
    shoulders: { id: 'shoulders', name: 'Schultern', color: '#8B5CF6' },
    biceps: { id: 'biceps', name: 'Bizeps', color: '#EC4899' },
    triceps: { id: 'triceps', name: 'Trizeps', color: '#F97316' },
    quads: { id: 'quads', name: 'Quadrizeps', color: '#22C55E' },
    hamstrings: { id: 'hamstrings', name: 'Beinbeuger', color: '#14B8A6' },
    glutes: { id: 'glutes', name: 'Gesäß', color: '#6366F1' },
    calves: { id: 'calves', name: 'Waden', color: '#06B6D4' },
    core: { id: 'core', name: 'Core', color: '#EAB308' }
};

// Empty by default - user adds their own exercises
const DEFAULT_EXERCISES = [];

// Helper to get muscle group info
function getMuscleGroup(id) {
    return MUSCLE_GROUPS[id] || { id, name: id, color: '#6B7280' };
}

// Get all muscle group IDs
function getMuscleGroupIds() {
    return Object.keys(MUSCLE_GROUPS);
}
