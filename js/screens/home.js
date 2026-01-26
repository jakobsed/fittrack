/* ========================================
   Home Screen - Fitapp
   Dashboard with MacroFactor Style (Dynamic Data)
   ======================================== */

const HomeScreen = {
    render() {
        // Get real data from Storage
        const weekWorkouts = Storage.getThisWeekWorkouts();
        const settings = Storage.getSettings();

        // Calculate actual stats from workouts
        const totalSets = this.calculateTotalSets(weekWorkouts);
        const targetSets = settings.weeklyTargetSets || 45;
        const setsLeft = Math.max(0, targetSets - totalSets);

        const totalMuscles = this.calculateUniqueMuscles(weekWorkouts);
        const targetMuscles = settings.weeklyTargetMuscles || 18;
        const musclesLeft = Math.max(0, targetMuscles - totalMuscles);

        const totalExercises = this.calculateUniqueExercises(weekWorkouts);
        const targetExercises = settings.weeklyTargetExercises || 12;
        const exercisesLeft = Math.max(0, targetExercises - totalExercises);

        // Date formatting strings
        const now = new Date();
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        const dateString = now.toLocaleDateString('en-US', options).toUpperCase();

        return `
            <div class="home-screen animate-fade-in">
                <!-- Header -->
                <div class="home-header">
                    <div class="home-date">${dateString}</div>
                    <div class="home-title">DASHBOARD</div>
                </div>

                <!-- Weekly Workouts Section -->
                <div class="section-header">Weekly Workouts</div>

                <div class="dashboard-stats-row">
                    <!-- Left Circle: Muscles -->
                    <div class="stat-circle-group">
                        ${this.renderProgressRing(totalMuscles, targetMuscles, 'ring-blue', false, musclesLeft)}
                        <div class="stat-label-bottom">
                            <span class="stat-name">Muscles</span>
                            <span class="stat-target">${targetMuscles} target</span>
                        </div>
                    </div>

                    <!-- Center Circle: Sets (Main) -->
                    <div class="stat-circle-group main">
                        ${this.renderProgressRing(totalSets, targetSets, 'ring-orange', true, setsLeft)}
                        <div class="stat-label-bottom">
                            <span class="stat-name">Sets</span>
                            <span class="stat-target">${targetSets} target</span>
                        </div>
                    </div>

                    <!-- Right Circle: Exercises -->
                    <div class="stat-circle-group">
                        ${this.renderProgressRing(totalExercises, targetExercises, 'ring-teal', false, exercisesLeft)}
                        <div class="stat-label-bottom">
                            <span class="stat-name">Exercises</span>
                            <span class="stat-target">${targetExercises} target</span>
                        </div>
                    </div>
                </div>

                <!-- Toggles -->
                <div class="dashboard-toggles-container">
                    <div class="dashboard-toggles">
                        <button class="toggle-btn active">All Workouts</button>
                        <button class="toggle-btn inactive">Active Program</button>
                    </div>
                </div>

                <!-- Scroll Dots -->
                <div class="section-scroll-dots">
                    <div class="scroll-dot active"></div>
                    <div class="scroll-dot"></div>
                </div>

                <!-- Insights & Analytics -->
                <div class="section-header">Insights & Analytics</div>

                <div class="insights-grid">
                    <!-- Workouts Graph Card -->
                    <div class="insight-card">
                        <div class="insight-title">Workouts</div>
                        <div class="insight-subtitle">Last 7 Workouts</div>
                        
                        <div class="insight-chart-container">
                            ${this.renderBarChart()}
                        </div>
                        
                        <div class="insight-footer">
                            <span class="dataset-value">${this.getTotalSetsFromRecentWorkouts()} <span class="dataset-unit">sets</span></span>
                            <svg class="chevron-right" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </div>
                    </div>

                    <!-- Weight Trend Card -->
                    <div class="insight-card">
                        <div class="insight-title">Weight Trend</div>
                        <div class="insight-subtitle">Last 7 Days</div>
                         
                        <div class="insight-chart-container">
                             ${this.renderLineChart()}
                        </div>
                        
                        <div class="insight-footer">
                            <span class="dataset-value">249.4 <span class="dataset-unit">lbs</span></span>
                            <svg class="chevron-right" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </div>
                    </div>
                </div>
                
                <!-- Spacer for Bottom Nav and aesthetic balance -->
                <div style="height: 120px;"></div>
            </div>
        `;
    },

    renderProgressRing(value, max, colorClass, isMain = false, remaining) {
        const radius = isMain ? 52 : 36; // Larger main ring
        const stroke = isMain ? 8 : 6;
        const normalizedRadius = radius - stroke / 2;
        const circumference = normalizedRadius * 2 * Math.PI;

        // Ensure visual fill doesn't exceed 100%
        const safeValue = Math.min(value, max);
        const strokeDashoffset = circumference - (safeValue / max) * circumference;

        const size = radius * 2;

        return `
            <div class="progress-ring-container ${colorClass}" style="width:${size}px; height:${size}px;">
                <svg
                    height="${size}"
                    width="${size}"
                    class="progress-ring"
                    >
                    <circle
                        class="ring-bg"
                        stroke-width="${stroke}"
                        fill="transparent"
                        r="${normalizedRadius}"
                        cx="${size / 2}"
                        cy="${size / 2}"
                    />
                    <circle
                        class="ring-progress"
                        stroke-width="${stroke}"
                        stroke-dasharray="${circumference} ${circumference}"
                        style="stroke-dashoffset: ${strokeDashoffset}"
                        fill="transparent"
                        r="${normalizedRadius}"
                        cx="${size / 2}"
                        cy="${size / 2}"
                    />
                </svg>
                <div class="ring-content">
                    <span class="ring-value ${isMain ? 'value-lg' : ''}">${value}</span>
                    <span class="ring-label">${remaining} left</span>
                </div>
            </div>
        `;
    },

    renderBarChart() {
        // Get real workout data for last 7 workouts
        const chartData = this.getBarChartData();
        const maxSets = Math.max(...chartData, 1); // Avoid division by zero

        return `
            <div class="bar-chart">
                ${chartData.map(sets => {
            const height = (sets / maxSets) * 100;
            return `<div class="bar" style="height: ${height}%"></div>`;
        }).join('')}
            </div>
        `;
    },

    renderLineChart() {
        // Weight trend - placeholder for now, can be connected to weight logging
        return `
            <svg viewBox="0 0 100 40" class="line-chart" preserveAspectRatio="none">
                <defs>
                     <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#A78BFA" stop-opacity="0.2"/>
                        <stop offset="100%" stop-color="#A78BFA" stop-opacity="0"/>
                    </linearGradient>
                </defs>
                <polyline 
                    points="5,30 20,28 35,25 50,26 65,20 80,18 95,15" 
                    fill="none" 
                    stroke="#A78BFA" 
                    stroke-width="2" 
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
                <circle cx="5" cy="30" r="2" fill="#1C1C1E" stroke="#A78BFA" stroke-width="2"/>
                <circle cx="20" cy="28" r="2" fill="#1C1C1E" stroke="#A78BFA" stroke-width="2"/>
                <circle cx="35" cy="25" r="2" fill="#1C1C1E" stroke="#A78BFA" stroke-width="2"/>
                <circle cx="50" cy="26" r="2" fill="#1C1C1E" stroke="#A78BFA" stroke-width="2"/>
                <circle cx="65" cy="20" r="2" fill="#1C1C1E" stroke="#A78BFA" stroke-width="2"/>
                <circle cx="80" cy="18" r="2" fill="#1C1C1E" stroke="#A78BFA" stroke-width="2"/>
                <circle cx="95" cy="15" r="2" fill="#1C1C1E" stroke="#A78BFA" stroke-width="2"/>
            </svg>
        `;
    },

    // ========================================
    // Helper Functions for Dynamic Data
    // ========================================

    calculateTotalSets(workouts) {
        if (!workouts || workouts.length === 0) return 0;

        let total = 0;
        workouts.forEach(workout => {
            if (workout.exercises) {
                workout.exercises.forEach(ex => {
                    total += ex.sets || 0;
                });
            }
        });
        return total;
    },

    calculateUniqueMuscles(workouts) {
        if (!workouts || workouts.length === 0) return 0;

        const muscles = new Set();
        workouts.forEach(workout => {
            if (workout.exercises) {
                workout.exercises.forEach(ex => {
                    const exercise = Storage.getExercise(ex.exerciseId);
                    if (exercise && exercise.muscleGroup) {
                        muscles.add(exercise.muscleGroup);
                    }
                });
            }
        });
        return muscles.size;
    },

    calculateUniqueExercises(workouts) {
        if (!workouts || workouts.length === 0) return 0;

        const exercises = new Set();
        workouts.forEach(workout => {
            if (workout.exercises) {
                workout.exercises.forEach(ex => {
                    exercises.add(ex.exerciseId);
                });
            }
        });
        return exercises.size;
    },

    getBarChartData() {
        // Get last 7 workouts and their sets
        const recentWorkouts = Storage.getRecentWorkouts(7);

        if (recentWorkouts.length === 0) {
            // Return placeholder data if no workouts
            return [0, 0, 0, 0, 0, 0, 0];
        }

        // Pad with zeros if less than 7 workouts
        const data = recentWorkouts.map(workout => {
            if (!workout.exercises) return 0;
            return workout.exercises.reduce((sum, ex) => sum + (ex.sets || 0), 0);
        });

        while (data.length < 7) {
            data.unshift(0);
        }

        return data.slice(-7);
    },

    getTotalSetsFromRecentWorkouts() {
        const recentWorkouts = Storage.getRecentWorkouts(7);
        if (recentWorkouts.length === 0) return 0;

        // Return sets from most recent workout
        const lastWorkout = recentWorkouts[0];
        if (!lastWorkout || !lastWorkout.exercises) return 0;

        return lastWorkout.exercises.reduce((sum, ex) => sum + (ex.sets || 0), 0);
    }
};
