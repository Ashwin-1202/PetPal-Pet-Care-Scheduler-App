// Health records management functionality

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Initialize health page
    initHealthPage();
    
    // Add health button event
    const addHealthBtn = document.getElementById('add-health-btn');
    if (addHealthBtn) {
        addHealthBtn.addEventListener('click', openHealthModal);
    }
    
    // Health form submission
    const healthForm = document.getElementById('health-form');
    if (healthForm) {
        healthForm.addEventListener('submit', handleHealthFormSubmit);
    }
    
    // Modal close button
    const closeBtn = document.querySelector('#health-modal .close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeHealthModal);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('health-modal');
        if (e.target === modal) {
            closeHealthModal();
        }
    });
    
    // Filter events
    const filterPet = document.getElementById('health-filter-pet');
    const filterType = document.getElementById('health-filter-type');
    
    if (filterPet) {
        filterPet.addEventListener('change', renderHealthRecords);
    }
    
    if (filterType) {
        filterType.addEventListener('change', renderHealthRecords);
    }
});

// Initialize health page
function initHealthPage() {
    populateHealthPetFilter();
    renderHealthRecords();
    populateHealthPetDropdown();
}

// Get all health records for current user
function getUserHealthRecords() {
    const currentUser = getCurrentUser();
    const healthRecords = JSON.parse(localStorage.getItem('healthRecords') || '[]');
    return healthRecords.filter(record => record.userId === currentUser.id);
}

// Save health records to localStorage
function saveHealthRecords(healthRecords) {
    localStorage.setItem('healthRecords', JSON.stringify(healthRecords));
}

// Populate health pet filter dropdown
function populateHealthPetFilter() {
    const filterPet = document.getElementById('health-filter-pet');
    const healthPet = document.getElementById('health-pet');
    
    if (!filterPet || !healthPet) return;
    
    const pets = getUserPets();
    
    // Clear existing options (except the first one)
    while (filterPet.children.length > 1) {
        filterPet.removeChild(filterPet.lastChild);
    }
    
    while (healthPet.children.length > 1) {
        healthPet.removeChild(healthPet.lastChild);
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
        healthPet.appendChild(option2);
    });
}

// Populate health pet dropdown
function populateHealthPetDropdown() {
    const healthPet = document.getElementById('health-pet');
    if (!healthPet) return;
    
    const pets = getUserPets();
    
    // Clear existing options (except the first one)
    while (healthPet.children.length > 1) {
        healthPet.removeChild(healthPet.lastChild);
    }
    
    // Add pet options
    pets.forEach(pet => {
        const option = document.createElement('option');
        option.value = pet.id;
        option.textContent = pet.name;
        healthPet.appendChild(option);
    });
}

