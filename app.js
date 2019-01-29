//BUDGET CONTROLLER
var budgetController = (function() {
    
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }
    
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }
    
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
            data.totals[type] = sum;
        });
    }
    
    var data = {
        allItems: {
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        percentage: -1
    }
    
    return {
        addItem: function(type, des, val) {
            var newItem;
            
            //create new id
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            //create a new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            //push this item into our data structure
            data.allItems[type].push(newItem);
            
            //return the new element
            return newItem; 
        },
        
        deleteItem: function(type, ID) {
            var ids, index;
            
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            
            index = ids.indexOf(ID);
        
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
            
            
        },
        
        test: function(){
        console.log(data);
        },
        
        calculateBudget: function() {
            // calculate total income and expences
            calculateTotal('inc');
            calculateTotal('exp');
            
            // calculate the budget
            data.budget = data.totals.inc - data.totals.exp;
            
            // calculate the percentage of the income        //exp = 100, inc = 200 => percentage = (100 / 200) * 100 =  50%
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            } 
            
        },
        
        getBudget: function() {
            return {
                budget: data.budget,
                inc: data.totals.inc,
                exp: data.totals.exp,
                percentage: data.percentage
            }
        }
    }
    
    
})();



var UIController = (function() {
    
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenceLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container'
    };
    
    return {
        getInput: function() {
            return {
            type: document.querySelector(DOMstrings.inputType).value, // will be either inс or exp
            description: document.querySelector(DOMstrings.inputDescription).value,
            value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },
        
        addListItem: function(obj, type) {
            var html, newHtml, element;
            //create html string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            //replace the placeholder text with an actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);
            
            //insert html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        },
        
        deleteListItem: function(selectorID) {
            var el;
            el = document.getElementById(selectorID);
            
            el.parentNode.removeChild(el);
            
            
        },
        
        clearFields: function() {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, value, array) {
                current.value = '';
            });
            
            fieldsArr[0].focus();
        },
        
        getDOMstrings: function() {
            return DOMstrings;
        },
        
        displayBudget: function(obj) {
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.inc;
            document.querySelector(DOMstrings.expenceLabel).textContent = obj.exp;
            
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },
    }

})();



var controller = (function(budgetCtrl, UICtrl) {
    
    var setupEventListeners = function() {
        
        var DOM = UICtrl.getDOMstrings();
        
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
    };
    
    var updateBudget = function() {
            // 1. Calculate the budget
            budgetCtrl.calculateBudget();
        
            // 2. Return the budget
            var budget = budgetCtrl.getBudget();

            // 3. Display the budget on the UI
            UICtrl.displayBudget(budget);
        
            return budget;
    };
    
    
    var ctrlAddItem = function() {
        var input, newItem;
        
        // 1. Get the filled input data
        input = UICtrl.getInput();
        
        
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budgetController
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item, to the UIController
            UICtrl.addListItem(newItem, input.type);

            //4. Clear fields
            UICtrl.clearFields();
            
            //5. Calculate and update the budget
            updateBudget();
        }
    };
    
    var ctrlDeleteItem = function(event) {
        var itemID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            //id example: exp-2
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            //delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            
            //remove the item from the UI
            UICtrl.deleteListItem(itemID);
            
            //update and show the new budget
            updateBudget();
        }
        
    };
    
    return {
        init: function() {
            setupEventListeners();
            UICtrl.displayBudget({
                budget: 0,
                inc: 0,
                exp: 0,
                percentage: -1
            })
        }
        
    };
    
})(budgetController, UIController);

controller.init();






































