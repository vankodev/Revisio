var textEditor = {
  paragraph: [],
  addSentence: function(sentence) {
    if (sentence !== '') {
      this.paragraph.push([sentence]);
    }
  },
  editSentence: function(sentencePosition, sentence) {
    if (version !== '') {
      this.paragraph[sentencePosition].push(sentence);
    }
  },
  selectBestSentence: function(sentencePosition, versionPosition) {
    this.paragraph[sentencePosition].move(versionPosition, - 1);
  },
  moveSentenceUp: function(position) {
    if (position > 0) {
      this.paragraph.move(position, position - 1);
    } 
  },
  moveSentenceDown: function(position) {
    if (position < this.paragraph.length - 1) {
      this.paragraph.move(position, position + 1);
    }
  },
  deleteSentence: function(position) {
    this.paragraph.splice(position, 1);
  }
};

var handlers = {
  addSentence: function(sentence) {
    textEditor.addSentence(sentence);
    document.querySelector('#addSentenceInput').value = '';
    view.displaySentence();
  },
  editSentence: function(sentencePosition, sentence) {
    // Посочва елементите в документа
    var editSentenceInput = document.getElementById('editSentenceInput');
    var editSentencePositionInput = document.getElementById('editSentencePositionInput');
    // Добавя стойностите на елементите в променливи
    var position = editSentencePositionInput.valueAsNumber - 1;
    var version = editSentenceInput.value;
    // Извиква фунцията за добавяне на нова версия на изречението с добавените параметри
    textEditor.editSentence(sentencePosition, sentence);
    view.displaySentence();
  },
  deleteSentence: function(position) {
    textEditor.deleteSentence(position);
    view.displaySentence();
  },
  selectBestSentence: function(sentencePosition, versionPosition) {
    textEditor.selectBestSentence(sentencePosition, versionPosition);
    view.displaySentence();
  },
  moveSentenceUp: function(position) {
    textEditor.moveSentenceUp(position);
    view.displaySentence();
  },
  moveSentenceDown: function(position) {
    textEditor.moveSentenceDown(position);
    view.displaySentence();
  }  
};

var view = {
  displaySentence: function() {
    var editOl = document.querySelector('ol');
    editOl.innerHTML = '';
    for (var i = 0; i < textEditor.paragraph.length; i++) {
      var editUl = document.createElement('ul');
      editUl.className = i;
      editOl.appendChild(editUl);
      editUl.appendChild(this.createDeleteButton());
      editUl.appendChild(this.createEditButton());
      editUl.appendChild(this.createMoveUpButton());
      editUl.appendChild(this.createMoveDownButton());
      for (var j = 0; j < textEditor.paragraph[i].length; j++) {
        var editLi = document.createElement('li');
        editLi.className = j;
        var sentence = textEditor.paragraph[i][j];
        editLi.textContent = sentence;
        editUl.appendChild(editLi);
        // editLi.appendChild(this.createBestButton());
      }
    }
  },
  showParagraph: function() {
    var textArea = document.querySelector('textarea');
    var joinedText = '';

    // Join the best sentences into joinedText variable
    for (var i = 0; i < textEditor.paragraph.length; i++) {
      var sentence = textEditor.paragraph[i];
      joinedText = joinedText + ' ' + sentence[sentence.length - 1];
    }

    textArea.textContent = joinedText;
  },
  createDeleteButton: function() {
    var deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'deleteButton';
    return deleteButton;
  },
  createEditButton: function() {
    var editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.className = 'editButton';
    return editButton;
  },
  createMoveUpButton: function() {
    var moveUpButton = document.createElement('button');
    moveUpButton.textContent = 'Move Up';
    moveUpButton.className = 'moveUpButton';
    return moveUpButton;
  },
  createMoveDownButton: function() {
    var moveDownButton = document.createElement('button');
    moveDownButton.textContent = 'Move Down';
    moveDownButton.className = 'moveDownButton';
    return moveDownButton;
  },
  createBestButton: function() {
    var bestButton = document.createElement('button');
    bestButton.textContent = 'Best';
    bestButton.className = 'bestButton';
    return bestButton;
  },
  setUpEventListeners: function() {
    // Listening for clicks in the edit window.
    var editOl = document.querySelector('ol');
    editOl.addEventListener('click', function() {
      //Get the element that was clicked on.
      var elementClicked = event.target;
      if (elementClicked.className === 'deleteButton') {
        handlers.deleteSentence(parseInt(elementClicked.parentNode.className)); // parseInt превръща стринг в число
      } else if (elementClicked.className === 'moveUpButton') {
        handlers.moveSentenceUp(parseInt(elementClicked.parentNode.className));
      } else if (elementClicked.className === 'moveDownButton') {
        handlers.moveSentenceDown(parseInt(elementClicked.parentNode.className));
      } else if (elementClicked.className === 'bestButton') {
        var sentencePosition = parseInt(elementClicked.parentNode.parentNode.className);
        var versionPosition = parseInt(elementClicked.parentNode.className); 
        handlers.selectBestSentence(sentencePosition, versionPosition);
      } else if (elementClicked.className === 'editButton') {
        var sentencePosition = ;
        var sentence = ;
        handlers.editSentence(sentencePosition, sentence);
      }
    });
    editOl.addEventListener('dblclick', function() {
      var sentencePosition = parseInt(event.target.parentNode.className);
      var versionPosition = parseInt(event.target.className); 
      handlers.selectBestSentence(sentencePosition, versionPosition);
    });

    // Listening for Enter key to add the new sentence.
    var addSentenceInput = document.querySelector('#addSentenceInput');
    addSentenceInput.addEventListener('keypress', function (e) {
      var key = e.which || e.keyCode;
      if (key === 13) { // 13 is enter
        handlers.addSentence(addSentenceInput.value);
      }
    });
  }
};

view.setUpEventListeners();