// Render health records to the page
function renderHealthRecords() {
    const container = document.getElementById('health-cards-container');
    if (!container) return;
    
    const filterPet = document.getElementById('health-filter-pet');
    const filterType = document.getElementById('health-filter-type');
    
    const selectedPet = filterPet ? filterPet.value : 'all';
    const selectedType = filterType ? filterType.value : 'all';
    
    let healthRecords = getUserHealthRecords();
    
    // Apply filters
    if (selectedPet !== 'all') {
        healthRecords = healthRecords.filter(record => record.petId === selectedPet);
    }
    
    if (selectedType !== 'all') {
        healthRecords = healthRecords.filter(record => record.type === selectedType);
    }
    
    // Sort by date (most recent first)
    healthRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (healthRecords.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-heartbeat"></i>
                <h3>No Health Records Added Yet</h3>
                <p>Add your first health record to track your pet's medical history!</p>
            </div>
        `;
        return;
    }
    
    const pets = getUserPets();
    
    container.innerHTML = healthRecords.map(record => {
        const pet = pets.find(p => p.id === record.petId);
        const petName = pet ? pet.name : 'Unknown Pet';
        
        return `
        <div class="health-card" data-health-id="${record.id}">
            <div class="health-card-header ${record.type}" style="background: ${getActivityColor(record.type)}">
                <h3>${record.title}</h3>
                <div class="health-card-pet">${petName}</div>
                <div class="health-card-actions">
                    <button class="edit-health" title="Edit Record"><i class="fas fa-edit"></i></button>
                    <button class="delete-health" title="Delete Record"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <div class="health-card-body">
                <div class="health-card-date">
                    <i class="fas fa-calendar-alt"></i> ${formatDate(record.date)}
                </div>
                ${record.nextDate ? `
                <div class="health-card-next-date">
                    <i class="fas fa-calendar-check"></i> Next due: ${formatDate(record.nextDate)}
                </div>
                ` : ''}
                <div class="health-card-details">
                    <p>${record.notes}</p>
                </div>
            </div>
        </div>
        `;
    }).join('');
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-health').forEach(btn => {
        btn.addEventListener('click', function() {
            const healthCard = this.closest('.health-card');
            const healthId = healthCard.getAttribute('data-health-id');
            editHealthRecord(healthId);
        });
    });
    
    document.querySelectorAll('.delete-health').forEach(btn => {
        btn.addEventListener('click', function() {
            const healthCard = this.closest('.health-card');
            const healthId = healthCard.getAttribute('data-health-id');
            deleteHealthRecord(healthId);
        });
    });
}

// Open health modal for adding a new record
function openHealthModal() {
    const modal = document.getElementById('health-modal');
    const modalTitle = document.getElementById('health-modal-title');
    
    modalTitle.textContent = 'Add Health Record';
    document.getElementById('health-form').reset();
    document.getElementById('health-id').value = '';
    
    // Set default date to today
    document.getElementById('health-date').value = new Date().toISOString().split('T')[0];
    
    populateHealthPetDropdown();
    modal.style.display = 'block';
}

// Close health modal
function closeHealthModal() {
    const modal = document.getElementById('health-modal');
    modal.style.display = 'none';
}

// Handle health form submission
function handleHealthFormSubmit(e) {
    e.preventDefault();
    
    const healthId = document.getElementById('health-id').value;
    const petId = document.getElementById('health-pet').value;
    const type = document.getElementById('health-type').value;
    const title = document.getElementById('health-title').value;
    const date = document.getElementById('health-date').value;
    const nextDate = document.getElementById('health-next-date').value;
    const notes = document.getElementById('health-notes').value;
    
    const currentUser = getCurrentUser();
    const healthRecords = JSON.parse(localStorage.getItem('healthRecords') || '[]');
    
    if (healthId) {
        // Editing existing record
        const recordIndex = healthRecords.findIndex(r => r.id === healthId);
        if (recordIndex !== -1) {
            healthRecords[recordIndex] = {
                ...healthRecords[recordIndex],
                petId,
                type,
                title,
                date,
                nextDate: nextDate || null,
                notes
            };
            showNotification('Health record updated successfully!', 'success');
        }
    } else {
        // Adding new record
        const newRecord = {
            id: Date.now().toString(),
            userId: currentUser.id,
            petId,
            type,
            title,
            date,
            nextDate: nextDate || null,
            notes,
            createdAt: new Date().toISOString()
        };
        healthRecords.push(newRecord);
        showNotification('Health record added successfully!', 'success');
    }
    
    saveHealthRecords(healthRecords);
    renderHealthRecords();
    closeHealthModal();
}

// Edit health record
function editHealthRecord(healthId) {
    const healthRecords = JSON.parse(localStorage.getItem('healthRecords') || '[]');
    const record = healthRecords.find(r => r.id === healthId);
    
    if (!record) return;
    
    const modal = document.getElementById('health-modal');
    const modalTitle = document.getElementById('health-modal-title');
    
    modalTitle.textContent = 'Edit Health Record';
    
    document.getElementById('health-id').value = record.id;
    document.getElementById('health-pet').value = record.petId;
    document.getElementById('health-type').value = record.type;
    document.getElementById('health-title').value = record.title;
    document.getElementById('health-date').value = record.date;
    document.getElementById('health-next-date').value = record.nextDate || '';
    document.getElementById('health-notes').value = record.notes;
    
    populateHealthPetDropdown();
    modal.style.display = 'block';
}

// Delete health record
function deleteHealthRecord(healthId) {
    if (!confirm('Are you sure you want to delete this health record?')) {
        return;
    }
    
    const healthRecords = JSON.parse(localStorage.getItem('healthRecords') || '[]');
    const filteredRecords = healthRecords.filter(r => r.id !== healthId);
    
    saveHealthRecords(filteredRecords);
    renderHealthRecords();
    showNotification('Health record deleted successfully', 'info');
}