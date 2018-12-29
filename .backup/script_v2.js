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
    for (var i = 0; i < totalTodos; i++) {
      if(this.todos[i].completed === true) {
        completedTodos++
      }
    }
    // If everything is true, make everything false
    if (completedTodos === totalTodos) {
      for (var i = 0; i < totalTodos; i++) {
        this.todos[i].completed = false;
      }
    // else make everything true
    } else {
      for (var i = 0; i < totalTodos; i++) {
        this.todos[i].completed = true;
      }
    }
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
  deleteTodo: function() {
    var deleteTodoPositionInput = document.getElementById("deleteTodoPositionInput");
    todoList.deleteTodo(deleteTodoPositionInput.valueAsNumber);
    view.displayTodos();
  },
  toggleCompleted: function() {
    var toggleCompletedPositionInput = document.getElementById("toggleCompletedPositionInput");
    todoList.toggleCompleted(toggleCompletedPositionInput.valueAsNumber);
    view.displayTodos();
  }
};

var view = {
  displayTodos: function() {
    //selects the ul in the html
    var todosUl = document.querySelector('ul');
    //clears the list
    todosUl.innerHTML = '';
    //iterates over the array and ads it to the list
    for (var i = 0; i < todoList.todos.length; i++) {
      var todoLi = document.createElement('li');
      var todo = todoList.todos[i];
      var todoTextWithCompletion = '';
      //creates text with completion
      if (todo.completed === true) {
        todoTextWithCompletion = '(x) ' + todo.todoText; 
      } else {
        todoTextWithCompletion = '( ) ' + todo.todoText; 
      }
      //ads the text with completion to the list
      todoLi.textContent = todoTextWithCompletion;
      todosUl.appendChild(todoLi);
    }
  }
};