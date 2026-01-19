/* ========================================
   Home Screen - Fitapp
   Dashboard with stats and recent workouts
   ======================================== */

const HomeScreen = {
    render() {
        const recentWorkouts = Storage.getRecentWorkouts(5);
        const weekWorkouts = Storage.getThisWeekWorkouts();

        // Calculate week stats
        const totalSets = weekWorkouts.reduce((sum, w) => {
            return sum + w.exercises.reduce((s, e) => s + (e.sets || 0), 0);
        }, 0);

        const totalDuration = weekWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
        const hours = Math.floor(totalDuration / 3600);
        const mins = Math.floor((totalDuration % 3600) / 60);
        const durationStr = hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;

        return `
            <div class="home-screen animate-fade-in">
                <div class="screen-header">
                    <h1 class="greeting">
                        Willkommen
                    </h1>
                    <button class="btn btn-ghost btn-icon" onclick="App.navigate('exercises')">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M12 1v6m0 6v10M4.22 4.22l4.24 4.24m7.08 7.08l4.24 4.24M1 12h6m6 0h10M4.22 19.78l4.24-4.24m7.08-7.08l4.24-4.24"></path>
                        </svg>
                    </button>
                </div>

                <!-- Week Stats -->
                <div class="card mb-lg">
                    <h3 class="text-sm font-semibold text-secondary mb-md">Diese Woche</h3>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-value">${weekWorkouts.length}</span>
                            <span class="stat-label">Workouts</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${durationStr || '0min'}</span>
                            <span class="stat-label">Zeit</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${totalSets}</span>
                            <span class="stat-label">Sets</span>
                        </div>
                    </div>
                </div>

                <!-- Recent Workouts -->
                <div class="section-title">Letzte Workouts</div>
                ${recentWorkouts.length > 0 ? `
                    <div class="recent-workouts">
                        ${recentWorkouts.map(w => this.renderWorkoutItem(w)).join('')}
                    </div>
                ` : `
                    <div class="empty-state">
                        <div class="empty-state-title">Noch keine Workouts</div>
                        <div class="empty-state-text">
                            Starte dein erstes Workout und beginne deinen Fortschritt zu tracken.
                        </div>
                    </div>
                `}

                <!-- Start Workout Button -->
                <button class="btn btn-primary btn-lg btn-full start-workout-btn" onclick="HomeScreen.showStartWorkoutModal()">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    Workout starten
                </button>
            </div>
        `;
    },

    renderWorkoutItem(workout) {
        const date = new Date(workout.date);
        const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
        const dayName = dayNames[date.getDay()];
        const dayNum = date.getDate();

        const totalSets = workout.exercises.reduce((sum, e) =>
            sum + (e.sets || 0), 0);

        const exerciseNames = workout.exercises
            .map(e => Storage.getExercise(e.exerciseId)?.name || 'Unbekannt')
            .slice(0, 3)
            .join(', ');

        return `
            <div class="workout-history-item" onclick="HomeScreen.viewWorkout('${workout.id}')">
                <div class="workout-history-date">
                    <span class="workout-history-day">${dayName}</span>
                    <span class="workout-history-num">${dayNum}</span>
                </div>
                <div class="workout-history-content">
                    <div class="workout-history-name">${workout.name || 'Workout'}</div>
                    <div class="workout-history-stats">${totalSets} Sets · ${exerciseNames}</div>
                </div>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--color-text-muted);">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </div>
        `;
    },

    showStartWorkoutModal() {
        const templates = Storage.getTemplates();

        const content = `
            <div class="list">
                ${templates.length > 0 ? `
                    <div class="section-title">Vorlage wählen</div>
                    ${templates.map(t => `
                        <div class="list-item" onclick="WorkoutScreen.startFromTemplate('${t.id}')">
                            <div class="list-item-content">
                                <div class="list-item-title">${t.name}</div>
                                <div class="list-item-subtitle">${t.exerciseIds.length} Übungen</div>
                            </div>
                            <svg class="list-item-action" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </div>
                    `).join('')}
                    <div class="divider-text">oder</div>
                ` : ''}
                <button class="btn btn-outline btn-full" onclick="WorkoutScreen.startEmpty()">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Freies Workout starten
                </button>
            </div>
        `;

        Modal.showSheet({
            title: 'Workout starten',
            content: content
        });
    },

    viewWorkout(id) {
        // TODO: Show workout details
        console.log('View workout:', id);
    }
};
