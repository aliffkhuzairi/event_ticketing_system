document.addEventListener('DOMContentLoaded', function () {
    fetch('footer.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load footer');
            }
            return response.text();
        })
        .then(html => {
            document.getElementById('footerPlaceholder').innerHTML = html;

            // Initialize any footer-specific functionality here
        })
        .catch(error => {
            console.error('Error loading footer:', error);
        });
});