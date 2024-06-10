document.addEventListener("DOMContentLoaded", function() {
    const addEjercicioButton = document.getElementById('addEjercicio');
    const removeEjercicioButton = document.getElementById('removeEjercicio');
    const ejercicioFieldsContainer = document.getElementById('ejercicio');
    
    let ejercicioCount = 0;

    // Función para agregar un nuevo campo de ejercicio
    function addEjercicioField() {
        ejercicioCount++;
        document.getElementById('ejercicioCount').value = ejercicioCount;
        const ejercicio = document.createElement('div');
        ejercicio.classList.add('ejercicio');
        ejercicio.innerHTML = `
            <div class="form-group">
                <div class="row">
                    <div class="col">
                        <label for="ejercicioId${ejercicioCount}">Ejercicio ${ejercicioCount}:</label><br>
                        <select type="text" id="ejercicioId${ejercicioCount}" name="ejercicioId${ejercicioCount}"><br>
                            <option value="">Seleccione un ejercicio</option>
                            {{#each ejercicios}}
                            <option value="{{idEjercicio}}">{{nombreEjercicio}}</option>
                            {{else}}
                            <option value="">No hay ejercicios</option>
                            {{/each}}
                        </select>
                    </div>
                    <div class="col">
                        <label for="ejercicioReps${ejercicioCount}">Cantidad de repeticiones:</label><br>
                        <input type="number" id="ejercicioReps${ejercicioCount}" name="ejercicioReps${ejercicioCount}" min="1"><br>
                    </div>
                </div>
            </div>`;
        ejercicioFieldsContainer.appendChild(ejercicio);
    }

    // Función para quitar el último campo de ejercicio
    function removeEjercicioFields() {
        if (ejercicioCount > 0) {
            ejercicioFieldsContainer.removeChild(ejercicioFieldsContainer.lastChild);
            ejercicioCount--;
        }
    }

    // Evento click para el botón de agregar ejercicio
    addEjercicioButton.addEventListener('click', addEjercicioField);

    // Evento click para el botón de quitar ejercicio
    removeEjercicioButton.addEventListener('click', removeEjercicioFields);
});