// Variable declarations
let users = JSON.parse(localStorage.getItem('users')) || {};
let currentUser = localStorage.getItem('currentUser');
let weeklyData = JSON.parse(localStorage.getItem('weeklyData')) || {};
let monthlyEarnings = JSON.parse(localStorage.getItem('monthlyEarnings')) || {};

// Function declarations
function toggleAuth() {
    const login = document.getElementById('login');
    const signup = document.getElementById('signup');
    login.style.display = login.style.display === 'none' ? 'block' : 'none';
    signup.style.display = signup.style.display === 'none' ? 'block' : 'none';
}

function signup() {
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;

    if (users[username]) {
        alert('Username already exists.');
        return;
    }

    users[username] = password;
    localStorage.setItem('users', JSON.stringify(users));
    alert('Sign up successful. You can log in now.');
    toggleAuth();
}

function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    if (users[username] && users[username] === password) {
        currentUser = username;
        localStorage.setItem('currentUser', currentUser);
        showTracker();
    } else {
        alert('Invalid credentials.');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showAuth();
}

function showAuth() {
    document.getElementById('auth').style.display = 'block';
    document.getElementById('tracker').style.display = 'none';
}

function showTracker() {
    document.getElementById('auth').style.display = 'none';
    document.getElementById('tracker').style.display = 'block';
    document.getElementById('user-name').innerText = currentUser;

    updateSummaryTable();
}

function addWork() {
    const date = document.getElementById('work-date').value;
    const startTime = document.getElementById('start-time').value;
    const endTime = document.getElementById('end-time').value;
    const hours = parseFloat(document.getElementById('hours').value) || 0; // Handle NaN input
    const rate = parseFloat(document.getElementById('pay-rate').value) || 0; // Handle NaN input
    const tips = parseFloat(document.getElementById('tips').value) || 0; // Handle NaN input

    let hoursWorked = hours; // Default to hours entered
    if (!hours) {
        const start = new Date(`1970-01-01T${startTime}`);
        const end = new Date(`1970-01-01T${endTime}`);
        hoursWorked = (end - start) / (1000 * 60 * 60);
        if (hoursWorked < 0) {
            hoursWorked += 24;
        }
    }

    const calculatedEarnings = (hoursWorked * rate) + tips;

    if (!weeklyData[currentUser]) weeklyData[currentUser] = {};
    if (!weeklyData[currentUser][date]) weeklyData[currentUser][date] = {};
    weeklyData[currentUser][date] = { hoursWorked, rate, tips, calculatedEarnings };

    const month = date.slice(0, 7);  // YYYY-MM
    if (!monthlyEarnings[currentUser]) monthlyEarnings[currentUser] = {};
    if (!monthlyEarnings[currentUser][month]) monthlyEarnings[currentUser][month] = 0;
    monthlyEarnings[currentUser][month] += calculatedEarnings;

    localStorage.setItem('weeklyData', JSON.stringify(weeklyData));
    localStorage.setItem('monthlyEarnings', JSON.stringify(monthlyEarnings));

    updateSummaryTable();
    alert('Daily work added successfully.');
}

function updateSummaryTable() {
    const tableBody = document.getElementById('summary-table').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    let totalEarnings = 0;

    if (weeklyData[currentUser]) {
        for (const [date, data] of Object.entries(weeklyData[currentUser])) {
            const row = tableBody.insertRow();
            row.insertCell(0).innerText = date;
            row.insertCell(1).innerText = data.hoursWorked.toFixed(2);
            row.insertCell(2).innerText = `$${data.rate.toFixed(2)}`;
            row.insertCell(3).innerText = `$${(data.tips || 0).toFixed(2)}`;
            row.insertCell(4).innerText = `$${(data.calculatedEarnings || 0).toFixed(2)}`;
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.dataset.action = 'delete';
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.dataset.action = 'edit';
            row.insertCell(5).appendChild(deleteButton);
            row.insertCell(6).appendChild(editButton);

            // Accumulate total earnings
            totalEarnings += data.calculatedEarnings;
        }
    }

    // Add total row
    const totalRow = tableBody.insertRow();
    totalRow.insertCell(0).innerText = 'Total';
    totalRow.insertCell(1).innerText = ''; // Leave hours blank
    totalRow.insertCell(2).innerText = ''; // Leave rate blank
    totalRow.insertCell(3).innerText = ''; // Leave tips blank
    totalRow.insertCell(4).innerText = `$${totalEarnings.toFixed(2)}`;
}

