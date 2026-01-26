/* ========================================
   Exercises Screen - Fitapp
   Manage exercise database
   ======================================== */

const ExercisesScreen = {
    filter: 'all', // 'all' or muscle group id
    searchQuery: '',

    render() {
        const exercises = this.getFilteredExercises();

        return `
            <div class="exercises-screen animate-fade-in">
                <!-- Minimal Header -->
                <div class="minimal-header-with-back">
                    <button class="back-btn-minimal" onclick="App.navigate('home')">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                    <button class="btn btn-ghost btn-sm" onclick="ExercisesScreen.showCreateModal()">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        NEU
                    </button>
                </div>

                <!-- Search -->
                <div class="search-bar">
                    <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input type="text" 
                           class="search-input" 
                           placeholder="Übung suchen..." 
                           value="${this.searchQuery}"
                           oninput="ExercisesScreen.search(this.value)">
                </div>

                <!-- Filters -->
                <div class="filter-tabs">
                    <button class="filter-tab ${this.filter === 'all' ? 'active' : ''}" 
                            onclick="ExercisesScreen.setFilter('all')">
                        Alle
                    </button>
                    ${Object.keys(MUSCLE_GROUPS).map(id => `
                        <button class="filter-tab ${this.filter === id ? 'active' : ''}" 
                                onclick="ExercisesScreen.setFilter('${id}')">
                            ${getMuscleGroup(id).name}
                        </button>
                    `).join('')}
                </div>

                <!-- Exercise List -->
                <div class="exercises-list">
                    ${this.renderExerciseList(exercises)}
                </div>
            </div>
        `;
    },

    getFilteredExercises() {
        let exercises = Storage.getExercises();

        // Apply search
        if (this.searchQuery) {
            exercises = exercises.filter(e =>
                e.name.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
        }

        // Apply filter
        if (this.filter !== 'all') {
            exercises = exercises.filter(e => e.muscleGroup === this.filter);
        }

        return exercises;
    },

    renderExerciseList(exercises) {
        if (exercises.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-state-title">Keine Übungen</div>
                    <div class="empty-state-text">
                        ${this.searchQuery ? 'Versuche einen anderen Suchbegriff.' : 'Füge deine erste Übung hinzu.'}
                    </div>
                </div>
            `;
        }

        // Group by muscle if showing all
        if (this.filter === 'all' && !this.searchQuery) {
            return Object.keys(MUSCLE_GROUPS).map(muscleId => {
                const muscleExercises = exercises.filter(e => e.muscleGroup === muscleId);
                if (muscleExercises.length === 0) return '';

                return `
                    <div class="exercise-group">
                        <div class="exercise-group-title">${getMuscleGroup(muscleId).name}</div>
                        ${muscleExercises.map(ex => this.renderExerciseItem(ex)).join('')}
                    </div>
                `;
            }).join('');
        }

        return exercises.map(ex => this.renderExerciseItem(ex)).join('');
    },

    renderExerciseItem(ex) {
        const muscle = getMuscleGroup(ex.muscleGroup);

        return `
            <div class="exercise-item">
                <span class="exercise-item-name">${App.escapeHTML(ex.name)}</span>
                <span class="tag tag-${ex.muscleGroup}">${muscle.name}</span>
                <button class="btn btn-ghost btn-icon-sm" 
                        onclick="event.stopPropagation(); ExercisesScreen.deleteExercise('${ex.id}')">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        `;
    },

    search(query) {
        this.searchQuery = query;
        App.refreshScreen();
    },

    setFilter(filter) {
        this.filter = filter;
        App.refreshScreen();
    },

    showCreateModal() {
        const content = `
            <div class="input-group mb-md">
                <label class="input-label">Name</label>
                <input type="text" class="input" id="exercise-name" placeholder="z.B. Bankdrücken">
            </div>

            <div class="input-group mb-md">
                <label class="input-label">Muskelgruppe</label>
                <select class="input" id="exercise-muscle" style="padding: var(--spacing-sm) var(--spacing-md);">
                    ${Object.keys(MUSCLE_GROUPS).map(id => `
                        <option value="${id}">${getMuscleGroup(id).name}</option>
                    `).join('')}
                </select>
            </div>
        `;

        const footer = `
            <button class="btn btn-primary btn-full" onclick="ExercisesScreen.saveExercise()">
                Übung erstellen
            </button>
        `;

        Modal.showSheet({
            title: 'Neue Übung',
            content: content,
            footer: footer
        });
    },

    saveExercise() {
        const nameInput = document.getElementById('exercise-name');
        const muscleSelect = document.getElementById('exercise-muscle');

        const name = nameInput?.value.trim();
        if (!name) {
            nameInput.style.borderColor = 'var(--color-error)';
            return;
        }

        Storage.addExercise({
            name: name,
            muscleGroup: muscleSelect.value
        });

        Modal.close();
        App.refreshScreen();
    },

    async deleteExercise(id) {
        const exercise = Storage.getExercise(id);
        if (!exercise) return;

        const confirmed = await Modal.confirm({
            title: 'Übung löschen?',
            message: `"${App.escapeHTML(exercise.name)}" wird unwiderruflich gelöscht.`,
            confirmText: 'Löschen',
            cancelText: 'Abbrechen',
            danger: true
        });

        if (confirmed) {
            Storage.deleteExercise(id);
            App.refreshScreen();
        }
    }
};
