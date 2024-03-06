document.addEventListener('DOMContentLoaded', function () {
    const modules = document.querySelectorAll('.module');

    modules.forEach(function (module) {
        module.addEventListener('click', function (event) {
            if (!event.target.closest('.priority-buttons, #priority-select, .timer-controls, #task-list')) {
                modules.forEach(function (otherModule) {
                    if (otherModule !== module) {
                        otherModule.classList.remove('expanded');
                    }
                });
                module.classList.toggle('expanded');
            }
        });
    });

    const todoModule = document.getElementById('todo');
    const todoContent = todoModule.querySelector('.todo-content');

    todoModule.addEventListener('click', function (event) {
        if (event.target === todoModule) {
            todoContent.classList.toggle('show');
        }
    });

    const taskList = document.getElementById('task-list');
    const newTaskInput = document.getElementById('new-task');
    const prioritySelect = document.getElementById('priority-select');
    const priorityButtons = document.querySelectorAll('.priority-btn');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    function addTask(taskText, priority) {
        const taskItem = document.createElement('li');
        taskItem.textContent = taskText;
        taskItem.dataset.priority = priority;

        if (priority === 'high') {
            taskItem.style.color = '#081c15';
        } else if (priority === 'medium') {
            taskItem.style.color = '#1b4332';
        } else {
            taskItem.style.color = '#2d6a4f';
        }

        taskItem.addEventListener('click', function () {
            this.classList.toggle('completed');
            updateProgressBar();
        });

        const trashIconContainer = document.createElement('span');
        trashIconContainer.classList.add('trash-icon-container');

        const trashIcon = document.createElement('img');
        trashIcon.src = 'trash.png';
        trashIcon.classList.add('trash-icon');

        trashIconContainer.appendChild(trashIcon);
        taskItem.appendChild(trashIconContainer);

        trashIcon.addEventListener('click', function (event) {
            event.stopPropagation();
            taskList.removeChild(taskItem);
            tasks = tasks.filter(function (task) {
                return task.text !== taskText;
            });
            localStorage.setItem('tasks', JSON.stringify(tasks));
            updateProgressBar();
        });

        taskList.appendChild(taskItem);

        if (taskText !== '') {
            tasks.push({ text: taskText, priority: priority });
            localStorage.setItem('tasks', JSON.stringify(tasks));
            newTaskInput.value = '';
        }
    }

    newTaskInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            const taskText = newTaskInput.value.trim();
            const priority = prioritySelect.value;
            addTask(taskText, priority);
            updateProgressBar();
        }
    });

    priorityButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            const priority = this.dataset.priority;
            filterTasksByPriority(priority);
            priorityButtons.forEach(function (btn) {
                btn.classList.remove('active');
            });
            this.classList.add('active');
        });
    });

    function filterTasksByPriority(priority) {
        const taskItems = taskList.querySelectorAll('li');
        taskItems.forEach(function (taskItem) {
            if (priority === 'all' || taskItem.dataset.priority === priority) {
                taskItem.style.display = 'flex';
            } else {
                taskItem.style.display = 'none';
            }
        });
    }

    tasks.forEach(function (task) {
        addTask(task.text, task.priority);
    });

    const progressFill = document.querySelector('.progress-fill');
    const progressValue = document.querySelector('.progress-value');

    function updateProgressBar() {
        const completedTasks = document.querySelectorAll('#task-list li.completed');
        const totalTasks = document.querySelectorAll('#task-list li');
        const progress = Math.round((completedTasks.length / totalTasks.length) * 100);
        progressFill.style.width = `${progress}%`;
        progressValue.textContent = `${progress}%`;
    }

    updateProgressBar();

    const startTimerBtn = document.getElementById('start-timer');
    const resetTimerBtn = document.getElementById('reset-timer');
    const timerValue = document.querySelector('.timer-value');

    let timerInterval;
    let totalSeconds = 0;
    let isTimerRunning = false;

    function startTimer() {
        if (!isTimerRunning) {
            timerInterval = setInterval(function () {
                totalSeconds++;
                updateTimerDisplay();
            }, 1000);

            startTimerBtn.textContent = 'Pause';
            resetTimerBtn.disabled = false;
            isTimerRunning = true;
        } else {
            pauseTimer();
        }
    }

    function pauseTimer() {
        clearInterval(timerInterval);
        startTimerBtn.textContent = 'Start';
        isTimerRunning = false;
    }

    function resetTimer() {
        clearInterval(timerInterval);
        totalSeconds = 0;
        updateTimerDisplay();

        startTimerBtn.textContent = 'Start';
        resetTimerBtn.disabled = true;
        isTimerRunning = false;
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