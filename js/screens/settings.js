/* ========================================
   Settings Screen - Fitapp
   App settings and data management
   ======================================== */

const SettingsScreen = {
    render() {
        return `
            <div class="settings-screen animate-fade-in">
                <div class="screen-header">
                    <div class="screen-header-left">
                        <button class="back-btn" onclick="App.navigate('home')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>
                        <h1 class="screen-title">Einstellungen</h1>
                    </div>
                </div>

                <!-- Data Section -->
                <div class="settings-section">
                    <h3 class="settings-section-title">Daten</h3>
                    <div class="settings-list">
                        <button class="settings-item" onclick="SettingsScreen.exportData()">
                            <div class="settings-item-content">
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                <div class="settings-item-text">
                                    <span class="settings-item-title">Daten exportieren</span>
                                    <span class="settings-item-subtitle">Backup als JSON-Datei speichern</span>
                                </div>
                            </div>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                        
                        <button class="settings-item" onclick="SettingsScreen.triggerImport()">
                            <div class="settings-item-content">
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="17 8 12 3 7 8"></polyline>
                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                </svg>
                                <div class="settings-item-text">
                                    <span class="settings-item-title">Daten importieren</span>
                                    <span class="settings-item-subtitle">Backup wiederherstellen</span>
                                </div>
                            </div>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Danger Zone -->
                <div class="settings-section">
                    <h3 class="settings-section-title">Gefahrenzone</h3>
                    <div class="settings-list">
                        <button class="settings-item settings-item-danger" onclick="SettingsScreen.confirmDeleteAll()">
                            <div class="settings-item-content">
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                                <div class="settings-item-text">
                                    <span class="settings-item-title">Alle Daten löschen</span>
                                    <span class="settings-item-subtitle">Übungen, Vorlagen und Workouts</span>
                                </div>
                            </div>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Info Section -->
                <div class="settings-section">
                    <h3 class="settings-section-title">Info</h3>
                    <div class="settings-list">
                        <div class="settings-item settings-item-static">
                            <div class="settings-item-content">
                                <span class="settings-item-title">Version</span>
                            </div>
                            <span class="settings-item-value">1.0.0</span>
                        </div>
                    </div>
                </div>

                <!-- Hidden file input for import -->
                <input type="file" 
                       id="import-file-input" 
                       accept=".json" 
                       style="display: none;" 
                       onchange="SettingsScreen.handleImport(event)">
            </div>
        `;
    },

    exportData() {
        const data = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            exercises: Storage.getExercises(),
            templates: Storage.getTemplates(),
            workouts: Storage.getWorkouts(),
            settings: Storage.getSettings()
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const date = new Date().toISOString().split('T')[0];
        const filename = `fitapp_backup_${date}.json`;

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();

        URL.revokeObjectURL(url);

        // Show success message
        Modal.showSheet({
            title: 'Export erfolgreich',
            content: `
                <div style="text-align: center; padding: var(--spacing-lg);">
                    <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="var(--color-success)" stroke-width="2" style="margin-bottom: var(--spacing-md);">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <p>Deine Daten wurden als <strong>${filename}</strong> gespeichert.</p>
                </div>
            `,
            footer: '<button class="btn btn-primary btn-full" onclick="Modal.close()">OK</button>'
        });
    },

    triggerImport() {
        document.getElementById('import-file-input').click();
    },

    async handleImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            // Validate data structure
            if (!data.version || !data.exercises || !data.templates || !data.workouts) {
                throw new Error('Ungültiges Backup-Format');
            }

            // Confirm import
            const confirmed = await Modal.confirm({
                title: 'Daten importieren?',
                message: `Backup vom ${new Date(data.exportDate).toLocaleDateString('de-DE')} gefunden. Alle aktuellen Daten werden überschrieben.`,
                confirmText: 'Importieren',
                cancelText: 'Abbrechen',
                danger: true
            });

            if (confirmed) {
                // Import data
                Storage.set(Storage.KEYS.EXERCISES, data.exercises);
                Storage.set(Storage.KEYS.TEMPLATES, data.templates);
                Storage.set(Storage.KEYS.WORKOUTS, data.workouts);
                if (data.settings) {
                    Storage.set(Storage.KEYS.SETTINGS, data.settings);
                }

                Modal.showSheet({
                    title: 'Import erfolgreich',
                    content: `
                        <div style="text-align: center; padding: var(--spacing-lg);">
                            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="var(--color-success)" stroke-width="2" style="margin-bottom: var(--spacing-md);">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                            <p><strong>${data.exercises.length}</strong> Übungen<br>
                            <strong>${data.templates.length}</strong> Vorlagen<br>
                            <strong>${data.workouts.length}</strong> Workouts</p>
                        </div>
                    `,
                    footer: '<button class="btn btn-primary btn-full" onclick="Modal.close(); App.navigate(\'home\');">OK</button>'
                });
            }
        } catch (e) {
            Modal.showSheet({
                title: 'Fehler beim Import',
                content: `
                    <div style="text-align: center; padding: var(--spacing-lg);">
                        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="var(--color-error)" stroke-width="2" style="margin-bottom: var(--spacing-md);">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                        <p>${e.message}</p>
                    </div>
                `,
                footer: '<button class="btn btn-primary btn-full" onclick="Modal.close()">OK</button>'
            });
        }

        // Reset file input
        event.target.value = '';
    },

    async confirmDeleteAll() {
        const confirmed = await Modal.confirm({
            title: 'Alle Daten löschen?',
            message: 'Dies löscht alle Übungen, Vorlagen und Workouts unwiderruflich. Erstelle vorher ein Backup!',
            confirmText: 'Alles löschen',
            cancelText: 'Abbrechen',
            danger: true
        });

        if (confirmed) {
            Storage.set(Storage.KEYS.EXERCISES, []);
            Storage.set(Storage.KEYS.TEMPLATES, []);
            Storage.set(Storage.KEYS.WORKOUTS, []);
            Storage.clearActiveWorkout();

            Modal.showSheet({
                title: 'Daten gelöscht',
                content: `
                    <div style="text-align: center; padding: var(--spacing-lg);">
                        <p>Alle Daten wurden gelöscht.</p>
                    </div>
                `,
                footer: '<button class="btn btn-primary btn-full" onclick="Modal.close(); App.navigate(\'home\');">OK</button>'
            });
        }
    }
};
