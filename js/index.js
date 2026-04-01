import eventsData from './eventsData.js';

document.addEventListener('DOMContentLoaded', () => {

    const slideWrapper = document.querySelector('.swiper-wrapper');
    if (slideWrapper) {
        slideWrapper.innerHTML = ''; // Clear existing slides
        // Add slides dynamically
    } else {
        console.error('Slide wrapper not found');
    }

    let featuredEvents = [];
    const allEvents = Object.values(eventsData).flat();

    if (allEvents.length > 0) {
        // Dynamically calculate popularity as a percentage of tickets sold
        const eventsWithPopularity = allEvents.map(event => {
            const totalDates = event.dates.length;
            const popularity = event.dates.reduce((total, date) => {
                if (date.tickets && date.tickets.total > 0) {
                    const soldTickets = date.tickets.total - date.tickets.available;
                    return total + (soldTickets / date.tickets.total);
                }
                return total;
            }, 0) / totalDates; // Average popularity across all dates

            return {
                ...event, // Keep original event properties
                popularity: isNaN(popularity) ? 0 : popularity // Assign 0 if popularity cannot be calculated
            };
        });

        // Sort events by popularity in descending order
        featuredEvents = eventsWithPopularity
            .sort((a, b) => b.popularity - a.popularity) // Sort by highest popularity
            .slice(0, 5); // Pick the top 7 events
    }

    // Log featured events for debugging
    console.log("Featured Events for Hero Section by Popularity:", featuredEvents);

    // Render Slider
    function renderSlides() {       
        slideWrapper.innerHTML = '';
        featuredEvents.forEach((event, index) => {
            const displayDate = Array.isArray(event.dates) && event.dates.length > 1
            ? `${event.dates[0].date} - ${event.dates[event.dates.length - 1].date}`
            : event.dates.length === 1
            ? event.dates[0].date
            : 'Date not available';

            const slide = document.createElement('div');
            slide.className = `slide-item swiper-slide ${index === 0 ? 'active' : ''}`;
            slide.style.background = `url(${event.image}) no-repeat center center/cover`;

            slide.innerHTML = `
                <div class="content">
                    <h1 class="hero-title">${event.title}</h2>
                    <h3>Venue: <span>${event.venue}</span></h3>
                    <h3>Date: <span>${displayDate}</span></h3>
                    <p>${event.eventDescription}</p>
                    <a href='detail.html?id=${event.id}' class="slide-btn">Buy Tickets</button>
                </div>
            `;
            slideWrapper.appendChild(slide);
        });

    }

    // Initialize Swiper
    const swiper = new Swiper('.hero', {
        effect: 'fade',
        speed: 1000,
        loop: true,
        loopedSlides: featuredEvents.length,
        navigation: {
            nextEl: '#next-btn',
            prevEl: '#prev-btn',
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            renderBullet: function (index, className) {
                return `<span class="${className}" style="width: 40px; height: 5px;"></span>`;
            },
        },
        autoplay: {delay:4000},
        on: {
            slideChangeTransitionEnd: function () {
                const activeIndex = this.realIndex;
                document.querySelectorAll('.swiper-pagination-bullet').forEach((bullet, index) => {
                    bullet.classList.toggle('swiper-pagination-bullet-active', index === activeIndex);
                });
            },
        },
    });

    // Initialize Slider
    if (featuredEvents.length > 0) {
        renderSlides();
    } else {
        slideWrapper.innerHTML = '<p>No events available.</p>';
    }


    const categoryButtons = document.querySelectorAll('.category-btn');
    const featuredContainer = document.querySelector('.featured');

    // Function to render filtered events
    function renderFilteredEvents(category) {
        // Clear the current featured section
        featuredContainer.innerHTML = '';

        // Get the events for the selected category
        const selectedEvents = eventsData[category]?.slice(0, 5) || [];

        // Render the events
        const categoryContainer = document.createElement('div');
        categoryContainer.className = 'category-container';

        if (selectedEvents.length > 0) {
            const eventList = document.createElement('div');
            eventList.className = 'list-event';

            selectedEvents.forEach(event => {
                const eventCard = document.createElement('a');
                eventCard.href = `detail.html?id=${event.id}`;
                eventCard.className = 'event-card';

                const displayDate = Array.isArray(event.dates) && event.dates.length
                    ? event.dates[0].date
                    : 'Date not available';

                eventCard.innerHTML = `
                    <div class="event-image">
                        <img src="${event.image}" alt="${event.title}">
                    </div>
                    <div class="event-details">
                        <h3>${event.title}</h3>
                        <p>${displayDate}</p>
                        <p>${event.location}</p>
                        <p class="price">${event.price ? event.price + ' KRW' : 'Free'}</p>
                    </div>
                `;
                eventList.appendChild(eventCard);
            });

            const viewMoreButton = document.createElement('div');
            viewMoreButton.className = 'view-all';
            viewMoreButton.innerHTML = `
                <button onclick="redirectToCategory('${category}')">View More</button>
            `;

            categoryContainer.appendChild(eventList);
            categoryContainer.appendChild(viewMoreButton);
        } else {
            categoryContainer.innerHTML = '<p>No events found for this category.</p>';
        }

        featuredContainer.appendChild(categoryContainer);
    }

    // Event Listener for Category Buttons
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to the clicked button
            button.classList.add('active');
            
            // Render events for the selected category
            const selectedCategory = button.dataset.category;
            renderFilteredEvents(selectedCategory);
        });
    });

    // Initialize the first category (e.g., "Concert")
    const defaultCategory = categoryButtons[0]?.dataset.category || 'Concert';
    document.querySelector(`.category-btn[data-category="${defaultCategory}"]`)?.classList.add('active');
    renderFilteredEvents(defaultCategory);


    const upcomingEventsContainer = document.getElementById('upcoming-events-container');

    function renderUpcomingEvents(eventsData) {
        const today = new Date();
        const categories = Object.keys(eventsData);
    
        // Collect upcoming events, one from each category
        const upcomingEvents = categories
            .map(category => {
                const events = eventsData[category];
                return events.find(event =>
                    event.dates.some(date => new Date(date.date) >= today)
                );
            })
            .filter(event => event !== undefined) // Remove undefined categories
            .slice(0, 5); // Limit to 4 events
    
        // Generate HTML for upcoming events
        upcomingEventsContainer.innerHTML = upcomingEvents.length
            ? upcomingEvents
                  .map(event => {
                      const firstDate = event.dates.find(date => new Date(date.date) >= today)?.date || 'TBA';
                      return `
                          <a href="detail.html?id=${event.id}" class="event-card">
                              <img src="${event.image}" alt="${event.title}">
                              <div class="event-card-content">
                                  <h3>${event.title}</h3>
                                  <p><strong></strong> ${firstDate}</p>
                                  <p><strong></strong> ${event.venue}</p>
                                  <p><strong></strong> ${event.price ? `${event.price} KRW` : 'Free'}</p>
                              </div>
                          </a>
                      `;
                  })
                  .join('')
            : '<p>No upcoming events available.</p>';
    }
    
    // Initialize Upcoming Events
    renderUpcomingEvents(eventsData);

    // Countdown Section
    function initializeCountdown(event) {
        const countdownElement = document.getElementById('countdown-timer');
        const eventTitleElement = document.getElementById('event-title');
        const eventDate = new Date(event.dates[0].date);
    
        eventTitleElement.textContent = event.title;
    
        function updateCountdown() {
            const now = new Date();
            const timeLeft = eventDate - now;
    
            if (timeLeft <= 0) {
                countdownElement.textContent = 'Event Started!';
                return;
            }
    
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
            const seconds = Math.floor((timeLeft / 1000) % 60);
    
            document.getElementById('days').textContent = days;
            document.getElementById('hours').textContent = hours;
            document.getElementById('minutes').textContent = minutes;
            document.getElementById('seconds').textContent = seconds;
        }
    
        setInterval(updateCountdown, 1000);
    }
    
    // Initialize with the next event
    if (allEvents.length > 0) {
        const nextEvent = allEvents.find(event => new Date(event.dates[0].date) > new Date());
        if (nextEvent) {
            initializeCountdown(nextEvent);
        }
    } 
});

     

// Redirect to the category page with highlighted sidebar
function redirectToCategory(category) {
    console.log(`Redirecting to: events.html?category=${encodeURIComponent(category)}`);
    window.location.href = `events.html?category=${encodeURIComponent(category)}`;
}

window.redirectToCategory = redirectToCategory;