// Event listeners or other code that calls functions
document.addEventListener('DOMContentLoaded', () => {
    if (currentUser) {
        showTracker();
    } else {
        showAuth();
    }
});

// Add event listener to the table to handle delete and edit clicks
document.getElementById('summary-table').addEventListener('click', function(event) {
    const target = event.target;
    if (target.tagName === 'BUTTON') {
        const row = target.parentNode.parentNode;
        const date = row.cells[0].innerText;
        const action = target.dataset.action;

        if (action === 'delete') {
            deleteEntry(date);
        } else if (action === 'edit') {
            editEntry(row);
        }
    }
});

function deleteEntry(date) {
    if (confirm('Are you sure you want to delete this entry?')) {
        delete weeklyData[currentUser][date];
        localStorage.setItem('weeklyData', JSON.stringify(weeklyData));
        updateSummaryTable();
    }
}

function editEntry(row) {
    const date = row.cells[0].innerText;
    let data = weeklyData[currentUser][date];

    const newHours = prompt('Enter new hours (leave blank to keep current value):', data.hoursWorked.toFixed(2));
    const newRate = prompt('Enter new rate (leave blank to keep current value):', data.rate.toFixed(2));
    const newTips = prompt('Enter new tips (leave blank to keep current value):', data.tips.toFixed(2));

    // Parse new values
    data.hoursWorked = newHours ? parseFloat(newHours) : data.hoursWorked;
    data.rate = newRate ? parseFloat(newRate) : data.rate;
    data.tips = newTips ? parseFloat(newTips) : data.tips;

    // Update calculated earnings
    data.calculatedEarnings = (data.hoursWorked * data.rate) + data.tips;

    // Update row cells
    row.cells[1].innerText = data.hoursWorked.toFixed(2);
    row.cells[2].innerText = `$${data.rate.toFixed(2)}`;
    row.cells[3].innerText = `$${(data.tips || 0).toFixed(2)}`;
    row.cells[4].innerText = `$${(data.calculatedEarnings || 0).toFixed(2)}`;

    // Update data in storage
    weeklyData[currentUser][date] = data;
    localStorage.setItem('weeklyData', JSON.stringify(weeklyData));

    // Update summary table
    updateSummaryTable();
}
function showWeeklySummary() {
    if (!weeklyData[currentUser]) {
        alert('No data available for the current user.');
        return;
    }

    let totalWeeklyEarnings = 0;

    for (const [date, data] of Object.entries(weeklyData[currentUser])) {
        totalWeeklyEarnings += data.calculatedEarnings;
    }

    alert(`Total Weekly Earnings: $${totalWeeklyEarnings.toFixed(2)}`);
}

function showMonthlySummary() {
    if (!monthlyEarnings[currentUser]) {
        alert('No data available for the current user.');
        return;
    }

    let totalMonthlyEarnings = 0;

    for (const [month, earnings] of Object.entries(monthlyEarnings[currentUser])) {
        totalMonthlyEarnings += earnings;
    }

    alert(`Total Monthly Earnings: $${totalMonthlyEarnings.toFixed(2)}`);
}

function saveData() {
    let content = "Date, Hours, Rate, Tips, Calculated Earnings\n";

    if (weeklyData[currentUser]) {
        for (const [date, data] of Object.entries(weeklyData[currentUser])) {
            content += `${date}, ${data.hoursWorked.toFixed(2)}, $${data.rate.toFixed(2)}, $${data.tips.toFixed(2)}, $${data.calculatedEarnings.toFixed(2)}\n`;
        }
    } else {
        alert("No data available to save.");
        return;
    }

    // Create a blob from the content
    const blob = new Blob([content], { type: 'text/plain' });

    // Create a link element for the download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'earnings.txt';

    // Append the link to the body and trigger the download
    document.body.appendChild(link);
    link.click();

    // Clean up and remove the link element
    document.body.removeChild(link);
}