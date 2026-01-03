/**
 * Fetches and injects the footer.html content into the placeholder element
 */
function injectFooter() {
    const placeholder = document.getElementById('footer-placeholder');
    if (!placeholder) return;

    fetch('footer.html')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load footer');
            return response.text();
        })
        .then(data => {
            placeholder.innerHTML = data;
        })
        .catch(err => console.error('Error loading footer:', err));
}

// Execute when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', injectFooter);