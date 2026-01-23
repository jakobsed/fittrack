/* ========================================
   Home Screen - Fitapp
   Dashboard with week planning
   ======================================== */

const HomeScreen = {
    render() {
        const weekWorkouts = Storage.getThisWeekWorkouts();
        const weekPlan = this.getWeekPlan();

        // Calculate week stats
        const totalSets = weekWorkouts.reduce((sum, w) => {
            return sum + w.exercises.reduce((s, e) => s + (e.sets || 0), 0);
        }, 0);

        const totalDuration = weekWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
        const hours = Math.floor(totalDuration / 3600);
        const mins = Math.floor((totalDuration % 3600) / 60);
        const durationStr = hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;

        return `
            <div class="home-screen animate-fade-in">
                <div class="screen-header">
                    <h1 class="greeting">
                        Willkommen
                    </h1>
                    <div class="header-actions">
                        <button class="btn btn-ghost btn-icon" onclick="App.navigate('exercises')" title="Übungen">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="4" y1="21" x2="4" y2="14"></line>
                                <line x1="4" y1="10" x2="4" y2="3"></line>
                                <line x1="12" y1="21" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12" y2="3"></line>
                                <line x1="20" y1="21" x2="20" y2="16"></line>
                                <line x1="20" y1="12" x2="20" y2="3"></line>
                                <line x1="1" y1="14" x2="7" y2="14"></line>
                                <line x1="9" y1="8" x2="15" y2="8"></line>
                                <line x1="17" y1="16" x2="23" y2="16"></line>
                            </svg>
                        </button>
                        <button class="btn btn-ghost btn-icon" onclick="App.navigate('settings')" title="Einstellungen">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Week Stats -->
                <div class="card mb-lg">
                    <h3 class="text-sm font-semibold text-secondary mb-md">Diese Woche</h3>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-value">${weekWorkouts.length}</span>
                            <span class="stat-label">Workouts</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${durationStr || '0min'}</span>
                            <span class="stat-label">Zeit</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${totalSets}</span>
                            <span class="stat-label">Sets</span>
                        </div>
                    </div>
                </div>

                <!-- Week Planning -->
                <div class="section-title">Wochenplan</div>
                <div class="week-planner">
                    ${this.renderWeekDays(weekPlan)}
                </div>

                <!-- Start Workout Button -->
                <button class="btn btn-primary btn-lg btn-full start-workout-btn" onclick="HomeScreen.showStartWorkoutModal()">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    Workout starten
                </button>
            </div>
        `;
    },

    getWeekPlan() {
        const weekKey = this.getCurrentWeekKey();
        const allPlans = Storage.get(Storage.KEYS.WEEK_PLAN) || {};
        return allPlans[weekKey] || {};
    },

    saveWeekPlan(plan) {
        const weekKey = this.getCurrentWeekKey();
        const allPlans = Storage.get(Storage.KEYS.WEEK_PLAN) || {};
        allPlans[weekKey] = plan;
        Storage.set(Storage.KEYS.WEEK_PLAN, allPlans);
    },

    getCurrentWeekKey() {
        const now = new Date();
        const year = now.getFullYear();
        const onejan = new Date(year, 0, 1);
        const week = Math.ceil((((now - onejan) / 86400000) + onejan.getDay() + 1) / 7);
        return `${year}-W${String(week).padStart(2, '0')}`;
    },

    getWeekDates() {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const monday = new Date(today);
        monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

        const days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            days.push(date);
        }
        return days;
    },

    renderWeekDays(weekPlan) {
        const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
        const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
        const weekDates = this.getWeekDates();
        const today = new Date();
        const todayStr = today.toDateString();

        return `
            <div class="week-days">
                ${days.map((day, i) => {
            const dateObj = weekDates[i];
            const dateStr = dateObj.toDateString();
            const isToday = dateStr === todayStr;
            const dayKey = dayKeys[i];
            const templateId = weekPlan[dayKey];
            const template = templateId ? Storage.getTemplate(templateId) : null;
            const dayNum = dateObj.getDate();

            return `
                        <div class="week-day ${isToday ? 'today' : ''} ${template ? 'has-workout' : ''}" 
                             onclick="HomeScreen.showDayModal('${dayKey}', '${day}')">
                            <span class="week-day-name">${day}</span>
                            <span class="week-day-num">${dayNum}</span>
                            ${template ? `
                                <span class="week-day-template">${this.getTemplateAbbrev(template.name)}</span>
                            ` : `
                                <span class="week-day-empty">+</span>
                            `}
                        </div>
                    `;
        }).join('')}
            </div>
        `;
    },

    getTemplateAbbrev(name) {
        // Get first 2-3 chars of each word
        return name.split(/\s+/)
            .map(w => w.substring(0, 2))
            .join('')
            .substring(0, 4)
            .toUpperCase();
    },

    showDayModal(dayKey, dayName) {
        const templates = Storage.getTemplates();
        const weekPlan = this.getWeekPlan();
        const currentTemplateId = weekPlan[dayKey];

        const content = `
            <div class="list">
                ${templates.length > 0 ? `
                    ${templates.map(t => `
                        <div class="list-item ${t.id === currentTemplateId ? 'selected' : ''}" 
                             onclick="HomeScreen.assignTemplate('${dayKey}', '${t.id}')">
                            <div class="list-item-content">
                                <div class="list-item-title">${t.name}</div>
                                <div class="list-item-subtitle">${t.exerciseIds.length} Übungen</div>
                            </div>
                            ${t.id === currentTemplateId ? `
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--color-accent)" stroke-width="2">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            ` : ''}
                        </div>
                    `).join('')}
                ` : `
                    <div class="empty-state">
                        <div class="empty-state-text">Erstelle zuerst eine Vorlage</div>
                    </div>
                `}
                
                ${currentTemplateId ? `
                    <button class="btn btn-outline btn-full mt-md" onclick="HomeScreen.clearDay('${dayKey}')" style="color: var(--color-error); border-color: var(--color-error);">
                        Planung entfernen
                    </button>
                ` : ''}
            </div>
        `;

        Modal.showSheet({
            title: `${dayName} planen`,
            content: content
        });
    },

    assignTemplate(dayKey, templateId) {
        const weekPlan = this.getWeekPlan();
        weekPlan[dayKey] = templateId;
        this.saveWeekPlan(weekPlan);
        Modal.close();
        App.refreshScreen();
    },

    clearDay(dayKey) {
        const weekPlan = this.getWeekPlan();
        delete weekPlan[dayKey];
        this.saveWeekPlan(weekPlan);
        Modal.close();
        App.refreshScreen();
    },

    showStartWorkoutModal() {
        const templates = Storage.getTemplates();

        const content = `
            <div class="list">
                ${templates.length > 0 ? `
                    <div class="section-title">Vorlage wählen</div>
                    ${templates.map(t => `
                        <div class="list-item" onclick="WorkoutScreen.startFromTemplate('${t.id}')">
                            <div class="list-item-content">
                                <div class="list-item-title">${t.name}</div>
                                <div class="list-item-subtitle">${t.exerciseIds.length} Übungen</div>
                            </div>
                            <svg class="list-item-action" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </div>
                    `).join('')}
                    <div class="divider-text">oder</div>
                ` : ''}
                <button class="btn btn-outline btn-full" onclick="WorkoutScreen.startEmpty()">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Freies Workout starten
                </button>
            </div>
        `;

        Modal.showSheet({
            title: 'Workout starten',
            content: content
        });
    },

    viewWorkout(id) {
        // TODO: Show workout details
        console.log('View workout:', id);
    }
};
