var textEditor = {
  paragraph: [],

  // Add sentence to the paragraph.
  addSentence: function(sentence) {
    if (sentence !== '') {
      this.paragraph.push([sentence]);
      view.displaySentence();
    }
  },

  // Add sentence version.
  addVersion: function(position, version) {
    if (version !== '') {
      this.paragraph[position].push(version);
      view.displaySentence();
    }
  },

  // Select best version of the sentence.
  selectBestSentence: function(sentence, version) {
    this.paragraph[sentence].move(version, - 1);
    view.displaySentence();
  },

  // Move sentence up.
  moveSentenceUp: function(position) {
    if (position > 0) {
      this.paragraph.move(position, position - 1);
      view.displaySentence();
    } 
  },

  // Move sentence down.
  moveSentenceDown: function(position) {
    if (position < this.paragraph.length - 1) {
      this.paragraph.move(position, position + 1);
      view.displaySentence();
    }
  },

  // Delete sentence.
  deleteSentence: function(position) {
    this.paragraph.splice(position, 1);
    view.displaySentence();
  },

  // Display the paragraph array.
  displayParagraph: function() {
    this.paragraph.forEach(function(element) {
      console.log(element);
    });
  }
};

var handlers = {
  addSentence: function() {
    var addSentenceInput = document.getElementById('addSentenceInput');
    textEditor.addSentence(addSentenceInput.value);
    addSentenceInput.value = '';
  },
  addVersion: function() {
    // Посочва елементите в документа
    var addVersionInput = document.getElementById('addVersionInput');
    var addVersionPositionInput = document.getElementById('addVersionPositionInput');
    // Добавя стойностите на елементите в променливи
    var position = addVersionPositionInput.valueAsNumber - 1;
    var version = addVersionInput.value;
    // Извиква фунцията за добавяне на нова версия на изречението с добавените параметри
    textEditor.addVersion(position, version);
    // Изчиства стойностите в елементите на документа
    addVersionPositionInput.value = '';
    addVersionInput.value = '';
  },
  deleteSentence: function() {
    var deleteSentencePositionInput = document.getElementById('deleteSentencePositionInput');
    textEditor.deleteSentence(deleteSentencePositionInput.valueAsNumber - 1);
    deleteSentencePositionInput.value = '';
  },
  selectBestSentence: function() {
    var sentence = document.getElementById('selectBestSentencePositionInput').valueAsNumber - 1;
    var version = document.getElementById('selectBestVersionPositionInput').valueAsNumber - 1;
    textEditor.selectBestSentence(sentence, version);
  },
  moveSentenceUp: function() {
    var position = document.getElementById('moveSentenceUpInput').valueAsNumber - 1;
    textEditor.moveSentenceUp(position);
  },
  moveSentenceDown: function() {
    var position = document.getElementById('moveSentenceDownInput').valueAsNumber - 1;
    textEditor.moveSentenceDown(position);
  }  
};

var view = {
  displaySentence: function() {
    var editOl = document.querySelector('ol');
    editOl.innerHTML = '';

    for (var i = 0; i < textEditor.paragraph.length; i++) {
      var editUl = document.createElement('ul');
      editUl.textContent = (1+i) + '-----------------------------';
      editOl.appendChild(editUl);
      
      for (var j = 0; j < textEditor.paragraph[i].length; j++) {
        var editLi = document.createElement('li');
        var sentence = textEditor.paragraph[i][j];
        editLi.textContent = sentence;
        editUl.appendChild(editLi);
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
  }
};