document.addEventListener('DOMContentLoaded', () => {
    const contentDiv = document.getElementById('content');
    const todayBtn = document.getElementById('today-btn');
    const workoutsBtn = document.getElementById('week-plan-btn'); // Button für die "Workouts"-Übersicht
    const addBtn = document.getElementById('create-new-workout-btn'); // Button für "Neues Workout"
    let workouts = loadWorkouts();

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

    function displayWorkout(workout, index) {
        let html = `<div class="workout-item">`;
        html += `<div class="workoutHeader">`
        html += `<h3>${workout.name}</h3>`;
        html += `<div>
                    <button type="button" class="edit-workout-btn" data-index="${index}">Bearbeiten</button>
                    <button type="button" class="delete-workout-btn" data-index="${index}">Löschen</button>
                </div>`;
        html += `</div>`;
        if (workout.exercises && workout.exercises.length > 0) {
            workout.exercises.forEach((exercise) => {
                html += `<div class="exercise">${exercise.name}`;
                if (exercise.sets && Array.isArray(exercise.sets) && exercise.sets.length > 0) {
                    html += `<ul>`;
                    exercise.sets.forEach(set => {
                        html += `<li>Satz: ${set.setNr || ''}, Gewicht: ${set.weight || ''} kg, Wiederholungen: ${set.reps || ''}</li>`;
                    });
                    html += `</ul>
                        </div>`;
                } else {
                    html += `<p>Keine Sätze für diese Übung.</p>`;
                }
            });
        } else {
            html += `<p>Dieses Workout enthält noch keine Übungen.</p>`;
        }
        html += `</div>`;
    
        return html
    }

    function displayToday() {
        let html = `<h2>Heute</h2>`;
        const today = new Date().getDay()-1; // Aktueller Wochentag (0 für Sonntag, ..., 6 für Samstag)

        if (workouts.length > 0) {
            workouts.forEach((workout, index) => {
                if (workout.scheduledDayOfWeek == today){
                    html += displayWorkout(workout, index)
                }
            });
        } else {
            html += `<p>Für heute ist kein Workout geplant.</p>`;
        }
    
        contentDiv.innerHTML = html;
        setActiveButton('today-btn');
        attachEditWorkoutListeners();
        attachDeleteWorkoutListeners();
    }

    function displayAllWorkouts() {
        let html = `<h2>Workouts</h2>`;
        html += `<button id="create-new-workout-btn" class="create-workout-btn">Neues Workout erstellen</button>`;
    
        if (workouts.length > 0) {
            workouts.forEach((workout, index) => {
                html += displayWorkout(workout, index)
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
        const weekdays = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
    
        let html = `
            <h2>Workout bearbeiten</h2>
            <form id="edit-workout-form" class="add-workout-form" data-index="${workoutIndex}">
                <div>
                    <input type="text" id="edit-workout-name-edit" name="edit-workout-name-edit" value="${workoutToEdit.name || ''}">
                    <select id="edit-scheduled-day-of-week-edit" name="edit-scheduled-day-of-week-edit">`;
        weekdays.forEach((day, index) => {
            let selected = ""
            if (workoutToEdit.scheduledDayOfWeek == index){
                selected = 'selected';
            }
            html += `<option value="${index}" ${selected}>${day}</option>`;
        });
        html += `
                    </select>
                </div>
                <div id="exercises-container-edit">`;
    
        if (workoutToEdit && workoutToEdit.exercises && Array.isArray(workoutToEdit.exercises) && workoutToEdit.exercises.length > 0) {
            workoutToEdit.exercises.forEach((exercise, exerciseIndex) => {
                html += createEditExerciseInput(exercise, exerciseIndex);
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
    
        if (editWorkoutForm) {
            editWorkoutForm.addEventListener('submit', handleEditWorkoutSubmit);
        }
        if (addExerciseBtnEditForm) {
            addExerciseBtnEditForm.addEventListener('click', handleAddExerciseToEditForm);
        }
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', displayAllWorkouts);
        }
    }
    
    function displayAddWorkoutForm() {
        const weekdays = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
    
        let html = `
            <h2>Neues Workout erstellen</h2>
            <form id="add-workout-form" class="add-workout-form">
                <div>
                    <input type="text" id="workout-name" name="workout-name" placeholder="Workoutname">
                    <select id="scheduled-day-of-week" name="scheduled-day-of-week">`;
        weekdays.forEach((day, index) => {
            html += `<option value="${index}">${day}</option>`;
        });
        html += `
                    </select>
                </div>
                <div id="exercises-container">
                    </div>
                <button type="button" id="add-exercise-btn">Weitere Übung hinzufügen</button>
                <button type="submit">Workout speichern</button>
            </form>
        `;
        contentDiv.innerHTML = html;
    
        const addWorkoutForm = document.getElementById('add-workout-form');
        const exercisesContainer = document.getElementById('exercises-container');
        const addExerciseButton = document.getElementById('add-exercise-btn');
    
        let exerciseCounter = 0;
    
        const firstExerciseDiv = createExerciseInput(exerciseCounter);
        exercisesContainer.appendChild(firstExerciseDiv);
        exerciseCounter++;
    
        addExerciseButton.addEventListener('click', () => {
            const exerciseDiv = createExerciseInput(exerciseCounter);
            exercisesContainer.appendChild(exerciseDiv);
            exerciseCounter++;
        });
    
        function createExerciseInput(exerciseIndex) {
            const exerciseDiv = document.createElement('div');
            exerciseDiv.classList.add('exercise-input');
            exerciseDiv.innerHTML = `
                <h3>
                    <input type="text" id="exercise-name-${exerciseIndex + 1}" name="exercise-name[]" placeholder="Übungsname" required>
                </h3>
                <div class="sets-table-container">
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
    
        addWorkoutForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const workoutNameInput = document.getElementById('workout-name');
            const workoutName = workoutNameInput.value.trim();
            const scheduledDayOfWeekInput = document.getElementById('scheduled-day-of-week');
            const scheduledDayOfWeek = parseInt(scheduledDayOfWeekInput.value);
            const exerciseNames = document.querySelectorAll('input[name="exercise-name[]"]');
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
                    sets: sets
                });
            });
    
            const newWorkout = {
                name: workoutName,
                scheduledDayOfWeek: scheduledDayOfWeek, // Speichern des Wochentags als Zahl
                exercises: allExercisesData
            };
            workouts.push(newWorkout);
            saveWorkouts();
            displayAllWorkouts();
        });
    }

    function createEditExerciseInput(exercise, exerciseIndex) {
        let html = `
            <div class="exercise-input">
                <h3>
                    <input type="text" id="edit-exercise-name-${exerciseIndex + 1}" name="edit-exercise-name[]" value="${exercise.name || ''}" required>
                </h3>
                <div class="sets-table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Satz</th>
                                <th>Gewicht (kg)</th>
                                <th>Wiederholungen</th>
                                <th>Aktion</th>
                            </tr>
                        </thead>
                        <tbody id="sets-table-body-edit-${exerciseIndex + 1}">
        `;
    
        if (exercise.sets && Array.isArray(exercise.sets)) {
            exercise.sets.forEach((set, setIndex) => {
                html += `
                    <tr>
                        <td><input type="text" name="edit-set-nr-${exerciseIndex + 1}[]" value="${set.setNr || setIndex + 1}"></td>
                        <td><input type="number" name="edit-weight-${exerciseIndex + 1}[]" value="${set.weight || ''}"></td>
                        <td><input type="number" name="edit-reps-${exerciseIndex + 1}[]" value="${set.reps || ''}"></td>
                        <td><button type="button" class="remove-set-btn-edit">Entfernen</button></td>
                    </tr>
                `;
            });
        }
    
        html += `
                        </tbody>
                    </table>
                    <button type="button" class="add-set-btn-edit" data-exercise-index="${exerciseIndex + 1}">Satz hinzufügen</button>
                </div>
            </div>
        `;
    
        return html;
    }

    function handleEditWorkoutSubmit(event) {
        event.preventDefault();
        const workoutIndex = parseInt(document.getElementById('edit-workout-form').dataset.index);
        const workoutNameInput = document.getElementById('edit-workout-name-edit');
        const workoutName = workoutNameInput.value.trim();
        const scheduledDayOfWeekInput = document.getElementById('edit-scheduled-day-of-week-edit');
        const scheduledDayOfWeek = parseInt(scheduledDayOfWeekInput.value);
        const exerciseContainers = document.querySelectorAll('#exercises-container-edit .exercise-input');
        const updatedExercises = [];
    
        exerciseContainers.forEach((container, exerciseIndex) => {
            const nameInput = container.querySelector(`input[name="edit-exercise-name[]"]`);
            const sets = [];
            const setRows = container.querySelectorAll(`#sets-table-body-edit-${exerciseIndex + 1} tr`);
    
            setRows.forEach(setRow => {
                const setNrInput = setRow.querySelector(`input[name="edit-set-nr-${exerciseIndex + 1}[]"]`);
                const weightInput = setRow.querySelector(`input[name="edit-weight-${exerciseIndex + 1}[]"]`);
                const repsInput = setRow.querySelector(`input[name="edit-reps-${exerciseIndex + 1}[]"]`);
    
                if (setNrInput && weightInput && repsInput) {
                    sets.push({
                        setNr: setNrInput.value,
                        weight: weightInput.value ? parseFloat(weightInput.value) : null,
                        reps: repsInput.value ? parseInt(repsInput.value) : null
                    });
                }
            });
    
            if (nameInput) {
                updatedExercises.push({
                    name: nameInput.value,
                    sets: sets
                });
            }
        });
    
        if (workouts[workoutIndex]) {
            workouts[workoutIndex].name = workoutName;
            workouts[workoutIndex].scheduledDayOfWeek = scheduledDayOfWeek; // Speichern des bearbeiteten Wochentags
            workouts[workoutIndex].exercises = updatedExercises;
            saveWorkouts();
            displayAllWorkouts();
        }
    }

    function handleAddExerciseToEditForm() {
        const exercisesContainerEdit = document.getElementById('exercises-container-edit');
        let exerciseCounterEdit = exercisesContainerEdit.querySelectorAll('.exercise-input').length; // Aktuelle Anzahl der Übungen
        exerciseCounterEdit++;
        const exerciseDiv = createEditExerciseInputTemplate(exerciseCounterEdit);
        exercisesContainerEdit.appendChild(exerciseDiv);
    
        // Füge Event Listener für "Satz hinzufügen" und "Satz entfernen" zu der neuen Übung hinzu
        const addSetButtonEdit = exerciseDiv.querySelector('.add-set-btn-edit');
        const setsTableBodyEdit = exerciseDiv.querySelector(`#sets-table-body-edit-${exerciseCounterEdit}`);
    
        if (addSetButtonEdit && setsTableBodyEdit) {
            addSetButtonEdit.addEventListener('click', () => {
                const newRow = setsTableBodyEdit.insertRow();
                const setCounter = setsTableBodyEdit.rows.length;
                newRow.innerHTML = `
                    <td><input type="text" name="edit-set-nr-${exerciseCounterEdit}[]" value="${setCounter}"></td>
                    <td><input type="number" name="edit-weight-${exerciseCounterEdit}[]" value=""></td>
                    <td><input type="number" name="edit-reps-${exerciseCounterEdit}[]" value=""></td>
                    <td><button type="button" class="remove-set-btn-edit">Entfernen</button></td>
                `;
                const removeButton = newRow.querySelector('.remove-set-btn-edit');
                removeButton.addEventListener('click', (event) => {
                    event.target.parentNode.parentNode.remove();
                });
            });
        }
    }

    function createEditExerciseInputTemplate(exerciseIndex) {
        const exerciseDiv = document.createElement('div');
        exerciseDiv.classList.add('exercise-input');
        exerciseDiv.innerHTML = `
            <h3>Übung ${exerciseIndex + 1}</h3>
            <label for="edit-exercise-name-${exerciseIndex}">Übungsname:</label>
            <input type="text" id="edit-exercise-name-${exerciseIndex}" name="edit-exercise-name[]" required>
            <label for="edit-muscle-group-${exerciseIndex}">Muskelgruppe:</label>
            <input type="text" id="edit-muscle-group-${exerciseIndex}" name="edit-muscle-group[]">
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
                    <tbody id="sets-table-body-edit-${exerciseIndex}">
                    </tbody>
                </table>
                <button type="button" class="add-set-btn-edit" data-exercise-index="${exerciseIndex}">Satz hinzufügen</button>
            </div>
        `;
        return exerciseDiv;
    }

    // Event Listener für die Navigation
    displayToday();
    todayBtn.addEventListener('click', displayToday);
    workoutsBtn.addEventListener('click', displayAllWorkouts); // Geändert zu displayAllWorkouts
    addBtn.addEventListener('click', displayAddWorkoutForm);
});