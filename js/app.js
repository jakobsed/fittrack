/**
 * FitTrack - Main Application V2
 * Handles app logic, navigation, and event handling
 */

const App = {
    currentView: 'week',
    currentWeekStart: null,
    selectedDate: null,
    weekDates: [],
    modalMode: 'workout', // 'workout' or 'database'

    init() {
        const today = new Date();
        this.currentWeekStart = this.getMonday(today);
        this.selectedDate = Components.formatDateKey(today);
        this.weekDates = Components.getWeekDates(today);

        this.renderWeekView();
        this.renderExercisesView();
        this.renderStatsView();
        this.setupEventListeners();

        console.log('FitTrack V2 initialized!');
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
        document.getElementById('nav-exercises').addEventListener('click', () => this.switchView('exercises'));
        document.getElementById('nav-stats').addEventListener('click', () => this.switchView('stats'));

        // Week navigation
        document.getElementById('prev-week').addEventListener('click', () => this.navigateWeek(-1));
        document.getElementById('next-week').addEventListener('click', () => this.navigateWeek(1));

        // Week calendar clicks
        document.getElementById('week-calendar').addEventListener('click', (e) => {
            const dayCard = e.target.closest('.day-card');
            if (dayCard) {
                this.selectDate(dayCard.dataset.date);
            }
        });

        // Add exercise button (workout)
        document.getElementById('add-exercise-btn').addEventListener('click', () => {
            this.modalMode = 'workout';
            this.openExerciseModal();
        });

        // Add exercise button (database)
        document.getElementById('add-db-exercise-btn').addEventListener('click', () => {
            this.modalMode = 'database';
            this.openExerciseModal();
        });

        // Modal events
        document.getElementById('modal-close').addEventListener('click', () => this.closeExerciseModal());
        document.getElementById('modal-cancel').addEventListener('click', () => this.closeExerciseModal());
        document.getElementById('modal-save').addEventListener('click', () => this.saveExercise());
        document.getElementById('exercise-modal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeExerciseModal();
            }
        });

        document.getElementById('exercise-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveExercise();
            }
        });

        // Exercise list events (delegated)
        document.getElementById('exercises-list').addEventListener('click', (e) => {
            this.handleExerciseAction(e);
        });

        document.getElementById('exercises-list').addEventListener('change', (e) => {
            if (e.target.matches('.exercise-input-group input')) {
                this.handleExerciseInputChange(e);
            }
        });

        // Exercise database events (delegated)
        document.getElementById('exercises-database-list').addEventListener('click', (e) => {
            this.handleDatabaseAction(e);
        });

        // Close menus when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.exercise-menu-btn') && !e.target.closest('.exercise-menu')) {
                document.querySelectorAll('.exercise-menu.show').forEach(menu => {
                    menu.classList.remove('show');
                });
            }
        });
    },

    switchView(view) {
        this.currentView = view;

        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        document.querySelectorAll('.view').forEach(v => {
            v.classList.toggle('active', v.id === `${view}-view`);
        });

        if (view === 'stats') {
            this.renderStatsView();
        } else if (view === 'exercises') {
            this.renderExercisesView();
        }
    },

    navigateWeek(direction) {
        this.currentWeekStart.setDate(this.currentWeekStart.getDate() + (direction * 7));
        this.weekDates = Components.getWeekDates(this.currentWeekStart);

        const selectedInWeek = this.weekDates.some(
            d => Components.formatDateKey(d) === this.selectedDate
        );
        if (!selectedInWeek) {
            this.selectedDate = Components.formatDateKey(this.weekDates[0]);
        }

        this.renderWeekView();
    },

    selectDate(dateKey) {
        this.selectedDate = dateKey;
        this.renderWeekView();
    },

    renderWeekView() {
        const workoutDates = Storage.getWorkoutDates();

        document.getElementById('week-title').textContent =
            Components.renderWeekTitle(this.currentWeekStart);

        document.getElementById('week-calendar').innerHTML =
            Components.renderWeekCalendar(this.weekDates, this.selectedDate, workoutDates);

        const selectedDateObj = new Date(this.selectedDate);
        document.getElementById('day-title').textContent =
            Components.formatDateDisplay(selectedDateObj);

        const workout = Storage.getWorkout(this.selectedDate);
        document.getElementById('exercises-list').innerHTML =
            Components.renderExercises(workout?.exercises);
    },

    renderExercisesView() {
        const exercises = Storage.getExerciseDatabase();
        document.getElementById('exercises-database-list').innerHTML =
            Components.renderExerciseDatabase(exercises);
    },

    renderStatsView() {
        const stats = Storage.getStatistics();
        document.getElementById('stats-grid').innerHTML = Components.renderStatsGrid(stats);

        const muscleStats = Storage.getMuscleGroupStats();
        document.getElementById('muscle-stats-list').innerHTML =
            Components.renderMuscleStats(muscleStats);

        const recentWorkouts = Storage.getRecentWorkouts(5);
        document.getElementById('recent-workouts-list').innerHTML =
            Components.renderRecentWorkouts(recentWorkouts);
    },

    openExerciseModal() {
        document.getElementById('exercise-name').value = '';
        document.getElementById('exercise-muscle').value = '';

        const title = this.modalMode === 'database'
            ? 'Übung zur Datenbank hinzufügen'
            : 'Übung hinzufügen';
        document.getElementById('modal-title').textContent = title;

        document.getElementById('exercise-modal').classList.add('show');
        document.getElementById('exercise-name').focus();
    },

    closeExerciseModal() {
        document.getElementById('exercise-modal').classList.remove('show');
    },

    saveExercise() {
        const nameInput = document.getElementById('exercise-name');
        const muscleSelect = document.getElementById('exercise-muscle');
        const name = nameInput.value.trim();
        const muscleGroup = muscleSelect.value;

        if (!name) {
            nameInput.focus();
            return;
        }

        if (this.modalMode === 'database') {
            // Add to database
            Storage.addToExerciseDatabase({ name, muscleGroup });
            this.closeExerciseModal();
            this.renderExercisesView();
        } else {
            // Add to today's workout
            const exercise = {
                id: Storage.generateId(),
                name: name,
                muscleGroup: muscleGroup,
                sets: '',
                weight: '',
                reps: '',
                completed: false
            };

            Storage.addExercise(this.selectedDate, exercise);
            this.closeExerciseModal();
            this.renderWeekView();
        }
    },

    handleExerciseAction(e) {
        const action = e.target.closest('[data-action]')?.dataset.action;
        const exerciseId = e.target.closest('[data-exercise-id]')?.dataset.exerciseId;

        if (!action) return;

        switch (action) {
            case 'menu':
                this.toggleExerciseMenu(exerciseId);
                break;
            case 'delete':
                this.deleteExercise(exerciseId);
                break;
            case 'complete':
                this.toggleExerciseComplete(exerciseId);
                break;
        }
    },

    handleDatabaseAction(e) {
        const action = e.target.closest('[data-action]')?.dataset.action;
        const exerciseId = e.target.closest('[data-exercise-id]')?.dataset.exerciseId;

        if (action === 'delete-db' && exerciseId) {
            Storage.deleteFromExerciseDatabase(exerciseId);
            this.renderExercisesView();
        }
    },

    toggleExerciseMenu(exerciseId) {
        document.querySelectorAll('.exercise-menu.show').forEach(menu => {
            if (menu.id !== `menu-${exerciseId}`) {
                menu.classList.remove('show');
            }
        });

        const menu = document.getElementById(`menu-${exerciseId}`);
        menu.classList.toggle('show');
    },

    deleteExercise(exerciseId) {
        Storage.deleteExercise(this.selectedDate, exerciseId);
        this.renderWeekView();
    },

    toggleExerciseComplete(exerciseId) {
        const workout = Storage.getWorkout(this.selectedDate);
        if (!workout) return;

        const exercise = workout.exercises.find(ex => ex.id === exerciseId);
        if (!exercise) return;

        exercise.completed = !exercise.completed;
        Storage.updateExercise(this.selectedDate, exerciseId, { completed: exercise.completed });
        this.renderWeekView();
    },

    handleExerciseInputChange(e) {
        const exerciseId = e.target.dataset.exerciseId;
        const field = e.target.dataset.field;
        const value = e.target.value;

        const workout = Storage.getWorkout(this.selectedDate);
        if (!workout) return;

        const exercise = workout.exercises.find(ex => ex.id === exerciseId);
        if (!exercise) return;

        exercise[field] = value;
        Storage.updateExercise(this.selectedDate, exerciseId, { [field]: value });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
