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
            const taskPriority = taskItem.dataset.priority;
            if (priority === 'all') {
                taskItem.style.display = 'flex';
            } else if (taskPriority === priority) {
                taskItem.style.display = 'flex';
            } else {
                taskItem.style.display = 'none';
            }
        });
    }

    const tasksFromStorage = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = [...new Set(tasksFromStorage.map(task => JSON.stringify(task)))].map(task => JSON.parse(task));

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

document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        event.preventDefault();
        toggleTerminal();
    }
});

const terminalOverlay = document.getElementById('terminal-overlay');
const closeTerminalBtn = document.getElementById('close-terminal');
const terminalInput = document.getElementById('terminal-input');
const terminalOutput = document.querySelector('.terminal-output');

function toggleTerminal() {
    terminalOverlay.classList.toggle('show');
    if (terminalOverlay.classList.contains('show')) {
        terminalInput.focus();
    }
}

closeTerminalBtn.addEventListener('click', toggleTerminal);

terminalInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        const command = terminalInput.value.trim();
        terminalInput.value = '';
        processCommand(command);
    } else if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        event.preventDefault();
        toggleTerminal();
    }
});

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
tasks = tasks.map(task => ({ text: task.text, priority: task.priority || 'medium' }));

function printHelp() {
    const helpText = `
Available commands:
- help: Show this help message
- clear: Clear the terminal output
    `;
    const helpLines = helpText.trim().split('\n');
    helpLines.forEach(line => {
        const helpLine = document.createElement('div');
        helpLine.textContent = line;
        helpLine.style.color = '#7cfc00';
        terminalOutput.appendChild(helpLine);
    });
}


const todoContainer = document.getElementById('todo-container');
const stopwatchContainer = document.getElementById('stopwatch-container');
const progressContainer = document.getElementById('progress-container');

