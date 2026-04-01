document.addEventListener('DOMContentLoaded', () => {
    const ticketSummaryContainer = document.getElementById('purchase-summary');
    const confirmPaymentButton = document.getElementById('confirm-payment');
    const cardContainer = document.getElementById('cardContainer');
    const addCardSection = document.getElementById('add-card-section');
    const addNewCardBtn = document.getElementById('addNewCardBtn');
    const saveCardBtn = document.querySelector('.save-card-btn');
    const cancelAddCardBtn = document.getElementById('cancelAddCardBtn');
    const bankOptionsContainer = document.getElementById('bank-options');
    const paymentSections = document.querySelectorAll('.section');
    const sidebarItems = document.querySelectorAll('.payment-options ul li');

    // Handle sidebar navigation for payment methods
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            sidebarItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const sectionToShow = item.getAttribute('data-section');
            paymentSections.forEach(section => {
                section.classList.toggle('active', section.id === sectionToShow);
            });
        });
    });

    // Retrieve ticket details from localStorage
    const ticketDetails = JSON.parse(localStorage.getItem('ticketSummary')) || {};
    if (!ticketDetails.event) {
        alert('No ticket details found. Please select your tickets again.');
        window.location.href = 'purchase.html';
        return;
    }

    // Display ticket summary
    ticketSummaryContainer.innerHTML = `
        <div class="word" style="display: flex; justify-content: space-between;">
            <strong>Event:</strong> <p>${ticketDetails.event}</p>
        </div>
        <div class="word" style="display: flex; justify-content: space-between;">
            <strong>Date:</strong> <p>${ticketDetails.date}</p>
        </div>
        <div class="word" style="display: flex; justify-content: space-between;">
            <strong>Seats/Quantity:</strong> <p>${ticketDetails.seats}</p>
        </div>
        <div class="word" style="display: flex; justify-content: space-between;">
            <strong>Total Price:</strong> <p>${ticketDetails.total}</p>
        </div>
    `;

    // Populate saved cards from currentUser
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
    if (currentUser.cards && currentUser.cards.length > 0) {
        cardContainer.innerHTML = '';
        currentUser.cards.forEach((card, index) => {
            const cardDiv = document.createElement('div');
            cardDiv.classList.add('card');
            cardDiv.innerHTML = `
            
            <div class="card-details">
                    <div class="radio">
                        <input type="radio" id="card-${index}" name="payment-card" value="${index}">
                    </div>
                    <div class="detail">
                        <p><strong>${card.type}</strong></p>
                        <p>**** **** **** ${card.cardNumber.slice(-4)}</p>
                        <p>${card.name}</p>
                    </div>     
            </div>
            `;
            cardContainer.appendChild(cardDiv);
        });
    } else {
        cardContainer.innerHTML = '<p>No saved cards available. Add a new card to proceed.</p>';
    }

    const paymentDetailsContainer = document.getElementById('payment-details-container');

    // Show Add Card form
    addNewCardBtn.addEventListener('click', () => {
        addCardSection.style.display = 'block';
        paymentDetailsContainer.style.display = 'none';
    });

    // Hide Add Card form
    cancelAddCardBtn.addEventListener('click', () => {
        addCardSection.style.display = 'none';
        paymentDetailsContainer.style.display = 'block';
    });

    // Card Form 
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

    // Save new card
    saveCardBtn.addEventListener('click', (e) => {
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
            // !email.value.trim()
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
        const cardType = cardNumberValue.startsWith('4') 
        ? 'Visa' : cardNumberValue.startsWith('5') 
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
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        addCardSection.style.display = 'none';
        alert('Card added successfully!');
        location.reload();
    });

    // Bank Section
    const bankOptions = [
        'Kookmin Bank', 
        'Shinhan Bank', 
        'Hana Bank', 
        'Woori Bank',
        'Nonghyup',
        'IBK',
        'SC',
        'KDB',
        'Busan Bank',
        'KakaoBank', 
        'KakaoPay', 
        'NPay'
    ];

    bankOptionsContainer.innerHTML = ''; // Clear previous banks
    bankOptions.forEach((bank) => {
        const bankButton = document.createElement('button');
        bankButton.type = 'button';
        bankButton.classList.add('bank-button');
        bankButton.textContent = bank;
        bankOptionsContainer.appendChild(bankButton);
    });

    // Add selection logic for bank buttons
    document.querySelectorAll('.bank-button').forEach((button) => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.bank-button').forEach((btn) => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });

    // Handle payment confirmation
    confirmPaymentButton.addEventListener('click', (e) => {
        e.preventDefault();

        const activeSection = document.querySelector('.section.active');
        let selectedPaymentMethod = '';

        if (activeSection.id === 'credit-card') {
            const selectedCard = document.querySelector('input[name="payment-card"]:checked');
            if (!selectedCard) {
                alert('Please select a card or add a new one.');
                return;
            }
            selectedPaymentMethod = 'Credit/Debit Card';
        } else if (activeSection.id === 'online-banking') {
            const selectedBank = document.querySelector('.bank-button.active');
            if (!selectedBank) {
                alert('Please select a bank.');
                return;
            }
            selectedPaymentMethod = `Online Banking - ${selectedBank.textContent}`;
        } else {
            alert('Please select a payment method.');
            return;
        }

        // Prepare booking data
        const bookingID = Math.floor(10000000 + Math.random() * 90000000).toString();
        const newBooking = {
            id: bookingID,
            orderDate: new Date().toLocaleDateString(),
            event: ticketDetails.event,
            date: ticketDetails.date,
            seats: ticketDetails.seats,
            total: ticketDetails.total,
            paymentMethod: selectedPaymentMethod,
            user: ticketDetails.user || 'Guest'
        };

        // Save booking data
        const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        bookings.push(newBooking);
        localStorage.setItem('bookings', JSON.stringify(bookings));

        if (currentUser.username) {
            currentUser.bookings = currentUser.bookings || [];
            currentUser.bookings.push(newBooking);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            const users = JSON.parse(localStorage.getItem('users')) || [];
            const userIndex = users.findIndex(user => user.username === currentUser.username);
            if (userIndex !== -1) {
                users[userIndex] = currentUser;
                localStorage.setItem('users', JSON.stringify(users));
            }
        }

        // Clear temporary ticketSummary
        localStorage.removeItem('ticketSummary');

        // Redirect to confirmation page
        window.location.href = 'confirmation.html';
    });
});
