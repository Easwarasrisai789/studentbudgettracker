const loginModal = document.getElementById("login-modal");
const budgetContainer = document.getElementById("budget-container");
const loginForm = document.getElementById("login-form");
const budgetForm = document.getElementById("budget-form");
const transactionList = document.getElementById("transaction-list");
const balanceDisplay = document.getElementById("balance");
const logoutBtn = document.getElementById("logout-btn");

let currentEmail = localStorage.getItem("currentEmail");

// Load transactions for the logged-in user
function loadTransactions(email) {
    const transactions = JSON.parse(localStorage.getItem(email)) || [];
    let totalIncome = 0;
    let totalExpense = 0;
    transactionList.innerHTML = "";

    // Group transactions by date
    const transactionsByDate = transactions.reduce((acc, transaction) => {
        const date = transaction.date; // Store the date from the transaction
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(transaction);
        return acc;
    }, {});

    // Display transactions grouped by date
    Object.keys(transactionsByDate).forEach(date => {
        const dateHeader = document.createElement("h3");
        dateHeader.innerText = `Date: ${new Date(date).toLocaleDateString()}`;
        transactionList.appendChild(dateHeader);

        transactionsByDate[date].forEach(transaction => {
            const li = document.createElement("li");
            li.className = transaction.type;
            const time = new Date(transaction.time).toLocaleTimeString(); // Format the time
            li.innerHTML = `${transaction.description}: $${transaction.amount.toFixed(2)} at ${time} 
                            <button class="remove-btn" onclick="removeTransaction('${email}', '${transaction.description}')">Remove</button>`;
            transactionList.appendChild(li);
        });
    });

    // Calculate total income and expense
    transactions.forEach(transaction => {
        if (transaction.type === "income") {
            totalIncome += transaction.amount;
        } else {
            totalExpense += transaction.amount;
        }
    });

    const balance = totalIncome - totalExpense;
    balanceDisplay.innerText = balance.toFixed(2);

    // Update details section
    const detailsContent = `
        <p>Total Income: $${totalIncome.toFixed(2)}</p>
        <p>Total Expense: $${totalExpense.toFixed(2)}</p>
        <p>Current Balance: $${balance.toFixed(2)}</p>
    `;
    document.getElementById("details-content").innerHTML = detailsContent;
    document.getElementById("details-content").style.display = "block"; // Show details
}

// Add transaction to the list and local storage
budgetForm.onsubmit = function (e) {
    e.preventDefault(); // Prevent page reload
    const type = document.getElementById("type").value;
    const description = document.getElementById("description").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const currentDateTime = new Date(); // Automatically get the current date and time

    if (!description || isNaN(amount)) {
        alert("Please fill in all fields!");
        return;
    }

    // Prepare the transaction object with the automatically set date and time
    const transaction = { 
        type, 
        description, 
        amount, 
        date: currentDateTime.toISOString().split('T')[0],  // Store the date part
        time: currentDateTime.toISOString() // Store the full timestamp
    };

    const transactions = JSON.parse(localStorage.getItem(currentEmail)) || [];
    transactions.push(transaction);
    localStorage.setItem(currentEmail, JSON.stringify(transactions));

    loadTransactions(currentEmail); // Reload transactions
    budgetForm.reset(); // Reset the form fields
};

// Handle login
loginForm.onsubmit = function (e) {
    e.preventDefault();
    const email = document.getElementById("email").value;

    localStorage.setItem("currentEmail", email);
    currentEmail = email;
    loginModal.style.display = "none";
    budgetContainer.style.display = "block";

    loadTransactions(currentEmail); // Load transactions for the logged-in user
    startLogoutTimer(); // Start the automatic logout timer
};

// Logout functionality
logoutBtn.onclick = function () {
    localStorage.removeItem("currentEmail");
    transactionList.innerHTML = "";
    balanceDisplay.innerText = "0.00";
    budgetContainer.style.display = "none";
    loginModal.style.display = "block"; // Show login modal again
    clearTimeout(logoutTimer); // Stop the logout timer
};

// Remove transaction
function removeTransaction(email, description) {
    let transactions = JSON.parse(localStorage.getItem(email)) || [];
    transactions = transactions.filter(transaction => transaction.description !== description);
    localStorage.setItem(email, JSON.stringify(transactions));

    loadTransactions(email); // Reload transactions after removing
}

// Auto-logout after 5 minutes of inactivity
let logoutTimer;

function startLogoutTimer() {
    logoutTimer = setTimeout(logoutUser, 300000); // 5 minutes
}

function resetLogoutTimer() {
    clearTimeout(logoutTimer);
    startLogoutTimer();
}

function logoutUser() {
    alert("You have been logged out due to inactivity.");
    logoutBtn.onclick(); // Trigger the logout functionality
}

// Detect user activity to reset logout timer
window.onload = function () {
    if (currentEmail) {
        loginModal.style.display = "none";
        budgetContainer.style.display = "block";
        loadTransactions(currentEmail);
        startLogoutTimer(); // Start the timer
    } else {
        loginModal.style.display = "block";
    }
}

window.addEventListener('mousemove', resetLogoutTimer);
window.addEventListener('keydown', resetLogoutTimer);
window.addEventListener('click', resetLogoutTimer);
