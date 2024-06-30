document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('taskForm');
    const todoTasks = document.getElementById('todoTasks');
    const inProgressTasks = document.getElementById('inProgressTasks');
    const doneTasks = document.getElementById('doneTasks');
  
    taskForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const title = document.getElementById('titleInput').value;
      const description = document.getElementById('descriptionInput').value;
  
      const response = await fetch('/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description }),
      });
  
      const newTask = await response.json();
      displayTask(newTask);
      taskForm.reset();
    });
  
    async function fetchTasks() {
      const response = await fetch('/tasks');
      const tasks = await response.json();
      tasks.forEach(task => displayTask(task));
    }
  
    function displayTask(task) {
      const taskElement = document.createElement('div');
      taskElement.classList.add('task');
      taskElement.dataset.id = task._id;
      taskElement.draggable = true;
      taskElement.innerHTML = `
        <div class="icons">
          <i class="fas fa-edit" onclick="editTask('${task._id}')"></i>
          <i class="fas fa-trash" onclick="deleteTask('${task._id}')"></i>
        </div>
        <h3>${task.title}</h3>
        <p>${task.description}</p>
        <p>Status: ${task.status}</p>
      `;
  
      taskElement.addEventListener('dragstart', (event) => {
        event.dataTransfer.setData('text/plain', task._id);
      });
  
      switch (task.status) {
        case 'todo':
          todoTasks.appendChild(taskElement);
          break;
        case 'in-progress':
          inProgressTasks.appendChild(taskElement);
          break;
        case 'done':
          doneTasks.appendChild(taskElement);
          break;
      }
    }
  
    async function deleteTask(taskId) {
      const response = await fetch(`/tasks/${taskId}`, {
        method: 'DELETE',
      });
  
      if (response.ok) {
        document.querySelector(`[data-id='${taskId}']`).remove();
      }
    }
  
    async function editTask(taskId) {
      const title = prompt("Enter new title:");
      const description = prompt("Enter new description:");
      const status = prompt("Enter new status (todo, in-progress, done):");
  
      const response = await fetch(`/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description, status }),
      });
  
      if (response.ok) {
        const updatedTask = await response.json();
        const taskElement = document.querySelector(`[data-id='${taskId}']`);
        taskElement.querySelector('h3').textContent = updatedTask.title;
        taskElement.querySelector('p').textContent = updatedTask.description;
        taskElement.querySelector('p:last-child').textContent = `Status: ${updatedTask.status}`;
        document.getElementById(`${updatedTask.status.replace(/ /g, '-')}`).appendChild(taskElement);
      }
    }
  
    const columns = document.querySelectorAll('.column');
  
    columns.forEach(column => {
      column.addEventListener('dragover', (event) => {
        event.preventDefault();
      });
  
      column.addEventListener('drop', async (event) => {
        event.preventDefault();
        const taskId = event.dataTransfer.getData('text/plain');
        const newStatus = column.id.replace(/-/g, ' ');
  
        const response = await fetch(`/tasks/${taskId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        });
  
        if (response.ok) {
          const updatedTask = await response.json();
          const taskElement = document.querySelector(`[data-id='${taskId}']`);
          taskElement.querySelector('p:last-child').textContent = `Status: ${updatedTask.status}`;
          column.querySelector('.task-list').appendChild(taskElement);
        }
      });
    });
  
    fetchTasks();
  });
  
  
  