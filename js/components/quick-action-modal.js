/* ========================================
   Quick Action Modal - Fitapp
   Modal that appears when plus button is clicked
   ======================================== */

const QuickActionModal = {
    show() {
        const modalContainer = document.getElementById('modal-container');

        modalContainer.innerHTML = `
            <div class="modal-overlay active" id="quick-action-overlay">
                <div class="quick-action-sheet animate-slide-up">
                    <div class="quick-action-header">
                        <span class="quick-action-title">Schnelle Aktion</span>
                        <button class="quick-action-close" onclick="QuickActionModal.hide()">
                            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="quick-action-options">
                        <button class="quick-action-option" onclick="QuickActionModal.startWorkout()">
                            <div class="quick-action-icon workout">
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M6.5 6.5h11M6.5 17.5h11M3 12h18M7 8v8M17 8v8"></path>
                                </svg>
                            </div>
                            <div class="quick-action-text">
                                <span class="quick-action-option-title">Workout starten</span>
                                <span class="quick-action-option-desc">Leeres Workout oder Vorlage</span>
                            </div>
                            <svg class="quick-action-chevron" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                        
                        <button class="quick-action-option" onclick="QuickActionModal.addExercise()">
                            <div class="quick-action-icon exercise">
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="16"></line>
                                    <line x1="8" y1="12" x2="16" y2="12"></line>
                                </svg>
                            </div>
                            <div class="quick-action-text">
                                <span class="quick-action-option-title">Übung hinzufügen</span>
                                <span class="quick-action-option-desc">Neue Übung zur Datenbank</span>
                            </div>
                            <svg class="quick-action-chevron" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                        
                        <button class="quick-action-option" onclick="QuickActionModal.createTemplate()">
                            <div class="quick-action-icon template">
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="3" y1="9" x2="21" y2="9"></line>
                                    <line x1="9" y1="21" x2="9" y2="9"></line>
                                </svg>
                            </div>
                            <div class="quick-action-text">
                                <span class="quick-action-option-title">Vorlage erstellen</span>
                                <span class="quick-action-option-desc">Workout-Template speichern</span>
                            </div>
                            <svg class="quick-action-chevron" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Close on overlay click
        document.getElementById('quick-action-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'quick-action-overlay') {
                this.hide();
            }
        });
    },

    hide() {
        const modalContainer = document.getElementById('modal-container');
        modalContainer.innerHTML = '';
    },

    startWorkout() {
        this.hide();
        // Navigate to workout screen or show template selection
        App.navigate('templates');
    },

    addExercise() {
        this.hide();
        // Navigate to exercises screen to add new exercise
        App.navigate('exercises');
        // If ExercisesScreen has an add method, call it
        if (ExercisesScreen && typeof ExercisesScreen.showAddModal === 'function') {
            setTimeout(() => ExercisesScreen.showAddModal(), 100);
        }
    },

    createTemplate() {
        this.hide();
        App.navigate('templates');
        // If TemplatesScreen has a create method, call it
        if (TemplatesScreen && typeof TemplatesScreen.showCreateModal === 'function') {
            setTimeout(() => TemplatesScreen.showCreateModal(), 100);
        }
    }
};
