/**
 * FitTrack - Main Application V3
 * Workout templates, tracking, and statistics
 */

const App = {
    currentView: 'week',
    currentWeekStart: null,
    selectedDate: null,
    weekDates: [],
    editingTemplateId: null,
    modalMode: 'workout', // 'workout' or 'template'

    init() {
        const today = new Date();
        this.currentWeekStart = this.getMonday(today);
        this.selectedDate = Components.formatDateKey(today);
        this.weekDates = Components.getWeekDates(today);

        this.renderWeekView();
        this.renderTemplatesView();
        this.renderStatsView();
        this.setupEventListeners();

        console.log('FitTrack V3 initialized!');
    },

    getMonday(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        d.setDate(d.getDate() + diff);
        return d;
    },

    setupEventListeners() {
        // Navigation
        document.getElementById('nav-week').addEventListener('click', () => this.switchView('week'));
        document.getElementById('nav-templates').addEventListener('click', () => this.switchView('templates'));
        document.getElementById('nav-stats').addEventListener('click', () => this.switchView('stats'));

        // Week navigation
        document.getElementById('prev-week').addEventListener('click', () => this.navigateWeek(-1));
        document.getElementById('next-week').addEventListener('click', () => this.navigateWeek(1));

        // Week calendar
        document.getElementById('week-calendar').addEventListener('click', (e) => {
            const dayCard = e.target.closest('.day-card');
            if (dayCard) this.selectDate(dayCard.dataset.date);
        });

        // Day workout area - template selection and exercise interactions
        document.getElementById('day-workout').addEventListener('click', (e) => {
            this.handleDayWorkoutClick(e);
        });

        document.getElementById('day-workout').addEventListener('input', (e) => {
            if (e.target.matches('.exercise-input-group input')) {
                this.handleExerciseInputChange(e);
            }
        });

        // Templates page
        document.getElementById('templates-content').addEventListener('click', (e) => {
            this.handleTemplatesClick(e);
        });

        document.getElementById('add-template-btn').addEventListener('click', () => {
            this.createNewTemplate();
        });

        // Modal
        document.getElementById('modal-close').addEventListener('click', () => this.closeModal());
        document.getElementById('modal-cancel').addEventListener('click', () => this.closeModal());
        document.getElementById('modal-save').addEventListener('click', () => this.saveModalExercise());
        document.getElementById('exercise-modal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) this.closeModal();
        });
        document.getElementById('exercise-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveModalExercise();
        });
    },

    switchView(view) {
        this.currentView = view;
        this.editingTemplateId = null;

        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        document.querySelectorAll('.view').forEach(v => {
            v.classList.toggle('active', v.id === `${view}-view`);
        });

        if (view === 'stats') this.renderStatsView();
        if (view === 'templates') this.renderTemplatesView();
    },

    navigateWeek(direction) {
        this.currentWeekStart.setDate(this.currentWeekStart.getDate() + (direction * 7));
        this.weekDates = Components.getWeekDates(this.currentWeekStart);

        const selectedInWeek = this.weekDates.some(d => Components.formatDateKey(d) === this.selectedDate);
        if (!selectedInWeek) {
            this.selectedDate = Components.formatDateKey(this.weekDates[0]);
        }
        this.renderWeekView();
    },

    selectDate(dateKey) {
        this.selectedDate = dateKey;
        this.renderWeekView();
    },

    // ==========================================
    // Week View
    // ==========================================

    renderWeekView() {
        const workoutDates = Storage.getWorkoutDates();
        const templates = Storage.getWorkoutTemplates();
        const workout = Storage.getWorkout(this.selectedDate);

        document.getElementById('week-title').textContent = Components.renderWeekTitle(this.currentWeekStart);
        document.getElementById('week-calendar').innerHTML = Components.renderWeekCalendar(this.weekDates, this.selectedDate, workoutDates);

        const selectedDateObj = new Date(this.selectedDate);
        document.getElementById('day-title').textContent = Components.formatDateDisplay(selectedDateObj);

        // Render content based on whether there's a workout
        let content = '';
        if (workout && workout.exercises && workout.exercises.length > 0) {
            content = Components.renderExercises(workout.exercises, workout.templateName);
        } else {
            content = Components.renderTemplateSelection(templates, false, this.homeFilter || 'all');
        }

        document.getElementById('day-workout').innerHTML = content;
    },

    handleDayWorkoutClick(e) {
        const target = e.target.closest('[data-action], [data-template-id], [data-home-filter], #add-exercise-btn, #clear-workout-btn');
        if (!target) return;

        // Home filter chip clicks
        if (target.dataset.homeFilter) {
            this.homeFilter = target.dataset.homeFilter;
            this.renderWeekView();
            return;
        }

        // Template selection
        if (target.dataset.templateId && !target.dataset.action) {
            this.startWorkoutFromTemplate(target.dataset.templateId);
            return;
        }

        // Add single exercise
        if (target.id === 'add-exercise-btn') {
            this.modalMode = 'workout';
            this.openModal('Übung hinzufügen');
            return;
        }

        // Clear workout
        if (target.id === 'clear-workout-btn') {
            Storage.clearWorkout(this.selectedDate);
            this.renderWeekView();
            return;
        }

        // Exercise actions
        const action = target.dataset.action;
        const exerciseId = target.dataset.exerciseId;

        if (action === 'complete') {
            this.toggleExerciseComplete(exerciseId);
        } else if (action === 'delete') {
            Storage.deleteExercise(this.selectedDate, exerciseId);
            this.renderWeekView();
        }
    },

    startWorkoutFromTemplate(templateId) {
        Storage.startWorkoutFromTemplate(this.selectedDate, templateId);
        this.renderWeekView();
    },

    toggleExerciseComplete(exerciseId) {
        const workout = Storage.getWorkout(this.selectedDate);
        if (!workout) return;

        const exercise = workout.exercises.find(ex => ex.id === exerciseId);
        if (!exercise) return;

        const newCompleted = !exercise.completed;
        Storage.updateExercise(this.selectedDate, exerciseId, { completed: newCompleted });

        // Sync values back to template when marking as complete
        if (newCompleted && workout.templateId) {
            Storage.syncWorkoutToTemplate(workout.templateId, exercise.name, {
                sets: exercise.sets,
                weight: exercise.weight,
                reps: exercise.reps
            });
        }

        this.renderWeekView();
    },

    handleExerciseInputChange(e) {
        const exerciseId = e.target.dataset.exerciseId;
        const field = e.target.dataset.field;
        const value = e.target.value;
        Storage.updateExercise(this.selectedDate, exerciseId, { [field]: value });

        // Sync changes back to template
        const workout = Storage.getWorkout(this.selectedDate);
        if (workout?.templateId) {
            const exercise = workout.exercises?.find(ex => ex.id === exerciseId);
            if (exercise) {
                Storage.syncWorkoutToTemplate(workout.templateId, exercise.name, { [field]: value });
            }
        }
    },

    // ==========================================
    // Templates View
    // ==========================================

    renderTemplatesView() {
        const templates = Storage.getWorkoutTemplates();
        const favorites = Storage.getFavoriteExercises();

        // Always render favorites section with active filter
        document.getElementById('favorites-section').innerHTML =
            Components.renderFavoritesSection(favorites, this.favoriteFilter || 'all');
        this.setupFavoritesListeners();

        if (this.editingTemplateId) {
            const template = Storage.getTemplateById(this.editingTemplateId);
            if (template) {
                document.getElementById('templates-content').innerHTML = Components.renderTemplateEditor(template);
                this.setupEditorListeners();
                return;
            }
        }

        document.getElementById('templates-content').innerHTML =
            Components.renderTemplatesList(templates, this.templateFilter || 'all');

        // Template filter chip clicks
        document.getElementById('templates-content')?.addEventListener('click', (e) => {
            const filterChip = e.target.closest('[data-template-filter]');
            if (filterChip) {
                this.templateFilter = filterChip.dataset.templateFilter;
                this.renderTemplatesView();
            }
        });
    },

    setupFavoritesListeners() {
        // Add favorite button
        document.getElementById('add-favorite-btn')?.addEventListener('click', () => {
            this.modalMode = 'favorite';
            this.openModal('Neue Favoriten-Übung');
        });

        // Delete and Edit favorite buttons
        document.getElementById('favorites-section')?.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('[data-action="delete-favorite"]');
            if (deleteBtn) {
                e.stopPropagation();
                Storage.deleteFavoriteExercise(deleteBtn.dataset.favoriteId);
                this.renderTemplatesView();
                return;
            }

            const editBtn = e.target.closest('[data-action="edit-favorite"]');
            if (editBtn) {
                this.editingFavoriteId = editBtn.dataset.favoriteId;
                this.modalMode = 'edit-favorite';
                this.openModal('Favorit bearbeiten');
                // Prefill modal
                document.getElementById('exercise-name').value = editBtn.dataset.favoriteName || '';
                document.getElementById('exercise-muscle').value = editBtn.dataset.favoriteMuscle || '';
                return;
            }

            // Filter chip clicks
            const filterChip = e.target.closest('.filter-chip');
            if (filterChip) {
                this.favoriteFilter = filterChip.dataset.filter;
                this.renderTemplatesView();
            }
        });
    },

    setupEditorListeners() {
        const backBtn = document.getElementById('editor-back');
        const saveBtn = document.getElementById('editor-save');
        const titleInput = document.getElementById('editor-title');
        const addBtn = document.getElementById('add-template-exercise-btn');

        if (backBtn) {
            backBtn.addEventListener('click', () => {
                // If it's a new template, delete it (cancel action)
                if (this.isNewTemplate && this.editingTemplateId) {
                    Storage.deleteTemplate(this.editingTemplateId);
                }
                this.editingTemplateId = null;
                this.isNewTemplate = false;
                this.renderTemplatesView();
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                // Save and go back
                const title = titleInput?.value.trim();
                if (title) {
                    Storage.updateTemplateName(this.editingTemplateId, title);
                }
                this.editingTemplateId = null;
                this.isNewTemplate = false; // Successfully saved
                this.renderTemplatesView();
            });
        }

        if (titleInput) {
            titleInput.addEventListener('change', () => {
                Storage.updateTemplateName(this.editingTemplateId, titleInput.value.trim());
            });
        }

        // Category selector
        const categorySelect = document.getElementById('editor-category');
        if (categorySelect) {
            categorySelect.addEventListener('change', () => {
                Storage.updateTemplateCategory(this.editingTemplateId, categorySelect.value);
            });
        }

        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.modalMode = 'template';
                this.openModal('Übung zur Vorlage hinzufügen');
            });
        }

        // Remove exercise buttons
        document.getElementById('editor-exercises-list')?.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('[data-action="remove-exercise"]');
            if (removeBtn) {
                Storage.removeExerciseFromTemplate(this.editingTemplateId, removeBtn.dataset.exerciseId);
                this.renderTemplatesView();
            }

            // Edit exercise button
            const editBtn = e.target.closest('[data-action="edit-exercise"]');
            if (editBtn) {
                this.editingExerciseId = editBtn.dataset.exerciseId;
                this.modalMode = 'edit-exercise';
                this.openModal('Übung bearbeiten');
                // Prefill modal
                document.getElementById('exercise-name').value = editBtn.dataset.exerciseName || '';
                document.getElementById('exercise-muscle').value = editBtn.dataset.exerciseMuscle || '';
            }
        });

        // Update exercise defaults in template
        document.getElementById('editor-exercises-list')?.addEventListener('input', (e) => {
            if (e.target.matches('.editor-input-group input')) {
                const exerciseId = e.target.dataset.exerciseId;
                const field = e.target.dataset.field;
                const value = e.target.value;
                Storage.updateExerciseInTemplate(this.editingTemplateId, exerciseId, { [field]: value });
            }
        });

        // Drag and drop reordering
        const exercisesList = document.getElementById('editor-exercises-list');
        if (exercisesList) {
            // Desktop drag events
            exercisesList.addEventListener('dragstart', (e) => {
                const item = e.target.closest('.editor-exercise-item');
                if (item) {
                    this.draggedIndex = parseInt(item.dataset.index);
                    item.classList.add('dragging');
                }
            });

            exercisesList.addEventListener('dragend', (e) => {
                const item = e.target.closest('.editor-exercise-item');
                if (item) item.classList.remove('dragging');
            });

            exercisesList.addEventListener('dragover', (e) => {
                e.preventDefault();
                const item = e.target.closest('.editor-exercise-item');
                if (item && !item.classList.contains('dragging')) {
                    item.classList.add('drag-over');
                }
            });

            exercisesList.addEventListener('dragleave', (e) => {
                const item = e.target.closest('.editor-exercise-item');
                if (item) item.classList.remove('drag-over');
            });

            exercisesList.addEventListener('drop', (e) => {
                e.preventDefault();
                const item = e.target.closest('.editor-exercise-item');
                if (item && this.draggedIndex !== undefined) {
                    const toIndex = parseInt(item.dataset.index);
                    if (this.draggedIndex !== toIndex) {
                        Storage.reorderTemplateExercises(this.editingTemplateId, this.draggedIndex, toIndex);
                        this.renderTemplatesView();
                    }
                    item.classList.remove('drag-over');
                }
                this.draggedIndex = undefined;
            });

            // Mobile touch events
            let touchStartY = 0;
            let draggedItem = null;
            let placeholder = null;

            exercisesList.addEventListener('touchstart', (e) => {
                const handle = e.target.closest('.drag-handle');
                if (!handle) return;

                const item = e.target.closest('.editor-exercise-item');
                if (!item) return;

                e.preventDefault();
                draggedItem = item;
                this.draggedIndex = parseInt(item.dataset.index);
                touchStartY = e.touches[0].clientY;

                item.classList.add('dragging');
                item.style.position = 'relative';
                item.style.zIndex = '1000';
            }, { passive: false });

            exercisesList.addEventListener('touchmove', (e) => {
                if (!draggedItem) return;
                e.preventDefault();

                const touch = e.touches[0];
                const deltaY = touch.clientY - touchStartY;
                draggedItem.style.transform = `translateY(${deltaY}px)`;

                // Find element under finger
                draggedItem.style.pointerEvents = 'none';
                const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
                draggedItem.style.pointerEvents = '';

                const itemBelow = elementBelow?.closest('.editor-exercise-item');

                // Clear previous highlights
                exercisesList.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));

                if (itemBelow && itemBelow !== draggedItem) {
                    itemBelow.classList.add('drag-over');
                }
            }, { passive: false });

            exercisesList.addEventListener('touchend', (e) => {
                if (!draggedItem) return;

                // Find drop target
                const allItems = [...exercisesList.querySelectorAll('.editor-exercise-item')];
                const dropTarget = exercisesList.querySelector('.drag-over');

                if (dropTarget) {
                    const toIndex = parseInt(dropTarget.dataset.index);
                    if (this.draggedIndex !== toIndex) {
                        Storage.reorderTemplateExercises(this.editingTemplateId, this.draggedIndex, toIndex);
                        this.renderTemplatesView();
                    }
                }

                // Cleanup
                draggedItem.classList.remove('dragging');
                draggedItem.style.transform = '';
                draggedItem.style.position = '';
                draggedItem.style.zIndex = '';
                exercisesList.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));

                draggedItem = null;
                this.draggedIndex = undefined;
            });
        }
    },

    handleTemplatesClick(e) {
        const target = e.target.closest('[data-action]');
        if (!target) return;

        const action = target.dataset.action;
        const templateId = target.dataset.templateId;

        if (action === 'edit') {
            this.editingTemplateId = templateId;
            this.renderTemplatesView();
        } else if (action === 'delete-template') {
            Storage.deleteTemplate(templateId);
            this.renderTemplatesView();
        }
    },

    createNewTemplate() {
        const template = Storage.createTemplate('Neues Workout');
        this.editingTemplateId = template.id;
        this.isNewTemplate = true; // Flag for back button to delete if cancelled
        this.renderTemplatesView();
    },

    // ==========================================
    // Stats View
    // ==========================================

    renderStatsView() {
        const muscleStats = Storage.getMuscleGroupStats();
        document.getElementById('muscle-stats-list').innerHTML = Components.renderMuscleStats(muscleStats);
    },

    // ==========================================
    // Modal
    // ==========================================

    openModal(title) {
        document.getElementById('exercise-name').value = '';
        document.getElementById('exercise-muscle').value = '';
        document.getElementById('modal-title').textContent = title;

        // Inject favorites picker if in template mode
        const pickerContainer = document.getElementById('favorites-picker-container');
        if (this.modalMode === 'template') {
            const favorites = Storage.getFavoriteExercises();
            pickerContainer.innerHTML = Components.renderFavoritesPicker(favorites);
            this.setupFavoritesPickerListeners();
        } else {
            pickerContainer.innerHTML = '';
        }

        document.getElementById('exercise-modal').classList.add('show');
        document.getElementById('exercise-name').focus();
    },

    setupFavoritesPickerListeners() {
        const container = document.getElementById('favorites-picker-container');
        if (!container) return;

        // Remove any previous listener by cloning the node
        const newContainer = container.cloneNode(true);
        container.parentNode.replaceChild(newContainer, container);

        newContainer.addEventListener('click', (e) => {
            const chip = e.target.closest('[data-action="pick-favorite"]');
            if (chip) {
                const name = chip.dataset.name;
                const muscle = chip.dataset.muscle;

                // Add the favorite exercise directly to the template
                Storage.addExerciseToTemplate(this.editingTemplateId, {
                    name,
                    muscleGroup: muscle,
                    defaultSets: 2,
                    defaultReps: 6
                });
                this.closeModal();
                this.renderTemplatesView();
            }
        });
    },

    closeModal() {
        document.getElementById('exercise-modal').classList.remove('show');
    },

    saveModalExercise() {
        const name = document.getElementById('exercise-name').value.trim();
        const muscleGroup = document.getElementById('exercise-muscle').value;

        if (!name) {
            document.getElementById('exercise-name').focus();
            return;
        }

        if (this.modalMode === 'favorite') {
            // Add to favorites
            Storage.addFavoriteExercise(name, muscleGroup);
            this.closeModal();
            this.renderTemplatesView();
        } else if (this.modalMode === 'edit-favorite' && this.editingFavoriteId) {
            // Update existing favorite
            Storage.updateFavoriteExercise(this.editingFavoriteId, name, muscleGroup);
            this.editingFavoriteId = null;
            this.closeModal();
            this.renderTemplatesView();
        } else if (this.modalMode === 'edit-exercise' && this.editingExerciseId && this.editingTemplateId) {
            // Update existing exercise in template
            Storage.updateExerciseInTemplate(this.editingTemplateId, this.editingExerciseId, {
                name,
                muscleGroup
            });
            this.editingExerciseId = null;
            this.closeModal();
            this.renderTemplatesView();
        } else if (this.modalMode === 'template' && this.editingTemplateId) {
            Storage.addExerciseToTemplate(this.editingTemplateId, {
                name,
                muscleGroup,
                defaultSets: 2,
                defaultReps: 6
            });
            this.closeModal();
            this.renderTemplatesView();
        } else {
            const exercise = {
                id: Storage.generateId(),
                name,
                muscleGroup,
                sets: 2,
                weight: '',
                reps: 6,
                completed: false
            };
            Storage.addExercise(this.selectedDate, exercise);
            this.closeModal();
            this.renderWeekView();
        }
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
