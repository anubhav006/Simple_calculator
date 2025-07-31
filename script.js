class Calculator {
    constructor() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = null;
        this.waitingForOperand = false;
        this.history = '';
        
        this.currentDisplay = document.getElementById('current');
        this.historyDisplay = document.getElementById('history');
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        // Button click events
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', this.handleButtonClick.bind(this));
        });
        
        // Keyboard events
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        
        // Prevent context menu on long press (mobile)
        document.addEventListener('contextmenu', e => e.preventDefault());
    }
    
    handleButtonClick(e) {
        const button = e.target;
        
        // Add visual feedback
        button.classList.add('active');
        setTimeout(() => button.classList.remove('active'), 150);
        
        if (button.dataset.number) {
            this.inputNumber(button.dataset.number);
        } else if (button.dataset.operator) {
            this.inputOperator(button.dataset.operator);
        } else if (button.dataset.action) {
            this.handleAction(button.dataset.action);
        }
    }
    
    handleKeyPress(e) {
        // Prevent default behavior for calculator keys
        if (this.isCalculatorKey(e.key)) {
            e.preventDefault();
        }
        
        if (e.key >= '0' && e.key <= '9') {
            this.inputNumber(e.key);
        } else if (e.key === '.') {
            this.handleAction('decimal');
        } else if (e.key === '+') {
            this.inputOperator('+');
        } else if (e.key === '-') {
            this.inputOperator('-');
        } else if (e.key === '*') {
            this.inputOperator('×');
        } else if (e.key === '/') {
            this.inputOperator('÷');
        } else if (e.key === 'Enter' || e.key === '=') {
            this.handleAction('equals');
        } else if (e.key === 'Escape') {
            this.handleAction('all-clear');
        } else if (e.key === 'Backspace') {
            this.handleAction('delete');
        } else if (e.key === 'c' || e.key === 'C') {
            this.handleAction('clear');
        }
    }
    
    isCalculatorKey(key) {
        const calculatorKeys = [
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            '+', '-', '*', '/', '=', 'Enter', 'Escape', 'Backspace',
            '.', 'c', 'C'
        ];
        return calculatorKeys.includes(key);
    }
    
    inputNumber(number) {
        if (this.waitingForOperand) {
            this.currentOperand = number;
            this.waitingForOperand = false;
        } else {
            this.currentOperand = this.currentOperand === '0' ? number : this.currentOperand + number;
        }
        
        this.updateDisplay();
    }
    
    inputOperator(nextOperator) {
        const inputValue = parseFloat(this.currentOperand);
        
        if (this.previousOperand === '') {
            this.previousOperand = inputValue;
        } else if (this.operation) {
            const currentValue = this.previousOperand || 0;
            const result = this.calculate(currentValue, inputValue, this.operation);
            
            if (result === null) return; // Error occurred
            
            this.currentOperand = String(result);
            this.previousOperand = result;
        }
        
        this.waitingForOperand = true;
        this.operation = nextOperator;
        this.updateHistory();
        this.updateDisplay();
        this.highlightOperator(nextOperator);
    }
    
    handleAction(action) {
        switch (action) {
            case 'clear':
                this.clear();
                break;
            case 'all-clear':
                this.allClear();
                break;
            case 'delete':
                this.delete();
                break;
            case 'decimal':
                this.inputDecimal();
                break;
            case 'equals':
                this.equals();
                break;
        }
    }
    
    calculate(firstOperand, secondOperand, operation) {
        switch (operation) {
            case '+':
                return firstOperand + secondOperand;
            case '-':
                return firstOperand - secondOperand;
            case '×':
                return firstOperand * secondOperand;
            case '÷':
                if (secondOperand === 0) {
                    this.showError('Cannot divide by zero');
                    return null;
                }
                return firstOperand / secondOperand;
            default:
                return secondOperand;
        }
    }
    
    equals() {
        const inputValue = parseFloat(this.currentOperand);
        
        if (this.previousOperand !== '' && this.operation) {
            const result = this.calculate(this.previousOperand, inputValue, this.operation);
            
            if (result === null) return; // Error occurred
            
            // Update history with complete calculation
            this.history = `${this.previousOperand} ${this.operation} ${inputValue} =`;
            
            this.currentOperand = String(result);
            this.previousOperand = '';
            this.operation = null;
            this.waitingForOperand = true;
            
            this.updateDisplay();
            this.clearOperatorHighlight();
        }
    }
    
    clear() {
        this.currentOperand = '0';
        this.updateDisplay();
    }
    
    allClear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = null;
        this.waitingForOperand = false;
        this.history = '';
        this.updateDisplay();
        this.clearOperatorHighlight();
    }
    
    delete() {
        if (this.currentOperand.length > 1) {
            this.currentOperand = this.currentOperand.slice(0, -1);
        } else {
            this.currentOperand = '0';
        }
        this.updateDisplay();
    }
    
    inputDecimal() {
        if (this.waitingForOperand) {
            this.currentOperand = '0.';
            this.waitingForOperand = false;
        } else if (this.currentOperand.indexOf('.') === -1) {
            this.currentOperand += '.';
        }
        
        this.updateDisplay();
    }
    
    updateDisplay() {
        // Format the current operand for display
        let displayValue = this.currentOperand;
        
        // Handle very long numbers
        if (displayValue.length > 12) {
            const num = parseFloat(displayValue);
            if (Math.abs(num) >= 1e12 || (Math.abs(num) < 1e-6 && num !== 0)) {
                displayValue = num.toExponential(6);
            } else {
                displayValue = num.toPrecision(12).replace(/\.?0+$/, '');
            }
        }
        
        this.currentDisplay.textContent = displayValue;
        this.historyDisplay.textContent = this.history;
        
        // Remove error state if it exists
        this.currentDisplay.classList.remove('error');
    }
    
    updateHistory() {
        if (this.previousOperand !== '' && this.operation) {
            this.history = `${this.previousOperand} ${this.operation}`;
        }
    }
    
    highlightOperator(operator) {
        // Remove previous highlights
        this.clearOperatorHighlight();
        
        // Highlight current operator
        const operatorButton = document.querySelector(`[data-operator="${operator}"]`);
        if (operatorButton) {
            operatorButton.classList.add('active');
        }
    }
    
    clearOperatorHighlight() {
        document.querySelectorAll('.btn-operator').forEach(btn => {
            btn.classList.remove('active');
        });
    }
    
    showError(message) {
        this.currentDisplay.textContent = message;
        this.currentDisplay.classList.add('error');
        
        // Clear error after 2 seconds
        setTimeout(() => {
            this.allClear();
        }, 2000);
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const calculator = new Calculator();
    
    // Add service worker for offline functionality (optional)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // Service worker registration failed, but app still works
        });
    }
});

// Prevent zoom on double tap (mobile)
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Prevent scroll bounce (mobile)
document.addEventListener('touchmove', (event) => {
    if (event.scale !== 1) {
        event.preventDefault();
    }
}, { passive: false });
