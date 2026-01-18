/* ========================================
   Stats Screen - Fitapp
   Statistics and analytics
   ======================================== */

const StatsScreen = {
    timeRange: 'week',
    selectedExercise: null,

    render() {
        const exercises = Storage.getExercises();

        if (!this.selectedExercise && exercises.length > 0) {
            const favs = exercises.filter(e => e.isFavorite);
            this.selectedExercise = favs.length > 0 ? favs[0].id : exercises[0].id;
        }

        return `
            <div class="stats-screen animate-fade-in">
                <div class="screen-header">
                    <h1 class="screen-title">Statistiken</h1>
                </div>

                <div class="segmented-control mb-lg">
                    <button class="segment ${this.timeRange === 'week' ? 'active' : ''}" 
                            onclick="StatsScreen.setTimeRange('week')">Woche</button>
                    <button class="segment ${this.timeRange === 'month' ? 'active' : ''}" 
                            onclick="StatsScreen.setTimeRange('month')">Monat</button>
                    <button class="segment ${this.timeRange === 'year' ? 'active' : ''}" 
                            onclick="StatsScreen.setTimeRange('year')">Jahr</button>
                </div>

                <div class="stats-section">
                    <h2 class="stats-section-title">Sets pro Muskelgruppe</h2>
                    ${this.renderMuscleStats()}
                </div>

                <div class="stats-section">
                    <h2 class="stats-section-title">Gewichtsentwicklung</h2>
                    <div class="chart-container">
                        <div class="chart-header">
                            <select class="exercise-select" onchange="StatsScreen.selectExercise(this.value)">
                                ${exercises.map(ex => `
                                    <option value="${ex.id}" ${this.selectedExercise === ex.id ? 'selected' : ''}>${ex.name}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div style="height: 200px;"><canvas id="weight-chart"></canvas></div>
                    </div>
                </div>

                <div class="stats-section">
                    <h2 class="stats-section-title">Trainingsfrequenz</h2>
                    ${this.renderFrequency()}
                </div>
            </div>
        `;
    },

    renderMuscleStats() {
        const { startDate, endDate } = this.getDateRange();
        const setsPerMuscle = Storage.getSetsPerMuscle(startDate, endDate);
        const maxSets = Math.max(...Object.values(setsPerMuscle), 1);

        return `<div class="muscle-bar-list">
            ${Object.keys(MUSCLE_GROUPS).map(id => {
            const muscle = getMuscleGroup(id);
            const sets = setsPerMuscle[id] || 0;
            const pct = (sets / maxSets) * 100;
            return `<div class="muscle-bar-item">
                    <span class="muscle-bar-label">${muscle.name}</span>
                    <div class="muscle-bar-track">
                        <div class="muscle-bar-fill" style="width:${pct}%;background:${muscle.color};"></div>
                    </div>
                    <span class="muscle-bar-value">${sets} Sets</span>
                </div>`;
        }).join('')}
        </div>`;
    },

    renderFrequency() {
        const freq = Storage.getWorkoutFrequency(4);
        const dates = new Set(freq.dates);
        const today = new Date();
        const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

        let html = `<div class="card-flat"><div style="display:flex;margin-bottom:8px;">
            <div style="width:50px;"></div>
            ${days.map(d => `<div style="flex:1;text-align:center;font-size:12px;color:#9CA3AF;">${d}</div>`).join('')}
        </div>`;

        for (let w = 0; w < 4; w++) {
            html += `<div style="display:flex;align-items:center;margin-bottom:4px;">
                <div style="width:50px;font-size:12px;color:#9CA3AF;">${w === 0 ? 'Diese' : w === 1 ? 'Letzte' : 'Vor ' + w}</div>`;
            for (let d = 0; d < 7; d++) {
                const date = new Date(today);
                date.setDate(today.getDate() - (w * 7) - (6 - d) - (today.getDay() === 0 ? 6 : today.getDay() - 1));
                const str = date.toISOString().split('T')[0];
                const active = dates.has(str);
                html += `<div style="flex:1;display:flex;justify-content:center;">
                    <div class="frequency-day-dot ${active ? 'active' : ''}"></div>
                </div>`;
            }
            html += '</div>';
        }
        html += `<div style="margin-top:16px;text-align:center;">
            <span class="text-display" style="font-size:30px;">${freq.totalDays}</span>
            <span class="text-secondary"> Trainingstage</span>
        </div></div>`;
        return html;
    },

    getDateRange() {
        const now = new Date();
        const end = new Date(now); end.setHours(23, 59, 59, 999);
        const start = new Date(now); start.setHours(0, 0, 0, 0);
        if (this.timeRange === 'week') start.setDate(now.getDate() - now.getDay() + 1);
        else if (this.timeRange === 'month') start.setDate(1);
        else if (this.timeRange === 'year') start.setMonth(0, 1);
        return { startDate: start, endDate: end };
    },

    setTimeRange(range) { this.timeRange = range; App.refreshScreen(); },
    selectExercise(id) { this.selectedExercise = id; this.updateWeightChart(); },

    updateWeightChart() {
        if (!this.selectedExercise) return;
        const data = Storage.getWeightProgression(this.selectedExercise, 15);
        if (data.length > 0) Charts.createWeightChart('weight-chart', data);
    },

    onShow() { setTimeout(() => this.updateWeightChart(), 100); }
};
