document.addEventListener('DOMContentLoaded', () => {
    const contentDiv = document.getElementById('content');
    const todayBtn = document.getElementById('today-btn');
    const weekPlanBtn = document.getElementById('week-plan-btn');
    const workoutsBtn = document.getElementById('week-plan-btn'); // Button für die "Workouts"-Übersicht
    const addBtn = document.getElementById('add-btn'); // Button für "Neues Workout"
    const searchBtn = document.getElementById('search-btn');
    let workouts = loadWorkouts();
    let currentEditIndex = null; // Speichert den Index des Workouts, das bearbeitet wird

    function loadWorkouts() {
        const storedWorkouts = localStorage.getItem('workouts');
        return storedWorkouts ? JSON.parse(storedWorkouts) : []; // Jetzt ein Array
    }

    function saveWorkouts() {
        localStorage.setItem('workouts', JSON.stringify(workouts));
    }

    function setActiveButton(buttonId) {
        document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
        document.getElementById(buttonId).classList.add('active');
    }

    function displayTodayWorkout() {
        const today = new Date();
        const dayIndex = today.getDay();
        const days = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
        const currentDay = days[dayIndex];
        contentDiv.innerHTML = `<h2>Heutiges Workout (${currentDay})</h2><p>Diese Funktion wurde im Zuge der Umstellung auf allgemeine Workouts deaktiviert.</p>`;
        setActiveButton('today-btn');
    }

    function displayWeekPlan() {
        contentDiv.innerHTML = `<h2>Wochenplan</h2><p>Diese Funktion wurde im Zuge der Umstellung auf allgemeine Workouts deaktiviert.</p>`;
        setActiveButton('week-plan-btn');
    }

    function displayAllWorkouts() {
        let html = `<h2>Workouts</h2>`;
        html += `<button id="create-new-workout-btn" class="edit-workout-btn">Neues Workout erstellen</button>`;

        if (workouts.length > 0) {
            workouts.forEach((workout, index) => {
                html += `<div class="workout-item">`;
                if (workout.exercises && workout.exercises.length > 0) {
                    workout.exercises.forEach((exercise, exerciseIndex) => {
                        html += `<div class="exercise">
                            <div class="exercise-info">
                                <strong>${exercise.name}</strong>`;
                        if (exercise.sets && Array.isArray(exercise.sets)) {
                            html += `<ul>`;
                            exercise.sets.forEach(set => {
                                html += `<li>Satz: ${set.setNr || ''}, Gewicht: ${set.weight || ''} kg, Wiederholungen: ${set.reps || ''}</li>`;
                            });
                            html += `</ul>`;
                        }
                        html += `</div>
                            <button type="button" class="edit-workout-btn" data-index="${index}">Bearbeiten</button>
                            <button type="button" class="delete-workout-btn" data-index="${index}">Löschen</button>
                        </div>`;
                    });
                } else {
                    html += `<p>Dieses Workout enthält noch keine Übungen.</p>`;
                }
                html += `</div>`;
            });
        } else {
            html += `<p>Noch keine Workouts gespeichert.</p>`;
        }
        contentDiv.innerHTML = html;
        setActiveButton('week-plan-btn');
        attachEditWorkoutListeners();
        attachDeleteWorkoutListeners();

        const createNewWorkoutBtn = document.getElementById('create-new-workout-btn');
        if (createNewWorkoutBtn) {
            createNewWorkoutBtn.addEventListener('click', displayAddWorkoutForm);
        } else {
            console.error("Das Element mit der ID 'create-new-workout-btn' wurde nicht gefunden.");
        }
    }

    function attachDeleteWorkoutListeners() {
        const deleteButtons = document.querySelectorAll('.delete-workout-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const indexToDelete = parseInt(event.target.dataset.index);
                workouts.splice(indexToDelete, 1); // Entfernt das Workout aus dem Array
                saveWorkouts();
                displayAllWorkouts(); // Aktualisiert die Anzeige
            });
        });
    }

    function attachEditWorkoutListeners() {
        const editButtons = document.querySelectorAll('.edit-workout-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const indexToEdit = parseInt(event.target.dataset.index);
                displayEditWorkoutForm(indexToEdit);
            });
        });
    }

    function displayEditWorkoutForm(workoutIndex) {
        const workoutToEdit = workouts[workoutIndex];

        let html = `
            <h2>Workout bearbeiten</h2>
            <form id="edit-workout-form" class="add-workout-form">
                <div id="exercises-container-edit">`;

        if (workoutToEdit && workoutToEdit.exercises && Array.isArray(workoutToEdit.exercises) && workoutToEdit.exercises.length > 0) {
            workoutToEdit.exercises.forEach((exercise, exerciseIndex) => {
                html += createEditExerciseInput(exercise, exerciseIndex); // Stelle sicher, dass diese Funktion existiert
            });
        } else {
            html += `<p>Keine Übungen in diesem Workout.</p>`;
        }

        html += `
                </div>
                <button type="button" id="add-exercise-btn-edit-form">Weitere Übung hinzufügen</button>
                <button type="submit">Änderungen speichern</button>
                <button type="button" id="cancel-edit-btn">Abbrechen</button>
            </form>
        `;
        contentDiv.innerHTML = html;

        const editWorkoutForm = document.getElementById('edit-workout-form');
        const addExerciseBtnEditForm = document.getElementById('add-exercise-btn-edit-form');
        const cancelEditBtn = document.getElementById('cancel-edit-btn');
        const exercisesContainerEdit = document.getElementById('exercises-container-edit');

        if (editWorkoutForm) {
            editWorkoutForm.addEventListener('submit', handleEditWorkoutSubmit); // Stelle sicher, dass diese Funktion existiert
        }
        if (addExerciseBtnEditForm) {
            addExerciseBtnEditForm.addEventListener('click', handleAddExerciseToEditForm); // Stelle sicher, dass diese Funktion existiert
        }
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', displayAllWorkouts);
        }
    }

    function displayAddWorkoutForm() {
        let html = `
            <h2>Neues Workout erstellen</h2>
            <form id="add-workout-form" class="add-workout-form">
                <div id="exercises-container">
                    </div>
                <button type="button" id="add-exercise-btn">Weitere Übung hinzufügen</button>
                <button type="submit">Workout speichern</button>
            </form>
        `;
        contentDiv.innerHTML = html;
        setActiveButton('add-btn');
    
        const addWorkoutForm = document.getElementById('add-workout-form');
        const exercisesContainer = document.getElementById('exercises-container');
        const addExerciseButton = document.getElementById('add-exercise-btn');
    
        let exerciseCounter = 0;
    
        // Füge die erste Übung direkt beim Anzeigen des Formulars hinzu
        const firstExerciseDiv = createExerciseInput(exerciseCounter);
        exercisesContainer.appendChild(firstExerciseDiv);
        exerciseCounter++; // Erhöhe den Zähler danach
    
        addExerciseButton.addEventListener('click', () => {
            const exerciseDiv = createExerciseInput(exerciseCounter);
            exercisesContainer.appendChild(exerciseDiv);
            exerciseCounter++;
        });
    
        function createExerciseInput(exerciseIndex) {
            const exerciseDiv = document.createElement('div');
            exerciseDiv.classList.add('exercise-input');
            exerciseDiv.innerHTML = `
                <h3>Übung ${exerciseIndex + 1}</h3>
                <label for="exercise-name-${exerciseIndex + 1}">Übungsname:</label>
                <input type="text" id="exercise-name-${exerciseIndex + 1}" name="exercise-name[]" required>
                <label for="muscle-group-${exerciseIndex + 1}">Muskelgruppe:</label>
                <input type="text" id="muscle-group-${exerciseIndex + 1}" name="muscle-group[]">
                <div class="sets-table-container">
                    <h4>Sätze</h4>
                    <table>
                        <thead>
                            <tr>
                                <th>Satz</th>
                                <th>Gewicht (kg)</th>
                                <th>Wiederholungen</th>
                                <th>Aktion</th>
                            </tr>
                        </thead>
                        <tbody id="sets-table-body-${exerciseIndex + 1}">
                            </tbody>
                    </table>
                    <button type="button" class="add-set-btn" data-exercise-index="${exerciseIndex + 1}">Satz hinzufügen</button>
                </div>
            `;
    
            const addSetButton = exerciseDiv.querySelector('.add-set-btn');
            const setsTableBody = exerciseDiv.querySelector(`#sets-table-body-${exerciseIndex + 1}`);
    
            addSetButton.addEventListener('click', () => {
                const newRow = setsTableBody.insertRow();
                const setCounter = setsTableBody.rows.length;
                newRow.innerHTML = `
                    <td><input type="text" name="set-nr-${exerciseIndex + 1}[]" value="${setCounter}"></td>
                    <td><input type="number" name="weight-${exerciseIndex + 1}[]" value=""></td>
                    <td><input type="number" name="reps-${exerciseIndex + 1}[]" value=""></td>
                    <td><button type="button" class="remove-set-btn">Entfernen</button></td>
                `;
                const removeButton = newRow.querySelector('.remove-set-btn');
                removeButton.addEventListener('click', (event) => {
                    event.target.parentNode.parentNode.remove();
                });
            });
    
            return exerciseDiv;
        }
    
        // addExerciseButton.click(); // Diese Zeile entfernen!
    
        addWorkoutForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const exerciseNames = document.querySelectorAll('input[name="exercise-name[]"]');
            const muscleGroups = document.querySelectorAll('input[name="muscle-group[]"]');
            const allExercisesData = [];
    
            exerciseNames.forEach((nameInput, exerciseIndex) => {
                const sets = [];
                const setNrs = document.querySelectorAll(`input[name="set-nr-${exerciseIndex + 1}[]"]`);
                const weights = document.querySelectorAll(`input[name="weight-${exerciseIndex + 1}[]"]`);
                const reps = document.querySelectorAll(`input[name="reps-${exerciseIndex + 1}[]"]`);
    
                setNrs.forEach((setNrInput, setIndex) => {
                    sets.push({
                        setNr: setNrInput.value,
                        weight: weights[setIndex].value ? parseFloat(weights[setIndex].value) : null,
                        reps: reps[setIndex].value ? parseInt(reps[setIndex].value) : null
                    });
                });
    
                allExercisesData.push({
                    name: nameInput.value,
                    muscleGroup: muscleGroups[exerciseIndex].value,
                    sets: sets
                });
            });
    
            const newWorkout = { exercises: allExercisesData };
            workouts.push(newWorkout);
            saveWorkouts();
            displayAllWorkouts();
        });
    }

    function displaySearchForm() {
        let html = `
            <h2>Übungen suchen</h2>
            <label for="search-muscle">Muskelgruppe eingeben:</label>
            <input type="text" id="search-muscle" name="search-muscle">
            <button id="search-button">Suchen</button>
            <div id="search-results" class="search-results"></div>
        `;
        contentDiv.innerHTML = html;
        setActiveButton('search-btn');

        const searchButton = document.getElementById('search-button');
        const searchInput = document.getElementById('search-muscle');
        const searchResultsDiv = document.getElementById('search-results');

        searchButton.addEventListener('click', () => {
            const searchTerm = searchInput.value.toLowerCase();
            let results = [];
            for (const workout of workouts) {
                if (workout.exercises) {
                    workout.exercises.forEach(exercise => {
                        if (exercise.muscleGroup && exercise.muscleGroup.toLowerCase().includes(searchTerm)) {
                            results.push(exercise);
                        }
                    });
                }
            }

            let resultsHtml = '<ul>';
            if (results.length > 0) {
                results.forEach(exercise => {
                    resultsHtml += `<li><strong>${exercise.name}</strong> <span>(${exercise.muscleGroup || 'keine Angabe'})</span></li>`;
                });
            } else {
                resultsHtml += `<li>Keine Übungen für diese Muskelgruppe gefunden.</li>`;
            }
            resultsHtml += '</ul>';
            searchResultsDiv.innerHTML = resultsHtml;
        });
    }

    // Event Listener für die Navigation
    todayBtn.addEventListener('click', displayTodayWorkout);
    workoutsBtn.addEventListener('click', displayAllWorkouts); // Geändert zu displayAllWorkouts
    addBtn.addEventListener('click', displayAddWorkoutForm);
    searchBtn.addEventListener('click', displaySearchForm);

    // Initial beim Laden der Seite die "Workouts"-Übersicht anzeigen und Button aktivieren
    displayAllWorkouts();
});

// Stelle sicher, dass diese Funktionen existieren und entsprechend deiner Logik implementiert sind
function createEditExerciseInput(exercise, exerciseIndex) {
    // ... (Deine Logik zum Erstellen der Bearbeitungsfelder für eine Übung) ...
    return `<div><h3>Übung ${exerciseIndex + 1}</h3><label>Name:</label><input type="text" value="${exercise.name || ''}"></div>`; // Beispiel-Platzhalter
}

function handleEditWorkoutSubmit(event) {
    event.preventDefault();
    // ... (Deine Logik zum Speichern der bearbeiteten Workout-Daten) ...
    console.log("Änderungen am Workout gespeichert!");
    displayAllWorkouts();
}

function handleAddExerciseToEditForm() {
    // ... (Deine Logik zum Hinzufügen weiterer Übungsfelder im Bearbeitungsformular) ...
    console.log("Weitere Übung zum Bearbeitungsformular hinzugefügt!");
}