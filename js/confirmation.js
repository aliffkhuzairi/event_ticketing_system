document.addEventListener('DOMContentLoaded', () => {
    const bookingSummary = document.getElementById('booking-summary');
    const emailMessage = document.getElementById('email-message');
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];

    // Fetch the latest booking
    const latestBooking = bookings[bookings.length - 1];

    if (latestBooking) {
        bookingSummary.innerHTML = `
            <p><strong>Booking Date:</strong> ${latestBooking.orderDate}</p>
            <p><strong>Booking ID:</strong> ${latestBooking.id}</p>
            <p><strong>Event:</strong> ${latestBooking.event}</p>
            <p><strong>Date:</strong> ${latestBooking.date}</p>
            <p><strong>Seats/Quantity:</strong> ${latestBooking.seats}</p>
            <p><strong>Total Price:</strong> ${latestBooking.total}</p>
            
            
            <p><strong>Payment Method:</strong> ${latestBooking.paymentMethod}</p>
            <p><strong>Name:</strong> ${latestBooking.user.name}</p>
            <p><strong>Email:</strong> ${latestBooking.user.email}</p>
            <p><strong>Phone:</strong> ${latestBooking.user.phone}</p>
        `;

        emailMessage.textContent = `A confirmation email has been sent to ${latestBooking.user.email}. Please check your inbox.`;
    } else {
        bookingSummary.innerHTML = '<p>No booking details found.</p>';
    }
});


