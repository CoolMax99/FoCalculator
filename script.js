// Enhanced Calculator with Expression Parser & Unit Converter

class Calculator {
    constructor() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = null;
        this.shouldResetScreen = false;
        this.isScientificMode = false;
        this.currentConverterCategory = 'length';
        this.expressionInputMode = false; // Track if we're typing in expression input
        this.lastFunction = ''; // Track the last function clicked
        
        // DOM Elements
        this.currentOperandElement = document.getElementById('current-operand');
        this.previousOperandElement = document.getElementById('previous-operand');
        this.expressionInput = document.getElementById('expression-input');
        this.converterValue = document.getElementById('converter-value');
        this.converterResult = document.getElementById('converter-result');
        
        // Mode toggle elements
        this.basicModeBtn = document.getElementById('basic-mode');
        this.scientificModeBtn = document.getElementById('scientific-mode');
        this.converterModeBtn = document.getElementById('converter-mode');
        this.calculatorSection = document.getElementById('calculator-section');
        this.converterSection = document.getElementById('converter-section');
        
        // Converter elements
        this.converterFromUnit = document.getElementById('converter-from-unit');
        this.converterToUnit = document.getElementById('converter-to-unit');
        this.swapUnitsBtn = document.getElementById('swap-units');
        this.categoryBtns = document.querySelectorAll('.category-btn');
        
        // Scientific buttons (initially hidden)
        this.scientificButtons = document.querySelectorAll('.scientific');
        
        // Unit conversion data
        this.conversionFactors = {
            length: {
                meter: 1,
                kilometer: 1000,
                centimeter: 0.01,
                millimeter: 0.001,
                mile: 1609.34,
                yard: 0.9144,
                foot: 0.3048,
                inch: 0.0254
            },
            weight: {
                kilogram: 1,
                gram: 0.001,
                milligram: 0.000001,
                pound: 0.453592,
                ounce: 0.0283495,
                ton: 1000
            },
            temperature: {
                celsius: 'celsius',
                fahrenheit: 'fahrenheit',
                kelvin: 'kelvin'
            },
            area: {
                squareMeter: 1,
                squareKilometer: 1000000,
                squareMile: 2589988.11,
                squareYard: 0.836127,
                squareFoot: 0.092903,
                acre: 4046.86,
                hectare: 10000
            },
            volume: {
                liter: 1,
                milliliter: 0.001,
                gallon: 3.78541,
                quart: 0.946353,
                pint: 0.473176,
                cup: 0.24,
                cubicMeter: 1000
            }
        };
        
        // Unit display names
        this.unitNames = {
            length: {
                meter: 'Meters',
                kilometer: 'Kilometers',
                centimeter: 'Centimeters',
                millimeter: 'Millimeters',
                mile: 'Miles',
                yard: 'Yards',
                foot: 'Feet',
                inch: 'Inches'
            },
            weight: {
                kilogram: 'Kilograms',
                gram: 'Grams',
                milligram: 'Milligrams',
                pound: 'Pounds',
                ounce: 'Ounces',
                ton: 'Tons'
            },
            temperature: {
                celsius: 'Celsius',
                fahrenheit: 'Fahrenheit',
                kelvin: 'Kelvin'
            },
            area: {
                squareMeter: 'Square Meters',
                squareKilometer: 'Square Kilometers',
                squareMile: 'Square Miles',
                squareYard: 'Square Yards',
                squareFoot: 'Square Feet',
                acre: 'Acres',
                hectare: 'Hectares'
            },
            volume: {
                liter: 'Liters',
                milliliter: 'Milliliters',
                gallon: 'Gallons',
                quart: 'Quarts',
                pint: 'Pints',
                cup: 'Cups',
                cubicMeter: 'Cubic Meters'
            }
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateDisplay();
        this.updateConverterUnitOptions();
        this.updateConverterResult();
        
        console.log('Enhanced Calculator initialized with expression parser and unit converter');
    }
    
