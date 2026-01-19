/* ========================================
   Storage - Fitapp
   localStorage utilities and data access
   ======================================== */

const Storage = {
    // Storage keys
    KEYS: {
        EXERCISES: 'fitapp_exercises',
        TEMPLATES: 'fitapp_templates',
        WORKOUTS: 'fitapp_workouts',
        ACTIVE_WORKOUT: 'fitapp_active_workout',
        SETTINGS: 'fitapp_settings'
    },

    // ========================================
    // Generic Methods
    // ========================================

    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Storage.get error:', e);
            return null;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage.set error:', e);
            return false;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Storage.remove error:', e);
            return false;
        }
    },

    // ========================================
    // Exercises
    // ========================================

    initExercises() {
        if (!this.get(this.KEYS.EXERCISES)) {
            this.set(this.KEYS.EXERCISES, DEFAULT_EXERCISES);
        }
    },

    getExercises() {
        return this.get(this.KEYS.EXERCISES) || DEFAULT_EXERCISES;
    },

    getExercise(id) {
        const exercises = this.getExercises();
        return exercises.find(ex => ex.id === id);
    },

    addExercise(exercise) {
        const exercises = this.getExercises();
        const newExercise = {
            ...exercise,
            id: 'ex_custom_' + Date.now(),
            isCustom: true
        };
        exercises.push(newExercise);
        this.set(this.KEYS.EXERCISES, exercises);
        return newExercise;
    },

    updateExercise(id, updates) {
        const exercises = this.getExercises();
        const index = exercises.findIndex(ex => ex.id === id);
        if (index !== -1) {
            exercises[index] = { ...exercises[index], ...updates };
            this.set(this.KEYS.EXERCISES, exercises);
            return exercises[index];
        }
        return null;
    },

    deleteExercise(id) {
        const exercises = this.getExercises();
        const filtered = exercises.filter(ex => ex.id !== id);
        this.set(this.KEYS.EXERCISES, filtered);
    },

    getExercisesByMuscle(muscleGroup) {
        return this.getExercises().filter(ex => ex.muscleGroup === muscleGroup);
    },

    // ========================================
    // Templates
    // ========================================

    getTemplates() {
        return this.get(this.KEYS.TEMPLATES) || [];
    },

    getTemplate(id) {
        const templates = this.getTemplates();
        return templates.find(t => t.id === id);
    },

    addTemplate(template) {
        const templates = this.getTemplates();
        const newTemplate = {
            ...template,
            id: 'tpl_' + Date.now()
        };
        templates.push(newTemplate);
        this.set(this.KEYS.TEMPLATES, templates);
        return newTemplate;
    },

    updateTemplate(id, updates) {
        const templates = this.getTemplates();
        const index = templates.findIndex(t => t.id === id);
        if (index !== -1) {
            templates[index] = { ...templates[index], ...updates };
            this.set(this.KEYS.TEMPLATES, templates);
            return templates[index];
        }
        return null;
    },

    deleteTemplate(id) {
        const templates = this.getTemplates();
        const filtered = templates.filter(t => t.id !== id);
        this.set(this.KEYS.TEMPLATES, filtered);
    },

    // ========================================
    // Workouts (Completed)
    // ========================================

    getWorkouts() {
        return this.get(this.KEYS.WORKOUTS) || [];
    },

    getWorkout(id) {
        const workouts = this.getWorkouts();
        return workouts.find(w => w.id === id);
    },

    addWorkout(workout) {
        const workouts = this.getWorkouts();
        const newWorkout = {
            ...workout,
            id: 'workout_' + Date.now()
        };
        workouts.unshift(newWorkout); // Add to beginning (most recent first)
        this.set(this.KEYS.WORKOUTS, workouts);
        return newWorkout;
    },

    deleteWorkout(id) {
        const workouts = this.getWorkouts();
        const filtered = workouts.filter(w => w.id !== id);
        this.set(this.KEYS.WORKOUTS, filtered);
    },

    getRecentWorkouts(limit = 5) {
        const workouts = this.getWorkouts();
        return workouts.slice(0, limit);
    },

    getWorkoutsInRange(startDate, endDate) {
        const workouts = this.getWorkouts();
        return workouts.filter(w => {
            const date = new Date(w.date);
            return date >= startDate && date <= endDate;
        });
    },

    getThisWeekWorkouts() {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        return this.getWorkoutsInRange(startOfWeek, endOfWeek);
    },

    // Get last workout data for an exercise (for pre-filling values)
    getLastExerciseData(exerciseId) {
        const workouts = this.getWorkouts();
        for (const workout of workouts) {
            const exercise = workout.exercises.find(e => e.exerciseId === exerciseId);
            if (exercise) {
                return {
                    weight: exercise.weight || '',
                    reps: exercise.reps || '',
                    targetSets: exercise.targetSets || 3
                };
            }
        }
        return null;
    },

    // ========================================
    // Active Workout
    // ========================================

    getActiveWorkout() {
        return this.get(this.KEYS.ACTIVE_WORKOUT);
    },

    setActiveWorkout(workout) {
        this.set(this.KEYS.ACTIVE_WORKOUT, workout);
    },

    clearActiveWorkout() {
        this.remove(this.KEYS.ACTIVE_WORKOUT);
    },

    // ========================================
    // Statistics Helpers
    // ========================================

    // Get total sets per muscle group in a date range
    getSetsPerMuscle(startDate, endDate) {
        const workouts = this.getWorkoutsInRange(startDate, endDate);
        const setsPerMuscle = {};

        // Initialize all muscle groups to 0
        getMuscleGroupIds().forEach(id => {
            setsPerMuscle[id] = 0;
        });

        // Count sets
        workouts.forEach(workout => {
            workout.exercises.forEach(ex => {
                const exercise = this.getExercise(ex.exerciseId);
                if (exercise) {
                    setsPerMuscle[exercise.muscleGroup] =
                        (setsPerMuscle[exercise.muscleGroup] || 0) + (ex.completedSets || 0);
                }
            });
        });

        return setsPerMuscle;
    },

    // Get weight progression for an exercise
    getWeightProgression(exerciseId, limit = 10) {
        const workouts = this.getWorkouts();
        const progression = [];

        for (const workout of workouts) {
            const exercise = workout.exercises.find(e => e.exerciseId === exerciseId);
            if (exercise && exercise.weight > 0 && exercise.completedSets > 0) {
                progression.push({
                    date: workout.date,
                    weight: exercise.weight
                });
            }

            if (progression.length >= limit) break;
        }

        return progression.reverse(); // Oldest first
    },

    // Get workout frequency (days trained)
    getWorkoutFrequency(weeks = 4) {
        const now = new Date();
        const startDate = new Date(now);
        startDate.setDate(now.getDate() - (weeks * 7));

        const workouts = this.getWorkoutsInRange(startDate, now);
        const daysWorked = new Set();

        workouts.forEach(w => {
            const date = new Date(w.date);
            const dateStr = date.toISOString().split('T')[0];
            daysWorked.add(dateStr);
        });

        return {
            totalDays: daysWorked.size,
            dates: Array.from(daysWorked)
        };
    },

    // ========================================
    // Settings
    // ========================================

    getSettings() {
        return this.get(this.KEYS.SETTINGS) || {
            restTimerDuration: 120, // 2 minutes in seconds
        };
    },

    updateSettings(updates) {
        const settings = this.getSettings();
        this.set(this.KEYS.SETTINGS, { ...settings, ...updates });
    }
};

// Initialize on load
Storage.initExercises();
