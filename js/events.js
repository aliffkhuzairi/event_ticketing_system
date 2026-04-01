import eventsData from './eventsData.js';

document.addEventListener('DOMContentLoaded', () => {
    const eventsContainer = document.getElementById('eventsContainer');
    const categoryButtons = document.querySelectorAll('.category-btn');

    const categoryNames = {
        All: "All Events",
        Concert: "Concert",
        Musical: "Musical",
        Sports: "Sports",
        Theatre: "Theatre",
        Festivals: "Festivals",
        FoodFashion: "Food and Fashion",
        Expos: "Expos",
        Exhibition: "Exhibitions",
    };

    let selectedCategory = 'All';

    // Remove duplicates
    function removeDuplicates(events) {
        const uniqueEvents = new Map();
        events.forEach(event => {
            const key = `${event.title}-${event.location}`;
            if (!uniqueEvents.has(key)) {
                uniqueEvents.set(key, event);
            }
        });
        return Array.from(uniqueEvents.values());
    }

    // Sort events
    function sortEvents(events, sortOption) {
        switch (sortOption) {
            case 'date-old':
                return events.sort((a, b) => new Date(a.dates[0]?.date) - new Date(b.dates[0]?.date));
            case 'date-new':
                return events.sort((a, b) => new Date(b.dates[0]?.date) - new Date(a.dates[0]?.date));
            case 'price-asc':
                return events.sort((a, b) => (a.price || Infinity) - (b.price || Infinity));
            case 'price-desc':
                return events.sort((a, b) => (b.price || 0) - (a.price || 0));
            case 'alphabetical-asc':
                return events.sort((a, b) => a.title.localeCompare(b.title));
            case 'alphabetical-desc':
                return events.sort((a, b) => b.title.localeCompare(a.title));
            default:
                return events;
        }
    }

    // Render events
    function renderEvents(events) {
        eventsContainer.innerHTML = '';

        if (!events || events.length === 0) {
            eventsContainer.innerHTML = '<p>No events found for this category.</p>';
            return;
        }

        events.forEach(event => {
            const datesDropdown = `
                <select class="dates-dropdown">
                    ${event.dates.map(date => {
                        return `<option value="${date.date}">${date.date} (${date.tickets ? 
                            (date.tickets.available > 0 
                                ? `${date.tickets.available} tickets available` 
                                : 'Sold Out') 
                            : 'Free Event'})</option>`;
                    }).join('')}
                </select>
            `;

            const eventCard = document.createElement('div');
            // eventCard.href = `detail.html?id=${event.id}`;
            eventCard.className = 'event-card';
            eventCard.innerHTML = `
                <div class="event-image">
                    <img src="${event.image}" alt="${event.title}">
                </div>
                <div class="event-details">
                    <a href="detail.html?id=${event.id}">${event.title}</a>
                    <p>Location: ${event.location}</p>
                    <p>Price: ${event.price ? `${event.price} KRW` : 'Free'}</p>
                    ${datesDropdown}
                </div>
            `;
            eventsContainer.appendChild(eventCard);
        });
    }

    // Load events by category
    function loadEventsByCategory(category) {
        selectedCategory = category;

        history.pushState({}, '', `events.html?category=${encodeURIComponent(category)}`);

        const events = category === 'All'
            ? Object.values(eventsData).flat()
            : eventsData[category] || [];

        renderEvents(removeDuplicates(events));
        highlightActiveCategory(category);

        // Update category title
        renderEvents(removeDuplicates(events.sort((a, b) => new Date(a.dates[0]?.date) - new Date(b.dates[0]?.date))));
        highlightActiveCategory(category);
        // categoryTitle.textContent = categoryNames[category] || 'All Events';
    }
    const dropdownToggle = document.getElementById('categoryDropdownToggle');
    const dropdownMenu = document.getElementById('categoryDropdownMenu');
    const categoryOptions = document.querySelectorAll('.category-option');
    const categoryTitle = document.getElementById('categoryTitle');

    // Highlight active category
    function highlightActiveCategory(category) {
        categoryButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.category === category);
        });
        categoryOptions.forEach(option => {
            option.classList.toggle('active', option.dataset.category === category);
        });
    }

    // Attach event listeners to desktop category buttons
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category || 'All';
            loadEventsByCategory(category);
        });
    });

    // Toggle the dropdown menu visibility
    dropdownToggle.addEventListener('click', () => {
        dropdownMenu.classList.toggle('open');
    });

    // Update button text and filter events based on selection
    categoryOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            const selectedCategory = e.target.getAttribute('data-category');
            if (!selectedCategory) {
                console.error("Category attribute missing");
                return;
            }

            dropdownToggle.textContent = e.target.textContent; // Update button text
            dropdownMenu.classList.remove('open'); // Close dropdown

            // Call existing logic to filter and load events
            loadEventsByCategory(selectedCategory);
        });
    });

    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!dropdownMenu.contains(e.target) && !dropdownToggle.contains(e.target)) {
            dropdownMenu.classList.remove('open');
        }
    });

    // Handle sorting
    sortSelector.addEventListener('change', () => {
        const events = selectedCategory === 'All'
            ? Object.values(eventsData).flat()
            : eventsData[selectedCategory] || [];

        renderEvents(removeDuplicates(sortEvents(events, sortSelector.value)));
    });

    // Handle page load or redirection with a specific category
    const urlParams = new URLSearchParams(window.location.search);
    const initialCategory = urlParams.get('category') || 'All';
    loadEventsByCategory(initialCategory);

    // Highlight active category on load
    highlightActiveCategory(initialCategory);

    // Update category on browser navigation
    window.addEventListener('popstate', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category') || 'All';
        loadEventsByCategory(category);
    });
});
