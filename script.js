
// ==========================================
// PERSONAL EXPENSE TRACKER
// FINAL JAVASCRIPT
// ==========================================


// 1. GET HTML ELEMENTS

const expenseForm = document.getElementById("expenseForm");

const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const expenseList = document.getElementById("expenseList");

const totalExpenses = document.getElementById("totalExpenses");
const monthlyExpenses = document.getElementById("monthlyExpenses");
const totalTransactions = document.getElementById("totalTransactions");

const searchInput = document.getElementById("searchInput");
const filterCategory = document.getElementById("filterCategory");

const monthlyChart = document.getElementById("monthlyChart");
const themeToggle = document.getElementById("themeToggle");
const clearAllBtn = document.getElementById("clearAllBtn");


// 2. CATEGORY LIST

const categories = [
    "Food",
    "Travel",
    "Shopping",
    "Bills",
    "Entertainment",
    "Other"
];


// 3. LOAD DATA FROM LOCAL STORAGE

function loadExpenses() {

    try {

        const savedData = JSON.parse(
            localStorage.getItem("expenses")
        );

        if (!Array.isArray(savedData)) {
            return [];
        }

        return savedData.filter(function(expense) {

            return (
                expense &&
                Number.isSafeInteger(expense.id) &&
                typeof expense.title === "string" &&
                Number.isFinite(expense.amount) &&
                expense.amount > 0 &&
                categories.includes(expense.category) &&
                isValidDate(expense.date)
            );

        });

    } catch (error) {

        console.error("Error loading expenses:", error);

        return [];

    }

}


let expenses = loadExpenses();


// 4. SAVE DATA

function saveExpenses() {

    try {

        localStorage.setItem(
            "expenses",
            JSON.stringify(expenses)
        );

        return true;

    } catch (error) {

        console.error("Error saving expenses:", error);

        alert("Unable to save data. Browser storage may be full.");

        return false;

    }

}


// 5. FORMAT CURRENCY

function formatCurrency(amount) {

    return amount.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    });

}


// 6. VALIDATE DATE


function isValidDate(dateString) {

    if (typeof dateString !== "string") {
        return false;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return false;
    }

    const [year, month, day] = dateString.split("-").map(Number);

    const date = new Date(year, month - 1, day);

    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
}



// 7. ADD EXPENSE

expenseForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const title = titleInput.value.trim();

    const amount = Number(amountInput.value);

    const category = categoryInput.value;

    const date = dateInput.value;


    if (title.length === 0) {

        alert("Please enter expense name.");

        return;

    }


    if (!Number.isFinite(amount) || amount <= 0) {

        alert("Please enter a valid amount.");

        return;

    }


    if (!categories.includes(category)) {

        alert("Please select a valid category.");

        return;

    }


    if (!isValidDate(date)) {

        alert("Please select a valid date.");

        return;

    }


    const expense = {

        id: Date.now(),

        title: title,

        amount: amount,

        category: category,

        date: date

    };


    expenses.push(expense);


    if (!saveExpenses()) {

        expenses.pop();

        return;

    }


    displayExpenses();

    updateDashboard();

    expenseForm.reset();

    alert("Expense added successfully!");

});


// 8. DISPLAY EXPENSES

