// Expense Tracker App with Local Storage
class ExpenseTracker {
    constructor() {
        this.expenses = [];
        this.filteredExpenses = [];
        this.currentEditId = null;
        this.storageKey = 'expenses';
        
        this.initializeElements();
        this.attachEventListeners();
        this.render();
    }

    initializeElements() {
        // Form elements
        this.form = document.getElementById('expenseForm');
        this.descriptionInput = document.getElementById('expenseDescription');
        this.amountInput = document.getElementById('expenseAmount');
        this.categorySelect = document.getElementById('expenseCategory');
        
        // Display elements
        this.expensesList = document.getElementById('expensesList');
        this.totalAmountDisplay = document.getElementById('totalAmount');
        this.totalItemsDisplay = document.getElementById('totalItems');
        
        // Filter elements
        this.filterCategory = document.getElementById('filterCategory');
        this.clearAllBtn = document.getElementById('clearAllBtn');
    }

    attachEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.filterCategory.addEventListener('change', (e) => this.handleFilterChange(e));
        this.clearAllBtn.addEventListener('click', () => this.handleClearAll());
    }

    // Generate unique ID for each expense
    generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }

    // Handle form submission
    handleFormSubmit(e) {
        e.preventDefault();

        const description = this.descriptionInput.value.trim();
        const amount = parseFloat(this.amountInput.value);
        const category = this.categorySelect.value;

        if (!description || !amount || !category) {
            alert('Please fill all fields');
            return;
        }

        if (this.currentEditId) {
            // Update existing expense
            this.updateExpense(this.currentEditId, { description, amount, category });
            this.currentEditId = null;
        } else {
            // Add new expense
            const expense = {
                id: this.generateId(),
                description,
                amount,
                category,
                date: new Date().toLocaleDateString('en-IN')
            };
            this.expenses.push(expense);
        }

        this.saveToLocalStorage();
        this.clearForm();
        this.applyFilter();
        this.render();
    }

    // Update existing expense
    updateExpense(id, { description, amount, category }) {
        const expense = this.expenses.find(exp => exp.id === id);
        if (expense) {
            expense.description = description;
            expense.amount = amount;
            expense.category = category;
        }
    }

    // Delete expense
    deleteExpense(id) {
        if (confirm('Are you sure you want to delete this expense?')) {
            this.expenses = this.expenses.filter(exp => exp.id !== id);
            this.saveToLocalStorage();
            this.applyFilter();
            this.render();
        }
    }

    // Edit expense
    editExpense(id) {
        const expense = this.expenses.find(exp => exp.id === id);
        if (expense) {
            this.descriptionInput.value = expense.description;
            this.amountInput.value = expense.amount;
            this.categorySelect.value = expense.category;
            this.currentEditId = id;
            
            // Scroll to form
            this.form.scrollIntoView({ behavior: 'smooth' });
            this.descriptionInput.focus();
        }
    }

    // Clear all expenses
    handleClearAll() {
        if (confirm('Are you sure you want to delete all expenses? This action cannot be undone.')) {
            this.expenses = [];
            this.filteredExpenses = [];
            this.saveToLocalStorage();
            this.clearForm();
            this.render();
        }
    }

    // Filter expenses by category
    handleFilterChange(e) {
        this.applyFilter();
        this.render();
    }

    // Apply filter logic
    applyFilter() {
        const selectedCategory = this.filterCategory.value;
        
        if (selectedCategory === '') {
            this.filteredExpenses = [...this.expenses];
        } else {
            this.filteredExpenses = this.expenses.filter(exp => exp.category === selectedCategory);
        }
    }

    // Clear form
    clearForm() {
        this.form.reset();
        this.currentEditId = null;
    }

    // Save to Local Storage
    saveToLocalStorage() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.expenses));
    }

    // Load from Local Storage
    loadFromLocalStorage() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            this.expenses = JSON.parse(stored);
            this.applyFilter();
        }
    }

    // Calculate total amount
    calculateTotal() {
        return this.filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    }

    // Calculate total items
    calculateTotalItems() {
        return this.filteredExpenses.length;
    }

    // Update summarySection
    updateSummary() {
        const total = this.calculateTotal();
        const items = this.calculateTotalItems();
        
        this.totalAmountDisplay.textContent = '₹' + total.toFixed(2);
        this.totalItemsDisplay.textContent = items;
    }

    // Create expense item HTML
    createExpenseItem(expense) {
        const expenseItem = document.createElement('div');
        expenseItem.className = 'expense-item';
        expenseItem.innerHTML = `
            <div class="expense-info">
                <div class="expense-description">${this.escapeHtml(expense.description)}</div>
                <div class="expense-meta">
                    <span class="expense-category">${expense.category}</span>
                    <span class="expense-date">📅 ${expense.date}</span>
                </div>
            </div>
            <div class="expense-amount">₹${expense.amount.toFixed(2)}</div>
            <div class="expense-actions">
                <button type="button" class="btn btn-warning btn-sm" onclick="expenseTracker.editExpense('${expense.id}')">Edit</button>
                <button type="button" class="btn btn-danger btn-sm" onclick="expenseTracker.deleteExpense('${expense.id}')">Delete</button>
            </div>
        `;
        return expenseItem;
    }

    // Escape HTML special characters
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Render expenses list
    renderExpensesList() {
        this.expensesList.innerHTML = '';

        if (this.filteredExpenses.length === 0) {
            this.expensesList.innerHTML = '<p class="text-center text-muted">No expenses yet. Add one to get started!</p>';
            return;
        }

        this.filteredExpenses.forEach(expense => {
            const expenseItem = this.createExpenseItem(expense);
            this.expensesList.appendChild(expenseItem);
        });
    }

    // Main render function
    render() {
        this.renderExpensesList();
        this.updateSummary();
    }

    // Initialize app
    init() {
        this.loadFromLocalStorage();
        this.render();
    }
}

// Initialize the app when DOM is loaded
let expenseTracker;
document.addEventListener('DOMContentLoaded', () => {
    expenseTracker = new ExpenseTracker();
    expenseTracker.init();
});
