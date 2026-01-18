/* ========================================
   Workout Screen - Fitapp
   Active workout tracking
   ======================================== */

const WorkoutScreen = {
    workout: null,
    timerRunning: false,

    // Start a workout from a template
    startFromTemplate(templateId) {
        Modal.close();

        const template = Storage.getTemplate(templateId);
        if (!template) return;

        this.workout = {
            name: template.name,
            templateId: templateId,
            startTime: Date.now(),
            exercises: template.exerciseIds.map(exId => ({
                exerciseId: exId,
                sets: [{ weight: '', reps: '', completed: false }]
            }))
        };

        // Pre-fill with last workout data
        this.workout.exercises.forEach(ex => {
            const lastData = Storage.getLastExerciseData(ex.exerciseId);
            if (lastData && lastData.length > 0) {
                ex.sets = lastData.map(s => ({
                    weight: s.weight || '',
                    reps: s.reps || '',
                    completed: false,
                    previous: `${s.weight}×${s.reps}`
                }));
            }
        });

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
            this.workout = active;
            const elapsed = Math.floor((Date.now() - active.startTime) / 1000);
            WorkoutTimer.elapsed = elapsed;
            WorkoutTimer.start((e) => this.updateWorkoutTime(e));
        }
    },

    render() {
        if (!this.workout) {
            const active = Storage.getActiveWorkout();
            if (active) {
                this.resume();
            } else {
                return '<div class="empty-state"><p>Kein aktives Workout</p></div>';
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

                <!-- Rest Timer -->
                <div id="rest-timer-container"></div>

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

        return `
            <div class="exercise-card" data-index="${index}">
                <div class="exercise-header">
                    <div class="exercise-info">
                        <div class="exercise-name">${exercise.name}</div>
                        <span class="tag tag-${exercise.muscleGroup} exercise-muscle">${muscle.name}</span>
                    </div>
                    <button class="favorite-btn ${exercise.isFavorite ? 'active' : ''}" 
                            onclick="WorkoutScreen.toggleFavorite('${exercise.id}')">
                        <svg viewBox="0 0 24 24" fill="${exercise.isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                    </button>
                </div>

                <table class="sets-table">
                    <thead>
                        <tr>
                            <th>Set</th>
                            <th>Vorher</th>
                            <th>kg</th>
                            <th>Reps</th>
                            <th>✓</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ex.sets.map((set, setIndex) => this.renderSet(set, index, setIndex)).join('')}
                    </tbody>
                </table>

                <button class="add-set-btn" onclick="WorkoutScreen.addSet(${index})">
                    + Set hinzufügen
                </button>
            </div>
        `;
    },

    renderSet(set, exIndex, setIndex) {
        return `
            <tr class="set-row ${set.completed ? 'completed' : ''}" data-ex="${exIndex}" data-set="${setIndex}">
                <td class="set-num">${setIndex + 1}</td>
                <td class="previous">${set.previous || '-'}</td>
                <td class="input-cell">
                    <input type="number" 
                           class="set-input" 
                           value="${set.weight}" 
                           placeholder="0"
                           inputmode="decimal"
                           onchange="WorkoutScreen.updateSet(${exIndex}, ${setIndex}, 'weight', this.value)">
                </td>
                <td class="input-cell">
                    <input type="number" 
                           class="set-input" 
                           value="${set.reps}" 
                           placeholder="0"
                           inputmode="numeric"
                           onchange="WorkoutScreen.updateSet(${exIndex}, ${setIndex}, 'reps', this.value)">
                </td>
                <td class="check-cell">
                    <div class="checkbox ${set.completed ? 'checked' : ''}" 
                         onclick="WorkoutScreen.toggleSetComplete(${exIndex}, ${setIndex})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                </td>
            </tr>
        `;
    },

    updateWorkoutTime(elapsed) {
        const el = document.getElementById('workout-time');
        if (el) {
            el.textContent = WorkoutTimer.formatTime(elapsed);
        }
    },

    updateSet(exIndex, setIndex, field, value) {
        if (!this.workout) return;

        const numValue = parseFloat(value) || '';
        this.workout.exercises[exIndex].sets[setIndex][field] = numValue;
        Storage.setActiveWorkout(this.workout);
    },

    toggleSetComplete(exIndex, setIndex) {
        if (!this.workout) return;

        const set = this.workout.exercises[exIndex].sets[setIndex];
        set.completed = !set.completed;
        Storage.setActiveWorkout(this.workout);

        // Update UI
        const row = document.querySelector(`tr[data-ex="${exIndex}"][data-set="${setIndex}"]`);
        if (row) {
            row.classList.toggle('completed', set.completed);
            row.querySelector('.checkbox').classList.toggle('checked', set.completed);
        }

        // Start rest timer if set completed
        if (set.completed) {
            this.startRestTimer();
        }
    },

    addSet(exIndex) {
        if (!this.workout) return;

        const lastSet = this.workout.exercises[exIndex].sets.slice(-1)[0];
        this.workout.exercises[exIndex].sets.push({
            weight: lastSet?.weight || '',
            reps: lastSet?.reps || '',
            completed: false
        });

        Storage.setActiveWorkout(this.workout);
        App.refreshScreen();
    },

    toggleFavorite(exerciseId) {
        Storage.toggleFavorite(exerciseId);
        App.refreshScreen();
    },

    showAddExerciseModal() {
        const exercises = Storage.getExercises();
        const favorites = exercises.filter(e => e.isFavorite);

        const content = `
            <div class="search-bar mb-md">
                <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input type="text" class="search-input" placeholder="Übung suchen..." 
                       oninput="WorkoutScreen.filterExercises(this.value)">
            </div>
            
            ${favorites.length > 0 ? `
                <div class="exercise-group">
                    <div class="exercise-group-title">⭐ Favoriten</div>
                    <div id="favorites-list">
                        ${favorites.map(ex => this.renderExerciseItem(ex)).join('')}
                    </div>
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
            // Restore grouped view
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
        const sets = lastData && lastData.length > 0
            ? lastData.map(s => ({
                weight: s.weight || '',
                reps: s.reps || '',
                completed: false,
                previous: `${s.weight}×${s.reps}`
            }))
            : [{ weight: '', reps: '', completed: false }];

        this.workout.exercises.push({
            exerciseId: exerciseId,
            sets: sets
        });

        Storage.setActiveWorkout(this.workout);
        Modal.close();
        App.refreshScreen();
    },

    startRestTimer() {
        const settings = Storage.getSettings();
        const duration = settings.restTimerDuration || 120;

        Timer.start(duration,
            (remaining) => this.updateRestTimerDisplay(remaining),
            () => this.onRestTimerComplete()
        );

        this.renderRestTimer();
    },

    renderRestTimer() {
        const container = document.getElementById('rest-timer-container');
        if (!container) return;

        container.innerHTML = `
            <div class="rest-timer-card">
                <div class="rest-timer-label">Pause</div>
                <div class="rest-timer-time" id="rest-timer-display">${Timer.formatTime()}</div>
                <div class="rest-timer-controls">
                    <button class="btn btn-sm btn-outline" onclick="Timer.addTime(-15)">-15s</button>
                    <button class="btn btn-sm btn-primary" onclick="WorkoutScreen.stopRestTimer()">Weiter</button>
                    <button class="btn btn-sm btn-outline" onclick="Timer.addTime(15)">+15s</button>
                </div>
            </div>
        `;
    },

    updateRestTimerDisplay(remaining) {
        const el = document.getElementById('rest-timer-display');
        if (el) {
            el.textContent = Timer.formatTime(remaining);
            if (remaining <= 10 && remaining > 0) {
                el.classList.add('warning');
            } else if (remaining <= 0) {
                el.classList.remove('warning');
                el.classList.add('done');
            }
        }
    },

    stopRestTimer() {
        Timer.stop();
        const container = document.getElementById('rest-timer-container');
        if (container) {
            container.innerHTML = '';
        }
    },

    onRestTimerComplete() {
        const container = document.getElementById('rest-timer-container');
        if (container) {
            container.innerHTML = `
                <div class="rest-timer-card" style="background: var(--color-success-light);">
                    <div class="rest-timer-time" style="color: var(--color-success);">Pause vorbei! 💪</div>
                    <button class="btn btn-sm btn-primary mt-md" onclick="WorkoutScreen.stopRestTimer()">OK</button>
                </div>
            `;
        }
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
        Timer.stop();
        WorkoutTimer.stop();
        Storage.clearActiveWorkout();
        this.workout = null;
        App.navigate('home');
    },

    async finishWorkout() {
        if (!this.workout) return;

        // Check if any sets were completed
        const completedSets = this.workout.exercises.reduce((sum, ex) =>
            sum + ex.sets.filter(s => s.completed).length, 0);

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
        Timer.stop();

        const savedWorkout = Storage.addWorkout({
            name: this.workout.name,
            templateId: this.workout.templateId,
            date: new Date().toISOString(),
            duration: duration,
            exercises: this.workout.exercises.map(ex => ({
                exerciseId: ex.exerciseId,
                sets: ex.sets.filter(s => s.completed).map(s => ({
                    weight: parseFloat(s.weight) || 0,
                    reps: parseInt(s.reps) || 0,
                    completed: true
                }))
            })).filter(ex => ex.sets.length > 0)
        });

        Storage.clearActiveWorkout();
        this.workout = null;

        // Show success and go home
        App.navigate('home');
    }
};
