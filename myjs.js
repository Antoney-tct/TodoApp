
  
    (function() {
      //My Statings
      let tasks = [];
      let currentCategory = 'all';
      let searchTerm = '';
      let focusMode = false;
      let focusTimer = null;
      let focusSeconds = 0;
      let editingId = null;
      
      // DOM elements
      const taskInput = document.getElementById('taskInput');
      const taskCategory = document.getElementById('taskCategory');
      const taskPriority = document.getElementById('taskPriority');
      const taskDueDate = document.getElementById('taskDueDate');
      const taskDuration = document.getElementById('taskDuration');
      const addBtn = document.getElementById('addTaskBtn');
      const taskList = document.getElementById('taskList');
      const searchInput = document.getElementById('searchInput');
      const clearCompletedBtn = document.getElementById('clearCompletedBtn');
      const themeToggle = document.getElementById('themeToggle');
      const voiceBtn = document.getElementById('voiceBtn');
      const focusModeBtn = document.getElementById('focusModeBtn');
      const focusStatus = document.getElementById('focusStatus');
      const focusTime = document.getElementById('focusTime');
      const alarmSound = document.getElementById('alarmSound');
      const profileAvatar = document.getElementById('profileAvatar');
      const profileName = document.getElementById('profileName');
      const profileBio = document.getElementById('profileBio');
      const profileStats = document.getElementById('profileStats');
      
      // My Category elements
      const categoryItems = document.querySelectorAll('.category-item');
      const totalCount = document.getElementById('totalCount');
      const workCount = document.getElementById('workCount');
      const personalCount = document.getElementById('personalCount');
      const shoppingCount = document.getElementById('shoppingCount');
      const healthCount = document.getElementById('healthCount');
      const pendingTasks = document.getElementById('pendingTasks');
      const completedTasks = document.getElementById('completedTasks');
      const todayProgress = document.getElementById('todayProgress');

      const ICONS = {
        calendar: `<svg class="icon" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
        alertTriangle: `<svg class="icon" viewBox="0 0 24 24"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
        play: `<svg class="icon" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`,
        pause: `<svg class="icon" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`,
        edit: `<svg class="icon" viewBox="0 0 24 24"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>`,
        trash: `<svg class="icon" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`,
      };

      // this part  Sets current date as default date
      document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

      // Load tasks
      function loadTasks() {
        const stored = localStorage.getItem('auraTasks');
        if (stored) {
          tasks = JSON.parse(stored);
          tasks = tasks.map(t => ({
            ...t,
            timeLeft: t.timeLeft !== undefined ? t.timeLeft : 0,
            originalDuration: t.originalDuration || 0,
            isTimerRunning: false
          }));
        } else {
          tasks = [
            { id: '1', text: 'Design team meeting', completed: false, priority: 'high', category: 'work', dueDate: getTodayDate(), createdAt: Date.now(), timeLeft: 0, originalDuration: 0, isTimerRunning: false },
            { id: '2', text: 'Buy groceries', completed: false, priority: 'medium', category: 'shopping', dueDate: '', createdAt: Date.now(), timeLeft: 0, originalDuration: 0, isTimerRunning: false },
            { id: '3', text: 'Morning yoga', completed: true, priority: 'low', category: 'health', dueDate: '', createdAt: Date.now(), timeLeft: 0, originalDuration: 0, isTimerRunning: false },
            { id: '4', text: 'Read 30 minutes', completed: false, priority: 'medium', category: 'personal', dueDate: getTomorrowDate(), createdAt: Date.now(), timeLeft: 1800, originalDuration: 30, isTimerRunning: false }
          ];
        }
        renderTasks();
        updateSidebarStats();
        loadProfile();
      }

      function loadProfile() {
        const name = localStorage.getItem('auraProfileName');
        const image = localStorage.getItem('auraProfileImage');
        const bio = localStorage.getItem('auraProfileBio');
        
        if (name) {
          profileName.textContent = name;
        }
        
        if (image) {
          profileAvatar.style.backgroundImage = `url(${image})`;
          profileAvatar.textContent = '';
        }
        if (bio && profileBio) profileBio.textContent = bio;
      }

      function getTodayDate() {
        return new Date().toISOString().split('T')[0];
      }

      function getTomorrowDate() {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        return date.toISOString().split('T')[0];
      }

      function saveTasks() {
        localStorage.setItem('auraTasks', JSON.stringify(tasks));
        updateSidebarStats();
      }

      function updateSidebarStats() {
        totalCount.textContent = tasks.length;
        workCount.textContent = tasks.filter(t => t.category === 'work').length;
        personalCount.textContent = tasks.filter(t => t.category === 'personal').length;
        shoppingCount.textContent = tasks.filter(t => t.category === 'shopping').length;
        healthCount.textContent = tasks.filter(t => t.category === 'health').length;

        const pending = tasks.filter(t => !t.completed).length;
        const completed = tasks.filter(t => t.completed).length;
        pendingTasks.textContent = `${pending} pending`;
        completedTasks.textContent = `${completed} completed`;
        profileStats.textContent = `✨ ${completed} tasks completed`;

        const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
        todayProgress.textContent = `${progress}%`;
      }

      function renderTasks() {
        let filtered = [...tasks];

        if (currentCategory !== 'all') {
          filtered = filtered.filter(t => t.category === currentCategory);
        }

        if (searchTerm) {
          filtered = filtered.filter(t => 
            t.text.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        if (filtered.length === 0) {
          taskList.innerHTML = `
            <li class="task-item" style="justify-content: center; color: #8f6bb3;">
              ✨ Nothing here ... yet
            </li>
          `;
          return;
        }

        taskList.innerHTML = filtered.map(task => renderTask(task)).join('');
      }

      function renderTask(task) {
        const now = new Date();
        const todayStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
        const isOverdue = task.dueDate && !task.completed && task.dueDate < todayStr;
        
        return `
          <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <div class="task-content">
              <div class="task-title">${escapeHtml(task.text)}</div>
              <div class="task-meta">
                <span class="task-category">${task.category}</span>
                <span class="task-priority">
                  <span class="priority-dot priority-${task.priority}"></span>
                  ${task.priority}
                </span>
                ${task.dueDate ? `
                  <span class="task-due ${isOverdue ? 'priority-high' : ''}">
                    ${ICONS.calendar} ${new Date(task.dueDate).toLocaleDateString()}
                    ${isOverdue ? ICONS.alertTriangle : ''}
                  </span>
                ` : ''}
                ${task.timeLeft > 0 || task.originalDuration > 0 ? `
                  <div class="task-timer">
                    <span class="timer-display" id="timer-${task.id}">${formatTime(task.timeLeft)}</span>
                    <button class="timer-toggle-btn" data-id="${task.id}" aria-label="${task.isTimerRunning ? 'Pause timer' : 'Start timer'}">${task.isTimerRunning ? ICONS.pause : ICONS.play}</button>
                  </div>
                ` : ''}
              </div>
            </div>
            <div class="task-actions">
              <button class="task-btn edit-btn" aria-label="Edit task">${ICONS.edit}</button>
              <button class="task-btn delete-btn" aria-label="Delete task">${ICONS.trash}</button>
            </div>
          </li>
        `;
      }

      function formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
      }

      function escapeHtml(unsafe) {
        return unsafe.replace(/[&<>"']/g, function(m) {
          if(m === '&') return '&amp;';
          if(m === '<') return '&lt;';
          if(m === '>') return '&gt;';
          if(m === '"') return '&quot;';
          if(m === "'") return '&#039;';
          return m;
        });
      }

      function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
          toast.remove();
        }, 3000);
      }

      function triggerConfetti() {
        if (typeof confetti === 'function') {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#b592e0', '#ffb3ba', '#ffd966', '#a3d9a5']
          });
        }
      }

      // Add task
      function addTask() {
        const text = taskInput.value.trim();
        const durationMins = parseInt(taskDuration.value) || 0;
        if (!text) {
          showToast('Please enter a task');
          return;
        }

        if (editingId) {
          const task = tasks.find(t => t.id === editingId);
          if (task) {
            task.text = text;
            task.priority = taskPriority.value;
            task.category = taskCategory.value;
            task.dueDate = taskDueDate.value;
            if (durationMins > 0) {
              task.originalDuration = durationMins;
              task.timeLeft = durationMins * 60;
            }
            showToast('Task updated');
          }
          editingId = null;
          addBtn.textContent = 'Add';
        } else {
          const newTask = {
            id: Date.now() + '-' + Math.random(),
            text: text,
            completed: false,
            priority: taskPriority.value,
            category: taskCategory.value,
            dueDate: taskDueDate.value,
            createdAt: Date.now(),
            originalDuration: durationMins,
            timeLeft: durationMins * 60,
            isTimerRunning: false
          };
          tasks.push(newTask);
          showToast('Task added!');
          if (tasks.filter(t => !t.completed).length === 1) {
            triggerConfetti();
          }
        }

        saveTasks();
        renderTasks();
        
        taskInput.value = '';
        taskDueDate.value = '';
        taskDuration.value = '';
      }

      // Delete task
      function deleteTask(id) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
        showToast('Task deleted');
      }

      // Toggle complete
      function toggleComplete(id, checked) {
        const task = tasks.find(t => t.id === id);
        if (task) {
          task.completed = checked;
          saveTasks();
          renderTasks();
          
          if (checked) {
            const allComplete = tasks.every(t => t.completed);
            if (allComplete) triggerConfetti();
          }
        }
      }

      // Edit task
      function editTask(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
          taskInput.value = task.text;
          taskCategory.value = task.category;
          taskPriority.value = task.priority;
          taskDueDate.value = task.dueDate || '';
          taskDuration.value = task.originalDuration || '';
          
          editingId = id;
          addBtn.textContent = 'Update';
          taskInput.focus();
        }
      }

      // Focus mode
      function toggleFocusMode() {
        focusMode = !focusMode;
        
        if (focusMode) {
          focusModeBtn.textContent = 'Stop';
          focusModeBtn.classList.add('active');
          focusStatus.textContent = 'active';
          
          localStorage.setItem('auraFocusActive', 'true');
          localStorage.setItem('auraFocusStartTime', Date.now());
          focusSeconds = 0;

          focusTimer = setInterval(() => {
            focusSeconds++;
            const mins = Math.floor(focusSeconds / 60);
            const secs = focusSeconds % 60;
            focusTime.textContent = `${mins}m ${secs}s`;
          }, 1000);
        } else {
          focusModeBtn.textContent = 'Start';
          focusModeBtn.classList.remove('active');
          focusStatus.textContent = 'inactive';
          
          localStorage.removeItem('auraFocusActive');
          localStorage.removeItem('auraFocusStartTime');

          if (focusTimer) {
            clearInterval(focusTimer);
          }
          focusSeconds = 0;
          focusTime.textContent = '0m';
        }
      }

      function initFocusMode() {
        const isActive = localStorage.getItem('auraFocusActive') === 'true';
        const startTime = localStorage.getItem('auraFocusStartTime');

        if (isActive && startTime) {
          focusMode = true;
          focusSeconds = Math.floor((Date.now() - parseInt(startTime)) / 1000);

          focusModeBtn.textContent = 'Stop';
          focusModeBtn.classList.add('active');
          focusStatus.textContent = 'active';

          focusTimer = setInterval(() => {
            focusSeconds++;
            const mins = Math.floor(focusSeconds / 60);
            const secs = focusSeconds % 60;
            focusTime.textContent = `${mins}m ${secs}s`;
          }, 1000);
        }
      }

      // Task Timer Logic
      function toggleTaskTimer(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
          task.isTimerRunning = !task.isTimerRunning;

          if (task.isTimerRunning) {
            alarmSound.load();
          }

          saveTasks();
          renderTasks();
        }
      }

      // Global Timer Loop
      setInterval(() => {
        let stateChanged = false;
        tasks.forEach(task => {
          if (task.isTimerRunning && task.timeLeft > 0) {
            task.timeLeft--;
            
            const display = document.getElementById(`timer-${task.id}`);
            if (display) display.textContent = formatTime(task.timeLeft);

            if (task.timeLeft === 0) {
              task.isTimerRunning = false;
              alarmSound.currentTime = 0;
              alarmSound.play().catch(e => console.log('Audio play failed', e));
              showToast(`⏰ Time's up: ${task.text}`);
              stateChanged = true;
            }
          }
        });
        if (stateChanged) {
          renderTasks();
          saveTasks();
        }
      }, 1000);

      // Voice input
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        voiceBtn.addEventListener('click', () => {
          voiceBtn.classList.add('listening');
          recognition.start();
        });

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          taskInput.value = transcript;
          voiceBtn.classList.remove('listening');
          showToast('Voice captured!');
        };

        recognition.onerror = (event) => {
          voiceBtn.classList.remove('listening');
          let errorMessage = 'Voice input failed. Please try again.';
          if (event.error === 'not-allowed') {
            errorMessage = 'Microphone access denied. Please allow it in your browser settings.';
          } else if (event.error === 'no-speech') {
            errorMessage = 'No speech detected. Please try again.';
          }
          showToast(errorMessage);
        };
      } else {
        voiceBtn.style.opacity = '0.5';
        voiceBtn.title = 'Voice not supported';
      }

      // --- Profile Modal Logic ---
      const profileModal = document.getElementById('profileModal');
      const closeProfileModal = document.getElementById('closeProfileModal');
      const modalAvatarPreview = document.getElementById('modalAvatarPreview');
      const triggerAvatarInput = document.getElementById('triggerAvatarInput');
      const modalAvatarInput = document.getElementById('modalAvatarInput');
      const editName = document.getElementById('editName');
      const editBio = document.getElementById('editBio');
      const saveProfileBtn = document.getElementById('saveProfileBtn');
      
      let tempAvatarUrl = '';

      function openProfileModal() {
        const currentName = localStorage.getItem('auraProfileName') || 'Alex Rivera';
        const currentBio = localStorage.getItem('auraProfileBio') || '';
        const currentImage = localStorage.getItem('auraProfileImage');

        editName.value = currentName;
        editBio.value = currentBio;
        
        if (currentImage) {
            modalAvatarPreview.style.backgroundImage = `url(${currentImage})`;
            modalAvatarPreview.textContent = '';
            tempAvatarUrl = currentImage;
        } else {
            modalAvatarPreview.style.backgroundImage = '';
            modalAvatarPreview.textContent = '👤';
            tempAvatarUrl = '';
        }

        profileModal.classList.add('active');
      }

      function closeProfileModalFunc() {
        profileModal.classList.remove('active');
      }

      function saveProfile() {
        const newName = editName.value.trim();
        const newBio = editBio.value.trim();
        
        if (newName) {
            localStorage.setItem('auraProfileName', newName);
            profileName.textContent = newName;
        }
        
        localStorage.setItem('auraProfileBio', newBio);
        if (profileBio) profileBio.textContent = newBio;
        
        if (tempAvatarUrl) {
            localStorage.setItem('auraProfileImage', tempAvatarUrl);
            profileAvatar.style.backgroundImage = `url(${tempAvatarUrl})`;
            profileAvatar.textContent = '';
        }

        closeProfileModalFunc();
        showToast('Profile updated!');
      }

      // Profile Event Listeners
      profileAvatar.addEventListener('click', openProfileModal);
      profileName.addEventListener('click', openProfileModal);
      
      closeProfileModal.addEventListener('click', closeProfileModalFunc);
      profileModal.addEventListener('click', (e) => {
        if (e.target === profileModal) closeProfileModalFunc();
      });

      triggerAvatarInput.addEventListener('click', () => modalAvatarInput.click());

      modalAvatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function(event) {
            tempAvatarUrl = event.target.result;
            modalAvatarPreview.style.backgroundImage = `url(${tempAvatarUrl})`;
            modalAvatarPreview.textContent = '';
          };
          reader.readAsDataURL(file);
        }
      });

      saveProfileBtn.addEventListener('click', saveProfile);

      // Event listeners
      addBtn.addEventListener('click', addTask);

      taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
      });

      taskList.addEventListener('click', (e) => {
        const li = e.target.closest('li[data-id]');
        if (!li) return;
        
        const id = li.dataset.id;

        const checkbox = e.target.closest('.task-checkbox');
        if (checkbox) {
          toggleComplete(id, checkbox.checked);
          return;
        }
        
        const editBtn = e.target.closest('.edit-btn');
        if (editBtn) {
          editTask(id);
          return;
        }
        
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
          deleteTask(id);
          return;
        }

        const timerToggleBtn = e.target.closest('.timer-toggle-btn');
        if (timerToggleBtn) {
          toggleTaskTimer(id);
          return;
        }
      });

      searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        renderTasks();
      });

      categoryItems.forEach(item => {
        item.addEventListener('click', () => {
          categoryItems.forEach(c => c.classList.remove('active'));
          item.classList.add('active');
          currentCategory = item.dataset.category;
          renderTasks();
        });
      });

      clearCompletedBtn.addEventListener('click', () => {
        tasks = tasks.filter(t => !t.completed);
        saveTasks();
        renderTasks();
        showToast('Completed tasks cleared');
      });

      themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark');
        localStorage.setItem('auraTheme', isDark ? 'dark' : 'light');
        showToast('Theme toggled');
      });

      focusModeBtn.addEventListener('click', toggleFocusMode);

      function initTheme() {
        const savedTheme = localStorage.getItem('auraTheme');
        if (savedTheme === 'dark') {
          document.body.classList.add('dark');
        } else {
          document.body.classList.remove('dark');
        }
      }

      // Initialize
      loadTasks();
      initFocusMode();
      initTheme();

      // Auto-save
      window.addEventListener('beforeunload', saveTasks);
    })();
  