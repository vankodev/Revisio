//Всичко е в обект за да е по-организиран кода така.
var todoList = {
  //Създаваме арей с наколко стойности.
  todos: [],
  //Функция в обект се нарича метод.
  addTodo: function(todoText) {
    //Добавяме нова стойност към арея. В случая, обект.
    this.todos.push({
      todoText: todoText,
      completed: false
    });
  },
  changeTodo: function(position, todoText) {
    //Избираме обекта в арея и я заместваме неговото свойство което съдържа текста с нова стойност.
    this.todos[position].todoText = todoText;
  },
  deleteTodo: function(position) {
    //Показваме от коя позиция да отрежем арея и колко стойности да продължава отрязъка. В нашия случай искаме само една стойност да премахнеме.
    this.todos.splice(position, 1);
  },
  toggleCompleted: function(position) {
    //избираме обекта в арея
    var todo = this.todos[position];
    //и му сменяме булеан стойността с обратната
    todo.completed = !todo.completed;
  },
  toggleAll: function() {
    var totalTodos = this.todos.length;
    var completedTodos = 0;
    //Get number of completed todos.
    this.todos.forEach(function(todo) {
      if (todo.completed === true) {
        completedTodos++;
      }
    });

    this.todos.forEach(function(todo) {
      // If everything is true, make everything false
      if (completedTodos === totalTodos) {
        todo.completed = false;
      // else make everything true
      } else {
        todo.completed = true;
      }
    });
  }
};

var handlers = {
  toggleAll: function() {
    todoList.toggleAll();
    view.displayTodos();
  },
  addTodo: function() {
    //добавя стойността от полето todoList обекта
    var addTodoTextInput = document.getElementById("addTodoTextInput");
    todoList.addTodo(addTodoTextInput.value);
    addTodoTextInput.value = '';
    view.displayTodos();
  },
  changeTodo: function () {
    //взимаме позицията и стойността от DOM-а и ги променяме в обекта с листа
    var changeTodoPositionInput = document.getElementById("changeTodoPositionInput");
    var changeTodoTextInput = document.getElementById("changeTodoTextInput");
    todoList.changeTodo(changeTodoPositionInput.valueAsNumber, changeTodoTextInput.value);
    changeTodoPositionInput.value = '';
    changeTodoTextInput.value = '';
    view.displayTodos();
  },
  deleteTodo: function(position) {
    todoList.deleteTodo(position);
    view.displayTodos();
  },
  toggleCompleted: function() {
    var toggleCompletedPositionInput = document.getElementById("toggleCompletedPositionInput");
    todoList.toggleCompleted(toggleCompletedPositionInput.valueAsNumber);
    toggleCompletedPositionInput.value = '';
    view.displayTodos();
  }
};

var view = {
  displayTodos: function() {
    //selects the ul in the html
    var todosUl = document.querySelector('ul');
    //clears the list
    todosUl.innerHTML = '';
    //iterates over the array and ads it to the html list
    todoList.todos.forEach(function(todo, position) {
      var todoLi = document.createElement('li');
      var todoTextWithCompletion = '';
      //creates text with completion
      if (todo.completed === true) {
        todoTextWithCompletion = '(x) ' + todo.todoText; 
      } else {
        todoTextWithCompletion = '( ) ' + todo.todoText; 
      }
      todoLi.id = position;
      //ads the text with completion to the list
      todoLi.textContent = todoTextWithCompletion;
      todoLi.appendChild(this.createDeleteButton());
      todosUl.appendChild(todoLi);
    }, this);
  },
  createDeleteButton: function() {
    var deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'deleteButton';
    return deleteButton;
  },
  setUpEventListeners: function() {
    var todosUl = document.querySelector('ul');
    todosUl.addEventListener('click', function(event) {
      //Get the element that was clicked on.
      var elementClicked = event.target;
      //Check if elementClicked is a delete button.
      if (elementClicked.className === 'deleteButton') {
        handlers.deleteTodo(parseInt(elementClicked.parentNode.id));
      }
    });  
  }
};

view.setUpEventListeners();