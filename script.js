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
    let totalBalance = 0;
    transactionList.innerHTML = "";

    transactions.forEach(transaction => {
        const li = document.createElement("li");
        li.className = "transaction-item";

        // Displaying the type of transaction with a label
        li.innerHTML = `${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}: ${transaction.description}: $${transaction.amount.toFixed(2)} 
                        <button class="remove-btn" onclick="removeTransaction('${email}', '${transaction.description}')">Remove</button>`;
        transactionList.appendChild(li);

        totalBalance += transaction.type === "income" ? transaction.amount : -transaction.amount;
    });

    balanceDisplay.innerText = totalBalance.toFixed(2);
}

// Add transaction to the list and local storage
budgetForm.onsubmit = function (e) {
    e.preventDefault();
    const type = document.getElementById("type").value;
    const description = document.getElementById("description").value;
    const amount = parseFloat(document.getElementById("amount").value);

    const transaction = { type, description, amount };
    const transactions = JSON.parse(localStorage.getItem(currentEmail)) || [];
    transactions.push(transaction);
    localStorage.setItem(currentEmail, JSON.stringify(transactions));

    loadTransactions(currentEmail);
    budgetForm.reset();
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
};

window.addEventListener('mousemove', resetLogoutTimer);
window.addEventListener('keydown', resetLogoutTimer);
window.addEventListener('click', resetLogoutTimer);
