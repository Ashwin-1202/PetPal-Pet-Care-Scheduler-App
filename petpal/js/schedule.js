// Schedule management functionality

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Initialize schedule page
    initSchedulePage();
    
    // Add schedule button event
    const addScheduleBtn = document.getElementById('add-schedule-btn');
    if (addScheduleBtn) {
        addScheduleBtn.addEventListener('click', openScheduleModal);
    }
    
    // Schedule form submission
    const scheduleForm = document.getElementById('schedule-form');
    if (scheduleForm) {
        scheduleForm.addEventListener('submit', handleScheduleFormSubmit);
    }
    
    // Modal close button
    const closeBtn = document.querySelector('#schedule-modal .close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeScheduleModal);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('schedule-modal');
        if (e.target === modal) {
            closeScheduleModal();
        }
    });
    
    // Filter events
    const filterPet = document.getElementById('filter-pet');
    const filterType = document.getElementById('filter-type');
    
    if (filterPet) {
        filterPet.addEventListener('change', renderSchedules);
    }
    
    if (filterType) {
        filterType.addEventListener('change', renderSchedules);
    }
});

// Initialize schedule page
function initSchedulePage() {
    populatePetFilter();
    renderSchedules();
    populateSchedulePetDropdown();
}

// Get all schedules for current user
function getUserSchedules() {
    const currentUser = getCurrentUser();
    const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    return schedules.filter(schedule => schedule.userId === currentUser.id);
}

// Save schedules to localStorage
function saveSchedules(schedules) {
    localStorage.setItem('schedules', JSON.stringify(schedules));
}

// Populate pet filter dropdown
function populatePetFilter() {
    const filterPet = document.getElementById('filter-pet');
    const schedulePet = document.getElementById('schedule-pet');
    
    if (!filterPet || !schedulePet) return;
    
    const pets = getUserPets();
    
    // Clear existing options (except the first one)
    while (filterPet.children.length > 1) {
        filterPet.removeChild(filterPet.lastChild);
    }
    
    while (schedulePet.children.length > 1) {
        schedulePet.removeChild(schedulePet.lastChild);
    }
    
    // Add pet options
    pets.forEach(pet => {
        const option1 = document.createElement('option');
        option1.value = pet.id;
        option1.textContent = pet.name;
        filterPet.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = pet.id;
        option2.textContent = pet.name;
        schedulePet.appendChild(option2);
    });
}

// Populate schedule pet dropdown
function populateSchedulePetDropdown() {
    const schedulePet = document.getElementById('schedule-pet');
    if (!schedulePet) return;
    
    const pets = getUserPets();
    
    // Clear existing options (except the first one)
    while (schedulePet.children.length > 1) {
        schedulePet.removeChild(schedulePet.lastChild);
    }
    
    // Add pet options
    pets.forEach(pet => {
        const option = document.createElement('option');
        option.value = pet.id;
        option.textContent = pet.name;
        schedulePet.appendChild(option);
    });
}

