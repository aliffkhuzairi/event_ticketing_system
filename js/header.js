document.addEventListener('DOMContentLoaded', function () {
    fetch('header.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('headerPlaceholder').innerHTML = html;
        })
        .then(() => {
            initializeHeader(); // Initialize header functionality after it's loaded
        })
        .catch(error => console.error('Error loading header:', error));
});

function initializeHeader() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    const desktopSearchIcons = document.querySelector('.search-bar .icons');
    const mobileSearchIcons = document.querySelector('.drop-down-search .icons');
    const userIcon = document.querySelector('.icon.user');

    function addIconListeners(iconsContainer) {
        const cameraIcon = iconsContainer.querySelector('.fa-camera');
        const microphoneIcon = iconsContainer.querySelector('.fa-microphone');

        if (cameraIcon) {
            cameraIcon.addEventListener('click', openPhotoUploadModal);
        }

        if (microphoneIcon) {
            microphoneIcon.addEventListener('click', startVoiceRecognition);
        }
    }

    // Attach Icon Listeners for Desktop and Mobile
    if (desktopSearchIcons) {
        addIconListeners(desktopSearchIcons);
    }

    if (mobileSearchIcons) {
        addIconListeners(mobileSearchIcons);
    }

    if (currentUser && currentUser.username && userIcon) {
        userIcon.style.display = 'none';
    }

    // Start Voice Recognition
    function startVoiceRecognition() {
        // Check if the browser supports the Web Speech API
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            alert('Your browser does not support voice recognition. Please use Chrome or another supported browser.');
            return;
        }
    
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
    
        recognition.lang = 'en-US'; // Set language (modify as needed)
        recognition.interimResults = false; // Only final results
        recognition.maxAlternatives = 1; // Return the best match
    
        // Show a popup/modal for feedback
        const modalHtml = `
            <div id="voiceRecognitionModal" class="modal">
                <div class="modal-content">
                    <h2>Voice Recognition Active</h2>
                    <p>Please speak your query now...</p>
                    <button id="closeVoiceModal" class="cancel-button">Cancel</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    
        // Add event listener to cancel the recognition
        document.getElementById('closeVoiceModal').addEventListener('click', () => {
            recognition.stop(); // Stop voice recognition
            document.getElementById('voiceRecognitionModal').remove(); // Remove the modal
        });
    
        // Start recognition
        recognition.start();
    
        // Handle recognition results
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript; // Get the recognized text
            console.log('Recognized text:', transcript);
    
            // Redirect to result.html with the recognized text as the query
            window.location.href = `result.html?query=${encodeURIComponent(transcript)}`;
        };
    
        // Handle errors
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            alert('Error with voice recognition. Please try again.');
        };
    
        // Cleanup after recognition ends
        recognition.onend = () => {
            console.log('Speech recognition ended.');
            const modal = document.getElementById('voiceRecognitionModal');
            if (modal) modal.remove();
        };
    }

    // Open Photo Upload Modal
    function openPhotoUploadModal() {
        const modalHtml = `
            <div id="imageSearchModal" class="modal">
                <div class="modal-content">
                    <span class="close-modal" id="closeModal">&times;</span>
                    <h2>Search by Image</h2>
                    <p>Choose an option to provide your image:</p>
                    <div class="input-options">
                        <label for="imageUpload">Upload Image:</label>
                        <input type="file" id="imageUpload" accept="image/*"><br>
                        <label for="imageUrl">Or Enter Image URL:</label>
                        <input type="url" id="imageUrl" placeholder="https://example.com/image.jpg"><br>
                    </div>
                    <button id="confirmImageSearch" class="confirm-button">Search</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Close Modal
        document.getElementById('closeModal').addEventListener('click', () => {
            document.getElementById('imageSearchModal').remove();
        });

        // Confirm Button Click
        document.getElementById('confirmImageSearch').addEventListener('click', handleImageSearch);
    }

    // Handle Image Search
    function handleImageSearch() {
        const imageUpload = document.getElementById('imageUpload');
        const imageUrl = document.getElementById('imageUrl').value.trim();

        if (imageUpload.files.length > 0) {
            // Handle uploaded image
            const file = imageUpload.files[0];
            const reader = new FileReader();

            reader.onload = () => {
                const base64Image = reader.result; // Base64-encoded image
                console.log('Base64 Image:', base64Image);

                // Redirect or process the image (mock query in this case)
                window.location.href = `result.html?query=image_uploaded`;
            };

            reader.readAsDataURL(file);
        } else if (imageUrl) {
            // Handle image URL
            console.log('Image URL:', imageUrl);

            // Redirect or process the URL (mock query in this case)
            window.location.href = `result.html?query=${encodeURIComponent(imageUrl)}`;
        } else {
            alert('Please upload an image or enter a valid URL.');
        }

        // Close the modal
        document.getElementById('imageSearchModal').remove();
    }

    const authButtons = document.getElementById('authButtons');
    const dropdownAuthButtons = document.querySelector('.drop-down .act-btn-box');

    // Function to handle button updates and attach event listeners
    function updateAuthButtons() {
        const authContent = currentUser && currentUser.username
            ? `
                <div class= "logged">
                <button class="act-btn logout-button">Sign Out</button>
                </div>
                `
            : `<div>
                <button onclick="location.href='signin.html'" class="act-btn">Get Started</button>
                </div>
                `;

        if (authButtons) {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'btn';
            cardDiv.innerHTML = authContent;
            authButtons.appendChild(cardDiv);
        };
        if (dropdownAuthButtons) dropdownAuthButtons.innerHTML = authContent;

        attachLogoutEvent(); // Attach logout functionality
        // Add functionality for My Page button

        const myPageUser = document.getElementById('myPageUser');
        if (myPageUser) {
            myPageUser.addEventListener('click', () => {
                window.location.href = `mypage.html`;
            });
        };
        
        const myPageButton = document.getElementById('myPage');
        if (myPageButton) {
            myPageButton.addEventListener('click', () => {
                requireLogin(() => {
                    window.location.href = `mypage.html`;
                });
            });
        }
    }

    // Attach event listener to logout buttons
    function attachLogoutEvent() {
        const logoutButtons = document.querySelectorAll('.logout-button');
        logoutButtons.forEach(button => {
            button.addEventListener('click', () => {
                localStorage.removeItem('currentUser');
                alert('You have been logged out.');
                location.href = 'index.html'; // Redirect after logout
            });
        });
    }

    // Search Functionality
    // Search Elements
    const desktopSearchForm = document.getElementById('headerSearchForm');
    const desktopSearchQuery = document.getElementById('headerSearchQuery');
    const mobileSearchForm = document.querySelector('.drop-down-search #headerSearchForm');
    const mobileSearchQuery = document.querySelector('.drop-down-search #headerSearchQuery');

    // Add Search Listener
    function addSearchListener(searchForm, searchQuery) {
        searchForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent form submission default behavior
            const query = searchQuery.value.trim();
            if (query) {
                // Redirect to result.html with the query as a parameter
                window.location.href = `result.html?query=${encodeURIComponent(query)}`;
            }
        });
    }

    // Attach Search Listeners for Desktop and Mobile
    if (desktopSearchForm && desktopSearchQuery) {
        addSearchListener(desktopSearchForm, desktopSearchQuery);
    }

    if (mobileSearchForm && mobileSearchQuery) {
        addSearchListener(mobileSearchForm, mobileSearchQuery);
    }

    // Sticky Header
    window.addEventListener('scroll', function () {
        const header = document.querySelector('header');
        header.classList.toggle('sticky', window.scrollY > 0);
    });

    // Dropdown Menu Toggle
    const toggleBtnBars = document.querySelector('.tgl-btn .bars i');
    const dropDown = document.querySelector('.drop-down');
    const toggleBtnSearch = document.querySelector('.tgl-btn .icon.search');
    const dropDownSearch = document.querySelector('.drop-down-search');
    const searchClose = document.querySelector('.tgl-btn .icon.search i')
    const navClose = document.querySelector('.drop-down .fa-xmark');
    const isOpen = dropDown.classList.contains('open');

    toggleBtnBars.onclick = function () {
        dropDown.classList.toggle('open');
    };

    navClose.addEventListener('click', () => {
        dropDown.classList.remove('open');
    });
    
    toggleBtnSearch.onclick = function () {
        dropDownSearch.classList.toggle('open');
        searchClose.classList = isOpen
            ? 'fa-solid fa-xmark'
            : 'fa-solid fa-magnifying-glass';
    };

    // Close search dropdown if clicking outside
    document.addEventListener('click', (e) => {
        if (!dropDownSearch.contains(e.target) && !toggleBtnSearch.contains(e.target)) {
            dropDownSearch.classList.remove('open');
            searchClose.classList = 'fa-solid fa-magnifying-glass'; // Reset icon
        }

        if (!dropDown.contains(e.target) && !toggleBtnBars.contains(e.target)) {
            dropDown.classList.remove('open');
        }
    });

    // Call the update function to initialize the buttons
    updateAuthButtons();
}

function requireLogin(action = null) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        const currentURL = window.location.href;
        localStorage.setItem('redirectAfterLogin', currentURL);
        window.location.href = 'signin.html';
        return false;
    }
    if (action) action();
    return true;
}
