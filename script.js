document.addEventListener('DOMContentLoaded', () => {
    const contentDiv = document.getElementById('content');
    const todayBtn = document.getElementById('today-btn');
    const weekPlanBtn = document.getElementById('week-plan-btn');
    const addBtn = document.getElementById('add-btn');
    const searchBtn = document.getElementById('search-btn');

    let workouts = loadWorkouts();
    let currentEditDay = null; // Speichert den Tag, dessen Workout bearbeitet wird
    let currentEditIndex = null; // Speichert den Index der Übung, die bearbeitet wird

    function loadWorkouts() {
        const storedWorkouts = localStorage.getItem('workouts');
        return storedWorkouts ? JSON.parse(storedWorkouts) : {
            Montag: [],
            Dienstag: [],
            Mittwoch: [],
            Donnerstag: [],
            Freitag: [],
            Samstag: [],
            Sonntag: []
        };
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
        const todayWorkout = workouts[currentDay] || [];

        let html = `<h2>Heutiges Workout (${currentDay})</h2>`;
        if (todayWorkout.length > 0) {
            todayWorkout.forEach((exercise, index) => {
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
                    <button type="button" class="edit-exercise-btn" data-day="${currentDay}" data-index="${index}">Bearbeiten</button>
                </div>`;
            });
        } else {
            html += `<p>Kein Workout für heute geplant.</p>`;
        }
        contentDiv.innerHTML = html;
        setActiveButton('today-btn');
        attachEditWorkoutListeners();
    }

    function displayWeekPlan() {
        let html = `<h2>Wochenplan</h2>`;
        const daysOfWeek = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
        daysOfWeek.forEach(day => {
            html += `<div class="workout-day"><h3>${day}</h3>`;
            if (workouts[day] && workouts[day].length > 0) {
                workouts[day].forEach((exercise, index) => {
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
                        <button type="button" class="edit-exercise-btn" data-day="${day}" data-index="${index}">Bearbeiten</button>
                    </div>`;
                });
            } else {
                html += `<p>Kein Workout geplant.</p>`;
            }
            html += `</div>`;
        });
        contentDiv.innerHTML = html;
        setActiveButton('week-plan-btn');
        attachEditWorkoutListeners();
    }

    function attachEditWorkoutListeners() {
        const editButtons = document.querySelectorAll('.edit-exercise-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const day = event.target.dataset.day;
                const index = parseInt(event.target.dataset.index);
                currentEditDay = day;
                currentEditIndex = index;
                displayEditWorkoutForm(day, index);
            });
        });
    }

    function displayEditWorkoutForm(day, exerciseIndex) {
        const exerciseToEdit = workouts[day][exerciseIndex];
        let html = `
            <h2>Workout bearbeiten (${day}, Übung ${exerciseIndex + 1})</h2>
            <form id="edit-workout-form" class="add-workout-form">
                <label for="exercise-name-edit">Übungsname:</label>
                <input type="text" id="exercise-name-edit" name="exercise-name" value="${exerciseToEdit.name}" required>
                <label for="muscle-group-edit">Muskelgruppe:</label>
                <input type="text" id="muscle-group-edit" name="muscle-group" value="${exerciseToEdit.muscleGroup || ''}">
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
                        <tbody id="edit-sets-table-body">
                            ${exerciseToEdit.sets ? exerciseToEdit.sets.map((set, setIndex) => `
                                <tr>
                                    <td><input type="text" name="set-nr-edit[]" value="${set.setNr || (setIndex + 1)}"></td>
                                    <td><input type="number" name="weight-edit[]" value="${set.weight || ''}"></td>
                                    <td><input type="number" name="reps-edit[]" value="${set.reps || ''}"></td>
                                    <td><button type="button" class="remove-set-btn-edit">Entfernen</button></td>
                                </tr>
                            `).join('') : ''}
                        </tbody>
                    </table>
                    <button type="button" id="add-set-btn-edit">Satz hinzufügen</button>
                </div>
                <button type="submit">Änderungen speichern</button>
                <button type="button" id="cancel-edit-btn">Abbrechen</button>
            </form>
        `;
        contentDiv.innerHTML = html;

        const editWorkoutForm = document.getElementById('edit-workout-form');
        const editSetsTableBody = document.getElementById('edit-sets-table-body');
        const addSetButtonEdit = document.getElementById('add-set-btn-edit');
        const cancelEditButton = document.getElementById('cancel-edit-btn');

        addSetButtonEdit.addEventListener('click', () => {
            const newRow = editSetsTableBody.insertRow();
            const setCounter = editSetsTableBody.rows.length; // Korrigierte Zeilennummer
            newRow.innerHTML = `
                <td><input type="text" name="set-nr-edit[]" value="${setCounter}"></td>
                <td><input type="number" name="weight-edit[]" value=""></td>
                <td><input type="number" name="reps-edit[]" value=""></td>
                <td><button type="button" class="remove-set-btn-edit">Entfernen</button></td>
            `;
            attachRemoveSetListenersEdit();
        });

        function attachRemoveSetListenersEdit() {
            const removeButtons = document.querySelectorAll('.remove-set-btn-edit');
            removeButtons.forEach(button => {
                button.addEventListener('click', (event) => {
                    event.target.parentNode.parentNode.remove();
                });
            });
        }
        attachRemoveSetListenersEdit();

        cancelEditButton.addEventListener('click', () => {
            if (document.querySelector('#today-btn.active')) {
                displayTodayWorkout();
            } else {
                displayWeekPlan();
            }
            currentEditDay = null;
            currentEditIndex = null;
        });

        editWorkoutForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const newExerciseName = document.getElementById('exercise-name-edit').value;
            const newMuscleGroup = document.getElementById('muscle-group-edit').value;
            const setNrInputs = document.querySelectorAll('input[name="set-nr-edit[]"]');
            const weightInputs = document.querySelectorAll('input[name="weight-edit[]"]');
            const repsInputs = document.querySelectorAll('input[name="reps-edit[]"]');
            const updatedSets = [];

            setNrInputs.forEach((input, index) => {
                updatedSets.push({
                    setNr: input.value,
                    weight: weightInputs[index].value ? parseFloat(weightInputs[index].value) : null,
                    reps: repsInputs[index].value ? parseInt(repsInputs[index].value) : null
                });
            });

            if (currentEditDay && currentEditIndex !== null) {
                workouts[currentEditDay][currentEditIndex] = {
                    name: newExerciseName,
                    muscleGroup: newMuscleGroup,
                    sets: updatedSets
                };
                saveWorkouts();
                if (document.querySelector('#today-btn.active')) {
                    displayTodayWorkout();
                } else {
                    displayWeekPlan();
                }
                currentEditDay = null;
                currentEditIndex = null;
            }
        });
    }

    function displayAddWorkoutForm() {
        let html = `
            <h2>Neues Workout hinzufügen</h2>
            <form id="add-workout-form" class="add-workout-form">
                <label for="day">Wochentag:</label>
                <select id="day" name="day">
                    <option value="Montag">Montag</option>
                    <option value="Dienstag">Dienstag</option>
                    <option value="Mittwoch">Mittwoch</option>
                    <option value="Donnerstag">Donnerstag</option>
                    <option value="Freitag">Freitag</option>
                    <option value="Samstag">Samstag</option>
                    <option value="Sonntag">Sonntag</option>
                </select>
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

        addExerciseButton.addEventListener('click', () => {
            exerciseCounter++;
            const exerciseDiv = createExerciseInput(exerciseCounter);
            exercisesContainer.appendChild(exerciseDiv);
        });

        function createExerciseInput(exerciseIndex) {
            const exerciseDiv = document.createElement('div');
            exerciseDiv.classList.add('exercise-input');
            exerciseDiv.innerHTML = `
                <h3>Übung ${exerciseIndex}</h3>
                <label for="exercise-name-${exerciseIndex}">Übungsname:</label>
                <input type="text" id="exercise-name-${exerciseIndex}" name="exercise-name[]" required>
                <label for="muscle-group-${exerciseIndex}">Muskelgruppe:</label>
                <input type="text" id="muscle-group-${exerciseIndex}" name="muscle-group[]">
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
                        <tbody id="sets-table-body-${exerciseIndex}">
                            </tbody>
                    </table>
                    <button type="button" class="add-set-btn" data-exercise-index="${exerciseIndex}">Satz hinzufügen</button>
                </div>
            `;

            const addSetButton = exerciseDiv.querySelector('.add-set-btn');
            const setsTableBody = exerciseDiv.querySelector(`#sets-table-body-${exerciseIndex}`);

            addSetButton.addEventListener('click', () => {
                const newRow = setsTableBody.insertRow();
                const setCounter = setsTableBody.rows.length; // Korrigierte Zeilennummer
                newRow.innerHTML = `
                    <td><input type="text" name="set-nr-${exerciseIndex}[]" value="${setCounter}"></td>
                    <td><input type="number" name="weight-${exerciseIndex}[]" value=""></td>
                    <td><input type="number" name="reps-${exerciseIndex}[]" value=""></td>
                    <td><button type="button" class="remove-set-btn">Entfernen</button></td>
                `;
                const removeButton = newRow.querySelector('.remove-set-btn');
                removeButton.addEventListener('click', (event) => {
                    event.target.parentNode.parentNode.remove();
                });
            });

            return exerciseDiv;
        }

        addExerciseButton.click();

        addWorkoutForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const day = document.getElementById('day').value;
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

            workouts[day] = workouts[day].concat(allExercisesData);
            saveWorkouts();
            displayWeekPlan();
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
            for (const day in workouts) {
                workouts[day].forEach(exercise => {
                    if (exercise.muscleGroup.toLowerCase().includes(searchTerm)) {
                        results.push(exercise);
                    }
                });
            }

            let resultsHtml = '<ul>';
            if (results.length > 0) {
                results.forEach(exercise => {
                    resultsHtml += `<li><strong>${exercise.name}</strong> <span>(${exercise.muscleGroup})</span></li>`;
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
    weekPlanBtn.addEventListener('click', displayWeekPlan);
    addBtn.addEventListener('click', displayAddWorkoutForm);
    searchBtn.addEventListener('click', displaySearchForm);

    // Initial beim Laden der Seite das heutige Workout anzeigen und Button aktivieren
    displayTodayWorkout();
});