// Render schedules to the page
function renderSchedules() {
    const container = document.getElementById('schedule-cards-container');
    if (!container) return;
    
    const filterPet = document.getElementById('filter-pet');
    const filterType = document.getElementById('filter-type');
    
    const selectedPet = filterPet ? filterPet.value : 'all';
    const selectedType = filterType ? filterType.value : 'all';
    
    let schedules = getUserSchedules();
    
    // Apply filters
    if (selectedPet !== 'all') {
        schedules = schedules.filter(schedule => schedule.petId === selectedPet);
    }
    
    if (selectedType !== 'all') {
        schedules = schedules.filter(schedule => schedule.type === selectedType);
    }
    
    // Sort by date and time
    schedules.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA - dateB;
    });
    
    if (schedules.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-alt"></i>
                <h3>No Schedules Added Yet</h3>
                <p>Add your first reminder to keep track of your pet's activities!</p>
            </div>
        `;
        return;
    }
    
    const pets = getUserPets();
    
    container.innerHTML = schedules.map(schedule => {
        const pet = pets.find(p => p.id === schedule.petId);
        const petName = pet ? pet.name : 'Unknown Pet';
        
        return `
        <div class="schedule-card" data-schedule-id="${schedule.id}">
            <div class="schedule-card-header ${schedule.type}" style="background: ${getActivityColor(schedule.type)}">
                <h3>${schedule.title}</h3>
                <div class="schedule-card-pet">${petName}</div>
                <div class="schedule-card-actions">
                    <button class="edit-schedule" title="Edit Schedule"><i class="fas fa-edit"></i></button>
                    <button class="delete-schedule" title="Delete Schedule"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <div class="schedule-card-body">
                <div class="schedule-card-time">
                    <i class="fas fa-clock"></i> ${formatDate(schedule.date)} at ${formatTime(schedule.time)}
                </div>
                ${schedule.notes ? `
                <div class="schedule-card-notes">
                    <p>${schedule.notes}</p>
                </div>
                ` : ''}
                ${schedule.repeat !== 'none' ? `
                <div class="schedule-card-repeat">
                    <i class="fas fa-redo"></i> Repeats ${schedule.repeat}
                </div>
                ` : ''}
            </div>
        </div>
        `;
    }).join('');
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-schedule').forEach(btn => {
        btn.addEventListener('click', function() {
            const scheduleCard = this.closest('.schedule-card');
            const scheduleId = scheduleCard.getAttribute('data-schedule-id');
            editSchedule(scheduleId);
        });
    });
    
    document.querySelectorAll('.delete-schedule').forEach(btn => {
        btn.addEventListener('click', function() {
            const scheduleCard = this.closest('.schedule-card');
            const scheduleId = scheduleCard.getAttribute('data-schedule-id');
            deleteSchedule(scheduleId);
        });
    });
}

// Open schedule modal for adding a new schedule
function openScheduleModal() {
    const modal = document.getElementById('schedule-modal');
    const modalTitle = document.getElementById('schedule-modal-title');
    
    modalTitle.textContent = 'Add New Reminder';
    document.getElementById('schedule-form').reset();
    document.getElementById('schedule-id').value = '';
    
    // Set default date to today and time to next hour
    const now = new Date();
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
    
    document.getElementById('schedule-date').value = now.toISOString().split('T')[0];
    document.getElementById('schedule-time').value = `${String(nextHour.getHours()).padStart(2, '0')}:${String(nextHour.getMinutes()).padStart(2, '0')}`;
    
    populateSchedulePetDropdown();
    modal.style.display = 'block';
}

// Close schedule modal
function closeScheduleModal() {
    const modal = document.getElementById('schedule-modal');
    modal.style.display = 'none';
}

// Handle schedule form submission
function handleScheduleFormSubmit(e) {
    e.preventDefault();
    
    const scheduleId = document.getElementById('schedule-id').value;
    const petId = document.getElementById('schedule-pet').value;
    const type = document.getElementById('schedule-type').value;
    const title = document.getElementById('schedule-title').value;
    const date = document.getElementById('schedule-date').value;
    const time = document.getElementById('schedule-time').value;
    const notes = document.getElementById('schedule-notes').value;
    const repeat = document.getElementById('schedule-repeat').value;
    
    const currentUser = getCurrentUser();
    const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    
    if (scheduleId) {
        // Editing existing schedule
        const scheduleIndex = schedules.findIndex(s => s.id === scheduleId);
        if (scheduleIndex !== -1) {
            schedules[scheduleIndex] = {
                ...schedules[scheduleIndex],
                petId,
                type,
                title,
                date,
                time,
                notes,
                repeat
            };
            showNotification('Schedule updated successfully!', 'success');
        }
    } else {
        // Adding new schedule
        const newSchedule = {
            id: Date.now().toString(),
            userId: currentUser.id,
            petId,
            type,
            title,
            date,
            time,
            notes,
            repeat,
            createdAt: new Date().toISOString()
        };
        schedules.push(newSchedule);
        showNotification('Schedule added successfully!', 'success');
    }
    
    saveSchedules(schedules);
    renderSchedules();
    closeScheduleModal();
}

// Edit schedule
function editSchedule(scheduleId) {
    const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    const schedule = schedules.find(s => s.id === scheduleId);
    
    if (!schedule) return;
    
    const modal = document.getElementById('schedule-modal');
    const modalTitle = document.getElementById('schedule-modal-title');
    
    modalTitle.textContent = 'Edit Schedule';
    
    document.getElementById('schedule-id').value = schedule.id;
    document.getElementById('schedule-pet').value = schedule.petId;
    document.getElementById('schedule-type').value = schedule.type;
    document.getElementById('schedule-title').value = schedule.title;
    document.getElementById('schedule-date').value = schedule.date;
    document.getElementById('schedule-time').value = schedule.time;
    document.getElementById('schedule-notes').value = schedule.notes || '';
    document.getElementById('schedule-repeat').value = schedule.repeat;
    
    populateSchedulePetDropdown();
    modal.style.display = 'block';
}

// Delete schedule
function deleteSchedule(scheduleId) {
    if (!confirm('Are you sure you want to delete this schedule?')) {
        return;
    }
    
    const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    const filteredSchedules = schedules.filter(s => s.id !== scheduleId);
    
    saveSchedules(filteredSchedules);
    renderSchedules();
    showNotification('Schedule deleted successfully', 'info');
}