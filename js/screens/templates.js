/* ========================================
   Templates Screen - Fitapp
   Manage workout templates
   ======================================== */

const TemplatesScreen = {
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
        const selectedIds = template ? template.exerciseIds : [];

        const content = `
            <div class="input-group mb-lg">
                <label class="input-label">Name</label>
                <input type="text" class="input" id="template-name" 
                       value="${template?.name || ''}" 
                       placeholder="z.B. Chest + Back">
            </div>

            <div class="mb-md">
                <label class="input-label">Übungen</label>
                <p class="text-sm text-secondary mb-md">Wähle die Übungen für diese Vorlage</p>
            </div>

            <div id="template-exercises" class="list mb-md" style="max-height: 300px; overflow-y: auto;">
                ${this.renderExerciseCheckboxes(exercises, selectedIds)}
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

    renderExerciseCheckboxes(exercises, selectedIds) {
        return Object.keys(MUSCLE_GROUPS).map(muscleId => {
            const muscleExercises = exercises.filter(e => e.muscleGroup === muscleId);
            if (muscleExercises.length === 0) return '';

            return `
                <div class="exercise-group">
                    <div class="exercise-group-title">${getMuscleGroup(muscleId).name}</div>
                    ${muscleExercises.map(ex => `
                        <label class="exercise-item" style="cursor: pointer;">
                            <input type="checkbox" 
                                   class="template-exercise-checkbox" 
                                   value="${ex.id}"
                                   ${selectedIds.includes(ex.id) ? 'checked' : ''}
                                   style="width: 18px; height: 18px; accent-color: var(--color-accent);">
                            <span class="exercise-item-name" style="margin-left: var(--spacing-sm);">${ex.name}</span>
                        </label>
                    `).join('')}
                </div>
            `;
        }).join('');
    },

    saveTemplate(id) {
        const nameInput = document.getElementById('template-name');
        const name = nameInput?.value.trim();

        if (!name) {
            nameInput.style.borderColor = 'var(--color-error)';
            return;
        }

        const checkboxes = document.querySelectorAll('.template-exercise-checkbox:checked');
        const exerciseIds = Array.from(checkboxes).map(cb => cb.value);

        if (exerciseIds.length === 0) {
            alert('Bitte wähle mindestens eine Übung aus.');
            return;
        }

        if (id) {
            Storage.updateTemplate(id, { name, exerciseIds });
        } else {
            Storage.addTemplate({ name, exerciseIds });
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
