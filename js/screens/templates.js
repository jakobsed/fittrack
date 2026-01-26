/* ========================================
   Workouts Screen - Fitapp
   Calendar & Program View (MacroFactor Style)
   ======================================== */

const TemplatesScreen = {
    // Temporary storage for selected exercise IDs during editing
    selectedExerciseIds: [],

    render() {
        const templates = Storage.getTemplates();
        const date = new Date();
        const todayNum = date.getDate();
        const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
        // Generate a calendar strip centered on today, or just static M-S for now
        // To match screenshot: M 3, T 4, W 5, T 6, F 7, S 8 (Highlighted), S 9

        // Mock calendar for visual accuracy based on current date
        const currentDayIndex = (date.getDay() + 6) % 7; // 0=Mon, 6=Sun
        const calendarHTML = days.map((d, i) => {
            const offset = i - currentDayIndex;
            const dDate = new Date(date);
            dDate.setDate(date.getDate() + offset);
            const num = dDate.getDate();
            const isToday = i === currentDayIndex;
            const isSelected = i === currentDayIndex; // For now select today

            return `
                <div class="calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'active' : ''}">
                    <span class="day-name">${d}</span>
                    <span class="day-num">${num}</span>
                    ${isToday ? `<div style="width:4px; height:4px; background:var(--color-brand-primary); border-radius:50%; margin-top:4px;"></div>` : ''}
                </div>
            `;
        }).join('');

        return `
            <div class="templates-screen animate-fade-in">
                <!-- Header -->
                <div class="screen-header">
                    <div class="screen-header-left">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                    </div>
                    <div class="screen-title" style="font-size: var(--font-size-lg);">Workout</div>
                    <button class="btn btn-ghost btn-icon-sm" onclick="TemplatesScreen.showCreateModal()">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                </div>

                <!-- Calendar Strip -->
                <div class="calendar-strip">
                    ${calendarHTML}
                </div>

                <!-- Active Program Title -->
                <div class="program-section-header">
                    <span class="section-title" style="margin:0;">Active Program</span>
                    <span class="text-sm text-secondary">Cycle 2</span>
                </div>

                <!-- Active Program Card -->
                <div class="program-card">
                    <div class="program-header">
                        <div class="program-icon">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
                                <path d="M12 15l-3 3a2.2 2.2 0 0 0 2 2l3-3"></path>
                                <path d="M14.31 8l5.74 9.94"></path>
                                <path d="M9.69 8h3.62"></path>
                                <path d="M18 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path>
                                <path d="M14 2l-.93 5.48a6 6 0 0 0-1.77 2.12"></path>
                            </svg>
                        </div>
                        <div class="program-info">
                            <div class="program-title">Novice Hypertrophy</div>
                            <div class="program-subtitle">2 workouts</div>
                        </div>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--color-text-secondary)" stroke-width="2">
                            <polyline points="18 15 12 9 6 15"></polyline>
                        </svg>
                    </div>

                    <div class="program-workouts">
                        <!-- Workout 1 -->
                        <div class="program-workout-item">
                            <div class="p-workout-info">
                                <div class="p-workout-title">Workout 1</div>
                                <div class="p-workout-desc">Dumbbell Bench Press, Bent-Over Neutral Grip T-Bar Row, Neutral Grip Pin-Loaded...</div>
                                <div class="p-tags">
                                    <span class="p-tag">Chest</span>
                                    <span class="p-tag">Triceps</span>
                                    <span class="p-tag">Front Delts</span>
                                    <span class="p-tag">Lats</span>
                                </div>
                            </div>
                            <div class="p-checkbox"></div>
                        </div>

                        <!-- Rest Day -->
                        <div class="program-workout-item">
                            <div class="p-workout-info">
                                <div class="p-workout-title">Rest Day</div>
                            </div>
                            <div class="p-checkbox"></div>
                        </div>

                        <!-- Workout 2 -->
                         <div class="program-workout-item">
                            <div class="p-workout-info">
                                <div class="p-workout-title">Workout 2</div>
                                <div class="p-workout-desc">Barbell Back Squat, Pin-Loaded Machine Leg Press, Glute Ham Raise...</div>
                                <div class="p-tags">
                                    <span class="p-tag">Glutes</span>
                                    <span class="p-tag">Quads</span>
                                    <span class="p-tag">Adductors</span>
                                </div>
                            </div>
                            <div class="p-checkbox"></div>
                        </div>
                    </div>
                </div>

                <!-- Workout Library Title -->
                <div class="program-section-header">
                    <span class="section-title" style="margin:0;">Workout Library</span>
                    <span class="text-sm text-secondary" style="text-decoration: underline;">Collapse</span>
                </div>

                 <!-- Library Program Card (Custom Templates) -->
                ${templates.length > 0 ? `
                 <div class="program-card">
                    <div class="program-header">
                         <div class="program-icon red">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 2l-5 9h10z"></path>
                                <path d="M7.5 13.5L4 22h16l-3.5-8.5"></path>
                            </svg>
                        </div>
                        <div class="program-info">
                            <div class="program-title">My Custom Workouts</div>
                            <div class="program-subtitle">${templates.length} workouts</div>
                        </div>
                         <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--color-text-secondary)" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                     <div class="program-workouts">
                        ${templates.slice(0, 3).map(t => `
                            <div class="program-workout-item" onclick="WorkoutScreen.startFromTemplate('${t.id}')" style="cursor:pointer;">
                                <div class="p-workout-info">
                                    <div class="p-workout-title">${App.escapeHTML(t.name)}</div>
                                    <div class="p-workout-desc">${t.exerciseIds.length} Exercises</div>
                                </div>
                                <div class="p-checkbox" style="border-radius:50%; display:flex; align-items:center; justify-content:center; border:1px solid var(--color-brand-primary);">
                                     <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--color-brand-primary)" stroke-width="2">
                                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                    </svg>
                                </div>
                            </div>
                        `).join('')}
                     </div>
                 </div>
                ` : ''}

                <!-- Empty State if no templates -->
                 ${templates.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-state-title">No Custom Workouts</div>
                        <button class="btn btn-primary mt-lg" onclick="TemplatesScreen.showCreateModal()">
                            Create First Workout
                        </button>
                    </div>
                ` : ''}

            </div>
        `;
    },

    renderTemplate(template, index, total) {
        // ... (Old renderTemplate logic if needed, but we are using the new card layout)
        return '';
    },

    showCreateModal() {
        this.showEditModal(null);
    },

    editTemplate(id) {
        const template = Storage.getTemplate(id);
        this.showEditModal(template);
    },

    showEditModal(template) {
        const isNew = !template;
        const exercises = Storage.getExercises();

        // Initialize selected exercises
        this.selectedExerciseIds = template ? [...template.exerciseIds] : [];

        const content = `
            <div class="input-group mb-lg">
                <label class="input-label">Name</label>
                <input type="text" class="input" id="template-name" 
                       value="${App.escapeHTML(template?.name || '')}" 
                       placeholder="z.B. Chest + Back">
            </div>

            <div class="mb-md">
                <label class="input-label">Ausgewählte Übungen</label>
                <p class="text-sm text-secondary mb-sm">Reihenfolge mit Pfeilen ändern</p>
            </div>

            <div id="selected-exercises" class="selected-exercises-list mb-lg">
                ${this.renderSelectedExercises()}
            </div>

            <div class="mb-md">
                <label class="input-label">Übung hinzufügen</label>
            </div>

            <div id="available-exercises" class="list" style="max-height: 200px; overflow-y: auto;">
                ${this.renderAvailableExercises(exercises)}
            </div>
        `;

        const footer = `
            <button class="btn btn-primary btn-full" onclick="TemplatesScreen.saveTemplate(${template ? `'${template.id}'` : 'null'})">
                ${isNew ? 'Erstellen' : 'Speichern'}
            </button>
        `;

        Modal.showSheet({
            title: isNew ? 'Neue Vorlage' : 'Vorlage bearbeiten',
            content: content,
            footer: footer
        });
    },

    renderSelectedExercises() {
        if (this.selectedExerciseIds.length === 0) {
            return '<div class="text-sm text-secondary" style="padding: var(--spacing-md); text-align: center;">Keine Übungen ausgewählt</div>';
        }

        return this.selectedExerciseIds.map((id, index) => {
            const exercise = Storage.getExercise(id);
            if (!exercise) return '';

            const muscle = getMuscleGroup(exercise.muscleGroup);
            const isFirst = index === 0;
            const isLast = index === this.selectedExerciseIds.length - 1;

            return `
                <div class="selected-exercise-item">
                    <div class="selected-exercise-info">
                        <span class="selected-exercise-name">${App.escapeHTML(exercise.name)}</span>
                        <span class="tag tag-${exercise.muscleGroup}">${muscle.name}</span>
                    </div>
                    <div class="selected-exercise-actions">
                        <div class="reorder-arrows">
                            <button class="arrow-btn ${isFirst ? 'disabled' : ''}" 
                                    onclick="TemplatesScreen.moveExercise(${index}, -1)"
                                    ${isFirst ? 'disabled' : ''}>
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="18 15 12 9 6 15"></polyline>
                                </svg>
                            </button>
                            <button class="arrow-btn ${isLast ? 'disabled' : ''}" 
                                    onclick="TemplatesScreen.moveExercise(${index}, 1)"
                                    ${isLast ? 'disabled' : ''}>
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </button>
                        </div>
                        <button class="btn btn-ghost btn-icon-sm" onclick="TemplatesScreen.removeExercise(${index})">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    renderAvailableExercises(exercises) {
        // Filter out already selected exercises
        const available = exercises.filter(e => !this.selectedExerciseIds.includes(e.id));

        if (available.length === 0) {
            return '<div class="text-sm text-secondary" style="padding: var(--spacing-md); text-align: center;">Alle Übungen ausgewählt</div>';
        }

        return Object.keys(MUSCLE_GROUPS).map(muscleId => {
            const muscleExercises = available.filter(e => e.muscleGroup === muscleId);
            if (muscleExercises.length === 0) return '';

            return `
                <div class="exercise-group">
                    <div class="exercise-group-title">${getMuscleGroup(muscleId).name}</div>
                    ${muscleExercises.map(ex => `
                        <div class="exercise-item" onclick="TemplatesScreen.addExercise('${ex.id}')" style="cursor: pointer;">
                            <span class="exercise-item-name">${App.escapeHTML(ex.name)}</span>
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--color-accent)" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </div>
                    `).join('')}
                </div>
            `;
        }).join('');
    },

    addExercise(exerciseId) {
        if (!this.selectedExerciseIds.includes(exerciseId)) {
            this.selectedExerciseIds.push(exerciseId);
            this.refreshModalLists();
        }
    },

    removeExercise(index) {
        this.selectedExerciseIds.splice(index, 1);
        this.refreshModalLists();
    },

    moveExercise(index, direction) {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= this.selectedExerciseIds.length) return;

        // Swap elements
        const temp = this.selectedExerciseIds[index];
        this.selectedExerciseIds[index] = this.selectedExerciseIds[newIndex];
        this.selectedExerciseIds[newIndex] = temp;

        this.refreshModalLists();
    },

    refreshModalLists() {
        const selectedContainer = document.getElementById('selected-exercises');
        const availableContainer = document.getElementById('available-exercises');
        const exercises = Storage.getExercises();

        if (selectedContainer) {
            selectedContainer.innerHTML = this.renderSelectedExercises();
        }
        if (availableContainer) {
            availableContainer.innerHTML = this.renderAvailableExercises(exercises);
        }
    },

    saveTemplate(id) {
        const nameInput = document.getElementById('template-name');
        const name = nameInput?.value.trim();

        if (!name) {
            nameInput.style.borderColor = 'var(--color-error)';
            return;
        }

        if (this.selectedExerciseIds.length === 0) {
            alert('Bitte wähle mindestens eine Übung aus.');
            return;
        }

        if (id) {
            Storage.updateTemplate(id, { name, exerciseIds: this.selectedExerciseIds });
        } else {
            Storage.addTemplate({ name, exerciseIds: this.selectedExerciseIds });
        }

        Modal.close();
        App.refreshScreen();
    },

    moveTemplate(index, direction) {
        const templates = Storage.getTemplates();
        const newIndex = index + direction;

        if (newIndex < 0 || newIndex >= templates.length) return;

        // Swap templates
        const temp = templates[index];
        templates[index] = templates[newIndex];
        templates[newIndex] = temp;

        // Save reordered list
        Storage.set(Storage.KEYS.TEMPLATES, templates);
        App.refreshScreen();
    },

    async deleteTemplate(id) {
        const template = Storage.getTemplate(id);
        if (!template) return;

        const confirmed = await Modal.confirm({
            title: 'Vorlage löschen?',
            message: `"${App.escapeHTML(template.name)}" wird unwiderruflich gelöscht.`,
            confirmText: 'Löschen',
            cancelText: 'Abbrechen',
            danger: true
        });

        if (confirmed) {
            Storage.deleteTemplate(id);
            App.refreshScreen();
        }
    }
};
