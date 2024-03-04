// script.js
document.addEventListener('DOMContentLoaded', function () {
    // Toggle module expansion
    const modules = document.querySelectorAll('.module');

    modules.forEach(function (module) {
        module.addEventListener('click', function () {
            modules.forEach(function (otherModule) {
                if (otherModule !== module) {
                    otherModule.classList.remove('expanded');
                }
            });
            module.classList.toggle('expanded');
        });
    });

    // Toggle to-do list content visibility
    const todoModule = document.getElementById('todo');
    const todoContent = todoModule.querySelector('.todo-content');

    todoModule.addEventListener('click', function (event) {
        if (event.target === todoModule) {
            todoContent.classList.toggle('show');
        }
    });

    // Typewriter effect for the input field
    const newTaskInput = document.getElementById('new-task');
    const taskList = document.getElementById('task-list');

    let i = 0;
    const txt = 'Add a new task...';
    const speed = 50;

    function typeWriter() {
        if (i < txt.length) {
            newTaskInput.placeholder += txt.charAt(i);
            i++;
            setTimeout(typeWriter, speed);
        }
    }

    typeWriter();

    // Retrieve tasks from local storage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Add a new task
    function addTask(taskText = '') {
        const taskItem = document.createElement('li');
        taskItem.appendChild(document.createTextNode(taskText));

        const trashIconContainer = document.createElement('span');
        trashIconContainer.classList.add('trash-icon-container');

        const trashIcon = document.createElement('img');
        trashIcon.src = 'trash.png'; // Replace with the actual path to your trash icon image
        trashIcon.classList.add('trash-icon');

        trashIconContainer.appendChild(trashIcon);
        taskItem.appendChild(trashIconContainer);

        // Add a click event listener to each task item to toggle completed class
        taskItem.addEventListener('click', function (event) {
            if (!event.target.classList.contains('trash-icon')) {
                // Stop the event from bubbling up to the module element
                event.stopPropagation();
                taskItem.classList.toggle('completed');
                updateProgressBar();
            }
        });

        // Add a click event listener to each trash icon to delete the task
        trashIcon.addEventListener('click', function (event) {
            event.stopPropagation(); // Stop the event from bubbling up to the task item
            taskList.removeChild(taskItem);
            tasks = tasks.filter(function (task) {
                return task !== taskText;
            });
            localStorage.setItem('tasks', JSON.stringify(tasks));
            updateProgressBar();
        });

        taskList.appendChild(taskItem);

        if (taskText !== '') {
            tasks.push(taskText);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            newTaskInput.value = '';
        }
    }

    // Event listener to add a new task when Enter key is pressed
    newTaskInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            addTask(newTaskInput.value.trim());
            updateProgressBar();
        }
    });

    // Progress Bar
    const progressFill = document.querySelector('.progress-fill');
    const progressValue = document.querySelector('.progress-value');

    // Update progress bar
    function updateProgressBar() {
        const completedTasks = document.querySelectorAll('#task-list li.completed');
        const totalTasks = document.querySelectorAll('#task-list li');
        const progress = Math.round((completedTasks.length / totalTasks.length) * 100);
        progressFill.style.width = `${progress}%`;
        progressValue.textContent = `${progress}%`;
    }

    // Call updateProgressBar initially
    updateProgressBar();

    // Timer
    const startTimerBtn = document.getElementById('start-timer');
    const resetTimerBtn = document.getElementById('reset-timer');
    const timerValue = document.querySelector('.timer-value');

    let timerInterval;
    let totalSeconds = 0;

    function startTimer() {
        timerInterval = setInterval(function () {
            totalSeconds++;
            updateTimerDisplay();
        }, 1000);

        startTimerBtn.disabled = true;
        resetTimerBtn.disabled = false;
    }

    function resetTimer() {
        clearInterval(timerInterval);
        totalSeconds = 0;
        updateTimerDisplay();

        startTimerBtn.disabled = false;
        resetTimerBtn.disabled = true;
    }

    function updateTimerDisplay() {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        timerValue.textContent = formattedTime;
    }

    startTimerBtn.addEventListener('click', startTimer);
    resetTimerBtn.addEventListener('click', resetTimer);

    // Keyboard Shortcuts
    document.addEventListener('keydown', function (e) {
        if (e.key === 'n' && e.metaKey) {
            newTaskInput.focus();
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            const taskItems = taskList.querySelectorAll('li');
            const currentFocus = document.activeElement;
            let index;

            if (currentFocus === taskList) {
                index = e.key === 'ArrowDown' ? 0 : taskItems.length - 1;
            } else {
                index = Array.from(taskItems).indexOf(currentFocus);
                index = e.key === 'ArrowDown' ? index + 1 : index - 1;
            }

            if (index >= 0 && index < taskItems.length) {
                taskItems[index].focus();
            } else {
                taskList.focus();
            }
        }
    });
});