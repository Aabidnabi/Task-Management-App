// ===== Elements & State =====
const taskContainer = document.getElementById("taskContainer");
let globalTaskData = [];
let editingId = null;

// ===== Limit description to 100 words =====
const limitTo100Words = text => {
  if (!text) return "";
  const words = text.trim().split(/\s+/);
  return words.length <= 100 ? text : words.slice(0, 100).join(" ") + "...";
};

// ===== Generate Task Card HTML =====
const generateHTML = task => {
  const imgSrc = task.image?.trim() || "https://via.placeholder.com/400x200?text=No+Image";
  const statusClass = task.status.toLowerCase().replace(/\s+/g, "-");
  const description = limitTo100Words(task.description);

  return `
    <div class="col-12 col-md-6 col-lg-4" id="${task.id}">
      <div class="task__card h-100">
        <img src="${imgSrc}" onerror="this.src='https://via.placeholder.com/400x200?text=No+Image'" />
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${task.title}</h5>
          <p class="card-text">${description || "No description"}</p>
          <p><strong>Deadline:</strong> ${task.deadline || "No deadline"}</p>
          <p><strong>Category:</strong> ${task.category}</p>
          <div class="mt-auto d-flex justify-content-between align-items-center">
            <span class="status-label ${statusClass}">${task.status}</span>
            <select class="status-dropdown" onchange="changeTaskStatus('${task.id}', this.value)">
              <option ${task.status === "Pending" ? "selected" : ""}>Pending</option>
              <option ${task.status === "In Progress" ? "selected" : ""}>In Progress</option>
              <option ${task.status === "Completed" ? "selected" : ""}>Completed</option>
            </select>
          </div>
        </div>
        <div class="card-footer">
          <button class="btn btn-sm btn-outline-info me-1" onclick="editCard('${task.id}')">
            <i class="fal fa-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteCard('${task.id}')">
            <i class="far fa-trash-alt"></i>
          </button>
        </div>
      </div>
    </div>`;
};

// ===== Save Task =====
const saveTaskFromModal = () => {
  const title = document.getElementById("taskTitle").value.trim();
  if (!title) return alert("Task name is required!");

  const task = {
    id: editingId || `${Date.now()}`,
    title,
    description: document.getElementById("taskDescription").value.trim(),
    category: document.getElementById("taskCategory").value,
    deadline: document.getElementById("taskDeadline").value,
    image: document.getElementById("taskImage").value.trim(),
    status: document.getElementById("taskStatus").value
  };

  if (editingId) {
    globalTaskData = globalTaskData.map(t => t.id === editingId ? task : t);
    editingId = null;
  } else {
    globalTaskData.push(task);
  }

  saveToLocalStorage();
  reloadTasks();
  updateTaskOverview();
  resetForm();
};

// ===== Edit Task =====
const editCard = id => {
  const task = globalTaskData.find(t => t.id === id);
  if (!task) return;

  editingId = id;
  document.getElementById("taskTitle").value = task.title;
  document.getElementById("taskDescription").value = task.description;
  document.getElementById("taskDeadline").value = task.deadline;
  document.getElementById("taskCategory").value = task.category;
  document.getElementById("taskStatus").value = task.status;
  document.getElementById("taskImage").value = task.image;

  new bootstrap.Modal(document.getElementById("newTask")).show();
};

// ===== Delete Task =====
const deleteCard = id => {
  globalTaskData = globalTaskData.filter(t => t.id !== id);
  saveToLocalStorage();
  reloadTasks();
  updateTaskOverview();
};

// ===== Change Task Status =====
const changeTaskStatus = (id, status) => {
  globalTaskData = globalTaskData.map(t => t.id === id ? { ...t, status } : t);
  saveToLocalStorage();
  reloadTasks();
  updateTaskOverview();
};

// ===== Reload Tasks =====
const reloadTasks = () => {
  taskContainer.innerHTML = globalTaskData.map(generateHTML).join("");
};

// ===== Task Overview =====
const updateTaskOverview = () => {
  const total = globalTaskData.length;
  const completed = globalTaskData.filter(t => t.status === "Completed").length;
  const inProgress = globalTaskData.filter(t => t.status === "In Progress").length;
  const pending = globalTaskData.filter(t => t.status === "Pending").length;

  document.getElementById("totalCount").textContent = total;
  document.getElementById("completedCount").textContent = completed;
  document.getElementById("progressCount").textContent = inProgress;
  document.getElementById("pendingCount").textContent = pending;
};

// ===== Local Storage =====
const saveToLocalStorage = () => localStorage.setItem("taskData", JSON.stringify(globalTaskData));

const loadExistingCards = () => {
  const stored = localStorage.getItem("taskData");
  if (stored) globalTaskData = JSON.parse(stored);
  reloadTasks();
  updateTaskOverview();
};

// ===== Reset Form =====
const resetForm = () => {
  ["taskTitle","taskDescription","taskDeadline","taskImage"].forEach(id => document.getElementById(id).value = "");
  document.getElementById("taskCategory").value = "Development";
  document.getElementById("taskStatus").value = "Pending";
};

// ===== Search =====
document.getElementById("searchInput").addEventListener("input", e => {
  const q = e.target.value.toLowerCase();
  const filtered = globalTaskData.filter(t =>
    t.title.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    t.category.toLowerCase().includes(q)
  );
  taskContainer.innerHTML = filtered.map(generateHTML).join("");
});

// ===== Clear All =====
document.getElementById("clearAllDesktop").addEventListener("click", () => {
  if (!globalTaskData.length) return alert("No tasks to clear.");
  if (confirm("Delete all tasks?")) {
    globalTaskData = [];
    saveToLocalStorage();
    reloadTasks();
    updateTaskOverview();
  }
});
