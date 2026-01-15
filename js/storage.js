/**
 * FitTrack - Storage Module V2
 * Handles all LocalStorage operations for workout data and exercise database
 */

const Storage = {
    STORAGE_KEY: 'fittrack_data',

    /**
     * Get all data from LocalStorage
     * @returns {Object} Data object with workouts and exerciseDatabase
     */
    getData() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        if (data) {
            return JSON.parse(data);
        }
        return { workouts: {}, exerciseDatabase: [] };
    },

    /**
     * Save all data to LocalStorage
     * @param {Object} data - Data object
     */
    saveData(data) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    },

    // ==========================================
    // Exercise Database Functions
    // ==========================================

    /**
     * Get all exercises from database
     * @returns {Array} Array of exercise objects
     */
    getExerciseDatabase() {
        const data = this.getData();
        return data.exerciseDatabase || [];
    },

    /**
     * Add exercise to database
     * @param {Object} exercise - Exercise object with name and muscleGroup
     */
    addToExerciseDatabase(exercise) {
        const data = this.getData();
        if (!data.exerciseDatabase) {
            data.exerciseDatabase = [];
        }
        exercise.id = this.generateId();
        data.exerciseDatabase.push(exercise);
        this.saveData(data);
        return exercise;
    },

    /**
     * Delete exercise from database
     * @param {string} exerciseId - Exercise ID
     */
    deleteFromExerciseDatabase(exerciseId) {
        const data = this.getData();
        if (data.exerciseDatabase) {
            data.exerciseDatabase = data.exerciseDatabase.filter(ex => ex.id !== exerciseId);
            this.saveData(data);
        }
    },

    /**
     * Get exercise from database by ID
     * @param {string} exerciseId - Exercise ID
     * @returns {Object|null} Exercise object or null
     */
    getExerciseById(exerciseId) {
        const exercises = this.getExerciseDatabase();
        return exercises.find(ex => ex.id === exerciseId) || null;
    },

    // ==========================================
    // Workout Functions
    // ==========================================

    /**
     * Get workout for a specific date
     * @param {string} dateKey - Date in YYYY-MM-DD format
     * @returns {Object|null} Workout object or null
     */
    getWorkout(dateKey) {
        const data = this.getData();
        return data.workouts[dateKey] || null;
    },

    /**
     * Save workout for a specific date
     * @param {string} dateKey - Date in YYYY-MM-DD format
     * @param {Object} workout - Workout object with exercises
     */
    saveWorkout(dateKey, workout) {
        const data = this.getData();
        data.workouts[dateKey] = workout;
        this.saveData(data);
    },

    /**
     * Add exercise to a specific date (V2: simplified format)
     * @param {string} dateKey - Date in YYYY-MM-DD format
     * @param {Object} exercise - Exercise object
     */
    addExercise(dateKey, exercise) {
        const data = this.getData();
        if (!data.workouts[dateKey]) {
            data.workouts[dateKey] = { exercises: [] };
        }
        data.workouts[dateKey].exercises.push(exercise);
        this.saveData(data);
        return data.workouts[dateKey];
    },

    /**
     * Update exercise for a specific date
     * @param {string} dateKey - Date in YYYY-MM-DD format
     * @param {string} exerciseId - Exercise ID
     * @param {Object} updates - Updated exercise properties
     */
    updateExercise(dateKey, exerciseId, updates) {
        const data = this.getData();
        if (data.workouts[dateKey]) {
            const exerciseIndex = data.workouts[dateKey].exercises.findIndex(
                ex => ex.id === exerciseId
            );
            if (exerciseIndex !== -1) {
                data.workouts[dateKey].exercises[exerciseIndex] = {
                    ...data.workouts[dateKey].exercises[exerciseIndex],
                    ...updates
                };
                this.saveData(data);
            }
        }
        return data.workouts[dateKey];
    },

    /**
     * Delete exercise from a specific date
     * @param {string} dateKey - Date in YYYY-MM-DD format
     * @param {string} exerciseId - Exercise ID
     */
    deleteExercise(dateKey, exerciseId) {
        const data = this.getData();
        if (data.workouts[dateKey]) {
            data.workouts[dateKey].exercises = data.workouts[dateKey].exercises.filter(
                ex => ex.id !== exerciseId
            );
            if (data.workouts[dateKey].exercises.length === 0) {
                delete data.workouts[dateKey];
            }
            this.saveData(data);
        }
        return data.workouts[dateKey] || null;
    },

    /**
     * Get dates that have workouts
     * @returns {string[]} Array of date keys
     */
    getWorkoutDates() {
        const data = this.getData();
        return Object.keys(data.workouts);
    },

    // ==========================================
    // Statistics Functions
    // ==========================================

    /**
     * Calculate statistics (V2: with muscle groups)
     * @returns {Object} Statistics object
     */
    getStatistics() {
        const data = this.getData();
        const workouts = data.workouts;
        const dates = Object.keys(workouts);

        let totalWorkouts = dates.length;
        let totalSets = 0;
        let totalVolume = 0;
        let totalExercises = 0;

        dates.forEach(date => {
            const workout = workouts[date];
            if (workout.exercises) {
                totalExercises += workout.exercises.length;
                workout.exercises.forEach(exercise => {
                    if (exercise.completed) {
                        const sets = parseInt(exercise.sets) || 0;
                        const weight = parseFloat(exercise.weight) || 0;
                        const reps = parseInt(exercise.reps) || 0;
                        totalSets += sets;
                        totalVolume += weight * reps * sets;
                    }
                });
            }
        });

        // Get this week's workouts
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1);
        startOfWeek.setHours(0, 0, 0, 0);

        const workoutsThisWeek = dates.filter(date => {
            const workoutDate = new Date(date);
            return workoutDate >= startOfWeek;
        }).length;

        return {
            totalWorkouts,
            totalSets,
            totalVolume: Math.round(totalVolume),
            totalExercises,
            workoutsThisWeek
        };
    },

    /**
     * Get sets per muscle group (V2)
     * @returns {Object} Object with muscle groups as keys and set counts as values
     */
    getMuscleGroupStats() {
        const data = this.getData();
        const workouts = data.workouts;
        const muscleStats = {};

        Object.values(workouts).forEach(workout => {
            if (workout.exercises) {
                workout.exercises.forEach(exercise => {
                    if (exercise.completed && exercise.muscleGroup) {
                        const sets = parseInt(exercise.sets) || 0;
                        if (!muscleStats[exercise.muscleGroup]) {
                            muscleStats[exercise.muscleGroup] = 0;
                        }
                        muscleStats[exercise.muscleGroup] += sets;
                    }
                });
            }
        });

        return muscleStats;
    },

    /**
     * Get recent workouts
     * @param {number} limit - Number of workouts to return
     * @returns {Array} Array of recent workout objects with dates
     */
    getRecentWorkouts(limit = 5) {
        const data = this.getData();
        const workouts = data.workouts;
        const dates = Object.keys(workouts)
            .sort((a, b) => new Date(b) - new Date(a))
            .slice(0, limit);

        return dates.map(date => ({
            date,
            ...workouts[date]
        }));
    },

    /**
     * Generate a unique ID
     * @returns {string} Unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};
