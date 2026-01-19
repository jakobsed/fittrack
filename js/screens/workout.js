/* ========================================
   Workout Screen - Fitapp
   Active workout tracking
   ======================================== */

const WorkoutScreen = {
    workout: null,

    // Start a workout from a template
    startFromTemplate(templateId) {
        Modal.close();
        
        const template = Storage.getTemplate(templateId);
        if (!template) return;

        this.workout = {
            name: template.name,
            templateId: templateId,
            startTime: Date.now(),
            exercises: template.exerciseIds.map(exId => {
                const lastData = Storage.getLastExerciseData(exId);
                return {
                    exerciseId: exId,
                    weight: lastData?.weight || '',
                    reps: lastData?.reps || '',
                    targetSets: lastData?.targetSets || 3,
                    completedSets: 0
                };
            })
        };

        Storage.setActiveWorkout(this.workout);
        WorkoutTimer.start((elapsed) => this.updateWorkoutTime(elapsed));
        App.navigate('workout');
    },

    // Start an empty workout
    startEmpty() {
        Modal.close();
        
        this.workout = {
            name: 'Freies Workout',
            templateId: null,
            startTime: Date.now(),
            exercises: []
        };

        Storage.setActiveWorkout(this.workout);
        WorkoutTimer.start((elapsed) => this.updateWorkoutTime(elapsed));
        App.navigate('workout');
    },

    // Resume active workout
    resume() {
        const active = Storage.getActiveWorkout();
        if (active) {
            // Validate workout structure - clear if incompatible
            if (!active.startTime || !Array.isArray(active.exercises)) {
                Storage.clearActiveWorkout();
                return false;
            }
            
            this.workout = active;
            const elapsed = Math.floor((Date.now() - active.startTime) / 1000);
            WorkoutTimer.elapsed = elapsed;
            WorkoutTimer.start((e) => this.updateWorkoutTime(e));
            return true;
        }
        return false;
    },

    render() {
        if (!this.workout) {
            const active = Storage.getActiveWorkout();
            if (active) {
                if (!this.resume()) {
                    // Resume failed, show home
                    App.navigate('home');
                    return '';
                }
            } else {
                App.navigate('home');
                return '';
            }
        }

        return `
            <div class="workout-screen">
                <!-- Header -->
                <div class="workout-header">
                    <div class="screen-header-left">
                        <button class="back-btn" onclick="WorkoutScreen.confirmCancel()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>
                        <h1 class="screen-title" style="font-size: var(--font-size-lg);">${this.workout.name}</h1>
                    </div>
                    <div class="workout-timer">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span id="workout-time">${WorkoutTimer.formatTime()}</span>
                    </div>
                </div>

                <!-- Exercises -->
                <div id="exercises-list">
                    ${this.workout.exercises.map((ex, i) => this.renderExercise(ex, i)).join('')}
                </div>

                <!-- Add Exercise Button -->
                <button class="add-exercise-btn" onclick="WorkoutScreen.showAddExerciseModal()">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Übung hinzufügen
                </button>

                <!-- Finish Button -->
                <button class="btn btn-primary btn-lg btn-full finish-workout-btn" onclick="WorkoutScreen.finishWorkout()">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Workout beenden
                </button>
            </div>
        `;
    },

    renderExercise(ex, index) {
        const exercise = Storage.getExercise(ex.exerciseId);
        if (!exercise) return '';

        const muscle = getMuscleGroup(exercise.muscleGroup);

        // Generate set checkboxes
        const setCheckboxes = [];
        for (let i = 0; i < ex.targetSets; i++) {
            const isCompleted = i < ex.completedSets;
            setCheckboxes.push(`
                <div class="set-checkbox ${isCompleted ? 'checked' : ''}" 
                     onclick="WorkoutScreen.toggleSet(${index}, ${i})">
                    <span class="set-number">${i + 1}</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
            `);
        }

        return `
            <div class="exercise-card" data-index="${index}">
                <div class="exercise-header">
                    <div class="exercise-info">
                        <div class="exercise-name">${exercise.name}</div>
                        <span class="tag tag-${exercise.muscleGroup} exercise-muscle">${muscle.name}</span>
                    </div>
                    <button class="btn btn-ghost btn-icon-sm" onclick="WorkoutScreen.removeExercise(${index})">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <!-- Simplified Input Row -->
                <div class="exercise-inputs">
                    <div class="input-group-inline">
                        <label>kg</label>
                        <input type="number" 
                               class="set-input" 
                               value="${ex.weight}" 
                               placeholder="0"
                               inputmode="decimal"
                               onchange="WorkoutScreen.updateExercise(${index}, 'weight', this.value)">
                    </div>
                    <div class="input-group-inline">
                        <label>Reps</label>
                        <input type="number" 
                               class="set-input" 
                               value="${ex.reps}" 
                               placeholder="0"
                               inputmode="numeric"
                               onchange="WorkoutScreen.updateExercise(${index}, 'reps', this.value)">
                    </div>
                    <div class="input-group-inline">
                        <label>Sets</label>
                        <div class="set-counter">
                            <button class="counter-btn" onclick="WorkoutScreen.adjustSets(${index}, -1)">−</button>
                            <span class="counter-value">${ex.targetSets}</span>
                            <button class="counter-btn" onclick="WorkoutScreen.adjustSets(${index}, 1)">+</button>
                        </div>
                    </div>
                </div>

                <!-- Set Checkboxes -->
                <div class="set-checkboxes">
                    ${setCheckboxes.join('')}
                </div>

                <!-- Progress indicator -->
                <div class="exercise-progress">
                    ${ex.completedSets} / ${ex.targetSets} Sets
                </div>
            </div>
        `;
    },

    updateWorkoutTime(elapsed) {
        const el = document.getElementById('workout-time');
        if (el) {
            el.textContent = WorkoutTimer.formatTime(elapsed);
        }
    },

    updateExercise(index, field, value) {
        if (!this.workout) return;
        
        const numValue = parseFloat(value) || '';
        this.workout.exercises[index][field] = numValue;
        Storage.setActiveWorkout(this.workout);
    },

    adjustSets(index, delta) {
        if (!this.workout) return;
        
        const ex = this.workout.exercises[index];
        const newTarget = Math.max(1, Math.min(10, ex.targetSets + delta));
        ex.targetSets = newTarget;
        
        // Adjust completed sets if needed
        if (ex.completedSets > newTarget) {
            ex.completedSets = newTarget;
        }
        
        Storage.setActiveWorkout(this.workout);
        App.refreshScreen();
    },

    toggleSet(exIndex, setIndex) {
        if (!this.workout) return;

        const ex = this.workout.exercises[exIndex];
        
        // If clicking on an uncompleted set, complete it (and all before it)
        // If clicking on a completed set, uncomplete it (and all after it)
        if (setIndex < ex.completedSets) {
            // Uncomplete this and all after
            ex.completedSets = setIndex;
        } else {
            // Complete this and all before
            ex.completedSets = setIndex + 1;
        }
        
        Storage.setActiveWorkout(this.workout);
        App.refreshScreen();
    },

    removeExercise(index) {
        if (!this.workout) return;
        this.workout.exercises.splice(index, 1);
        Storage.setActiveWorkout(this.workout);
        App.refreshScreen();
    },

    showAddExerciseModal() {
        const exercises = Storage.getExercises();

        const content = `
            <div class="search-bar mb-md">
                <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input type="text" class="search-input" placeholder="Übung suchen..." 
                       oninput="WorkoutScreen.filterExercises(this.value)">
            </div>
            
            ${exercises.length === 0 ? `
                <div class="empty-state">
                    <div class="empty-state-title">Keine Übungen</div>
                    <div class="empty-state-text">Füge zuerst Übungen in der Übungsverwaltung hinzu.</div>
                </div>
            ` : ''}
            
            <div id="all-exercises-list">
                ${Object.keys(MUSCLE_GROUPS).map(muscleId => {
                    const muscleExercises = exercises.filter(e => e.muscleGroup === muscleId);
                    if (muscleExercises.length === 0) return '';
                    
                    return `
                        <div class="exercise-group" data-muscle="${muscleId}">
                            <div class="exercise-group-title">${getMuscleGroup(muscleId).name}</div>
                            ${muscleExercises.map(ex => this.renderExerciseItem(ex)).join('')}
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        Modal.showSheet({
            title: 'Übung hinzufügen',
            content: content
        });
    },

    renderExerciseItem(ex) {
        return `
            <div class="exercise-item" onclick="WorkoutScreen.addExercise('${ex.id}')">
                <span class="exercise-item-name">${ex.name}</span>
                <span class="tag tag-${ex.muscleGroup}">${getMuscleGroup(ex.muscleGroup).name}</span>
            </div>
        `;
    },

    filterExercises(query) {
        const exercises = Storage.getExercises();
        const filtered = exercises.filter(e => 
            e.name.toLowerCase().includes(query.toLowerCase())
        );
        
        const container = document.getElementById('all-exercises-list');
        if (!container) return;

        if (query) {
            container.innerHTML = filtered.map(ex => this.renderExerciseItem(ex)).join('');
        } else {
            container.innerHTML = Object.keys(MUSCLE_GROUPS).map(muscleId => {
                const muscleExercises = exercises.filter(e => e.muscleGroup === muscleId);
                if (muscleExercises.length === 0) return '';
                
                return `
                    <div class="exercise-group" data-muscle="${muscleId}">
                        <div class="exercise-group-title">${getMuscleGroup(muscleId).name}</div>
                        ${muscleExercises.map(ex => this.renderExerciseItem(ex)).join('')}
                    </div>
                `;
            }).join('');
        }
    },

    addExercise(exerciseId) {
        if (!this.workout) return;

        const lastData = Storage.getLastExerciseData(exerciseId);
        
        this.workout.exercises.push({
            exerciseId: exerciseId,
            weight: lastData?.weight || '',
            reps: lastData?.reps || '',
            targetSets: lastData?.targetSets || 3,
            completedSets: 0
        });

        Storage.setActiveWorkout(this.workout);
        Modal.close();
        App.refreshScreen();
    },

    async confirmCancel() {
        const confirmed = await Modal.confirm({
            title: 'Workout abbrechen?',
            message: 'Dein aktueller Fortschritt geht verloren.',
            confirmText: 'Abbrechen',
            cancelText: 'Weiter trainieren',
            danger: true
        });

        if (confirmed) {
            this.cancelWorkout();
        }
    },

    cancelWorkout() {
        WorkoutTimer.stop();
        Storage.clearActiveWorkout();
        this.workout = null;
        App.navigate('home');
    },

    async finishWorkout() {
        if (!this.workout) return;

        // Check if any sets were completed
        const completedSets = this.workout.exercises.reduce((sum, ex) => sum + ex.completedSets, 0);

        if (completedSets === 0) {
            const confirmed = await Modal.confirm({
                title: 'Keine Sets abgeschlossen',
                message: 'Du hast noch keine Sets als erledigt markiert. Workout trotzdem beenden?',
                confirmText: 'Beenden',
                cancelText: 'Zurück'
            });
            if (!confirmed) return;
        }

        // Save workout
        const duration = WorkoutTimer.stop();

        // Convert to storage format
        const exercisesToSave = this.workout.exercises
            .filter(ex => ex.completedSets > 0)
            .map(ex => ({
                exerciseId: ex.exerciseId,
                weight: parseFloat(ex.weight) || 0,
                reps: parseInt(ex.reps) || 0,
                targetSets: ex.targetSets,
                completedSets: ex.completedSets
            }));

        Storage.addWorkout({
            name: this.workout.name,
            templateId: this.workout.templateId,
            date: new Date().toISOString(),
            duration: duration,
            exercises: exercisesToSave
        });

        Storage.clearActiveWorkout();
        this.workout = null;

        App.navigate('home');
    }
};
