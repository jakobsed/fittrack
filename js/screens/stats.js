/* ========================================
   Stats Screen - Fitapp
   Statistics and analytics - Minimalist Dot Style
   ======================================== */

const StatsScreen = {
    timeRange: 'week',

    render() {
        const { startDate, endDate } = this.getDateRange();
        const workouts = Storage.getWorkouts().filter(w => {
            const d = new Date(w.date);
            return d >= startDate && d <= endDate;
        });

        // Calculate totals
        const totalSets = workouts.reduce((sum, w) =>
            sum + w.exercises.reduce((s, e) => s + (e.sets || 0), 0), 0);
        const totalDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
        const hours = Math.floor(totalDuration / 3600);
        const mins = Math.floor((totalDuration % 3600) / 60);

        return `
            <div class="stats-screen animate-fade-in">

                <!-- Time Range Tabs -->
                <div class="stats-tabs mb-lg">
                    <button class="stats-tab ${this.timeRange === 'week' ? 'active' : ''}" 
                            onclick="StatsScreen.setTimeRange('week')">WOCHE</button>
                    <button class="stats-tab ${this.timeRange === 'month' ? 'active' : ''}" 
                            onclick="StatsScreen.setTimeRange('month')">MONAT</button>
                    <button class="stats-tab ${this.timeRange === 'year' ? 'active' : ''}" 
                            onclick="StatsScreen.setTimeRange('year')">JAHR</button>
                </div>

                <!-- Main Stats Card -->
                <div class="stats-card-main">
                    <div class="stats-card-header">
                        <span class="stats-card-label">GESAMT</span>
                        <span class="stats-card-period">${this.getPeriodLabel()}</span>
                    </div>
                    <div class="stats-big-numbers">
                        <div class="stats-big-number">
                            <span class="stats-big-value">${workouts.length}</span>
                            <span class="stats-big-unit">WO</span>
                        </div>
                        <div class="stats-big-number">
                            <span class="stats-big-value">${totalSets}</span>
                            <span class="stats-big-unit">SETS</span>
                        </div>
                        <div class="stats-big-number">
                            <span class="stats-big-value">${hours > 0 ? hours : mins}</span>
                            <span class="stats-big-unit">${hours > 0 ? 'HR' : 'MIN'}</span>
                        </div>
                    </div>
                </div>

                <!-- Muscle Distribution -->
                <div class="stats-card">
                    <div class="stats-card-header">
                        <span class="stats-card-label">MUSKEL-VERTEILUNG</span>
                    </div>
                    ${this.renderMuscleDotsStats()}
                </div>

                <!-- Training Frequency -->
                <div class="stats-card">
                    <div class="stats-card-header">
                        <span class="stats-card-label">TRAININGS-AKTIVITÄT</span>
                    </div>
                    ${this.renderActivityGrid()}
                </div>
            </div>
        `;
    },

    renderMuscleDotsStats() {
        const { startDate, endDate } = this.getDateRange();
        const setsPerMuscle = Storage.getSetsPerMuscle(startDate, endDate);
        const totalSets = Object.values(setsPerMuscle).reduce((a, b) => a + b, 0) || 1;
        const maxDots = 12;

        const muscles = Object.keys(MUSCLE_GROUPS)
            .map(id => ({
                id,
                name: getMuscleGroup(id).name,
                sets: setsPerMuscle[id] || 0,
                pct: Math.round(((setsPerMuscle[id] || 0) / totalSets) * 100)
            }))
            .filter(m => m.sets > 0)
            .sort((a, b) => b.sets - a.sets);

        if (muscles.length === 0) {
            return '<div class="stats-empty">Keine Daten</div>';
        }

        const maxSets = Math.max(...muscles.map(m => m.sets));

        return `
            <div class="muscle-dots-list">
                ${muscles.map(m => {
            const filledDots = Math.max(1, Math.round((m.sets / maxSets) * maxDots));
            return `
                        <div class="muscle-dots-row">
                            <span class="muscle-dots-label">${m.name}</span>
                            <div class="muscle-dots-bar">
                                ${this.renderDots(filledDots, maxDots)}
                            </div>
                            <span class="muscle-dots-value">${m.pct}%</span>
                        </div>
                    `;
        }).join('')}
            </div>
        `;
    },

    renderDots(filled, total) {
        let html = '';
        for (let i = 0; i < total; i++) {
            html += `<span class="stat-dot ${i < filled ? 'filled' : ''}"></span>`;
        }
        return html;
    },

    renderActivityGrid() {
        const freq = Storage.getWorkoutFrequency(4);
        const dates = new Set(freq.dates);
        const today = new Date();
        const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

        let html = `
            <div class="activity-grid">
                <div class="activity-header">
                    <div class="activity-week-label"></div>
                    ${days.map(d => `<div class="activity-day-label">${d}</div>`).join('')}
                </div>
        `;

        const weekLabels = ['Diese', 'Letzte', 'Vor 2', 'Vor 3'];

        for (let w = 0; w < 4; w++) {
            html += `
                <div class="activity-row">
                    <div class="activity-week-label">${weekLabels[w]}</div>
            `;
            for (let d = 0; d < 7; d++) {
                const date = new Date(today);
                const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
                date.setDate(today.getDate() - (w * 7) - (6 - d) - dayOfWeek + 6);
                const str = date.toISOString().split('T')[0];
                const active = dates.has(str);
                html += `<div class="activity-cell"><span class="activity-dot ${active ? 'active' : ''}"></span></div>`;
            }
            html += '</div>';
        }

        html += `
            </div>
            <div class="activity-total">
                <span class="activity-total-value">${freq.totalDays}</span>
                <span class="activity-total-label">TAGE</span>
            </div>
        `;

        return html;
    },

    getPeriodLabel() {
        const now = new Date();
        if (this.timeRange === 'week') {
            return `KW ${this.getWeekNumber(now)}`;
        } else if (this.timeRange === 'month') {
            const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
            return months[now.getMonth()];
        } else {
            return now.getFullYear().toString();
        }
    },

    getWeekNumber(date) {
        const onejan = new Date(date.getFullYear(), 0, 1);
        return Math.ceil((((date - onejan) / 86400000) + onejan.getDay() + 1) / 7);
    },

    getDateRange() {
        const now = new Date();
        const end = new Date(now);
        end.setHours(23, 59, 59, 999);
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);

        if (this.timeRange === 'week') {
            const day = now.getDay();
            start.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
        } else if (this.timeRange === 'month') {
            start.setDate(1);
        } else if (this.timeRange === 'year') {
            start.setMonth(0, 1);
        }

        return { startDate: start, endDate: end };
    },

    setTimeRange(range) {
        this.timeRange = range;
        App.refreshScreen();
    },

    onShow() {
        // No chart to update anymore
    }
};
