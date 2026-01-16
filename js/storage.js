/**
 * FitTrack - Storage Module V3
 * Handles workout templates, workout tracking, and statistics
 */

const Storage = {
    STORAGE_KEY: 'fittrack_data',

    /**
     * Get all data from LocalStorage
     */
    getData() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        if (data) {
            return JSON.parse(data);
        }
        return { workouts: {}, workoutTemplates: [], favoriteExercises: [] };
    },

    /**
     * Save all data to LocalStorage
     */
    saveData(data) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    },

    // ==========================================
    // Favorite Exercises
    // ==========================================

    /**
     * Get all favorite exercises
     */
    getFavoriteExercises() {
        const data = this.getData();
        return data.favoriteExercises || [];
    },

    /**
     * Add a favorite exercise
     */
    addFavoriteExercise(name, muscleGroup) {
        const data = this.getData();
        if (!data.favoriteExercises) data.favoriteExercises = [];

        const favorite = {
            id: this.generateId(),
            name: name,
            muscleGroup: muscleGroup
        };

        data.favoriteExercises.push(favorite);
        this.saveData(data);
        return favorite;
    },

    /**
     * Delete a favorite exercise
     */
    deleteFavoriteExercise(id) {
        const data = this.getData();
        if (data.favoriteExercises) {
            data.favoriteExercises = data.favoriteExercises.filter(f => f.id !== id);
            this.saveData(data);
        }
    },

    /**
     * Update a favorite exercise
     */
    updateFavoriteExercise(id, name, muscleGroup) {
        const data = this.getData();
        if (data.favoriteExercises) {
            const favorite = data.favoriteExercises.find(f => f.id === id);
            if (favorite) {
                favorite.name = name;
                favorite.muscleGroup = muscleGroup;
                this.saveData(data);
            }
        }
    },

    // ==========================================
    // Workout Templates
    // ==========================================

    /**
     * Get all workout templates
     */
    getWorkoutTemplates() {
        const data = this.getData();
        return data.workoutTemplates || [];
    },

    /**
     * Get a single template by ID
     */
    getTemplateById(templateId) {
        const templates = this.getWorkoutTemplates();
        return templates.find(t => t.id === templateId) || null;
    },

    /**
     * Create a new workout template
     */
    createTemplate(name) {
        const data = this.getData();
        if (!data.workoutTemplates) {
            data.workoutTemplates = [];
        }
        const template = {
            id: this.generateId(),
            name: name,
            exercises: []
        };
        data.workoutTemplates.push(template);
        this.saveData(data);
        return template;
    },

    /**
     * Update template name
     */
    updateTemplateName(templateId, name) {
        const data = this.getData();
        const template = data.workoutTemplates?.find(t => t.id === templateId);
        if (template) {
            template.name = name;
            this.saveData(data);
        }
    },

    /**
     * Delete a workout template
     */
    deleteTemplate(templateId) {
        const data = this.getData();
        if (data.workoutTemplates) {
            data.workoutTemplates = data.workoutTemplates.filter(t => t.id !== templateId);
            this.saveData(data);
        }
    },

    /**
     * Reorder exercises in a template
     */
    reorderTemplateExercises(templateId, fromIndex, toIndex) {
        const data = this.getData();
        const template = data.workoutTemplates?.find(t => t.id === templateId);
        if (template && template.exercises) {
            const [moved] = template.exercises.splice(fromIndex, 1);
            template.exercises.splice(toIndex, 0, moved);
            this.saveData(data);
        }
    },

    /**
     * Add exercise to template
     */
    addExerciseToTemplate(templateId, exercise) {
        const data = this.getData();
        const template = data.workoutTemplates?.find(t => t.id === templateId);
        if (template) {
            if (!template.exercises) template.exercises = [];
            exercise.id = this.generateId();
            template.exercises.push(exercise);
            this.saveData(data);
        }
        return template;
    },

    /**
     * Remove exercise from template
     */
    removeExerciseFromTemplate(templateId, exerciseId) {
        const data = this.getData();
        const template = data.workoutTemplates?.find(t => t.id === templateId);
        if (template && template.exercises) {
            template.exercises = template.exercises.filter(e => e.id !== exerciseId);
            this.saveData(data);
        }
        return template;
    },

    /**
     * Update exercise defaults in template
     */
    updateExerciseInTemplate(templateId, exerciseId, updates) {
        const data = this.getData();
        const template = data.workoutTemplates?.find(t => t.id === templateId);
        if (template && template.exercises) {
            const exercise = template.exercises.find(e => e.id === exerciseId);
            if (exercise) {
                Object.assign(exercise, updates);
                this.saveData(data);
            }
        }
        return template;
    },

    /**
     * Sync workout values back to template (when user changes during workout)
     */
    syncWorkoutToTemplate(templateId, exerciseName, updates) {
        const data = this.getData();
        const template = data.workoutTemplates?.find(t => t.id === templateId);
        if (template && template.exercises) {
            const exercise = template.exercises.find(e => e.name === exerciseName);
            if (exercise) {
                if (updates.sets) exercise.defaultSets = updates.sets;
                if (updates.weight) exercise.defaultWeight = updates.weight;
                if (updates.reps) exercise.defaultReps = updates.reps;
                this.saveData(data);
            }
        }
    },

    // ==========================================
    // Workout Tracking
    // ==========================================

    /**
     * Get workout for a specific date
     */
    getWorkout(dateKey) {
        const data = this.getData();
        return data.workouts[dateKey] || null;
    },

    /**
     * Start workout from template
     */
    startWorkoutFromTemplate(dateKey, templateId) {
        const template = this.getTemplateById(templateId);
        if (!template) return null;

        const exercises = template.exercises.map(ex => ({
            id: this.generateId(),
            name: ex.name,
            muscleGroup: ex.muscleGroup,
            sets: ex.defaultSets || '',
            weight: ex.defaultWeight || '',
            reps: ex.defaultReps || '',
            completed: false
        }));

        const workout = {
            templateId: templateId,
            templateName: template.name,
            exercises: exercises
        };

        const data = this.getData();
        data.workouts[dateKey] = workout;
        this.saveData(data);
        return workout;
    },

    /**
     * Add single exercise to a date
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
     * Update exercise in workout
     */
    updateExercise(dateKey, exerciseId, updates) {
        const data = this.getData();
        if (data.workouts[dateKey]) {
            const exercise = data.workouts[dateKey].exercises.find(ex => ex.id === exerciseId);
            if (exercise) {
                Object.assign(exercise, updates);
                this.saveData(data);
            }
        }
        return data.workouts[dateKey];
    },

    /**
     * Delete exercise from workout
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
     * Clear workout for a date
     */
    clearWorkout(dateKey) {
        const data = this.getData();
        delete data.workouts[dateKey];
        this.saveData(data);
    },

    /**
     * Get dates that have workouts
     */
    getWorkoutDates() {
        const data = this.getData();
        return Object.keys(data.workouts);
    },

    // ==========================================
    // Statistics
    // ==========================================

    /**
     * Calculate basic statistics
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

        // This week's workouts
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
     * Get sets per muscle group for the current week
     */
    getMuscleGroupStats() {
        const data = this.getData();
        const workouts = data.workouts;
        const muscleStats = {};

        // Get start of current week (Monday)
        const today = new Date();
        const day = today.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() + diff);
        startOfWeek.setHours(0, 0, 0, 0);

        // Get end of week (Sunday)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        Object.entries(workouts).forEach(([dateKey, workout]) => {
            const workoutDate = new Date(dateKey);

            // Only count workouts from this week
            if (workoutDate >= startOfWeek && workoutDate <= endOfWeek) {
                if (workout.exercises) {
                    workout.exercises.forEach(exercise => {
                        // Count sets immediately when workout is selected (planning mode)
                        if (exercise.muscleGroup) {
                            const sets = parseInt(exercise.sets) || 0;
                            if (!muscleStats[exercise.muscleGroup]) {
                                muscleStats[exercise.muscleGroup] = 0;
                            }
                            muscleStats[exercise.muscleGroup] += sets;
                        }
                    });
                }
            }
        });

        return muscleStats;
    },

    /**
     * Get volume history for chart (V3)
     * Returns array of {date, volume} sorted by date
     */
    getVolumeHistory() {
        const data = this.getData();
        const workouts = data.workouts;
        const history = [];

        Object.entries(workouts).forEach(([date, workout]) => {
            let dayVolume = 0;
            if (workout.exercises) {
                workout.exercises.forEach(exercise => {
                    if (exercise.completed) {
                        const sets = parseInt(exercise.sets) || 0;
                        const weight = parseFloat(exercise.weight) || 0;
                        const reps = parseInt(exercise.reps) || 0;
                        dayVolume += weight * reps * sets;
                    }
                });
            }
            if (dayVolume > 0) {
                history.push({ date, volume: Math.round(dayVolume) });
            }
        });

        // Sort by date
        history.sort((a, b) => new Date(a.date) - new Date(b.date));
        return history;
    },

    /**
     * Get recent workouts
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
     * Generate unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};
