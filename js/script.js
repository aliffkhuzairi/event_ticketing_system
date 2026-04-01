import eventsData from './eventsData.js';
let allEvents = Object.values(eventsData).flat(); // Combine all events from categories

document.addEventListener('DOMContentLoaded', () => {
    let pendingFilters = {
        priceMin: null,
        priceMax: null,
        date: null,
        seatType: null,
    };

    const resultsContainer = document.getElementById('resultsContainer');
    const resultsCount = document.getElementById('resultsCount');
    const noResultMessage = document.getElementById('noResultMessage');
    const filterPriceMin = document.getElementById('filterPriceMin');
    const filterPriceMax = document.getElementById('filterPriceMax');
    const filterDate = document.getElementById('filterDate');
    const filterSeatType = document.getElementById('filterSeatType');
    const applyFiltersButton = document.getElementById('applyFilters');
    const resetFiltersButton = document.getElementById('resetFilters');
    const sortSelector = document.getElementById('sortSelector');

    let filteredEvents = []; // Holds the current filtered events (after search or filters)

    // Remove duplicates
    function removeDuplicates(events) {
        const uniqueEvents = new Map();
        events.forEach(event => {
            const key = `${event.title}-${event.date}-${event.location}`;
            if (!uniqueEvents.has(key)) {
                uniqueEvents.set(key, event);
            }
        });
        return Array.from(uniqueEvents.values());
    }

    // Render the events
    function renderResults(events) {
        resultsContainer.innerHTML = ''; // Clear previous results
    
        if (events.length === 0) {
            noResultMessage.style.display = 'block';
            resultsCount.textContent = '';
            return;
        }
    
        noResultMessage.style.display = 'none';
        resultsCount.textContent = `Found ${events.length} event(s)`;
    
        events.forEach(event => {
            const dateDropdown = `
                <select class="dates-dropdown">
                    ${event.dates.map(dateInfo => {
                        return `<option value="${dateInfo.date}">${dateInfo.date} (${dateInfo.tickets ? 
                            (dateInfo.tickets.available > 0 
                                ? `${dateInfo.tickets.available} tickets available` 
                                : 'Sold Out') 
                            : 'Free Event'})</option>`;
                    }).join('')}
                </select>`;

            const eventCard = document.createElement('div');
            eventCard.classList.add('result-card');
            eventCard.innerHTML = `
                <div class="event-image">
                    <img src="${event.image}" alt="${event.title}">
                </div>
                <div class="event-details">
                    <a href="detail.html?id=${event.id}" class="view-details-btn"><h3>${event.title}</h3></a>
                    <p>Location: ${event.location}</p>
                    <p>Price: ${event.price ? `${event.price} KRW` : 'Free Event'}</p>
                    ${dateDropdown}
                    
                </div>`;
            resultsContainer.appendChild(eventCard);
        });
    }

    // Update pending filters
    function updatePendingFilters() {
        pendingFilters.priceMin = filterPriceMin.value;
        pendingFilters.priceMax = filterPriceMax.value;
        pendingFilters.date = filterDate.value;
        pendingFilters.seatType = filterSeatType.value;
    }

    // Attach listeners to filter inputs
    [filterPriceMin, filterPriceMax, filterDate, filterSeatType].forEach(filter => {
        filter.addEventListener('change', updatePendingFilters);
    });

    // Apply filters to the current filtered events (not `allEvents`)
    function applyFilters() {
        let events = [...filteredEvents]; // Start with the currently filtered events
    
        // Apply Price Filter
        const minPrice = parseInt(pendingFilters.priceMin) || 0;
        const maxPrice = parseInt(pendingFilters.priceMax) || Infinity;
        events = events.filter(event => event.price === null || (event.price >= minPrice && event.price <= maxPrice));
    
        // Apply Date Filter
        if (pendingFilters.date) {
            const selectedDate = new Date(pendingFilters.date);
            events = events.filter(event => event.dates.some(dateInfo => new Date(dateInfo.date) >= selectedDate));
        }
    
        // Apply Seating Filter
        if (pendingFilters.seatType) {
            events = events.filter(event => String(event.seating) === pendingFilters.seatType);
        }
    
        // Sort the filtered events
        events = sortEvents(events);
    
        renderResults(events); // Render the updated results
    }

    // Reset filters
    resetFiltersButton.addEventListener('click', () => {
        pendingFilters = {
            priceMin: null,
            priceMax: null,
            date: null,
            seatType: null,
        };

        filterPriceMin.value = '';
        filterPriceMax.value = '';
        filterDate.value = '';
        filterSeatType.value = '';

        renderResults(filteredEvents); // Reset to the last query results
    });

    // Sort events
    function sortEvents(events) {
        const sortOption = sortSelector.value;
        switch (sortOption) {
            case 'price-asc':
                return events.sort((a, b) => (a.price || 0) - (b.price || 0));
            case 'price-desc':
                return events.sort((a, b) => (b.price || 0) - (a.price || 0));
            case 'location-asc':
                return events.sort((a, b) => a.location.localeCompare(b.location));
            case 'location-desc':
                return events.sort((a, b) => b.location.localeCompare(a.location));
            case 'alphabetical-asc':
                return events.sort((a, b) => a.title.localeCompare(b.title));
            case 'alphabetical-desc':
                return events.sort((a, b) => b.title.localeCompare(a.title));
            default:
                return events.sort((a, b) => 
                    new Date(a.dates[0].date) - new Date(b.dates[0].date) // Use the first date for comparison
                );
        }
    }

    // Filter by search query
    function filterByQuery(query) {
        const queryResults = Object.entries(eventsData)
            .flatMap(([category, events]) =>
                events.filter(event => {
                    const searchableFields = {
                        title: event.title.toLowerCase(),
                        location: event.location.toLowerCase(),
                        genre: event.genre ? event.genre.map(g => g.toLowerCase()).join(" ") : "",
                        keywords: event.keywords ? event.keywords.join(' ').toLowerCase() : '',
                        category: category.toLowerCase(),
                    };

                    return Object.values(searchableFields).some(value => value.includes(query.toLowerCase()));
                })
            );

        filteredEvents = removeDuplicates(queryResults); // Update the filtered events globally
        renderResults(filteredEvents); // Render the search results
    }

    // Handle sorting
    sortSelector.addEventListener('change', () => {
        const sortedEvents = sortEvents([...filteredEvents]);
        renderResults(sortedEvents);
    });

    // Handle search query from URL
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('query')?.toLowerCase() || '';

    if (query) {
        filterByQuery(query); // Perform the search
    } else {
        filteredEvents = removeDuplicates(allEvents); // Start with all events
        renderResults(filteredEvents);
    }

    // Apply filters button
    applyFiltersButton.addEventListener('click', applyFilters);
});
