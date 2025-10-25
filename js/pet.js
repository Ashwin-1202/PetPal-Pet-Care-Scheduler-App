// Pets management functionality

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Initialize pets page
    initPetsPage();
    
    // Add pet button event
    const addPetBtn = document.getElementById('add-pet-btn');
    if (addPetBtn) {
        addPetBtn.addEventListener('click', openPetModal);
    }
    
    // Pet form submission
    const petForm = document.getElementById('pet-form');
    if (petForm) {
        petForm.addEventListener('submit', handlePetFormSubmit);
    }
    
    // Modal close button
    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closePetModal);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('pet-modal');
        if (e.target === modal) {
            closePetModal();
        }
    });
});

// Initialize pets page
function initPetsPage() {
    renderPets();
}

// Get all pets for current user
function getUserPets() {
    const currentUser = getCurrentUser();
    const pets = JSON.parse(localStorage.getItem('pets') || '[]');
    return pets.filter(pet => pet.userId === currentUser.id);
}

// Save pets to localStorage
function savePets(pets) {
    localStorage.setItem('pets', JSON.stringify(pets));
}

// Render pets to the page
function renderPets() {
    const container = document.getElementById('pets-cards-container');
    if (!container) return;
    
    const pets = getUserPets();
    
    if (pets.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-paw"></i>
                <h3>No Pets Added Yet</h3>
                <p>Add your first pet to get started with PetPal!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = pets.map(pet => `
        <div class="pet-card" data-pet-id="${pet.id}">
            <div class="pet-card-header">
                <h3>${pet.name}</h3>
                <div class="pet-card-actions">
                    <button class="edit-pet" title="Edit Pet"><i class="fas fa-edit"></i></button>
                    <button class="delete-pet" title="Delete Pet"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <div class="pet-card-body">
                <div class="pet-card-info">
                    <p><i class="fas fa-dog"></i> ${pet.type} - ${pet.breed}</p>
                    <p><i class="fas fa-birthday-cake"></i> ${pet.age} years old</p>
                    <p><i class="fas fa-weight"></i> ${pet.weight} kg</p>
                </div>
                ${pet.notes ? `
                <div class="pet-card-notes">
                    <p><i class="fas fa-sticky-note"></i> ${pet.notes}</p>
                </div>
                ` : ''}
            </div>
        </div>
    `).join('');
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-pet').forEach(btn => {
        btn.addEventListener('click', function() {
            const petCard = this.closest('.pet-card');
            const petId = petCard.getAttribute('data-pet-id');
            editPet(petId);
        });
    });
    
    document.querySelectorAll('.delete-pet').forEach(btn => {
        btn.addEventListener('click', function() {
            const petCard = this.closest('.pet-card');
            const petId = petCard.getAttribute('data-pet-id');
            deletePet(petId);
        });
    });
}

// Open pet modal for adding a new pet
function openPetModal() {
    const modal = document.getElementById('pet-modal');
    const modalTitle = document.getElementById('modal-title');
    
    modalTitle.textContent = 'Add New Pet';
    document.getElementById('pet-form').reset();
    document.getElementById('pet-id').value = '';
    
    modal.style.display = 'block';
}

// Close pet modal
function closePetModal() {
    const modal = document.getElementById('pet-modal');
    modal.style.display = 'none';
}

// Handle pet form submission
function handlePetFormSubmit(e) {
    e.preventDefault();
    
    const petId = document.getElementById('pet-id').value;
    const name = document.getElementById('pet-name').value;
    const type = document.getElementById('pet-type').value;
    const breed = document.getElementById('pet-breed').value;
    const age = parseFloat(document.getElementById('pet-age').value);
    const weight = parseFloat(document.getElementById('pet-weight').value);
    const notes = document.getElementById('pet-notes').value;
    
    const currentUser = getCurrentUser();
    const pets = JSON.parse(localStorage.getItem('pets') || '[]');
    
    if (petId) {
        // Editing existing pet
        const petIndex = pets.findIndex(p => p.id === petId);
        if (petIndex !== -1) {
            pets[petIndex] = {
                ...pets[petIndex],
                name,
                type,
                breed,
                age,
                weight,
                notes
            };
            showNotification('Pet updated successfully!', 'success');
        }
    } else {
        // Adding new pet
        const newPet = {
            id: Date.now().toString(),
            userId: currentUser.id,
            name,
            type,
            breed,
            age,
            weight,
            notes,
            createdAt: new Date().toISOString()
        };
        pets.push(newPet);
        showNotification('Pet added successfully!', 'success');
    }
    
    savePets(pets);
    renderPets();
    closePetModal();
}

// Edit pet
function editPet(petId) {
    const pets = JSON.parse(localStorage.getItem('pets') || '[]');
    const pet = pets.find(p => p.id === petId);
    
    if (!pet) return;
    
    const modal = document.getElementById('pet-modal');
    const modalTitle = document.getElementById('modal-title');
    
    modalTitle.textContent = 'Edit Pet';
    
    document.getElementById('pet-id').value = pet.id;
    document.getElementById('pet-name').value = pet.name;
    document.getElementById('pet-type').value = pet.type;
    document.getElementById('pet-breed').value = pet.breed;
    document.getElementById('pet-age').value = pet.age;
    document.getElementById('pet-weight').value = pet.weight;
    document.getElementById('pet-notes').value = pet.notes || '';
    
    modal.style.display = 'block';
}

// Delete pet
function deletePet(petId) {
    if (!confirm('Are you sure you want to delete this pet?')) {
        return;
    }
    
    const pets = JSON.parse(localStorage.getItem('pets') || '[]');
    const filteredPets = pets.filter(p => p.id !== petId);
    
    savePets(filteredPets);
    renderPets();
    showNotification('Pet deleted successfully', 'info');
}