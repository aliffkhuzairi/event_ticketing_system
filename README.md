# Eventure - Event Ticketing Website

Eventure is a web-based **event ticketing** website built with HTML, CSS, and JavaScript. It lets users browse events by category, view event details, choose dates and seats, simulate ticket purchases, and manage simple user data on the client side.

This project started as a frontend-only system. At the moment, event data is stored in `js/eventsData.js`, and user flow data such as selected tickets and saved cards is handled with `localStorage`. :contentReference[oaicite:1]{index=1}

## Features

- Browse events from multiple categories
- View event details
- Filter events by category
- Sort events by:
  - date
  - price
  - alphabetical order
- Show featured events on the homepage
- Show upcoming events
- Countdown timer for the next event
- Ticket purchase flow
- Seat selection for seated events
- Quantity-based purchase for non-seated events
- Payment page mockup
- Confirmation page
- Simple sign-in and my page flow
- Client-side data storage using `localStorage` :contentReference[oaicite:2]{index=2}

## Tech Stack

- HTML
- CSS
- JavaScript

There is no backend or database connected in the current version. The app runs as a static frontend project. Event records come from `js/eventsData.js`. :contentReference[oaicite:3]{index=3}

## Project Structure

```bash
event_ticketing/
├── img/
├── js/
│   ├── chatbot.js
│   ├── confirmation.js
│   ├── detail.js
│   ├── events.js
│   ├── eventsData.js
│   ├── footer.js
│   ├── header.js
│   ├── index.js
│   ├── mypage.js
│   ├── payment.js
│   ├── purchase.js
│   ├── result.js
│   ├── script.js
│   └── signin.js
├── style/
├── aboutus.html
├── chatbot.html
├── confirmation.html
├── contact.html
├── detail.html
├── events.html
├── faq.html
├── footer.html
├── header.html
├── index.html
├── mypage.html
├── payment.html
├── purchase.html
├── result.html
└── signin.html
