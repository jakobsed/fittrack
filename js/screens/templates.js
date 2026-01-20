/* ========================================
   Templates Screen - Fitapp
   Manage workout templates
   ======================================== */

const TemplatesScreen = {
    // Temporary storage for selected exercise IDs during editing
    selectedExerciseIds: [],

    render() {
        const templates = Storage.getTemplates();

        return `
            <div class="templates-screen animate-fade-in">
                <div class="screen-header">
                    <h1 class="screen-title">Vorlagen</h1>
                    <button class="btn btn-primary btn-sm" onclick="TemplatesScreen.showCreateModal()">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Neu
                    </button>
                </div>

                ${templates.length > 0 ? `
                    <div class="templates-list">
                        ${templates.map(t => this.renderTemplate(t)).join('')}
                    </div>
                ` : `
                    <div class="empty-state">
                        <div class="empty-state-title">Keine Vorlagen</div>
                        <div class="empty-state-text">
                            Erstelle Workout-Vorlagen für schnelleren Zugriff auf deine Trainingsroutinen.
                        </div>
                        <button class="btn btn-primary mt-lg" onclick="TemplatesScreen.showCreateModal()">
                            Erste Vorlage erstellen
                        </button>
                    </div>
                `}
            </div>
        `;
    },

    renderTemplate(template) {
        const exercises = template.exerciseIds
            .map(id => Storage.getExercise(id)?.name)
            .filter(Boolean);

        const exerciseList = exercises.slice(0, 4).join(', ');
        const moreCount = exercises.length - 4;

        return `
            <div class="template-card">
                <div class="template-header">
                    <h3 class="template-name">${template.name}</h3>
                    <div class="template-actions">
                        <button class="btn btn-ghost btn-icon-sm" onclick="TemplatesScreen.editTemplate('${template.id}')">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button class="btn btn-ghost btn-icon-sm" onclick="TemplatesScreen.deleteTemplate('${template.id}')">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="template-exercises">
                    ${exerciseList}${moreCount > 0 ? ` +${moreCount} mehr` : ''}
                </div>
                <button class="btn btn-secondary btn-full mt-md" onclick="WorkoutScreen.startFromTemplate('${template.id}')">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    Workout starten
                </button>
            </div>
        `;
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
                       value="${template?.name || ''}" 
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
                        <span class="selected-exercise-name">${exercise.name}</span>
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
                            <span class="exercise-item-name">${ex.name}</span>
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

    async deleteTemplate(id) {
        const template = Storage.getTemplate(id);
        if (!template) return;

        const confirmed = await Modal.confirm({
            title: 'Vorlage löschen?',
            message: `"${template.name}" wird unwiderruflich gelöscht.`,
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
