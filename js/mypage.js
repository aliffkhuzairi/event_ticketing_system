document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarLinks = document.querySelectorAll('.sidebar li');
    const sections = document.querySelectorAll('.section');
    const menuOverlay = document.getElementById('menuOverlay');

    // Function to update URL and display the corresponding section
    function showSection(sectionId) {
        // Update URL without reloading the page
        history.pushState({}, '', `mypage.html?section=${encodeURIComponent(sectionId)}`);

        // Remove 'active' class from all sections
        sections.forEach(section => section.classList.remove('active'));

        // Add 'active' class to the target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Remove 'active' class from all sidebar items
        sidebarLinks.forEach(item => item.classList.remove('active'));

        // Highlight the current sidebar item
        const activeSidebarItem = Array.from(sidebarLinks).find(item => item.dataset.section === sectionId);
        if (activeSidebarItem) {
            activeSidebarItem.classList.add('active');
        }

        // Close the sidebar
        sidebar.classList.remove('open');
    }

    // Toggle the sidebar on button click
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        menuOverlay.classList.toggle('visible');
    });

    // Close the menu when the overlay is clicked
    menuOverlay.addEventListener('click', closeMenu);

    // Event listener for sidebar items
    sidebarLinks.forEach(item => {
        item.addEventListener('click', () => {
            sidebarLinks.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const sectionId = item.dataset.section; // Get the section ID from the data attribute
            if (sectionId) {
                showSection(sectionId);
                closeMenu();
            }
        });
    });

    // Close the sidebar and overlay when clicking outside (additional safety)
    document.addEventListener('click', (event) => {
        if (!sidebar.contains(event.target) && !sidebarToggle.contains(event.target)) {
            closeMenu();
        }
    });

    function closeMenu() {
        sidebar.classList.remove('open');
        menuOverlay.classList.remove('visible'); // Ensure overlay is hidden
    }

    // Handle browser navigation (Back/Forward buttons)
    window.addEventListener('popstate', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const sectionId = urlParams.get('section') || 'my-ticket'; // Default to 'MyTickets'
        showSection(sectionId);
    });


    // Initialize the page on load based on the URL
    const urlParams = new URLSearchParams(window.location.search);
    const initialSection = urlParams.get('section') || 'my-ticket'; // Default to 'MyTickets'
    showSection(initialSection);
    

    // Populate My Tickets as Table
    const bookingDataBody = document.getElementById('booking-data-body');
    // Simulated User Data
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {
        username: 'johndoe',
        firstName: '',
        lastName: '',
        email: 'johndoe@example.com',
        cards: [],
        bookings
    };

    const userName = document.querySelector('.username');
    userName.innerHTML= `<h3>${currentUser.username}</h3>`


    // Ensure `bookings` exists and is an array
    const bookings = currentUser.bookings || [];

    if (bookings.length > 0) {
        // Remove "No bookings" row
        bookingDataBody.innerHTML = '';

        // Populate table with booking data
        bookings.forEach(booking => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td data-label="Order Date">${booking.orderDate || 'N/A'}</td>
                <td data-label="Order ID">${booking.id || 'N/A'}</td>
                <td data-label="Event">${booking.event}</td>
                <td data-label="Date">${booking.date}</td>
                <td data-label="Seats/Quantity">${booking.seats}</td>
                <td data-label="Total">${booking.total}</td>
                <td data-label="Print Ticket"><button class="print-btn" data-id="${booking.id}">Print</button></td>
                <td data-label="Cancel"><button class="cancel-btn" data-id="${booking.id}">Cancel</button></td>
                
            `;
            bookingDataBody.appendChild(row);
        });

        // // Add event listeners for Cancel buttons
        document.querySelectorAll('.cancel-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const confirmCancel = confirm('Are you sure you want to cancel this booking?');
                if (confirmCancel) {
                    // Remove from global bookings
                    const updatedBookings = bookings.filter(booking => booking.id !== id);
                    localStorage.setItem('bookings', JSON.stringify(updatedBookings));
        
                    // Remove from currentUser's bookings
                    currentUser.bookings = currentUser.bookings.filter(booking => booking.id !== id);
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
                    // Update the global users dataset
                    const users = JSON.parse(localStorage.getItem('users')) || [];
                    const userIndex = users.findIndex(user => user.username === currentUser.username);
                    if (userIndex !== -1) {
                        users[userIndex].bookings = currentUser.bookings;
                        localStorage.setItem('users', JSON.stringify(users));
                    }
        
                    alert('Booking canceled successfully!');
                    location.reload(); // Refresh the page to update the UI
                }
            });
        });

        // Add event listeners for Print buttons
        document.querySelectorAll('.print-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const booking = bookings.find(b => b.id === id); // Ensure `id` matches correctly
                if (booking) {
                    const printWindow = window.open('', '_blank');
                    printWindow.document.write(`
                        <html>
                            <head>
                                <title>Ticket Print</title>
                                <style>
                                    body {
                                        font-family: Arial, sans-serif;
                                        margin: 20px;
                                    }
                                    h1 {
                                        text-align: center;
                                        color: #333;
                                    }
                                    p {
                                        font-size: 16px;
                                        margin: 10px 0;
                                    }
                                    .ticket-details {
                                        border: 1px solid #ccc;
                                        padding: 15px;
                                        border-radius: 8px;
                                        max-width: 400px;
                                        margin: 20px auto;
                                    }
                                </style>
                            </head>
                            <body>
                                <div class="ticket-details">
                                    <h1>Event Ticket</h1>
                                    <p><strong>Order ID:</strong> ${booking.id}</p>
                                    <p><strong>Purchase Date:</strong> ${booking.orderDate || 'N/A'}</p>
                                    <p><strong>Event:</strong> ${booking.event}</p>
                                    <p><strong>Date:</strong> ${booking.date}</p>
                                    <p><strong>Seats/Quantity:</strong> ${booking.seats}</p>
                                    <p><strong>Total:</strong> ${booking.total}</p>
                                </div>
                            </body>
                        </html>
                    `);
                    printWindow.document.close();
                    printWindow.print();
                } else {
                    alert('Booking not found. Please try again.');
                }
            });
        });
    }else {
        // No bookings to display
        bookingDataBody.innerHTML = '<tr><td colspan="8" class="no-bookings">No tickets booked yet.</td></tr>';
    }

    // Populate Account Information Form
    const userDisable = document.querySelector('.user-fix');
    userDisable.innerHTML=`<label>Username: <p>${currentUser.username}</p></label>`
    
    document.getElementById('firstName').value = currentUser.firstName;
    document.getElementById('lastName').value = currentUser.lastName;
    document.getElementById('email').value = currentUser.email;

    // Save Account Information
    document.getElementById('accountForm').addEventListener('submit', (e) => {
        e.preventDefault();
        currentUser.firstName = document.getElementById('firstName').value.trim();
        currentUser.lastName = document.getElementById('lastName').value.trim();
        currentUser.email = document.getElementById('email').value.trim();
        updatecurrentUser();
        alert('Account information updated successfully!');
    });

    // Password
    const showhidePw = document.querySelectorAll('.showhidePw');
    const pwFields = document.querySelectorAll('.password');
    showhidePw.forEach(eyeIcon =>{
        eyeIcon.addEventListener('click', () =>{
            pwFields.forEach(pwField =>{
                if(pwField.type == 'password'){
                    pwField.type = 'text';
                    showhidePw.forEach(icon =>{
                        icon.classList.replace('fa-eye-slash','fa-eye')
                    })
                }else{
                    pwField.type = "password";
                    showhidePw.forEach(icon =>{
                        icon.classList.replace('fa-eye','fa-eye-slash')
                    })       
                }
            })
        })
    })

    

    // Render Cards in Payment Details
    const addCardForm = document.getElementById('addCardForm');
    const addCardSection = document.getElementById('add-card-section');
    const paymentDetailsContainer = document.getElementById('payment-details-container');
    const addCardButton = document.getElementById('addNewCardBtn');

    function renderCards() {
        const cardContainer = document.getElementById('cardContainer');
        cardContainer.innerHTML = '';

        if (currentUser.cards.length === 0) {
            cardContainer.innerHTML = '<p>You don’t have any cards yet.</p>';
            return;
        }

        currentUser.cards.forEach((cards, index) => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'card';
            cardDiv.innerHTML = `
                <div class="card-details">
                    <p><strong>${cards.type}</strong></p>
                    <p>**** **** **** ${cards.cardNumber.slice(-4)}</p>
                    <p>${cards.name}</p>
                </div>
                <div class="card-actions">
                    <button class="delete-btn" data-index="${index}">Delete</button>
                    ${index === 0 ? '<span class="default-badge">Default</span>' : `<a class="set-default" data-index="${index}">Set As Default</a>`}
                </div>
            `;
            cardContainer.appendChild(cardDiv);
        });

        // Add Delete and Default Set Listeners
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index, 10);
                
                // Show a confirmation dialog
                const confirmDelete = confirm('Are you sure you want to delete this card? This action cannot be undone.');
                
                if (confirmDelete) {
                    // Proceed with deletion if confirmed
                    currentUser.cards.splice(index, 1);
                    updatecurrentUser();
                    renderCards();
                    alert('Card deleted successfully.');
                } else {
                    // If canceled, do nothing
                    alert('Card deletion canceled.');
                }
            });
        });

        document.querySelectorAll('.set-default').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                const [defaultCard] = currentUser.cards.splice(index, 1);
                currentUser.cards.unshift(defaultCard);
                updatecurrentUser();
                renderCards();
            });
        });
    }
    const cardName = document.getElementById('cardName');
    const cardNumber = document.getElementById('cardNumber');
    const expiryDate = document.getElementById('expiryDate');
    const cvv = document.getElementById('cvv');

    // Format Card Number: Add spaces every 4 digits
    cardNumber.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\s/g, '').replace(/\D/g, ''); // Remove non-digit characters and spaces
        e.target.value = value.replace(/(\d{4})/g, '$1 ').trim(); // Add space every 4 digits
    });

    // Format Expiry Date: MM/YY
    expiryDate.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove non-digit characters
        if (value.length > 2) value = `${value.slice(0, 2)}/${value.slice(2, 4)}`; // Add slash after 2 digits
        e.target.value = value;
    });

    // CVV: Ensure only numbers and restrict to maxlength
    cvv.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, ''); // Remove non-digit characters
    });

    // Add Card Submission
    addCardForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const cardNameValue = cardName.value.trim();
        const cardNumberValue = cardNumber.value.replace(/\s/g, '').trim();
        const expiryDateValue = expiryDate.value.trim();
        const cvvValue = cvv.value.trim();

        if (
            !cardNameValue ||
            !cardNumberValue ||
            !expiryDateValue ||
            !cvvValue
        ) {
            alert('Please fill out all card details.');
            return;
        }

        // Validate card number length (16 digits)
        if (cardNumberValue.length !== 16) {
            alert('Card number must be 16 digits.');
            return;
        }

        // Validate expiry date format
        if (!/^\d{2}\/\d{2}$/.test(expiryDateValue)) {
            alert('Expiry date must be in MM/YY format.');
            return;
        }

        // Validate CVV length
        if (cvvValue.length !== 3) {
            alert('CVV must be 3 digits.');
            return;
        }

        // Determine card type
        const cardType = cardNumberValue.startsWith('4')
        ? 'Visa'
        : cardNumberValue.startsWith('5')
        ? 'MasterCard'
        : 'Other';

        const newCard = {
            name: cardName.value.trim(),
            cardNumber: cardNumberValue.trim(), 
            expiry: expiryDateValue.trim(), 
            cvv: cvvValue.trim(),
            type: cardType,
        };

        currentUser.cards = currentUser.cards || [];
        currentUser.cards.push(newCard);
        updatecurrentUser();
        alert('Card added successfully!');
        renderCards();

        // Reset and Hide Form
        addCardForm.reset();
        addCardSection.style.display = 'none';
        paymentDetailsContainer.style.display = 'block';
    });

    // Show Add Card Form
    addCardButton.addEventListener('click', () => {
        addCardSection.style.display = 'block';
        paymentDetailsContainer.style.display = 'none';
    });

    // Cancel Adding Card
    document.getElementById('cancelAddCardBtn').addEventListener('click', () => {
        addCardForm.reset();
        addCardSection.style.display = 'none';
        paymentDetailsContainer.style.display = 'block';
    });

    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Update LocalStorage Data
    function updatecurrentUser() {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        const userIndex = users.findIndex(user => user.username === currentUser.username);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            localStorage.setItem('users', JSON.stringify(users));
        }
    }

    // Initialize
    renderCards();

    const overlay = document.getElementById('overlay');
    const confirmCloseBtn = document.getElementById('confirmCloseBtn');
    const cancelCloseBtn = document.getElementById('cancelCloseBtn');
    const closeAccountForm = document.getElementById('closeAccountForm');

    // Close Account Overlay Logic
    closeAccountForm.addEventListener('submit', (e) => {
        e.preventDefault();
        overlay.classList.remove('hidden');
    });

    confirmCloseBtn.addEventListener('click', () => {
        alert('Your account has been closed.');
        localStorage.removeItem('currentUser');
        window.location.href = 'signin.html';
    });

    cancelCloseBtn.addEventListener('click', () => {
        overlay.classList.add('hidden');
    });


    
});