function displayExpenses() {

    expenseList.innerHTML = "";

    const searchText = searchInput.value
        .toLowerCase()
        .trim();

    const selectedCategory = filterCategory.value;


    const filteredExpenses = expenses.filter(function(expense) {

        const matchesSearch = expense.title
            .toLowerCase()
            .includes(searchText);

        const matchesCategory =
            selectedCategory === "All" ||
            expense.category === selectedCategory;

        return matchesSearch && matchesCategory;

    });


    if (filteredExpenses.length === 0) {

        const row = document.createElement("tr");

        const cell = document.createElement("td");

        cell.colSpan = 5;

        cell.textContent = expenses.length === 0
            ? "No expenses added yet."
            : "No expenses found.";

        row.appendChild(cell);

        expenseList.appendChild(row);

        return;

    }


    filteredExpenses.forEach(function(expense) {

        const row = document.createElement("tr");


        const titleCell = document.createElement("td");
        titleCell.textContent = expense.title;


        const categoryCell = document.createElement("td");
        categoryCell.textContent = expense.category;


        const dateCell = document.createElement("td");
        dateCell.textContent = expense.date;


        const amountCell = document.createElement("td");
        amountCell.textContent = formatCurrency(expense.amount);


        const actionCell = document.createElement("td");


        const editButton = document.createElement("button");

        editButton.className = "action-btn edit-btn";

        editButton.textContent = "Edit";

        editButton.dataset.action = "edit";

        editButton.dataset.id = expense.id;


        const deleteButton = document.createElement("button");

        deleteButton.className = "action-btn delete-btn";

        deleteButton.textContent = "Delete";

        deleteButton.dataset.action = "delete";

        deleteButton.dataset.id = expense.id;


        actionCell.appendChild(editButton);

        actionCell.appendChild(deleteButton);


        row.appendChild(titleCell);

        row.appendChild(categoryCell);

        row.appendChild(dateCell);

        row.appendChild(amountCell);

        row.appendChild(actionCell);


        expenseList.appendChild(row);

    });

}


// 9. SEARCH EXPENSES

searchInput.addEventListener("input", function() {

    displayExpenses();

});


// 10. CATEGORY FILTER

filterCategory.addEventListener("change", function() {

    displayExpenses();

});


// 11. EDIT AND DELETE BUTTON EVENTS

expenseList.addEventListener("click", function(event) {

    const button = event.target.closest("button");

    if (!button || !expenseList.contains(button)) {
        return;
    }


    const id = Number(button.dataset.id);

    const action = button.dataset.action;


    if (action === "edit") {

        editExpense(id);

    }


    if (action === "delete") {

        deleteExpense(id);

    }

});


// 12. DELETE EXPENSE

function deleteExpense(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this expense?"
    );

    if (!confirmDelete) {
        return;
    }


    const previousExpenses = expenses;

    expenses = expenses.filter(function(expense) {

        return expense.id !== id;

    });


    if (!saveExpenses()) {

        expenses = previousExpenses;

        return;

    }


    displayExpenses();

    updateDashboard();

    alert("Expense deleted successfully!");

}


// 13. EDIT EXPENSE

function editExpense(id) {

    const expense = expenses.find(function(item) {

        return item.id === id;

    });


    if (!expense) {
        return;
    }


    const newTitle = prompt(
        "Enter Expense Name:",
        expense.title
    );

    if (newTitle === null) {
        return;
    }

    if (newTitle.trim() === "") {

        alert("Expense name cannot be empty.");

        return;

    }


    const newAmount = prompt(
        "Enter Amount:",
        expense.amount
    );

    if (newAmount === null) {
        return;
    }

    const amount = Number(newAmount);

    if (!Number.isFinite(amount) || amount <= 0) {

        alert("Please enter a valid amount.");

        return;

    }


    const newCategory = prompt(
        "Enter Category (Food, Travel, Shopping, Bills, Entertainment, Other):",
        expense.category
    );

    if (newCategory === null) {
        return;
    }

    const category = newCategory.trim();

    if (!categories.includes(category)) {

        alert("Please enter a valid category.");

        return;

    }


    const newDate = prompt(
        "Enter Date (YYYY-MM-DD):",
        expense.date
    );

    if (newDate === null) {
        return;
    }

    if (!isValidDate(newDate)) {

        alert("Please enter a valid date.");

        return;

    }


    const oldExpense = { ...expense };


    expense.title = newTitle.trim();

    expense.amount = amount;

    expense.category = category;

    expense.date = newDate;


    if (!saveExpenses()) {

        Object.assign(expense, oldExpense);

        return;

    }


    displayExpenses();

    updateDashboard();

    alert("Expense updated successfully!");

}


