/**
 * FitTrack - UI Components Module V2
 * Reusable UI component generators
 */

const Components = {
    dayNames: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
    dayNamesFull: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'],
    monthNames: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],

    muscleGroups: ['Brust', 'Rücken', 'Schultern', 'Bizeps', 'Trizeps', 'Beine', 'Core', 'Andere'],

    formatDateKey(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    formatDateDisplay(date) {
        const dayIndex = (date.getDay() + 6) % 7;
        const dayName = this.dayNamesFull[dayIndex];
        const day = date.getDate();
        const month = this.monthNames[date.getMonth()];
        return `${dayName}, ${day}. ${month}`;
    },

    getWeekNumber(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    },

    getWeekDates(referenceDate) {
        const dates = [];
        const day = referenceDate.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        const monday = new Date(referenceDate);
        monday.setDate(referenceDate.getDate() + diff);

        for (let i = 0; i < 7; i++) {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            dates.push(date);
        }
        return dates;
    },

    renderWeekCalendar(weekDates, selectedDateKey, workoutDates) {
        const today = this.formatDateKey(new Date());

        return weekDates.map((date, index) => {
            const dateKey = this.formatDateKey(date);
            const isSelected = dateKey === selectedDateKey;
            const isToday = dateKey === today;
            const hasWorkout = workoutDates.includes(dateKey);

            let classes = 'day-card';
            if (isSelected) classes += ' selected';
            if (isToday) classes += ' today';
            if (hasWorkout) classes += ' has-workout';

            return `
                <div class="${classes}" data-date="${dateKey}">
                    <span class="day-name">${this.dayNames[index]}</span>
                    <span class="day-number">${date.getDate()}</span>
                </div>
            `;
        }).join('');
    },

    renderWeekTitle(referenceDate) {
        const month = this.monthNames[referenceDate.getMonth()];
        const year = referenceDate.getFullYear();
        const weekNum = this.getWeekNumber(referenceDate);
        return `${month} ${year} - Woche ${weekNum}`;
    },

    // V2: Simplified exercise rendering
    renderExercises(exercises) {
        if (!exercises || exercises.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">🏋️</div>
                    <p class="empty-state-text">Noch keine Übungen für heute.</p>
                </div>
            `;
        }

        return exercises.map(exercise => this.renderExerciseCard(exercise)).join('');
    },

    // V2: Simplified exercise card with sets/weight/reps
    renderExerciseCard(exercise) {
        const completedClass = exercise.completed ? 'completed' : '';
        const muscleTag = exercise.muscleGroup
            ? `<span class="exercise-muscle-tag">${this.escapeHtml(exercise.muscleGroup)}</span>`
            : '';

        return `
            <div class="exercise-card" data-exercise-id="${exercise.id}">
                <div class="exercise-header">
                    <span class="exercise-name">${this.escapeHtml(exercise.name)}${muscleTag}</span>
                    <div style="position: relative;">
                        <button class="exercise-menu-btn" data-action="menu" data-exercise-id="${exercise.id}">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="5" r="1"></circle>
                                <circle cx="12" cy="12" r="1"></circle>
                                <circle cx="12" cy="19" r="1"></circle>
                            </svg>
                        </button>
                        <div class="exercise-menu" id="menu-${exercise.id}">
                            <button class="exercise-menu-item delete" data-action="delete" data-exercise-id="${exercise.id}">
                                Löschen
                            </button>
                        </div>
                    </div>
                </div>
                <div class="exercise-inputs">
                    <div class="exercise-input-group">
                        <label>Sets</label>
                        <input type="number" 
                               value="${exercise.sets || ''}" 
                               placeholder="0"
                               data-field="sets"
                               data-exercise-id="${exercise.id}"
                               inputmode="numeric">
                    </div>
                    <div class="exercise-input-group">
                        <label>Gewicht (kg)</label>
                        <input type="number" 
                               value="${exercise.weight || ''}" 
                               placeholder="0"
                               data-field="weight"
                               data-exercise-id="${exercise.id}"
                               inputmode="decimal"
                               step="0.5">
                    </div>
                    <div class="exercise-input-group">
                        <label>Reps</label>
                        <input type="number" 
                               value="${exercise.reps || ''}" 
                               placeholder="0"
                               data-field="reps"
                               data-exercise-id="${exercise.id}"
                               inputmode="numeric">
                    </div>
                </div>
                <button class="exercise-complete-btn ${completedClass}" 
                        data-action="complete" 
                        data-exercise-id="${exercise.id}">
                    ${exercise.completed ? '✓ Erledigt' : 'Als erledigt markieren'}
                </button>
            </div>
        `;
    },

    // V2: Exercise database list
    renderExerciseDatabase(exercises) {
        if (!exercises || exercises.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">📚</div>
                    <p class="empty-state-text">Noch keine Übungen in der Datenbank.</p>
                </div>
            `;
        }

        return exercises.map(exercise => `
            <div class="db-exercise-card" data-exercise-id="${exercise.id}">
                <div class="db-exercise-info">
                    <span class="db-exercise-name">${this.escapeHtml(exercise.name)}</span>
                    ${exercise.muscleGroup ? `<span class="db-exercise-muscle">${this.escapeHtml(exercise.muscleGroup)}</span>` : ''}
                </div>
                <button class="db-exercise-delete" data-action="delete-db" data-exercise-id="${exercise.id}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        `).join('');
    },

    // V2: Muscle group statistics bars
    renderMuscleStats(muscleStats) {
        const groups = Object.keys(muscleStats);
        if (groups.length === 0) {
            return `
                <div class="empty-state" style="padding: 1rem;">
                    <p class="empty-state-text">Noch keine Daten vorhanden.</p>
                </div>
            `;
        }

        const maxSets = Math.max(...Object.values(muscleStats), 1);

        return groups.map(group => {
            const sets = muscleStats[group];
            const percentage = (sets / maxSets) * 100;
            return `
                <div class="muscle-stat-row">
                    <span class="muscle-stat-label">${this.escapeHtml(group)}</span>
                    <div class="muscle-stat-bar-container">
                        <div class="muscle-stat-bar" style="width: ${percentage}%"></div>
                    </div>
                    <span class="muscle-stat-value">${sets}</span>
                </div>
            `;
        }).join('');
    },

    renderStatsGrid(stats) {
        return `
            <div class="stat-card">
                <div class="stat-value">${stats.workoutsThisWeek}</div>
                <div class="stat-label">Workouts diese Woche</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.totalWorkouts}</div>
                <div class="stat-label">Workouts gesamt</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.totalSets}</div>
                <div class="stat-label">Sets gesamt</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${this.formatVolume(stats.totalVolume)}</div>
                <div class="stat-label">Volume (kg)</div>
            </div>
        `;
    },

    formatVolume(volume) {
        if (volume >= 1000000) {
            return (volume / 1000000).toFixed(1) + 'M';
        }
        if (volume >= 1000) {
            return (volume / 1000).toFixed(1) + 'K';
        }
        return volume.toString();
    },

    renderRecentWorkouts(workouts) {
        if (workouts.length === 0) {
            return `
                <div class="empty-state">
                    <p class="empty-state-text">Noch keine Workouts aufgezeichnet.</p>
                </div>
            `;
        }

        return workouts.map(workout => {
            const date = new Date(workout.date);
            const dateDisplay = this.formatDateDisplay(date);
            const exerciseCount = workout.exercises ? workout.exercises.length : 0;
            const setCount = workout.exercises
                ? workout.exercises.reduce((sum, ex) => sum + (ex.completed ? (parseInt(ex.sets) || 0) : 0), 0)
                : 0;

            return `
                <div class="workout-item">
                    <span class="workout-date">${dateDisplay}</span>
                    <span class="workout-summary">${exerciseCount} Übungen · ${setCount} Sets</span>
                </div>
            `;
        }).join('');
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};
