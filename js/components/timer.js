/* ========================================
   Timer Component - Fitapp
   Rest timer for between sets
   ======================================== */

const Timer = {
    duration: 120, // Default 2 minutes
    remaining: 0,
    isRunning: false,
    intervalId: null,
    onTick: null,
    onComplete: null,

    // Start the timer
    start(duration = null, onTick = null, onComplete = null) {
        if (duration !== null) {
            this.duration = duration;
        }
        this.remaining = this.duration;
        this.isRunning = true;
        this.onTick = onTick;
        this.onComplete = onComplete;

        this.intervalId = setInterval(() => {
            this.remaining--;

            if (this.onTick) {
                this.onTick(this.remaining);
            }

            if (this.remaining <= 0) {
                this.complete();
            }
        }, 1000);
    },

    // Pause the timer
    pause() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
    },

    // Resume the timer
    resume() {
        if (!this.isRunning && this.remaining > 0) {
            this.isRunning = true;
            this.intervalId = setInterval(() => {
                this.remaining--;

                if (this.onTick) {
                    this.onTick(this.remaining);
                }

                if (this.remaining <= 0) {
                    this.complete();
                }
            }, 1000);
        }
    },

    // Stop and reset the timer
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        this.remaining = 0;
    },

    // Reset to initial duration
    reset() {
        this.stop();
        this.remaining = this.duration;
    },

    // Add time
    addTime(seconds) {
        this.remaining += seconds;
    },

    // Timer completed
    complete() {
        this.stop();
        if (this.onComplete) {
            this.onComplete();
        }
        // Vibrate if supported
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
        }
    },

    // Format time as MM:SS
    formatTime(seconds = null) {
        const time = seconds !== null ? seconds : this.remaining;
        const mins = Math.floor(Math.abs(time) / 60);
        const secs = Math.abs(time) % 60;
        const sign = time < 0 ? '-' : '';
        return `${sign}${mins}:${secs.toString().padStart(2, '0')}`;
    },

    // Get current state
    getState() {
        return {
            duration: this.duration,
            remaining: this.remaining,
            isRunning: this.isRunning,
            formatted: this.formatTime()
        };
    }
};

// Workout duration timer (counts up)
const WorkoutTimer = {
    startTime: null,
    elapsed: 0,
    intervalId: null,
    isRunning: false,
    onTick: null,

    start(onTick = null) {
        this.startTime = Date.now();
        this.elapsed = 0;
        this.isRunning = true;
        this.onTick = onTick;

        this.intervalId = setInterval(() => {
            this.elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            if (this.onTick) {
                this.onTick(this.elapsed);
            }
        }, 1000);
    },

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        return this.elapsed;
    },

    formatTime(seconds = null) {
        const time = seconds !== null ? seconds : this.elapsed;
        const hours = Math.floor(time / 3600);
        const mins = Math.floor((time % 3600) / 60);
        const secs = time % 60;

        if (hours > 0) {
            return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    getElapsed() {
        return this.elapsed;
    }
};