// 14. UPDATE DASHBOARD

function updateDashboard() {

    const total = expenses.reduce(function(sum, expense) {

        return sum + expense.amount;

    }, 0);


    const today = new Date();

    const currentMonth = today.getMonth();

    const currentYear = today.getFullYear();


    const monthlyTotal = expenses.reduce(function(sum, expense) {

        const expenseDate = new Date(
            expense.date + "T00:00:00"
        );

        if (
            expenseDate.getMonth() === currentMonth &&
            expenseDate.getFullYear() === currentYear
        ) {

            return sum + expense.amount;

        }

        return sum;

    }, 0);


    totalExpenses.textContent = formatCurrency(total);

    monthlyExpenses.textContent = formatCurrency(monthlyTotal);

    totalTransactions.textContent = expenses.length;


    updateMonthlyChart();

}


// 15. MONTHLY EXPENSE CHART

function updateMonthlyChart() {

    monthlyChart.innerHTML = "";

    const today = new Date();

    const monthlyData = [];


    for (let i = 5; i >= 0; i--) {

        const date = new Date(
            today.getFullYear(),
            today.getMonth() - i,
            1
        );


        const month = date.getMonth();

        const year = date.getFullYear();


        const total = expenses.reduce(function(sum, expense) {

            const expenseDate = new Date(
                expense.date + "T00:00:00"
            );

            if (
                expenseDate.getMonth() === month &&
                expenseDate.getFullYear() === year
            ) {

                return sum + expense.amount;

            }

            return sum;

        }, 0);


        monthlyData.push({

            month: date.toLocaleDateString("en-IN", {
                month: "short"
            }),

            total: total

        });

    }


    const maxExpense = Math.max(
        ...monthlyData.map(item => item.total),
        1
    );


    monthlyData.forEach(function(item) {

        const column = document.createElement("div");

        column.className = "chart-column";


        const value = document.createElement("div");

        value.className = "bar-value";

        value.textContent = formatCurrency(item.total);


        const track = document.createElement("div");

        track.className = "bar-track";


        const bar = document.createElement("div");

        bar.className = "bar-fill";

        bar.style.height =
            (item.total / maxExpense * 100) + "%";


        const month = document.createElement("div");

        month.className = "bar-month";

        month.textContent = item.month;


        track.appendChild(bar);

        column.appendChild(value);

        column.appendChild(track);

        column.appendChild(month);


        monthlyChart.appendChild(column);

    });

}


// 16. CLEAR ALL EXPENSES

clearAllBtn.addEventListener("click", function() {

    if (expenses.length === 0) {

        alert("There are no expenses to clear.");

        return;

    }


    const confirmClear = confirm(
        "Are you sure you want to delete ALL expenses? This cannot be undone."
    );

    if (!confirmClear) {
        return;
    }


    const previousExpenses = expenses;

    expenses = [];


    if (!saveExpenses()) {

        expenses = previousExpenses;

        return;

    }


    displayExpenses();

    updateDashboard();

    alert("All expenses cleared successfully!");

});


// 17. DARK MODE

let darkMode = localStorage.getItem("darkMode") === "true";


function applyTheme() {

    document.body.classList.toggle(
        "dark-mode",
        darkMode
    );

    themeToggle.textContent = darkMode
        ? "☀️ Light Mode"
        : "🌙 Dark Mode";

}


themeToggle.addEventListener("click", function() {

    darkMode = !darkMode;

    localStorage.setItem(
        "darkMode",
        String(darkMode)
    );

    applyTheme();

});


// 18. INITIALIZE WEBSITE

applyTheme();

displayExpenses();

updateDashboard();


// ==========================================
// END OF PERSONAL EXPENSE TRACKER
// ==========================================
