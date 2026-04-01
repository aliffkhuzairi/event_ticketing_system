import eventsData from './eventsData.js';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = parseInt(urlParams.get('id'));
    const allEvents = Object.values(eventsData).flat();
    const event = allEvents.find(e => e.id === eventId);

    const eventSummary = document.getElementById('event-summary');
    const dateButtonsContainer = document.getElementById('date-buttons');
    const seatSelectionContainer = document.getElementById('seat-selection');
    const seatMapContainer = document.getElementById('seat-map');
    const ticketQuantityContainer = document.getElementById('ticket-quantity');
    const userDetailsContainer = document.getElementById('user-details');
    const ticketSummary = document.getElementById('ticket-summary');

    let selectedDate = null;
    let selectedSeats = [];
    let selectedQuantity = 0;
    let totalPrice = 0;

    // Retrieve the selected date from localStorage
    const savedDate = localStorage.getItem('selectedDate');

    const eventImg = document.getElementById('event-img');
    eventImg.innerHTML = `<img src="${event.image}" alt="${event.title}">`;
    // Display event summary
    const displayDate = Array.isArray(event.dates) && event.dates.length > 1
        ? `${event.dates[0].date} - ${event.dates[event.dates.length - 1].date}`
        : event.dates.length === 1
        ? event.dates[0].date
        : 'Date not available';

    eventSummary.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 5px;">
            <h2>${event.title}</h2>
            <div class="word"style="display: flex; justify-content: space-between;">
                <strong>Venue:</strong><p>${event.venue}</p>
            </div>
            <div class="word"style="display: flex; justify-content: space-between;">
                <strong>Location:</strong><p>${event.location}</p>
            </div>
            <div class="word"style="display: flex; justify-content: space-between;">
                <strong>Date:</strong><p>${displayDate}</p>    
            </div>
            <div class="word"style="display: flex; justify-content: space-between;">
                <strong>Price:</strong><p>${event.price ? `${event.price} KRW` : 'Free Event'}</p>
            </div>
        </div>
    `;

    // Display dates as buttons
    event.dates.forEach(dateInfo => {
        const dateButton = document.createElement('button');
        dateButton.textContent = dateInfo.date;
        dateButton.classList.add('date-button');
        if (savedDate && savedDate === dateInfo.date) {
            dateButton.classList.add('active');
            selectedDate = dateInfo;
            updateSummary();
        }

        dateButton.addEventListener('click', () => {
            selectedDate = dateInfo;
            document.querySelectorAll('.date-button').forEach(btn => btn.classList.remove('active'));
            dateButton.classList.add('active');
            updateSummary();

            if (event.seating) {
                renderSeats(dateInfo);
                seatSelectionContainer.style.display = 'block';
                ticketQuantityContainer.style.display = 'none';
            } else {
                seatSelectionContainer.style.display = 'none';
                renderTicketQuantity(dateInfo);
            }
        });

        dateButtonsContainer.appendChild(dateButton);
    });

    // Render seats
    function renderSeats(dateInfo) {
        seatMapContainer.innerHTML = '';
        selectedSeats = [];

        dateInfo.tickets.seats.forEach(seat => {
            const seatButton = document.createElement('button');
            seatButton.textContent = seat.seatNumber;
            seatButton.className = `seat-button ${seat.available ? 'available' : 'sold'}`;
            seatButton.disabled = !seat.available;

            seatButton.addEventListener('click', () => {
                if (seatButton.classList.contains('selected')) {
                    seatButton.classList.remove('selected');
                    selectedSeats = selectedSeats.filter(s => s !== seat.seatNumber);
                } else if (selectedSeats.length < dateInfo.tickets.maxTicketsPerPurchase) {
                    seatButton.classList.add('selected');
                    selectedSeats.push(seat.seatNumber);
                } else {
                    alert(`You cannot select more than ${dateInfo.tickets.maxTicketsPerPurchase} seats.`);
                }
                updateSummary();
                updateUserDetails();
                confirmProceed();
            });

            seatMapContainer.appendChild(seatButton);
        });
    }

    // Render ticket quantity selection for non-seated events
    function renderTicketQuantity(dateInfo) {
        ticketQuantityContainer.style.display = 'block';
        ticketQuantityContainer.innerHTML = `
            <label for="ticket-quantity-input">Select Ticket Quantity (Max: ${dateInfo.tickets.maxTicketsPerPurchase}):</label>
            <input type="number" id="ticket-quantity-input" min="0" max="${dateInfo.tickets.maxTicketsPerPurchase}" value="0">
        `;
    
        const quantityInput = document.getElementById('ticket-quantity-input');
        selectedQuantity = 0;
    
        quantityInput.addEventListener('change', (e) => {
            const value = parseInt(e.target.value) || 0;
            if (value > dateInfo.tickets.maxTicketsPerPurchase) {
                alert(`You cannot purchase more than ${dateInfo.tickets.maxTicketsPerPurchase} tickets.`);
                quantityInput.value = dateInfo.tickets.maxTicketsPerPurchase;
                selectedQuantity = dateInfo.tickets.maxTicketsPerPurchase;
            } else {
                selectedQuantity = value;
            }
    
            updateSummary();
            updateUserDetails();
            confirmProceed(); // Check button visibility and state
        });
    }

    // Update user details form visibility
    function updateUserDetails() {
        userDetailsContainer.style.display = (selectedSeats.length > 0 || selectedQuantity > 0) ? 'block' : 'none';
    }

    // Update confirm button visibility
    function confirmProceed() {
        const confirmBtnContainer = document.querySelector('.confirm-btn');
    
        // Show the button if seats are selected
        const isSeatsSelected = selectedSeats.length > 0 || selectedQuantity > 0;
        if (isSeatsSelected) {
            confirmBtnContainer.style.display = 'block'; // Make button visible
        } else {
            confirmBtnContainer.style.display = 'none'; // Hide button
        }
    }

    // Update summary details
    function updateSummary() {
        const seatsText = selectedSeats.length > 0 
            ? selectedSeats.join(', ') 
            : selectedQuantity > 0 
            ? `${selectedQuantity}` 
            : 'None selected';
        
        totalPrice = event.price * (event.seating ? selectedSeats.length : selectedQuantity) || 0;
    
        ticketSummary.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 5px;">
                <h2>Ticket Summary</h2>
                <div class="word" style="display: flex; justify-content: space-between;">
                    <strong>Event:</strong> <p>${event.title}</p>
                </div>
                <div class="word" style="display: flex; justify-content: space-between;">
                    <strong>Date:</strong> <p>${selectedDate ? selectedDate.date : '-'}</p>
                </div>
                <div class="word" style="display: flex; justify-content: space-between;">
                    <strong>Seats/Quantity:</strong> <p>${seatsText}</p>
                </div>
                <div class="word" style="display: flex; justify-content: space-between;">
                    <strong>Price per Ticket:</strong> <p>${event.price ? `${event.price} KRW` : 'Free'}</p>
                </div>
                <div class="word" style="display: flex; justify-content: space-between;">
                    <strong>Total:</strong> <p>${event.price ? `${totalPrice} KRW` : 'Free'}</p>
                </div>
                
            </div>
        `;
    }

    document.getElementById('userDetailsForm').addEventListener('input', confirmProceed);

    // Handle user details submission
    const confirmBtn = document.querySelector('.confirm-btn button');

    confirmBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent any unintended behavior
    
        const userName = document.getElementById('userName').value.trim();
        const userEmail = document.getElementById('userEmail').value.trim();
        const userPhone = document.getElementById('userPhone').value.trim();
        
        // Validate inputs
        if (!userName) {
            alert('Please enter your name.');
            document.getElementById('userName').focus();
            return;
        }
        if (!userEmail) {
            alert('Please enter a valid email.');
            document.getElementById('userEmail').focus();
            return;
        }
        if (!userPhone) {
            alert('Please enter your phone number.');
            document.getElementById('userPhone').focus();
            return;
        }

        // Prepare ticket details
        const ticketDetails = {
            event: event.title,
            date: selectedDate ? selectedDate.date : 'N/A',
            seats: selectedSeats.length > 0 ? selectedSeats.join(', ') : `Quantity: ${selectedQuantity}`,
            total: totalPrice ? `${totalPrice} KRW` : 'Free',
            user: {
                name: userName,
                email: userEmail,
                phone: userPhone
            }
        };
    
        // Store the ticket details in localStorage
        localStorage.setItem('ticketSummary', JSON.stringify(ticketDetails));
    
        // Redirect to the appropriate page
        if (!event.price || event.price === null) {
            window.location.href = 'confirmation.html';
        } else {
            window.location.href = 'payment.html';
        }
    });

    // Automatically highlight selected date from details page
    if (savedDate) {
        const matchingButton = [...document.querySelectorAll('.date-button')].find(btn => btn.textContent === savedDate);
        if (matchingButton) {
            matchingButton.click();
        }
    }
});
