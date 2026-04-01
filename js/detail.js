import eventsData from './eventsData.js';

document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const eventDetailContainer = document.getElementById('event-details');
    const eventInformation = document.querySelector('.event-info');
    const eventTitle = document.querySelector('.event-title');
    // const buyTicketButtonContainer = document.querySelector('.buy-ticket');

    // Fetch event ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = parseInt(urlParams.get('id'));
    
    // Load event details
    function loadEventDetails(eventId) {
        const allEvents = Object.values(eventsData).flat();
        const event = allEvents.find(e => e.id === eventId);
        
        if (!event) {
            eventDetailContainer.innerHTML = '<p>Event not found.</p>';
            return;
        }

        // Update Event Title
        eventTitle.innerHTML = `
            <div class="title-event"><h1>${event.title}</h1></div>
        `;

        const eventImageContainer = document.querySelector('.img');

        if (eventImageContainer) {
            eventImageContainer.style.backgroundImage = `url('${event.image}')`;
            eventImageContainer.style.backgroundSize = 'cover';
            eventImageContainer.style.backgroundPosition = 'center';
        } else {
            console.error('Event image container not found');
        }

        // Display date range
        const displayDate = Array.isArray(event.dates) && event.dates.length > 1
            ? `${event.dates[0].date} - ${event.dates[event.dates.length - 1].date}`
            : event.dates.length === 1
            ? event.dates[0].date
            : 'Date not available';

        // Update Event Information
        eventInformation.innerHTML = `
        <div class="other">
            <p><strong>Date:</strong> ${displayDate}</p>
            <p><strong>Venue:</strong> ${event.venue}</p>
            <p><strong>Location:</strong> ${event.location}</p>        
        </div>
        `;
        
        const priceArea = document.querySelector('.price-container');
        
        priceArea.innerHTML = `
        <label>Price : ${event.price ? `${event.price} KRW` : 'Free Event'}`

        // Default selected date
        let selectedDate = event.dates?.[0]?.date;
        localStorage.setItem('selectedDate', selectedDate);
        const calendarSection = document.querySelector('.calendar');
        const dateButtonsContainer = document.getElementById('date-buttons');
        const buyButtonContainer = document.querySelector('.btn');

        if (!event.price || event.price === null) {
            // Free Event Logic
            if (event.seating) {
                // Free Event with Seat Selection
                renderDateButtons(event.dates, dateButtonsContainer);
                setupDateSelection(dateButtonsContainer);

                const chooseSeatButton = document.createElement('button');
                chooseSeatButton.textContent = 'Choose Seat';
                chooseSeatButton.id = 'confirm-booking';
                chooseSeatButton.addEventListener('click', () => {
                    const selectedDate = localStorage.getItem('selectedDate');
                    if (!selectedDate) {
                        alert('Please select a date before proceeding.');
                        return;
                    }
                    window.location.href = `purchase.html?id=${eventId}&date=${encodeURIComponent(selectedDate)}&free=true`;
                });
                buyButtonContainer.appendChild(chooseSeatButton);
            } else {
                // Free Event Without Seat Selection
                calendarSection.style.display = 'none'; // Hide calendar
                buyButtonContainer.style.display = 'none'; // Hide button
            }
        } else {
            // Paid Event Logic
            renderDateButtons(event.dates, dateButtonsContainer);
            setupDateSelection(dateButtonsContainer);

            const buyTicketButton = document.createElement('button');
            buyTicketButton.textContent = 'Buy Ticket';
            buyTicketButton.id = 'confirm-booking';
            buyTicketButton.addEventListener('click', () => {
                const selectedDate = localStorage.getItem('selectedDate');
                if (!selectedDate) {
                    alert('Please select a date before proceeding.');
                    return;
                }
                requireLogin(() => {
                    window.location.href = `purchase.html?id=${eventId}&date=${encodeURIComponent(selectedDate)}&free=false`;
                });
            });
            buyButtonContainer.appendChild(buyTicketButton);
        }

        const eventDetails = document.querySelector('.tab-content');
        eventDetails.innerHTML = `
        <div class="active" id=desc-content>
            <h3>Description</h3>
            <p>${event.eventDescription}</p>
        </div>
        <div id=info-content>
            <h3>Info</h3>
            <p>${event.eventInfo}</p> 
        </div>            
        `
    }

    // Initialize
    loadEventDetails(eventId);

    // Initialize tabs after injecting content
    const tabs = document.querySelectorAll(".tab-box h3");
    const tabContents = document.querySelectorAll(".tab-content div");

    // Ensure the number of tabs matches the content
    if (tabs.length !== tabContents.length) {
        console.error("Tabs and tab content mismatch!");
    }

    tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => {
            // Remove active class from all tabs and content
            tabs.forEach(t => t.classList.remove("active"));
            tabContents.forEach(content => content.classList.remove("active"));

            // Add active class to clicked tab and corresponding content
            tab.classList.add("active");
            tabContents[index].classList.add("active");
        });
    });

    // Set the first tab and content as active initially
    if (tabs.length > 0) tabs[0].classList.add("active");
    if (tabContents.length > 0) tabContents[0].classList.add("active");
    
});

// Require login function
function requireLogin(action = null) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        const currentURL = window.location.href; // Save current page URL
        localStorage.setItem('redirectAfterLogin', currentURL);
        window.location.href = 'signin.html'; // Redirect to login page
        return false;
    }
    if (action) action();
    return true;
}

// Helper: Render Date Buttons
function renderDateButtons(dates, container) {
    container.innerHTML = dates.map((date, index) => `
        <button class="date-btn ${index === 0 ? 'active' : ''}" data-date="${date.date}">
            ${date.date}
        </button>
    `).join('');
    // Set default selected date in localStorage
    if (dates.length > 0) localStorage.setItem('selectedDate', dates[0].date);
}

// Helper: Set Up Date Selection
function setupDateSelection(container) {
    const dateButtons = container.querySelectorAll('.date-btn');
    dateButtons.forEach(button => {
        button.addEventListener('click', () => {
            dateButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const selectedDate = button.dataset.date;
            localStorage.setItem('selectedDate', selectedDate);
        });
    });
}