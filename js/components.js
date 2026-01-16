/**
 * FitTrack - UI Components V3
 * Workout templates, exercises, and chart components
 */

const Components = {
    dayNames: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
    dayNamesFull: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'],
    monthNames: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],

    muscleGroups: ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Abs'],

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

    // ==========================================
    // Workout Template Selection (Home Page)
    // ==========================================

    renderTemplateSelection(templates, hasWorkout) {
        if (hasWorkout) {
            return ''; // Don't show if workout already exists
        }

        if (!templates || templates.length === 0) {
            return `
                <div class="template-selection">
                    <p class="template-hint">Erstelle zuerst eine Workout-Vorlage in der Datenbank.</p>
                    <button class="add-exercise-btn" id="add-exercise-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Einzelne Übung hinzufügen
                    </button>
                </div>
            `;
        }

        const templateButtons = templates.map(t => `
            <button class="template-btn" data-template-id="${t.id}">
                <span class="template-btn-name">${this.escapeHtml(t.name)}</span>
                <span class="template-btn-count">${t.exercises?.length || 0} Übungen</span>
            </button>
        `).join('');

        return `
            <div class="template-selection">
                <p class="template-hint">Workout auswählen:</p>
                <div class="template-buttons">
                    ${templateButtons}
                </div>
                <div class="template-divider">
                    <span>oder</span>
                </div>
                <button class="add-exercise-btn" id="add-exercise-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Einzelne Übung hinzufügen
                </button>
            </div>
        `;
    },

    // ==========================================
    // Exercise Tracking
    // ==========================================

    renderExercises(exercises, templateName = null) {
        if (!exercises || exercises.length === 0) {
            return '';
        }

        const header = templateName ? `
            <div class="workout-header">
                <span class="workout-template-name">${this.escapeHtml(templateName)}</span>
                <button class="workout-clear-btn" id="clear-workout-btn">Löschen</button>
            </div>
        ` : '';

        return header + exercises.map(exercise => this.renderExerciseCard(exercise)).join('');
    },

    renderExerciseCard(exercise) {
        const completedClass = exercise.completed ? 'completed' : '';
        const muscleTag = exercise.muscleGroup
            ? `<span class="exercise-muscle-tag">${this.escapeHtml(exercise.muscleGroup)}</span>`
            : '';

        return `
            <div class="exercise-card" data-exercise-id="${exercise.id}">
                <div class="exercise-header">
                    <span class="exercise-name">${this.escapeHtml(exercise.name)}${muscleTag}</span>
                    <button class="exercise-menu-btn" data-action="delete" data-exercise-id="${exercise.id}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
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

    // ==========================================
    // Favorite Exercises (Templates Page)
    // ==========================================

    renderFavoritesSection(favorites) {
        const favoritesHtml = (favorites || []).map(fav => `
            <div class="favorite-card" data-favorite-id="${fav.id}">
                <div class="favorite-card-actions">
                    <button class="favorite-edit-btn" data-action="edit-favorite" data-favorite-id="${fav.id}"
                            data-favorite-name="${this.escapeHtml(fav.name)}" data-favorite-muscle="${this.escapeHtml(fav.muscleGroup)}">✎</button>
                    <button class="favorite-delete-btn" data-action="delete-favorite" data-favorite-id="${fav.id}">×</button>
                </div>
                <span class="favorite-name">${this.escapeHtml(fav.name)}</span>
                <span class="favorite-muscle">${this.escapeHtml(fav.muscleGroup)}</span>
            </div>
        `).join('');

        return `
            <div class="favorites-section">
                <h3 class="subsection-title">Übungsbibliothek</h3>
                <div class="favorites-scroll-container">
                    <div class="favorites-scroll">
                        ${favoritesHtml}
                        <button class="favorite-add-btn" id="add-favorite-btn">
                            <span class="favorite-add-icon">+</span>
                            <span>Neu</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    renderFavoritesPicker(favorites) {
        if (!favorites || favorites.length === 0) {
            return '';
        }

        const chips = favorites.map(fav => `
            <button class="favorite-chip" data-action="pick-favorite" 
                    data-name="${this.escapeHtml(fav.name)}" 
                    data-muscle="${this.escapeHtml(fav.muscleGroup)}">
                ${this.escapeHtml(fav.name)}
            </button>
        `).join('');

        return `
            <div class="favorites-picker">
                <label class="form-label">Aus Favoriten:</label>
                <div class="favorites-chips">
                    ${chips}
                </div>
                <div class="favorites-divider">
                    <span>oder neue Übung</span>
                </div>
            </div>
        `;
    },

    // ==========================================
    // Workout Templates (Database Page)
    // ==========================================

    renderTemplatesList(templates) {
        if (!templates || templates.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <p class="empty-state-text">Noch keine Workout-Vorlagen erstellt.</p>
                </div>
            `;
        }

        return templates.map(template => `
            <div class="template-card" data-template-id="${template.id}">
                <div class="template-card-header">
                    <span class="template-card-name">${this.escapeHtml(template.name)}</span>
                    <span class="template-card-count">${template.exercises?.length || 0} Übungen</span>
                </div>
                <div class="template-card-exercises">
                    ${(template.exercises || []).slice(0, 3).map(ex =>
            `<span class="template-exercise-tag">${this.escapeHtml(ex.name)}</span>`
        ).join('')}
                    ${(template.exercises?.length || 0) > 3 ? `<span class="template-exercise-more">+${template.exercises.length - 3} mehr</span>` : ''}
                </div>
                <div class="template-card-actions">
                    <button class="template-edit-btn" data-action="edit" data-template-id="${template.id}">Bearbeiten</button>
                    <button class="template-delete-btn" data-action="delete-template" data-template-id="${template.id}">Löschen</button>
                </div>
            </div>
        `).join('');
    },

    renderTemplateEditor(template) {
        const exercisesList = (template.exercises || []).map((ex, index) => `
            <div class="editor-exercise-item" data-exercise-id="${ex.id}" data-index="${index}" draggable="true">
                <div class="editor-exercise-header">
                    <span class="drag-handle">⋮⋮</span>
                    <span class="editor-exercise-name">${this.escapeHtml(ex.name)}</span>
                    ${ex.muscleGroup ? `<span class="editor-exercise-muscle">${this.escapeHtml(ex.muscleGroup)}</span>` : ''}
                    <div class="editor-exercise-actions">
                        <button class="editor-exercise-edit" data-action="edit-exercise" data-exercise-id="${ex.id}" 
                                data-exercise-name="${this.escapeHtml(ex.name)}" data-exercise-muscle="${this.escapeHtml(ex.muscleGroup || '')}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button class="editor-exercise-remove" data-action="remove-exercise" data-exercise-id="${ex.id}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="editor-exercise-defaults">
                    <div class="editor-input-group">
                        <label>Sets</label>
                        <input type="number" value="${ex.defaultSets || ''}" placeholder="3" 
                               data-field="defaultSets" data-exercise-id="${ex.id}" inputmode="numeric">
                    </div>
                    <div class="editor-input-group">
                        <label>Gewicht</label>
                        <input type="number" value="${ex.defaultWeight || ''}" placeholder="0" 
                               data-field="defaultWeight" data-exercise-id="${ex.id}" inputmode="decimal" step="0.5">
                    </div>
                    <div class="editor-input-group">
                        <label>Reps</label>
                        <input type="number" value="${ex.defaultReps || ''}" placeholder="10" 
                               data-field="defaultReps" data-exercise-id="${ex.id}" inputmode="numeric">
                    </div>
                </div>
            </div>
        `).join('');

        return `
            <div class="template-editor">
                <div class="editor-header">
                    <button class="editor-back-btn" id="editor-back">← Zurück</button>
                    <input type="text" class="editor-title-input" id="editor-title" value="${this.escapeHtml(template.name)}">
                    <button class="editor-save-btn" id="editor-save">✓</button>
                </div>
                <div class="editor-exercises-list" id="editor-exercises-list">
                    ${exercisesList || '<p class="editor-empty">Noch keine Übungen in dieser Vorlage.</p>'}
                </div>
                <button class="add-exercise-btn" id="add-template-exercise-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Übung hinzufügen
                </button>
            </div>
        `;
    },

    // ==========================================
    // Statistics & Chart
    // ==========================================

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
        if (volume >= 1000000) return (volume / 1000000).toFixed(1) + 'M';
        if (volume >= 1000) return (volume / 1000).toFixed(1) + 'K';
        return volume.toString();
    },

    renderMuscleStats(muscleStats) {
        // Show all muscle groups, even if 0 sets
        const allGroups = this.muscleGroups;
        const maxScale = 20; // High end reference (like in the image)

        return allGroups.map(group => {
            const sets = muscleStats[group] || 0;
            const percentage = Math.min((sets / maxScale) * 100, 100);
            const isLow = sets < 10;

            return `
                <div class="muscle-stat-row ${isLow ? 'low' : ''}">
                    <span class="muscle-stat-label">${this.escapeHtml(group)}</span>
                    <div class="muscle-stat-bar-container">
                        <div class="muscle-stat-bar" style="width: ${percentage}%"></div>
                    </div>
                    <span class="muscle-stat-value">${sets}</span>
                </div>
            `;
        }).join('');
    },

    renderVolumeChart(volumeHistory) {
        if (!volumeHistory || volumeHistory.length < 2) {
            return `<div class="chart-empty"><p>Mindestens 2 Workouts benötigt für Chart.</p></div>`;
        }

        const width = 320;
        const height = 160;
        const padding = { top: 20, right: 40, bottom: 30, left: 10 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        const volumes = volumeHistory.map(d => d.volume);
        const minVolume = Math.min(...volumes) * 0.9;
        const maxVolume = Math.max(...volumes) * 1.1;

        const xScale = (i) => padding.left + (i / (volumeHistory.length - 1)) * chartWidth;
        const yScale = (v) => padding.top + chartHeight - ((v - minVolume) / (maxVolume - minVolume)) * chartHeight;

        // Create path
        const pathData = volumeHistory.map((d, i) =>
            `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.volume)}`
        ).join(' ');

        // Grid lines
        const gridLines = [0.25, 0.5, 0.75].map(p => {
            const y = padding.top + chartHeight * (1 - p);
            const value = Math.round(minVolume + (maxVolume - minVolume) * p);
            return `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" class="chart-grid-line"/>
                    <text x="${width - padding.right + 5}" y="${y + 4}" class="chart-label">${this.formatVolume(value)}</text>`;
        }).join('');

        // Date labels
        const firstDate = new Date(volumeHistory[0].date);
        const lastDate = new Date(volumeHistory[volumeHistory.length - 1].date);
        const dateLabels = `
            <text x="${padding.left}" y="${height - 5}" class="chart-label">${firstDate.getDate()}.${firstDate.getMonth() + 1}</text>
            <text x="${width - padding.right}" y="${height - 5}" class="chart-label" text-anchor="end">${lastDate.getDate()}.${lastDate.getMonth() + 1}</text>
        `;

        return `
            <svg class="volume-chart" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
                ${gridLines}
                ${dateLabels}
                <path d="${pathData}" class="chart-line" fill="none"/>
            </svg>
        `;
    },

    renderRecentWorkouts(workouts) {
        if (workouts.length === 0) {
            return `<div class="empty-state"><p class="empty-state-text">Noch keine Workouts.</p></div>`;
        }

        return workouts.map(workout => {
            const date = new Date(workout.date);
            const dateDisplay = this.formatDateDisplay(date);
            const name = workout.templateName || 'Workout';
            const exerciseCount = workout.exercises ? workout.exercises.length : 0;

            return `
                <div class="workout-item">
                    <span class="workout-date">${dateDisplay}</span>
                    <span class="workout-summary">${this.escapeHtml(name)} · ${exerciseCount} Übungen</span>
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
