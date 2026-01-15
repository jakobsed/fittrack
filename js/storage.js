/**
 * FitTrack - Storage Module
 * Handles all LocalStorage operations for workout data
 */

const Storage = {
    STORAGE_KEY: 'fittrack_data',

    /**
     * Get all workout data from LocalStorage
     * @returns {Object} Workout data object
     */
    getData() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        if (data) {
            return JSON.parse(data);
        }
        return { workouts: {} };
    },

    /**
     * Save all workout data to LocalStorage
     * @param {Object} data - Workout data object
     */
    saveData(data) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    },

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
     * Add exercise to a specific date
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
            // Clean up empty workout days
            if (data.workouts[dateKey].exercises.length === 0) {
                delete data.workouts[dateKey];
            }
            this.saveData(data);
        }
        return data.workouts[dateKey] || null;
    },

    /**
     * Get all workouts (for statistics)
     * @returns {Object} All workouts keyed by date
     */
    getAllWorkouts() {
        const data = this.getData();
        return data.workouts;
    },

    /**
     * Get dates that have workouts
     * @returns {string[]} Array of date keys
     */
    getWorkoutDates() {
        const data = this.getData();
        return Object.keys(data.workouts);
    },

    /**
     * Calculate statistics
     * @returns {Object} Statistics object
     */
    getStatistics() {
        const data = this.getData();
        const workouts = data.workouts;
        const dates = Object.keys(workouts);
        
        let totalWorkouts = dates.length;
        let totalSets = 0;
        let totalVolume = 0; // weight × reps
        let totalExercises = 0;

        dates.forEach(date => {
            const workout = workouts[date];
            if (workout.exercises) {
                totalExercises += workout.exercises.length;
                workout.exercises.forEach(exercise => {
                    if (exercise.sets) {
                        exercise.sets.forEach(set => {
                            if (set.completed) {
                                totalSets++;
                                const weight = parseFloat(set.weight) || 0;
                                const reps = parseInt(set.reps) || 0;
                                totalVolume += weight * reps;
                            }
                        });
                    }
                });
            }
        });

        // Get this week's workouts
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
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
     * Get recent workouts (last 7 days with workouts)
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
