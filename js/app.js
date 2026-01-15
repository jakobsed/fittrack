/**
 * FitTrack - Main Application
 * Handles app logic, navigation, and event handling
 */

const App = {
    // Current state
    currentView: 'week',
    currentWeekStart: null,
    selectedDate: null,
    weekDates: [],

    /**
     * Initialize the application
     */
    init() {
        // Set initial date to today
        const today = new Date();
        this.currentWeekStart = this.getMonday(today);
        this.selectedDate = Components.formatDateKey(today);
        this.weekDates = Components.getWeekDates(today);

        // Render initial views
        this.renderWeekView();
        this.renderStatsView();

        // Setup event listeners
        this.setupEventListeners();

        console.log('FitTrack initialized!');
    },

    /**
     * Get Monday of the week for a given date
     * @param {Date} date 
     * @returns {Date}
     */
    getMonday(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        d.setDate(d.getDate() + diff);
        return d;
    },

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Navigation
        document.getElementById('nav-week').addEventListener('click', () => this.switchView('week'));
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

        // Add exercise button
        document.getElementById('add-exercise-btn').addEventListener('click', () => this.openExerciseModal());

        // Modal events
        document.getElementById('modal-close').addEventListener('click', () => this.closeExerciseModal());
        document.getElementById('modal-cancel').addEventListener('click', () => this.closeExerciseModal());
        document.getElementById('modal-save').addEventListener('click', () => this.saveExercise());
        document.getElementById('exercise-modal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeExerciseModal();
            }
        });

        // Enter key in exercise name input
        document.getElementById('exercise-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveExercise();
            }
        });

        // Exercise list events (delegated)
        document.getElementById('exercises-list').addEventListener('click', (e) => {
            this.handleExerciseAction(e);
        });

        // Set input changes (delegated)
        document.getElementById('exercises-list').addEventListener('change', (e) => {
            if (e.target.classList.contains('set-input')) {
                this.handleSetInputChange(e);
            }
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

    /**
     * Switch between views
     * @param {string} view - 'week' or 'stats'
     */
    switchView(view) {
        this.currentView = view;

        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        // Update views
        document.querySelectorAll('.view').forEach(v => {
            v.classList.toggle('active', v.id === `${view}-view`);
        });

        // Refresh stats if switching to stats view
        if (view === 'stats') {
            this.renderStatsView();
        }
    },

    /**
     * Navigate to previous/next week
     * @param {number} direction - -1 for previous, 1 for next
     */
    navigateWeek(direction) {
        this.currentWeekStart.setDate(this.currentWeekStart.getDate() + (direction * 7));
        this.weekDates = Components.getWeekDates(this.currentWeekStart);

        // If selected date is not in new week, select first day
        const selectedInWeek = this.weekDates.some(
            d => Components.formatDateKey(d) === this.selectedDate
        );
        if (!selectedInWeek) {
            this.selectedDate = Components.formatDateKey(this.weekDates[0]);
        }

        this.renderWeekView();
    },

    /**
     * Select a date
     * @param {string} dateKey 
     */
    selectDate(dateKey) {
        this.selectedDate = dateKey;
        this.renderWeekView();
    },

    /**
     * Render the week view
     */
    renderWeekView() {
        const workoutDates = Storage.getWorkoutDates();

        // Render week title
        document.getElementById('week-title').textContent =
            Components.renderWeekTitle(this.currentWeekStart);

        // Render week calendar
        document.getElementById('week-calendar').innerHTML =
            Components.renderWeekCalendar(this.weekDates, this.selectedDate, workoutDates);

        // Render day title
        const selectedDateObj = new Date(this.selectedDate);
        document.getElementById('day-title').textContent =
            Components.formatDateDisplay(selectedDateObj);

        // Render exercises for selected day
        const workout = Storage.getWorkout(this.selectedDate);
        document.getElementById('exercises-list').innerHTML =
            Components.renderExercises(workout?.exercises);
    },

    /**
     * Render the stats view
     */
    renderStatsView() {
        const stats = Storage.getStatistics();
        document.getElementById('stats-grid').innerHTML = Components.renderStatsGrid(stats);

        const recentWorkouts = Storage.getRecentWorkouts(5);
        document.getElementById('recent-workouts-list').innerHTML =
            Components.renderRecentWorkouts(recentWorkouts);
    },

    /**
     * Open the add exercise modal
     */
    openExerciseModal() {
        document.getElementById('exercise-name').value = '';
        document.getElementById('exercise-modal').classList.add('show');
        document.getElementById('exercise-name').focus();
    },

    /**
     * Close the exercise modal
     */
    closeExerciseModal() {
        document.getElementById('exercise-modal').classList.remove('show');
    },

    /**
     * Save new exercise
     */
    saveExercise() {
        const nameInput = document.getElementById('exercise-name');
        const name = nameInput.value.trim();

        if (!name) {
            nameInput.focus();
            return;
        }

        const exercise = {
            id: Storage.generateId(),
            name: name,
            sets: [{ weight: '', reps: '', completed: false }]
        };

        Storage.addExercise(this.selectedDate, exercise);
        this.closeExerciseModal();
        this.renderWeekView();
    },

    /**
     * Handle exercise-related actions
     * @param {Event} e 
     */
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
            case 'add-set':
                this.addSet(exerciseId);
                break;
            case 'complete-set':
                const setIndex = parseInt(e.target.closest('[data-set-index]').dataset.setIndex);
                this.toggleSetComplete(exerciseId, setIndex);
                break;
        }
    },

    /**
     * Toggle exercise menu visibility
     * @param {string} exerciseId 
     */
    toggleExerciseMenu(exerciseId) {
        // Close all other menus first
        document.querySelectorAll('.exercise-menu.show').forEach(menu => {
            if (menu.id !== `menu-${exerciseId}`) {
                menu.classList.remove('show');
            }
        });

        const menu = document.getElementById(`menu-${exerciseId}`);
        menu.classList.toggle('show');
    },

    /**
     * Delete an exercise
     * @param {string} exerciseId 
     */
    deleteExercise(exerciseId) {
        Storage.deleteExercise(this.selectedDate, exerciseId);
        this.renderWeekView();
    },

    /**
     * Add a new set to an exercise
     * @param {string} exerciseId 
     */
    addSet(exerciseId) {
        const workout = Storage.getWorkout(this.selectedDate);
        if (!workout) return;

        const exercise = workout.exercises.find(ex => ex.id === exerciseId);
        if (!exercise) return;

        if (!exercise.sets) {
            exercise.sets = [];
        }
        exercise.sets.push({ weight: '', reps: '', completed: false });

        Storage.updateExercise(this.selectedDate, exerciseId, { sets: exercise.sets });
        this.renderWeekView();
    },

    /**
     * Handle set input change
     * @param {Event} e 
     */
    handleSetInputChange(e) {
        const exerciseId = e.target.dataset.exerciseId;
        const setIndex = parseInt(e.target.dataset.setIndex);
        const field = e.target.dataset.field;
        const value = e.target.value;

        const workout = Storage.getWorkout(this.selectedDate);
        if (!workout) return;

        const exercise = workout.exercises.find(ex => ex.id === exerciseId);
        if (!exercise || !exercise.sets[setIndex]) return;

        exercise.sets[setIndex][field] = value;
        Storage.updateExercise(this.selectedDate, exerciseId, { sets: exercise.sets });
    },

    /**
     * Toggle set completion
     * @param {string} exerciseId 
     * @param {number} setIndex 
     */
    toggleSetComplete(exerciseId, setIndex) {
        const workout = Storage.getWorkout(this.selectedDate);
        if (!workout) return;

        const exercise = workout.exercises.find(ex => ex.id === exerciseId);
        if (!exercise || !exercise.sets[setIndex]) return;

        exercise.sets[setIndex].completed = !exercise.sets[setIndex].completed;
        Storage.updateExercise(this.selectedDate, exerciseId, { sets: exercise.sets });
        this.renderWeekView();
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
