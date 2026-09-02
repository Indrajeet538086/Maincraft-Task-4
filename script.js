document.addEventListener("DOMContentLoaded", function () {
  
  //  MOBILE NAVIGATION TOGGLE
 
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      navMenu.classList.toggle("active");
      const icon = navToggle.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-bars");
        icon.classList.toggle("fa-times");
      }
    });
  }

  
  //  CONTACT FORM & SUBMISSIONS 
  
  const contactForm = document.getElementById("contactForm");
  const submissionsList = document.getElementById("submissionsList");
  const clearDataBtn = document.getElementById("clearDataBtn");

  if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const message = document.getElementById("message").value.trim();

      if (name === "" || email === "" || message === "") {
        alert(
          "Please fill out all required fields (Name, Email, and Message) before submitting.",
        );
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return;
      }

      const newSubmission = {
        id: Date.now(),
        name: name,
        email: email,
        message: message,
        date:
          new Date().toLocaleDateString() +
          " at " +
          new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
      };

      let existingSubmissions =
        JSON.parse(localStorage.getItem("contactSubmissions")) || [];
      existingSubmissions.push(newSubmission);
      localStorage.setItem(
        "contactSubmissions",
        JSON.stringify(existingSubmissions),
      );

      alert("Success! Your message has been saved locally.");
      contactForm.reset();
      window.location.href = "submissions.html";
    });
  }

  if (submissionsList) {
    displaySubmissions();
  }

  function displaySubmissions() {
    const submissions =
      JSON.parse(localStorage.getItem("contactSubmissions")) || [];

    if (submissions.length === 0) {
      submissionsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No contact submissions found in LocalStorage yet.</p>
                    <a href="contact.html" class="cta-link">Submit a Message</a>
                </div>
            `;
      return;
    }

    submissionsList.innerHTML = submissions
      .map(
        (item) => `
            <div class="submission-card">
                <div class="submission-meta">
                    <span class="sender-name"><i class="fas fa-user"></i> ${escapeHTML(item.name)}</span>
                    <span class="submission-date"><i class="far fa-clock"></i> ${item.date}</span>
                </div>
                <p class="sender-email"><i class="fas fa-envelope"></i> ${escapeHTML(item.email)}</p>
                <div class="message-box">
                    <p>${escapeHTML(item.message)}</p>
                </div>
            </div>
        `,
      )
      .join("");
  }

  if (clearDataBtn) {
    clearDataBtn.addEventListener("click", function () {
      if (confirm("Are you sure you want to clear all stored submissions?")) {
        localStorage.removeItem("contactSubmissions");
        displaySubmissions();
      }
    });
  }

  
  //  TASK CRUD DASHBOARD 
  
  const addTaskForm = document.getElementById("addTaskForm");
  const taskInput = document.getElementById("taskInput");
  const taskList = document.getElementById("taskList");
  const taskSearch = document.getElementById("taskSearch");
  const taskFilter = document.getElementById("taskFilter");

  const totalStat = document.getElementById("totalStat");
  const pendingStat = document.getElementById("pendingStat");
  const completedStat = document.getElementById("completedStat");

  if (taskList) {
    let tasks = JSON.parse(localStorage.getItem("miancraftsTasks")) || [];

    function saveTasks() {
      localStorage.setItem("miancraftsTasks", JSON.stringify(tasks));
      renderDashboard();
    }

    if (addTaskForm) {
      addTaskForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const text = taskInput.value.trim();

        if (text === "") {
          alert("Task description cannot be empty!");
          return;
        }

        const newTask = {
          id: Date.now(),
          text: text,
          completed: false,
          createdAt: new Date().toLocaleDateString(),
        };

        tasks.unshift(newTask);
        taskInput.value = "";
        saveTasks();
      });
    }

    taskList.addEventListener("click", function (e) {
      const target = e.target;
      const btn = target.closest("button");
      if (!btn) return;

      const taskId = Number(btn.getAttribute("data-id"));

      // Toggle Completion
      if (btn.classList.contains("toggle-btn")) {
        tasks = tasks.map((t) =>
          t.id === taskId ? { ...t, completed: !t.completed } : t,
        );
        saveTasks();
      }

      // Edit Task Text
      if (btn.classList.contains("edit-btn")) {
        const taskToEdit = tasks.find((t) => t.id === taskId);
        if (taskToEdit) {
          const newText = prompt("Update your task text:", taskToEdit.text);
          if (newText !== null && newText.trim() !== "") {
            tasks = tasks.map((t) =>
              t.id === taskId ? { ...t, text: newText.trim() } : t,
            );
            saveTasks();
          }
        }
      }

      // Delete Task
      if (btn.classList.contains("delete-btn")) {
        if (confirm("Are you sure you want to delete this task?")) {
          tasks = tasks.filter((t) => t.id !== taskId);
          saveTasks();
        }
      }
    });

    if (taskSearch) {
      taskSearch.addEventListener("input", renderDashboard);
    }
    if (taskFilter) {
      taskFilter.addEventListener("change", renderDashboard);
    }

    function renderDashboard() {
      const searchQuery = taskSearch
        ? taskSearch.value.toLowerCase().trim()
        : "";
      const filterValue = taskFilter ? taskFilter.value : "all";

      const totalCount = tasks.length;
      const completedCount = tasks.filter((t) => t.completed).length;
      const pendingCount = totalCount - completedCount;

      if (totalStat) totalStat.textContent = totalCount;
      if (pendingStat) pendingStat.textContent = pendingCount;
      if (completedStat) completedStat.textContent = completedCount;

      let filteredTasks = tasks.filter((task) => {
        const matchesSearch = task.text.toLowerCase().includes(searchQuery);
        let matchesFilter = true;

        if (filterValue === "pending") matchesFilter = !task.completed;
        if (filterValue === "completed") matchesFilter = task.completed;

        return matchesSearch && matchesFilter;
      });

      if (filteredTasks.length === 0) {
        taskList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-clipboard-list"></i>
                        <p>${tasks.length === 0 ? "No tasks added yet. Add your first task above!" : "No tasks match your filter criteria."}</p>
                    </div>
                `;
        return;
      }

      taskList.innerHTML = filteredTasks
        .map(
          (task) => `
                <li class="task-item ${task.completed ? "completed-item" : ""}">
                    <div class="task-content">
                        <button class="action-btn toggle-btn ${task.completed ? "checked" : ""}" data-id="${task.id}" title="${task.completed ? "Mark Pending" : "Mark Complete"}">
                            <i class="${task.completed ? "fas fa-check-circle" : "far fa-circle"}"></i>
                        </button>
                        <span class="task-text ${task.completed ? "completed" : ""}">${escapeHTML(task.text)}</span>
                    </div>
                    <div class="task-actions">
                        <button class="action-btn edit-btn" data-id="${task.id}" title="Edit Task">
                            <i class="fas fa-pen"></i>
                        </button>
                        <button class="action-btn delete-btn" data-id="${task.id}" title="Delete Task">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </li>
            `,
        )
        .join("");
    }

    renderDashboard();
  }

  // Helper Function
  function escapeHTML(str) {
    return str.replace(
      /[&<>'"]/g,
      (tag) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        })[tag] || tag,
    );
  }
});
