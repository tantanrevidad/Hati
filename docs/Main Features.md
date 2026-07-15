# Main Features

This app takes heavy inspiration from the apps “Hati” on appstore, and “Splitwise” on multiple platforms

Title: Lista: Your tab. settled.

Landing Page:

- The user should be greeted with a login via phone number, email, google, or any other related auth services
- The user will then be prompted to setup a profile (e.g name, photo, or pick from any preset avatar)
- The user is then prompted to link their Gcash, Maya, or Bank

Main Menu

- The user should be greeted with two buttons: Create a new *Listahan,* Join a *Listahan*
    - **Create a Listahan:**
        - The user is prompted to enter a field: “What should we *lista* for you?” (e.g. Baguio Trip, Dorm bills, Restaurant Bill)
        - After clicking continue, the user is redirected to the QR code for sharing, as well as the link at the bottom of the QR code to copy.
        - After sharing, the user is redirected to the dashboard
    - **Join a listahan:**
        - The user is prompted to the camera app like the gcash scan qr button.
        - The user is allowed to upload a qr from gallery, or enter the invite link/code
        - After scanning, the user is now redirected to the dashboard of the Listahan.

Dashboard

- At the dashboard, the user should see the total balance, owed as a group, what you are owed, and what others owe you.
- Next, the dashboard should show a pie chart of the total balance, with each field having the total balances of what each person in the group is owed.
- Next, It should show an Activity field with a summary of what other people is owed, who owes who, who paid who, etc.
- At the dashboard, the user should only see two buttons: SETTLE and PA LISTA
- **Settle:**
    - Using the stellar network smart settling system, the user can click a one tap “settle” button.
    - The user is prompted to a payment portal, to which they can either choose QRPH, or Pay in Cash.
    - **Pay in Cash Feature:**
        - When paying in cash, all users that are owed are then prompted a notification that they need to confirm if that user has paid them in cash.
        - The “what you owe” should only be settled when all involved users have approved that notification.
- **Pa Lista:**
    - There are two entry fields: SCAN or UPLOAD Invoice, and DESCRIPTION field.
    - **SCAN INVOICE:**
        - The user is prompted to open camera or gallery to take a picture or upload the invoice or receipt
        - Using Gemini API, the ai scans and reads the invoice and automatically sorts all the owed payments
    - **DESCRIPTION:**
        - The user enters a prompt description of who paid the bill
        - The user can tag other users in the group by using @{user}
            - Example:
            - “I paid for the bill, @Mark ordered extra rice, and everyone shared the rest of the food”

ADDITIONAL FEATURES

- The app syncs in real time, but can work offline
- The settlement can go through even in low bandwidth area
- “Nudge” a user to remind them to pay for their share
- *Listahan/s* expire when the group has a total balance of 0 after 7 days to remove clutter in the app
- [IF POSSIBLE] For users joining a group, the app should work on the web even without installing the app
-