    setupEventListeners() {
        // Number buttons
        document.querySelectorAll('[data-number]').forEach(button => {
            button.addEventListener('click', () => {
                if (this.expressionInputMode) {
                    // If expression input has focus, add number to expression
                    this.addToExpression(button.getAttribute('data-number'));
                } else {
                    this.appendNumber(button.getAttribute('data-number'));
                    this.updateDisplay();
                }
            });
        });
        
        // Operator buttons (basic and scientific)
        document.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', () => {
                const action = button.getAttribute('data-action');
                if (this.expressionInputMode) {
                    this.handleExpressionAction(action, button.textContent);
                } else {
                    this.handleAction(action);
                }
            });
        });
        
        // Expression input focus events
        this.expressionInput.addEventListener('focus', () => {
            this.expressionInputMode = true;
            this.expressionInput.style.backgroundColor = '#ffffe0';
        });
        
        this.expressionInput.addEventListener('blur', () => {
            this.expressionInputMode = false;
            this.expressionInput.style.backgroundColor = '';
        });
        
        // Expression evaluator
        document.getElementById('evaluate-expression').addEventListener('click', () => {
            this.evaluateExpression();
        });
        
        // Expression input enter key
        this.expressionInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.evaluateExpression();
            }
        });
        
        // Mode toggles
        this.basicModeBtn.addEventListener('click', () => this.switchMode('basic'));
        this.scientificModeBtn.addEventListener('click', () => this.switchMode('scientific'));
        this.converterModeBtn.addEventListener('click', () => this.switchMode('converter'));
        
        // Converter events - allow typing in converter input
        this.converterValue.addEventListener('input', () => {
            this.validateConverterInput();
            this.updateConverterResult();
        });
        
        this.converterValue.addEventListener('keydown', (e) => {
            // Allow: backspace, delete, tab, escape, enter, decimal point
            if ([46, 8, 9, 27, 13, 110, 190].includes(e.keyCode) ||
                // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                (e.keyCode === 65 && e.ctrlKey === true) ||
                (e.keyCode === 67 && e.ctrlKey === true) ||
                (e.keyCode === 86 && e.ctrlKey === true) ||
                (e.keyCode === 88 && e.ctrlKey === true) ||
                // Allow: home, end, left, right
                (e.keyCode >= 35 && e.keyCode <= 39)) {
                return;
            }
            
            // Ensure that it's a number and stop the keypress if not
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
            }
        });
        
        this.converterFromUnit.addEventListener('change', () => this.updateConverterResult());
        this.converterToUnit.addEventListener('change', () => this.updateConverterResult());
        this.swapUnitsBtn.addEventListener('click', () => this.swapConverterUnits());
        
        // Category buttons
        this.categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.getAttribute('data-category');
                this.switchConverterCategory(category);
            });
        });
        
        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyboardInput(e));
    }
    
    switchMode(mode) {
        // Update active mode button
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
        
        if (mode === 'basic') {
            this.basicModeBtn.classList.add('active');
            this.calculatorSection.classList.add('active');
            this.hideScientificButtons();
            this.isScientificMode = false;
        } else if (mode === 'scientific') {
            this.scientificModeBtn.classList.add('active');
            this.calculatorSection.classList.add('active');
            this.showScientificButtons();
            this.isScientificMode = true;
        } else if (mode === 'converter') {
            this.converterModeBtn.classList.add('active');
            this.converterSection.classList.add('active');
            // Focus on converter input when switching to converter mode
            setTimeout(() => {
                this.converterValue.focus();
                this.converterValue.select();
            }, 10);
        }
    }
    
    showScientificButtons() {
        this.scientificButtons.forEach(btn => {
            btn.style.display = 'block';
        });
        
        // Update grid layout for scientific mode
        const buttonsContainer = document.querySelector('.buttons');
        if (window.innerWidth > 850) {
            buttonsContainer.style.gridTemplateColumns = 'repeat(8, 1fr)';
        }
    }
    
    hideScientificButtons() {
        this.scientificButtons.forEach(btn => {
            btn.style.display = 'none';
        });
        
        // Update grid layout for basic mode
        document.querySelector('.buttons').style.gridTemplateColumns = 'repeat(4, 1fr)';
    }
    
    // Validate converter input to ensure it's a valid number
    validateConverterInput() {
        let value = this.converterValue.value;
        
        // Remove any non-numeric characters except decimal point and minus sign
        value = value.replace(/[^0-9.\-]/g, '');
        
        // Ensure only one decimal point
        const decimalCount = (value.match(/\./g) || []).length;
        if (decimalCount > 1) {
            value = value.replace(/\.+$/, ''); // Remove extra decimal points at the end
            const parts = value.split('.');
            value = parts[0] + '.' + parts.slice(1).join('');
        }
        
        // Ensure minus sign is only at the beginning
        if (value.includes('-')) {
            value = '-' + value.replace(/-/g, '');
        }
        
        // Remove leading zeros (except for decimal numbers)
        if (value.length > 1 && value.startsWith('0') && !value.startsWith('0.')) {
            value = value.replace(/^0+/, '') || '0';
        }
        
        // If empty, set to 0
        if (value === '' || value === '-' || value === '.') {
            value = '0';
        }
        
        // Remove trailing decimal point
        if (value.endsWith('.')) {
            value = value.slice(0, -1);
        }
        
        this.converterValue.value = value;
    }
    
    // Calculator core functions
    appendNumber(number) {
        if (this.currentOperand === '0' || this.shouldResetScreen) {
            this.currentOperand = number;
            this.shouldResetScreen = false;
        } else {
            this.currentOperand += number;
        }
    }
    
    appendConstant(constantValue) {
        if (this.shouldResetScreen) {
            this.currentOperand = constantValue;
            this.shouldResetScreen = false;
        } else {
            this.currentOperand += constantValue;
        }
        this.updateDisplay();
    }
    
    handleAction(action) {
        switch(action) {
            case 'clear':
                this.clearCalculator();
                break;
            case 'backspace':
                this.deleteDigit();
                break;
            case 'equals':
                this.calculate();
                break;
            case 'decimal':
                this.addDecimal();
                break;
            case 'percent':
                this.calculatePercentage();
                break;
            case 'add':
            case 'subtract':
            case 'multiply':
            case 'divide':
                this.chooseOperation(action);
                break;
            // Scientific functions - now these add functions to expression input
            case 'power':
                this.addToExpression('^');
                break;
            case 'sqrt':
                this.addToExpression('sqrt(');
                break;
            case 'pi':
                this.addToExpression('π');
                break;
            case 'e':
                this.addToExpression('e');
                break;
            case 'sin':
                this.lastFunction = 'sin';
                this.addToExpression('sin(');
                break;
            case 'cos':
                this.lastFunction = 'cos';
                this.addToExpression('cos(');
                break;
            case 'tan':
                this.lastFunction = 'tan';
                this.addToExpression('tan(');
                break;
            case 'log':
                this.lastFunction = 'log';
                this.addToExpression('log(');
                break;
            case 'open-paren':
                this.addToExpression('(');
                break;
            case 'close-paren':
                this.addToExpression(')');
                break;
            case 'factorial':
                this.addToExpression('!');
                break;
            case 'inverse':
                // If there's a current value, calculate inverse immediately
                const currentValue = parseFloat(this.currentOperand);
                if (currentValue !== 0) {
                    this.currentOperand = (1 / currentValue).toString();
                    this.shouldResetScreen = true;
                } else {
                    alert('Cannot divide by zero');
                }
                break;
        }
        
        this.updateDisplay();
    }
    
    // Handle actions when expression input is focused
    handleExpressionAction(action, buttonText) {
        switch(action) {
            case 'clear':
                this.expressionInput.value = '';
                break;
            case 'backspace':
                this.expressionInput.value = this.expressionInput.value.slice(0, -1);
                break;
            case 'equals':
                this.evaluateExpression();
                break;
            case 'decimal':
                this.addToExpression('.');
                break;
            case 'add':
                this.addToExpression('+');
                break;
            case 'subtract':
                this.addToExpression('-');
                break;
            case 'multiply':
                this.addToExpression('*');
                break;
            case 'divide':
                this.addToExpression('/');
                break;
            // Scientific functions for expression input
            case 'power':
                this.addToExpression('^');
                break;
            case 'sqrt':
                this.addToExpression('sqrt(');
                break;
            case 'pi':
                this.addToExpression('π');
                break;
            case 'e':
                this.addToExpression('e');
                break;
            case 'sin':
                this.addToExpression('sin(');
                break;
            case 'cos':
                this.addToExpression('cos(');
                break;
            case 'tan':
                this.addToExpression('tan(');
                break;
            case 'log':
                this.addToExpression('log(');
                break;
            case 'open-paren':
                this.addToExpression('(');
                break;
            case 'close-paren':
                this.addToExpression(')');
                break;
            case 'factorial':
                this.addToExpression('!');
                break;
            case 'inverse':
                this.addToExpression('1/');
                break;
            default:
                // For number buttons
                if (buttonText && !isNaN(parseInt(buttonText))) {
                    this.addToExpression(buttonText);
                }
        }
    }
    
    // Add text to expression input
    addToExpression(text) {
        // Focus on expression input if not already focused
        if (!this.expressionInputMode) {
            this.expressionInput.focus();
            this.expressionInputMode = true;
            this.expressionInput.style.backgroundColor = '#ffffe0';
        }
        
        const currentPos = this.expressionInput.selectionStart;
        const before = this.expressionInput.value.substring(0, currentPos);
        const after = this.expressionInput.value.substring(currentPos);
        
        this.expressionInput.value = before + text + after;
        
        // Move cursor to after inserted text
        this.expressionInput.selectionStart = this.expressionInput.selectionEnd = currentPos + text.length;
        
        // Trigger input event for any listeners
        this.expressionInput.dispatchEvent(new Event('input'));
    }
    
    chooseOperation(op) {
        if (this.currentOperand === '') return;
        
        if (this.previousOperand !== '') {
            this.calculate();
        }
        
        this.operation = op;
        this.previousOperand = this.currentOperand;
        this.shouldResetScreen = true;
    }
    
    calculate() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return;
        
        switch(this.operation) {
            case 'add':
                computation = prev + current;
                break;
            case 'subtract':
                computation = prev - current;
                break;
            case 'multiply':
                computation = prev * current;
                break;
            case 'divide':
                if (current === 0) {
                    alert("Cannot divide by zero!");
                    this.clearCalculator();
                    return;
                }
                computation = prev / current;
                break;
            case 'percent':
                computation = prev * (current / 100);
                break;
            default:
                return;
        }
        
        // Round to avoid long decimals
        this.currentOperand = Math.round(computation * 100000000) / 100000000;
        this.operation = null;
        this.previousOperand = '';
        this.shouldResetScreen = true;
    }
    
    clearCalculator() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = null;
        this.expressionInput.value = '';
        this.updateDisplay();
    }
    
    deleteDigit() {
        if (this.currentOperand.length === 1 || this.currentOperand === '0') {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.slice(0, -1);
        }
        this.updateDisplay();
    }
    
    addDecimal() {
        if (this.shouldResetScreen) {
            this.currentOperand = '0.';
            this.shouldResetScreen = false;
            return;
        }
        
        if (!this.currentOperand.includes('.')) {
            this.currentOperand += '.';
        }
        this.updateDisplay();
    }
    
    calculatePercentage() {
        if (this.previousOperand === '' || this.operation === null) {
            this.currentOperand = (parseFloat(this.currentOperand) / 100).toString();
        } else {
            this.calculate();
        }
        this.updateDisplay();
    }
    
    updateDisplay() {
        this.currentOperandElement.textContent = this.currentOperand;
        
        if (this.operation) {
            const operationSymbol = this.getOperationSymbol(this.operation);
            this.previousOperandElement.textContent = `${this.previousOperand} ${operationSymbol}`;
        } else {
            this.previousOperandElement.textContent = this.previousOperand;
        }
    }
    
    getOperationSymbol(op) {
        switch(op) {
            case 'add': return '+';
            case 'subtract': return '-';
            case 'multiply': return '×';
            case 'divide': return '÷';
            default: return '';
        }
    }
    
    // Expression Parser
    evaluateExpression() {
        const expression = this.expressionInput.value.trim();
        if (!expression) {
            // If expression input is empty, evaluate the current calculator state
            if (this.operation && this.previousOperand) {
                this.calculate();
                this.updateDisplay();
            }
            return;
        }
        
        try {
            // Replace common math functions and constants
            let processedExpression = expression
                .replace(/sin\(/g, 'Math.sin(Math.PI/180*')
                .replace(/cos\(/g, 'Math.cos(Math.PI/180*')
                .replace(/tan\(/g, 'Math.tan(Math.PI/180*')
                .replace(/log\(/g, 'Math.log10(')
                .replace(/ln\(/g, 'Math.log(')
                .replace(/sqrt\(/g, 'Math.sqrt(')
                .replace(/π/g, 'Math.PI')
                .replace(/pi/g, 'Math.PI')
                .replace(/e/g, 'Math.E')
                .replace(/\^/g, '**')
                .replace(/!/g, '');
            
            // Handle factorial separately if present
            if (expression.includes('!')) {
                // Extract the number before factorial
                const match = expression.match(/(\d+(?:\.\d+)?)\s*!/);
                if (match) {
                    const num = parseFloat(match[1]);
                    const factorialResult = this.factorial(Math.floor(num));
                    processedExpression = processedExpression.replace(/(\d+(?:\.\d+)?)\s*!/, factorialResult);
                }
            }
            
            // Evaluate the expression
            const result = Function(`"use strict"; return (${processedExpression})`)();
            
            // Update calculator display with result
            this.currentOperand = result.toString();
            this.shouldResetScreen = true;
            this.updateDisplay();
            
            // Show expression in previous operand
            this.previousOperandElement.textContent = `${expression} =`;
            
        } catch (error) {
            alert(`Invalid expression: ${error.message}`);
            console.error('Expression evaluation error:', error);
        }
    }
    
    factorial(n) {
        if (n < 0) return NaN;
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }
    
    // Unit Converter Functions
    switchConverterCategory(category) {
        this.currentConverterCategory = category;
        
        // Update active category button
        this.categoryBtns.forEach(btn => {
            if (btn.getAttribute('data-category') === category) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        this.updateConverterUnitOptions();
        this.updateConverterResult();
    }
    
    updateConverterUnitOptions() {
        const units = Object.keys(this.conversionFactors[this.currentConverterCategory]);
        const unitNames = this.unitNames[this.currentConverterCategory];
        
        // Clear current options
        this.converterFromUnit.innerHTML = '';
        this.converterToUnit.innerHTML = '';
        
        // Add new options
        units.forEach(unit => {
            const optionFrom = document.createElement('option');
            optionFrom.value = unit;
            optionFrom.textContent = unitNames[unit];
            this.converterFromUnit.appendChild(optionFrom);
            
            const optionTo = document.createElement('option');
            optionTo.value = unit;
            optionTo.textContent = unitNames[unit];
            this.converterToUnit.appendChild(optionTo);
        });
        
        // Set sensible defaults
        if (this.currentConverterCategory === 'length') {
            this.converterFromUnit.value = 'meter';
            this.converterToUnit.value = 'foot';
        } else if (this.currentConverterCategory === 'weight') {
            this.converterFromUnit.value = 'kilogram';
            this.converterToUnit.value = 'pound';
        } else if (this.currentConverterCategory === 'temperature') {
            this.converterFromUnit.value = 'celsius';
            this.converterToUnit.value = 'fahrenheit';
        }
        
        // Update converter result with new units
        this.updateConverterResult();
    }
    
    updateConverterResult() {
        let value = this.converterValue.value;
        
        // Ensure we have a valid number
        if (value === '' || value === '-' || value === '.') {
            value = '0';
        }
        
        const numValue = parseFloat(value) || 0;
        const fromUnit = this.converterFromUnit.value;
        const toUnit = this.converterToUnit.value;
        const category = this.currentConverterCategory;
        
        let result;
        
        if (category === 'temperature') {
            result = this.convertTemperature(numValue, fromUnit, toUnit);
        } else {
            // For other categories, convert via base unit
            const fromFactor = this.conversionFactors[category][fromUnit];
            const toFactor = this.conversionFactors[category][toUnit];
            
            if (fromFactor && toFactor) {
                result = (numValue * fromFactor) / toFactor;
            } else {
                result = numValue; // Fallback
            }
        }
        
        // Round to reasonable precision
        result = Math.round(result * 1000000) / 1000000;
        this.converterResult.value = result;
    }
    
    convertTemperature(value, fromUnit, toUnit) {
        // Convert to Celsius first
        let celsius;
        
        switch(fromUnit) {
            case 'celsius':
                celsius = value;
                break;
            case 'fahrenheit':
                celsius = (value - 32) * 5/9;
                break;
            case 'kelvin':
                celsius = value - 273.15;
                break;
            default:
                celsius = value;
        }
        
        // Convert from Celsius to target unit
        switch(toUnit) {
            case 'celsius':
                return celsius;
            case 'fahrenheit':
                return (celsius * 9/5) + 32;
            case 'kelvin':
                return celsius + 273.15;
            default:
                return celsius;
        }
    }
    
    swapConverterUnits() {
        const fromUnit = this.converterFromUnit.value;
        const toUnit = this.converterToUnit.value;
        
        this.converterFromUnit.value = toUnit;
        this.converterToUnit.value = fromUnit;
        
        this.updateConverterResult();
    }
    
    // Enhanced Keyboard support
    handleKeyboardInput(e) {
        // Check what's currently focused
        const isExpressionInputFocused = document.activeElement === this.expressionInput;
        const isConverterInputFocused = document.activeElement === this.converterValue;
        
        // Don't prevent default for tab, arrow keys, etc.
        if (e.key === 'Tab' || e.key.startsWith('Arrow') || e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt') {
            return;
        }
        
        // If converter input is focused, allow normal typing
        if (isConverterInputFocused) {
            // Allow normal input in converter field
            return;
        }
        
        // Handle number keys (both top row and numpad)
        if ((e.key >= '0' && e.key <= '9') || (e.key >= 'NumPad0' && e.key <= 'NumPad9')) {
            e.preventDefault();
            const number = e.key.replace('NumPad', '');
            if (isExpressionInputFocused) {
                this.addToExpression(number);
            } else {
                this.appendNumber(number);
                this.updateDisplay();
            }
        }
        
        // Handle decimal point
        if (e.key === '.' || e.key === 'Decimal') {
            e.preventDefault();
            if (isExpressionInputFocused) {
                this.addToExpression('.');
            } else {
                this.addDecimal();
            }
        }
        
        // Handle basic operations
        if (e.key === '+' || e.key === '-') {
            e.preventDefault();
            if (isExpressionInputFocused) {
                this.addToExpression(e.key);
            } else {
                this.chooseOperation(e.key === '+' ? 'add' : 'subtract');
                this.updateDisplay();
            }
        }
        
        if (e.key === '*' || e.key === 'x') {
            e.preventDefault();
            if (isExpressionInputFocused) {
                this.addToExpression('*');
            } else {
                this.chooseOperation('multiply');
                this.updateDisplay();
            }
        }
        
        if (e.key === '/') {
            e.preventDefault();
            if (isExpressionInputFocused) {
                this.addToExpression('/');
            } else {
                this.chooseOperation('divide');
                this.updateDisplay();
            }
        }
        
        // Handle equals/enter
        if (e.key === 'Enter' || e.key === '=') {
            e.preventDefault();
            if (isExpressionInputFocused) {
                this.evaluateExpression();
            } else {
                this.calculate();
                this.updateDisplay();
            }
        }
        
        // Handle clear (Escape)
        if (e.key === 'Escape') {
            e.preventDefault();
            this.clearCalculator();
        }
        
        // Handle backspace
        if (e.key === 'Backspace') {
            e.preventDefault();
            if (isExpressionInputFocused) {
                this.expressionInput.value = this.expressionInput.value.slice(0, -1);
                this.expressionInput.dispatchEvent(new Event('input'));
            } else {
                this.deleteDigit();
            }
        }
        
        // Handle percentage
        if (e.key === '%') {
            e.preventDefault();
            if (isExpressionInputFocused) {
                this.addToExpression('%');
            } else {
                this.calculatePercentage();
            }
        }
        
        // Handle parentheses for expressions
        if (e.key === '(' || e.key === ')') {
            e.preventDefault();
            this.addToExpression(e.key);
        }
        
        // Handle scientific functions with keyboard shortcuts
        if ((e.ctrlKey || e.altKey) && !isExpressionInputFocused) {
            e.preventDefault();
            switch(e.key.toLowerCase()) {
                case 's':
                    this.addToExpression('sin(');
                    break;
                case 'c':
                    this.addToExpression('cos(');
                    break;
                case 't':
                    this.addToExpression('tan(');
                    break;
                case 'l':
                    this.addToExpression('log(');
                    break;
                case 'r':
                    this.addToExpression('sqrt(');
                    break;
                case 'p':
                    this.addToExpression('π');
                    break;
                case 'e':
                    this.addToExpression('Math.E');
                    break;
            }
        }
        
        // Mode switching with keyboard shortcuts
        if (e.ctrlKey && e.shiftKey) {
            e.preventDefault();
            switch(e.key.toLowerCase()) {
                case 'b':
                    this.switchMode('basic');
                    break;
                case 's':
                    this.switchMode('scientific');
                    break;
                case 'c':
                    this.switchMode('converter');
                    break;
            }
        }
    }
}

// Initialize calculator when page loads
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});