// Contact form functionality

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactFormSubmit);
    }
});

// Handle contact form submission
function handleContactFormSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    // In a real application, you would send this data to a server
    // For this demo, we'll just show a success message
    
    showNotification('Thank you for your message! We will get back to you soon.', 'success');
    
    // Reset form
    document.getElementById('contact-form').reset();
}