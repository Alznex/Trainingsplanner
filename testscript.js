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
                    <button type="button" class="edit-workout-btn" data-index="${index}">Starten</button>
                    <button type="button" class="delete-workout-btn" data-index="${index}">Löschen</button>
                </div>`;
        html += `</div>`;
        if (workout.exercises && workout.exercises.length > 0) {
            workout.exercises.forEach((exercise) => {
                html += `<div class="exercise">${exercise.name} </div>`;
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
        let html = `<div class="workoutHeader">
                        <h2>Workouts</h2>
                        <button id="create-new-workout-btn" class="create-workout-btn">Neues Workout erstellen</button> 
                    </div>`;

        if (workouts.length > 0) {
            workouts.forEach((workout, index) => {
                html += displayWorkout(workout, index)
            });
        } else {
            html += `<p>Noch keine Workouts gespeichert.</p>`;
        }
        contentDiv.innerHTML = html;
        attachEditWorkoutListeners();
        attachDeleteWorkoutListeners();
    
        const createNewWorkoutBtn = document.getElementById('create-new-workout-btn');
        if (createNewWorkoutBtn) {
            createNewWorkoutBtn.addEventListener('click', displayEditWorkoutForm);
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
        let State = true
        let workoutToEdit
        if (workoutIndex){
            workoutToEdit = {name: '', scheduledDayOfWeek: 0, exercises:[{name: '', sets: [{setNr: "1", weight: 0, reps: 0}]}]};
            State = false
        }else{
            workoutToEdit = workouts[workoutIndex];
        }
        const weekdays = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
        
        let html = `
            <h2>Workout bearbeiten</h2>
            <form id="edit-workout-form" class="add-workout-form" data-index="${workoutIndex}">
                <div>
                    <input type="text" id="edit-workout-name-edit" name="edit-workout-name-edit" placeholder="Workout Name" value="${workoutToEdit.name || ''}">
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
            // Event Delegation für "Satz entfernen" im Bearbeitungsformular
            editWorkoutForm.addEventListener('click', function(event) {
                if (event.target.classList.contains('remove-set-btn-edit')) {
                    event.target.closest('tr').remove();
                }
            });
        }
        if (addExerciseBtnEditForm && State == true) {
            addExerciseBtnEditForm.addEventListener('click', handleAddExerciseToEditForm);
        }else{
            addExerciseBtnEditForm.addEventListener('click', saveNemWorkout);
        }
        if (cancelEditBtn && State == false) {
            cancelEditBtn.addEventListener('click', displayAllWorkouts);
        }else{
            cancelEditBtn.addEventListener('click', displayToday);
        }

        const addSetButtonsEdit = document.querySelectorAll('.add-set-btn-edit');
        addSetButtonsEdit.forEach(button => {
            button.addEventListener('click', function() {
                const exerciseIndex = this.dataset.exerciseIndex;
                const setsTableBodyEdit = document.querySelector(`#sets-table-body-edit-${exerciseIndex}`);
                if (setsTableBodyEdit) {
                    const newRow = setsTableBodyEdit.insertRow();
                    const setCounter = setsTableBodyEdit.rows.length;
                    newRow.innerHTML = `
                        <td><input type="text" name="edit-set-nr-${exerciseIndex}[]" value="${setCounter}"></td>
                        <td><input type="number" step="0.01" name="edit-weight-${exerciseIndex}[]" value=""></td>
                        <td><input type="number" name="edit-reps-${exerciseIndex}[]" value=""></td>
                        <td><button type="button" class="remove-set-btn-edit"><svg class="svgDelet" viewBox="0 0 2048 2048" focusable="false"><path d="M1792 384h-128v1472q0 40-15 75t-41 61-61 41-75 15H448q-40 0-75-15t-61-41-41-61-15-75V384H128V256h512V128q0-27 10-50t27-40 41-28 50-10h384q27 0 50 10t40 27 28 41 10 50v128h512v128zM768 256h384V128H768v128zm768 128H384v1472q0 26 19 45t45 19h1024q26 0 45-19t19-45V384zM768 1664H640V640h128v1024zm256 0H896V640h128v1024zm256 0h-128V640h128v1024z"></path></svg></button></td>
                    `;
                    // WICHTIG: Füge auch hier den delegierten Listener für das neu erstellte "Entfernen"-Button hinzu
                    newRow.querySelector('.remove-set-btn-edit').addEventListener('click', (event) => {
                        event.target.closest('tr').remove();
                    });
                }
            });
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
                                <th>Reps</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody id="sets-table-body-edit-${exerciseIndex + 1}">
        `;
    
        if (exercise.sets && Array.isArray(exercise.sets)) {
            exercise.sets.forEach((set, setIndex) => {
                html += `
                    <tr>
                        <td><input type="text" name="edit-set-nr-${exerciseIndex + 1}[]" value="${set.setNr || setIndex + 1}"></td>
                        <td><input type="number" step="0.01" name="edit-weight-${exerciseIndex + 1}[]" value="${set.weight || ''}"></td>
                        <td><input type="number" name="edit-reps-${exerciseIndex + 1}[]" value="${set.reps || ''}"></td>
                        <td><button type="button" class="remove-set-btn-edit"><svg class="svgDelet" viewBox="0 0 2048 2048" focusable="false"><path d="M1792 384h-128v1472q0 40-15 75t-41 61-61 41-75 15H448q-40 0-75-15t-61-41-41-61-15-75V384H128V256h512V128q0-27 10-50t27-40 41-28 50-10h384q27 0 50 10t40 27 28 41 10 50v128h512v128zM768 256h384V128H768v128zm768 128H384v1472q0 26 19 45t45 19h1024q26 0 45-19t19-45V384zM768 1664H640V640h128v1024zm256 0H896V640h128v1024zm256 0h-128V640h128v1024z"></path></svg></button></td>
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
            displayToday();
        }
    }

    function handleAddExerciseToEditForm() {
        const exercisesContainerEdit = document.getElementById('exercises-container-edit');
        let exerciseCounterEdit = exercisesContainerEdit.querySelectorAll('.exercise-input').length;
        exerciseCounterEdit++;
        const exerciseDiv = document.createElement('div');
        exerciseDiv.classList.add('exercise-input');
        exerciseDiv.innerHTML = `
            <h3><input type="text" id="edit-exercise-name-${exerciseCounterEdit}" name="edit-exercise-name[]" placeholder="Übungs Name" required></h3>
            <div class="sets-table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Satz</th>
                            <th>Gewicht (kg)</th>
                            <th>Wiederholungen</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody id="sets-table-body-edit-${exerciseCounterEdit}">
                    </tbody>
                </table>
                <button type="button" class="add-set-btn-edit" data-exercise-index="${exerciseCounterEdit}">Satz hinzufügen</button>
            </div>
        `;
        exercisesContainerEdit.appendChild(exerciseDiv);
    
        // Füge Event Listener für "Satz hinzufügen" zum neu erstellten Übungs-Div hinzu
        const addSetButtonEdit = exerciseDiv.querySelector('.add-set-btn-edit');
        const setsTableBodyEdit = exerciseDiv.querySelector(`#sets-table-body-edit-${exerciseCounterEdit}`);
    
        if (addSetButtonEdit && setsTableBodyEdit) {
            addSetButtonEdit.addEventListener('click', () => {
                const newRow = setsTableBodyEdit.insertRow();
                const setCounter = setsTableBodyEdit.rows.length;
                newRow.innerHTML = `
                    <td><input type="text" name="edit-set-nr-${exerciseCounterEdit}[]" value="${setCounter}"></td>
                    <td><input type="number" step="0.01" name="edit-weight-${exerciseCounterEdit}[]" value=""></td>
                    <td><input type="number" name="edit-reps-${exerciseCounterEdit}[]" value=""></td>
                    <td><button type="button" class="remove-set-btn-edit"><svg class="svgDelet" viewBox="0 0 2048 2048" focusable="false"><path d="M1792 384h-128v1472q0 40-15 75t-41 61-61 41-75 15H448q-40 0-75-15t-61-41-41-61-15-75V384H128V256h512V128q0-27 10-50t27-40 41-28 50-10h384q27 0 50 10t40 27 28 41 10 50v128h512v128zM768 256h384V128H768v128zm768 128H384v1472q0 26 19 45t45 19h1024q26 0 45-19t19-45V384zM768 1664H640V640h128v1024zm256 0H896V640h128v1024zm256 0h-128V640h128v1024z"></path></svg></button></td>
                `;
                // WICHTIG: Füge auch hier den delegierten Listener für das neu erstellte "Entfernen"-Button hinzu
                newRow.querySelector('.remove-set-btn-edit').addEventListener('click', (event) => {
                    event.target.closest('tr').remove();
                });
            });
        }
    }

    function saveNemWorkout(event){
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
    }

    // Event Listener für die Navigation
    displayToday();
    todayBtn.addEventListener('click', displayToday);
    workoutsBtn.addEventListener('click', displayAllWorkouts);
});