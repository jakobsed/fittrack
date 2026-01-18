/* ========================================
   App - Fitapp
   Main application logic and routing
   ======================================== */

const App = {
    currentScreen: 'home',
    screens: {
        home: HomeScreen,
        workout: WorkoutScreen,
        templates: TemplatesScreen,
        exercises: ExercisesScreen,
        stats: StatsScreen
    },

    init() {
        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('SW registered'))
                .catch(err => console.log('SW registration failed:', err));
        }

        // Check for active workout
        const activeWorkout = Storage.getActiveWorkout();
        if (activeWorkout) {
            this.currentScreen = 'workout';
        }

        // Initial render
        this.render();

        // Setup navigation
        this.setupNavigation();
    },

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const screen = item.dataset.screen;
                this.navigate(screen);
            });
        });
    },

    navigate(screen) {
        // Don't leave workout screen without confirmation
        if (this.currentScreen === 'workout' && screen !== 'workout') {
            const activeWorkout = Storage.getActiveWorkout();
            if (activeWorkout) {
                WorkoutScreen.confirmCancel();
                return;
            }
        }

        this.currentScreen = screen;
        this.render();
        this.updateNav();

        // Call onShow if exists
        const screenObj = this.screens[screen];
        if (screenObj && screenObj.onShow) {
            screenObj.onShow();
        }
    },

    render() {
        const mainContent = document.getElementById('main-content');
        const screen = this.screens[this.currentScreen];

        if (screen && screen.render) {
            mainContent.innerHTML = screen.render();
        }

        // Hide nav during workout
        const nav = document.getElementById('bottom-nav');
        if (this.currentScreen === 'workout') {
            nav.style.display = 'none';
            mainContent.style.paddingBottom = 'var(--spacing-md)';
        } else {
            nav.style.display = 'flex';
            mainContent.style.paddingBottom = 'calc(var(--nav-height) + var(--spacing-md))';
        }
    },

    refreshScreen() {
        this.render();

        // Call onShow if exists
        const screenObj = this.screens[this.currentScreen];
        if (screenObj && screenObj.onShow) {
            screenObj.onShow();
        }
    },

    updateNav() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.screen === this.currentScreen);
        });
    }
};

// Initialize app on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
