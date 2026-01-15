/**
 * FitTrack - UI Components Module
 * Reusable UI component generators
 */

const Components = {
    /**
     * German day names (short)
     */
    dayNames: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],

    /**
     * German day names (full)
     */
    dayNamesFull: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'],

    /**
     * German month names
     */
    monthNames: [
        'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
        'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ],

    /**
     * Format date to YYYY-MM-DD
     * @param {Date} date 
     * @returns {string}
     */
    formatDateKey(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    /**
     * Format date for display
     * @param {Date} date 
     * @returns {string}
     */
    formatDateDisplay(date) {
        const dayIndex = (date.getDay() + 6) % 7; // Adjust for Monday start
        const dayName = this.dayNamesFull[dayIndex];
        const day = date.getDate();
        const month = this.monthNames[date.getMonth()];
        return `${dayName}, ${day}. ${month}`;
    },

    /**
     * Get week number
     * @param {Date} date 
     * @returns {number}
     */
    getWeekNumber(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    },

    /**
     * Get dates for a week (Monday to Sunday)
     * @param {Date} referenceDate - Any date in the desired week
     * @returns {Date[]} Array of 7 dates
     */
    getWeekDates(referenceDate) {
        const dates = [];
        const day = referenceDate.getDay();
        // Adjust to get Monday (day 0 = Sunday, so we adjust)
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

    /**
     * Render week calendar
     * @param {Date[]} weekDates - Array of week dates
     * @param {string} selectedDateKey - Currently selected date key
     * @param {string[]} workoutDates - Dates that have workouts
     * @returns {string} HTML string
     */
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

    /**
     * Render week title
     * @param {Date} referenceDate 
     * @returns {string}
     */
    renderWeekTitle(referenceDate) {
        const month = this.monthNames[referenceDate.getMonth()];
        const year = referenceDate.getFullYear();
        const weekNum = this.getWeekNumber(referenceDate);
        return `${month} ${year} - Woche ${weekNum}`;
    },

    /**
     * Render exercises list
     * @param {Array} exercises 
     * @returns {string} HTML string
     */
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

    /**
     * Render single exercise card
     * @param {Object} exercise 
     * @returns {string} HTML string
     */
    renderExerciseCard(exercise) {
        const sets = exercise.sets || [];

        return `
            <div class="exercise-card" data-exercise-id="${exercise.id}">
                <div class="exercise-header">
                    <span class="exercise-name">${this.escapeHtml(exercise.name)}</span>
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
                <div class="sets-container">
                    <div class="sets-header">
                        <span>Set</span>
                        <span>kg</span>
                        <span>Reps</span>
                        <span></span>
                    </div>
                    <div class="sets-list" data-exercise-id="${exercise.id}">
                        ${this.renderSets(exercise.id, sets)}
                    </div>
                    <button class="add-set-btn" data-action="add-set" data-exercise-id="${exercise.id}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Set hinzufügen
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Render sets for an exercise
     * @param {string} exerciseId 
     * @param {Array} sets 
     * @returns {string} HTML string
     */
    renderSets(exerciseId, sets) {
        if (sets.length === 0) {
            // Add one empty set by default
            return this.renderSetRow(exerciseId, 0, { weight: '', reps: '', completed: false });
        }

        return sets.map((set, index) => this.renderSetRow(exerciseId, index, set)).join('');
    },

    /**
     * Render single set row
     * @param {string} exerciseId 
     * @param {number} index 
     * @param {Object} set 
     * @returns {string} HTML string
     */
    renderSetRow(exerciseId, index, set) {
        const completedClass = set.completed ? 'completed' : '';
        const checkIcon = set.completed
            ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>'
            : '';

        return `
            <div class="set-row ${completedClass}" data-set-index="${index}">
                <span class="set-number">${index + 1}</span>
                <input type="number" 
                       class="set-input" 
                       placeholder="kg" 
                       value="${set.weight || ''}" 
                       data-field="weight"
                       data-exercise-id="${exerciseId}"
                       data-set-index="${index}"
                       inputmode="decimal"
                       step="0.5">
                <input type="number" 
                       class="set-input" 
                       placeholder="reps" 
                       value="${set.reps || ''}" 
                       data-field="reps"
                       data-exercise-id="${exerciseId}"
                       data-set-index="${index}"
                       inputmode="numeric">
                <button class="set-complete-btn ${completedClass}" 
                        data-action="complete-set"
                        data-exercise-id="${exerciseId}"
                        data-set-index="${index}">
                    ${checkIcon}
                </button>
            </div>
        `;
    },

    /**
     * Render statistics cards
     * @param {Object} stats 
     * @returns {string} HTML string
     */
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

    /**
     * Format volume number
     * @param {number} volume 
     * @returns {string}
     */
    formatVolume(volume) {
        if (volume >= 1000000) {
            return (volume / 1000000).toFixed(1) + 'M';
        }
        if (volume >= 1000) {
            return (volume / 1000).toFixed(1) + 'K';
        }
        return volume.toString();
    },

    /**
     * Render recent workouts list
     * @param {Array} workouts 
     * @returns {string} HTML string
     */
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
                ? workout.exercises.reduce((sum, ex) => sum + (ex.sets ? ex.sets.filter(s => s.completed).length : 0), 0)
                : 0;

            return `
                <div class="workout-item">
                    <span class="workout-date">${dateDisplay}</span>
                    <span class="workout-summary">${exerciseCount} Übungen · ${setCount} Sets</span>
                </div>
            `;
        }).join('');
    },

    /**
     * Escape HTML to prevent XSS
     * @param {string} text 
     * @returns {string}
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};
