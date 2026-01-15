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
            content = Components.renderTemplateSelection(templates, false);
        }

        document.getElementById('day-workout').innerHTML = content;
    },

    handleDayWorkoutClick(e) {
        const target = e.target.closest('[data-action], [data-template-id], #add-exercise-btn, #clear-workout-btn');
        if (!target) return;

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
    },

    // ==========================================
    // Templates View
    // ==========================================

    renderTemplatesView() {
        const templates = Storage.getWorkoutTemplates();

        if (this.editingTemplateId) {
            const template = Storage.getTemplateById(this.editingTemplateId);
            if (template) {
                document.getElementById('templates-content').innerHTML = Components.renderTemplateEditor(template);
                this.setupEditorListeners();
                return;
            }
        }

        document.getElementById('templates-content').innerHTML = Components.renderTemplatesList(templates);
    },

    setupEditorListeners() {
        const backBtn = document.getElementById('editor-back');
        const saveBtn = document.getElementById('editor-save');
        const titleInput = document.getElementById('editor-title');
        const addBtn = document.getElementById('add-template-exercise-btn');

        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.editingTemplateId = null;
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
                this.renderTemplatesView();
            });
        }

        if (titleInput) {
            titleInput.addEventListener('change', () => {
                Storage.updateTemplateName(this.editingTemplateId, titleInput.value.trim());
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
        this.renderTemplatesView();
    },

    // ==========================================
    // Stats View
    // ==========================================

    renderStatsView() {
        const stats = Storage.getStatistics();
        const muscleStats = Storage.getMuscleGroupStats();
        const volumeHistory = Storage.getVolumeHistory();
        const recentWorkouts = Storage.getRecentWorkouts(5);

        document.getElementById('volume-chart').innerHTML = Components.renderVolumeChart(volumeHistory);
        document.getElementById('stats-grid').innerHTML = Components.renderStatsGrid(stats);
        document.getElementById('muscle-stats-list').innerHTML = Components.renderMuscleStats(muscleStats);
        document.getElementById('recent-workouts-list').innerHTML = Components.renderRecentWorkouts(recentWorkouts);
    },

    // ==========================================
    // Modal
    // ==========================================

    openModal(title) {
        document.getElementById('exercise-name').value = '';
        document.getElementById('exercise-muscle').value = '';
        document.getElementById('modal-title').textContent = title;
        document.getElementById('exercise-modal').classList.add('show');
        document.getElementById('exercise-name').focus();
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

        if (this.modalMode === 'template' && this.editingTemplateId) {
            Storage.addExerciseToTemplate(this.editingTemplateId, {
                name,
                muscleGroup,
                defaultSets: 3,
                defaultReps: 10
            });
            this.closeModal();
            this.renderTemplatesView();
        } else {
            const exercise = {
                id: Storage.generateId(),
                name,
                muscleGroup,
                sets: '',
                weight: '',
                reps: '',
                completed: false
            };
            Storage.addExercise(this.selectedDate, exercise);
            this.closeModal();
            this.renderWeekView();
        }
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