function processCommand(command) {
    const taskList = document.getElementById('task-list');
    const [cmd, ...args] = command.split(' ');
    const outputLine = document.createElement('div');
    outputLine.textContent = `user@foco:~$ ${command}`;
    terminalOutput.appendChild(outputLine);

    switch (cmd) {
    case 'new_task':
    let taskText = '';
    let priority = 'medium';

    if (args[0] === '-h') {
        priority = 'high';
        taskText = args.slice(1).join(' ');
    } else if (args[0] === '-l') {
        priority = 'low';
        taskText = args.slice(1).join(' ');
    } else if (args[0] === '-m') {
        priority = 'medium';
        taskText = args.slice(1).join(' ');
    } else {
        taskText = args.join(' ');
    }

    if (taskText.trim() === '') {
        const errorLine = document.createElement('div');
        errorLine.textContent = 'Please provide a task name';
        errorLine.style.color = 'red';
        terminalOutput.appendChild(errorLine);
        break;
    }

    const taskItem = createTaskItem(taskText, priority);
    taskList.appendChild(taskItem);

    const trashIcon = taskItem.querySelector('.trash-icon');
    trashIcon.addEventListener('click', function (event) {
        event.stopPropagation();
        taskList.removeChild(taskItem);
        tasks = tasks.filter(function (task) {
            return task.text !== taskText;
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateProgressBar();
    });

    tasks.push({ text: taskText, priority: priority, fromTerminal: true });
    localStorage.setItem('tasks', JSON.stringify(tasks));
    updateProgressBar();

    break;
            case 'delete_task':
                const taskToDelete = args.join(' ');
                const taskItems = taskList.querySelectorAll('li');
                let taskFound = false;
            
                taskItems.forEach(taskItem => {
                    if (taskItem.textContent.includes(taskToDelete)) {
                        taskList.removeChild(taskItem);
                        tasks = tasks.filter(task => task.text !== taskToDelete);
                        localStorage.setItem('tasks', JSON.stringify(tasks));
                        taskFound = true;
                        updateProgressBar();
                    }
                });
            
                if (!taskFound) {
                    const errorLine = document.createElement('div');
                    errorLine.textContent = `Task '${taskToDelete}' not found`;
                    errorLine.style.color = 'red';
                    terminalOutput.appendChild(errorLine);
                }
                break;

        case 'show':
            showModule(args[0]);
            break;
        case 'hide':
            hideModule(args[0]);
            break;
        case 'help':
            printHelp();
            break;
        case 'clear':
            terminalOutput.innerHTML = '';
            break;
        default:
            const errorLine = document.createElement('div');
            errorLine.textContent = `Command not found: ${command}`;
            errorLine.style.color = 'red';
            terminalOutput.appendChild(errorLine);
            break;
    }

    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function showModule(module) {
    switch (module) {
        case 'todo':
            todoContainer.style.display = 'block';
            adjustModulePositions();
            break;
        case 'stopwatch':
            stopwatchContainer.style.display = 'block';
            adjustModulePositions();
            break;
        case 'progress':
            progressContainer.style.display = 'block';
            adjustModulePositions();
            break;
        default:
            const errorLine = document.createElement('div');
            errorLine.textContent = `Invalid module: ${module}`;
            errorLine.style.color = 'red';
            terminalOutput.appendChild(errorLine);
            break;
    }
}

function hideModule(module) {
    switch (module) {
        case 'todo':
            todoContainer.style.display = 'none';
            adjustModulePositions();
            break;
        case 'stopwatch':
            stopwatchContainer.style.display = 'none';
            adjustModulePositions();
            break;
        case 'progress':
            progressContainer.style.display = 'none';
            adjustModulePositions();
            break;
        default:
            const errorLine = document.createElement('div');
            errorLine.textContent = `Invalid module: ${module}`;
            errorLine.style.color = 'red';
            terminalOutput.appendChild(errorLine);
            break;
    }
}



function printHelp() {
    const helpText = `
Available commands:
- new_task [-h|-m|-l] [task name]: Add a new task (use -h for high priority, -m for medium priority, -l for low priority)
- delete_task [task name]: Delete a task by its name
- show [module]: Show a specific module (todo, stopwatch, progress)
- hide [module]: Hide a specific module (todo, stopwatch, progress)
- help: Show this help message
- clear: Clear the terminal output
    `;
    const helpLines = helpText.trim().split('\n');
    helpLines.forEach(line => {
        const helpLine = document.createElement('div');
        helpLine.textContent = line;
        helpLine.style.color = '#7cfc00';
        terminalOutput.appendChild(helpLine);
    });
}

const moduleAreas = {
    'todo-container': 1,
    'stopwatch-container': 2,
    'progress-container': 3
};

function adjustModulePositions() {
    const visibleModules = document.querySelectorAll('.module-container:not([style*="display: none"])');

    visibleModules.forEach((module) => {
        const moduleArea = moduleAreas[module.id];
        module.style.position = 'static';
        module.style.marginLeft = 'auto';
        module.style.marginRight = 'auto';

        switch (moduleArea) {
            case 1:
                module.style.margin = '20px auto';
                break;
            case 2:
                if (!document.querySelector('#todo-container:not([style*="display: none"])')) {
                    module.style.margin = '20px auto';
                } else {
                    module.style.marginTop = '20px';
                    module.style.marginBottom = '20px';
                }
                break;
            case 3:
                if (!document.querySelector('#stopwatch-container:not([style*="display: none"])')) {
                    module.style.margin = '20px auto';
                } else {
                    module.style.marginTop = '20px';
                    module.style.marginBottom = '20px';
                }
                break;
        }
    });
}

function showModule(module) {
    switch (module) {
        case 'todo':
            todoContainer.style.display = 'block';
            adjustModulePositions();
            break;
        case 'stopwatch':
            stopwatchContainer.style.display = 'block';
            adjustModulePositions();
            break;
        case 'progress':
            progressContainer.style.display = 'block';
            adjustModulePositions();
            break;
        default:
            const errorLine = document.createElement('div');
            errorLine.textContent = `Invalid module: ${module}`;
            errorLine.style.color = 'red';
            terminalOutput.appendChild(errorLine);
            break;
    }
}

function hideModule(module) {
    switch (module) {
        case 'todo':
            todoContainer.style.display = 'none';
            adjustModulePositions();
            break;
        case 'stopwatch':
            stopwatchContainer.style.display = 'none';
            adjustModulePositions();
            break;
        case 'progress':
            progressContainer.style.display = 'none';
            adjustModulePositions();
            break;
        default:
            const errorLine = document.createElement('div');
            errorLine.textContent = `Invalid module: ${module}`;
            errorLine.style.color = 'red';
            terminalOutput.appendChild(errorLine);
            break;
    }
}

function createTaskItem(taskText, priority) {
    const taskItem = document.createElement('li');
    taskItem.textContent = taskText;
    taskItem.dataset.priority = priority;

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

    return taskItem;
}