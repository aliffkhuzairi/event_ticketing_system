document.addEventListener('DOMContentLoaded', () => {
    const chatbotContainer = document.getElementById('chatbot-container');
    const toggleBtn = document.getElementById('chatbot-toggle-btn');
    const closeBtn = document.getElementById('chatbot-close-btn');
    const sendBtn = document.getElementById('chatbot-send-btn');
    const chatbotInput = document.getElementById('chatbot-input');
    const messagesContainer = document.getElementById('chatbot-messages');

    // Predefined answers for user questions
    const answers = {
        "help":"Sure! Let me know what you need help with.",
        "event":"You can browse events on our Events page. What kind of event are you looking for?",
        "bye": "Goodbye! Have a great day!",
        "hello": "Hello! How can I assist you today?",
        "hi": "Hello! How can I assist you today?",
        "tickets": "You can view your booked tickets in the 'My Tickets' section. You can also print or cancel your tickets directly from there.",
        "account information": "You can update your account details like name, email, and phone number in the 'Account Information' section of your profile.",
        "edit password": "To update your password, go to the 'Edit Password' section. You'll need to enter your current password, then set a new one.",
        "payment details": "You can manage your payment methods in the 'Payment Details' section. Add, update, or delete your saved cards for ticket purchases.",
        "event sorting": "Events can be sorted by date, category, or popularity on the 'Events' page. Use the filters for easier navigation.",
        "faq": "The FAQ page answers common questions about ticket booking, cancellations, and payments. Visit it for more information.",
        "close account": "To close your account, navigate to the 'Close Account' section in 'My Page' and follow the instructions. Please note that this action is irreversible.",
    };

    // Open chatbot
    toggleBtn.addEventListener('click', () => {
        chatbotContainer.style.display = 'flex';
        toggleBtn.style.display = 'none';
    });

    // Close chatbot
    closeBtn.addEventListener('click', () => {
        chatbotContainer.style.display = 'none';
        toggleBtn.style.display = 'block';
    });

    // Handle user input
    sendBtn.addEventListener('click', () => {
        const userInput = chatbotInput.value.trim().toLowerCase();
        if (userInput) {
            addMessage(userInput, 'user'); // Display user message
            chatbotInput.value = '';

            setTimeout(() => {
                const botResponse = getBotResponse(userInput);
                addMessage(botResponse, 'bot'); // Display bot response
            }, 1000); // Simulate a delay
        }
    });

    // Add message to chat
    function addMessage(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight; // Auto-scroll to the latest message
    }

    // Get bot response
    function getBotResponse(input) {
        for (const question in answers) {
            if (input.includes(question)) {
                return answers[question]; // Return predefined answer
            }
        }
        return "I'm sorry, I don't have an answer for that. Can you try asking something else?"; // Default response
    }
});
