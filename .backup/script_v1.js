//Всичко е в обект за да е по-организиран кода така.
var todoList = {
  //Създаваме арей с наколко стойности.
  todos: [],
  //Функция в обект се нарича метод.
  displayTodos: function() {
    // if there are no todos print message
    if (this.todos.length === 0) {
      console.log("Your todo list is empty!");
    } else {
      // else print todos in the console
      console.log('My Todos: ');
      for (var i = 0; i < this.todos.length; i++) {
        //check if .completed is true and print with () else (x)
        if (this.todos[i].completed) {
          console.log('(x)', this.todos[i].todoText);
        } else {
          console.log('( )', this.todos[i].todoText);
        }
      }
    }
  },
  addTodo: function(todoText) {
    //Добавяме нова стойност към арея. В случая, обект.
    this.todos.push({
      todoText: todoText,
      completed: false
    });
    this.displayTodos();
  },
  changeTodo: function(position, todoText) {
    //Избираме обекта в арея и я заместваме неговото свойство което съдържа текста с нова стойност.
    this.todos[position].todoText = todoText;
    this.displayTodos();
  },
  deleteTodo: function(position) {
    //Показваме от коя позиция да отрежем арея и колко стойности да продължава отрязъка. В нашия случай искаме само една стойност да премахнеме.
    this.todos.splice(position, 1);
    this.displayTodos();
  },
  toggleCompleted: function(position) {
    //избираме обекта в арея
    var todo = this.todos[position];
    //и му сменяме булеан стойността с обратната
    todo.completed = !todo.completed;
    this.displayTodos();
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
    this.displayTodos();
  }
};

