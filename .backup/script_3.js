var textEditor = {
  textArray: [],
  // Split text into tokens and pushes them in the textArray
  tokenizeText: function(text) {
    this.textArray = [];
    var tokenizeParagraphs = /\n/;
    var tokenizeSentences = /(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s/;
    var paragraphArray = text.split(tokenizeParagraphs);
    for (var i = 0; i < paragraphArray.length; i++) {
      if (paragraphArray[i] !== '') {
        var sentenceArray = paragraphArray[i].split(tokenizeSentences);
        this.addSentence('<P>');
        for (var j = 0; j < sentenceArray.length; j++) {
          this.addSentence(sentenceArray[j]);
        }
      }
    }
    this.textArray.shift();
  },
  addSentence: function(sentence) {
    if (sentence !== '') {
      this.textArray.push([sentence]);
    }
  },
  editSentence: function(sentencePosition, sentence) {
    if (sentence !== '') {
      this.textArray[sentencePosition].push(sentence);
    }
  },
  selectBestSentence: function(sentencePosition, versionPosition) {
    this.textArray[sentencePosition].move(versionPosition, - 1);
  },
  moveSentenceUp: function(position) {
    if (position > 0) {
      this.textArray.move(position, position - 1);
    } 
  },
  moveSentenceDown: function(position) {
    if (position < this.textArray.length - 1) {
      this.textArray.move(position, position + 1);
    }
  },
  deleteSentence: function(position) {
    this.textArray.splice(position, 1);
  }
};

var handlers = {
  tokenizeText: function() {
    // Takes the text from the textarea
    var text = document.querySelector('textarea').value;
    textEditor.tokenizeText(text);
    view.displaySentence();
  },
  addSentence: function(sentence) {
    textEditor.addSentence(sentence);
    document.querySelector('#addSentenceInput').value = '';
    view.displaySentence();
  },
  editSentence: function(sentencePosition, sentence) {
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
  },
  copyToClipboard: function() {
    var textArea = document.querySelector('textarea');
    textArea.select();
    document.execCommand('copy');
  }
};

var view = {
  displaySentence: function() {
    var editOl = document.querySelector('ol');
    editOl.innerHTML = '';
    for (var i = 0; i < textEditor.textArray.length; i++) {
      var editUl = document.createElement('ul');
      editUl.className = i;
      editUl.tabIndex = -1;
      editOl.appendChild(editUl);
      editUl.appendChild(this.createDeleteButton());
      editUl.appendChild(this.createEditButton());
      editUl.appendChild(this.createMoveUpButton());
      editUl.appendChild(this.createMoveDownButton());
      for (var j = 0; j < textEditor.textArray[i].length; j++) {
        var editLi = document.createElement('li');
        editLi.className = j;
        var sentence = textEditor.textArray[i][j];
        editLi.textContent = sentence;
        if (sentence == '<P>') {
          var hr = document.createElement('hr');
          editUl.appendChild(hr);
        } else {
          editUl.appendChild(editLi);
        }
        // editLi.appendChild(this.createBestButton());
      }
    }
  },
  previewText: function() {
    var textArea = document.querySelector('textarea');
    var joinedText = '';
    // Join the best sentences into joinedText variable
    for (var i = 0; i < textEditor.textArray.length; i++) {
      var sentence = textEditor.textArray[i];
      if (sentence == '<P>') {
        joinedText = joinedText.slice(0, -1); //removes last char in the string
        joinedText = joinedText + '\n\n';
      } else {
        joinedText = joinedText + sentence[sentence.length - 1] + ' ';
      }
    }
    joinedText = joinedText.slice(0, -1);
    textArea.value = joinedText;
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
  createEditSentenceInput: function() {
    var editSentenceInput = document.createElement('input');
    editSentenceInput.className = 'editSentenceInput';
    editSentenceInput.type = 'text';
    return editSentenceInput;

  },
  setUpEventListeners: function() {
    // Listening for clicks in the edit window.
    var editor = document.getElementById('editor');
    editor.addEventListener('click', function() {
      if (event.target.className === 'deleteButton') { // event.target is the clicked element
        handlers.deleteSentence(parseInt(event.target.parentNode.className)); // parseInt converts string into a number
      } else if (event.target.className === 'moveUpButton') {
        handlers.moveSentenceUp(parseInt(event.target.parentNode.className));
      } else if (event.target.className === 'moveDownButton') {
        handlers.moveSentenceDown(parseInt(event.target.parentNode.className));
      } else if (event.target.className === 'bestButton') {
        var sentencePosition = parseInt(event.target.parentNode.parentNode.className);
        var versionPosition = parseInt(event.target.parentNode.className); 
        handlers.selectBestSentence(sentencePosition, versionPosition);
      } else if (event.target.className === 'editButton') {
        // Delete existing input elements in the list
        var editSentenceInput = document.querySelector('ul input');
        if (editSentenceInput != null) {
          editSentenceInput.parentNode.removeChild(editSentenceInput);
        }

        // Creates input element on the selected ul
        var ulIndex = parseInt(event.target.parentNode.className);
        var editUl = document.querySelector('ul.' + CSS.escape(ulIndex));
        editUl.appendChild(view.createEditSentenceInput());
        editSentenceInput = document.querySelector('ul input');
        editSentenceInput.focus();

        // Adds the sentence when Enter key is pressed
        editSentenceInput.addEventListener('keypress', function (e) {
          var key = e.which || e.keyCode;
          if (key === 13) { // 13 is enter
            handlers.editSentence(ulIndex, editSentenceInput.value);
          } else if (key === 27) { // esc doesn't work!!!
            handlers.editSentence(ulIndex, '');
          }
        });
      }
    });
    // On double click choose best sentence.
    editor.addEventListener('dblclick', function() {
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

    // document.activeElement.addEventListener('keypress', function(e) {
    //   var key = e.which || e.keyCode;
    //   if (key === 117) { // 38 is up arrow key
    //     if (document.activeElement.tagName == 'UL') {
    //       handlers.moveSentenceUp(parseInt(document.activeElement.className));
    //     }

    //   } else if (key === 100) { // 40 is down arrow key
    //     if (document.activeElement.tagName == 'UL') {
    //       handlers.moveSentenceDown(parseInt(document.activeElement.className));
    //     }

    //   }

    // });

    //Това трябваше да работи. Отказах се защото focus() не ще да бачка.

    // editor.addEventListener("keydown", function (event) {
    //   if (event.defaultPrevented) {
    //     return; // Do nothing if the event was already processed
    //   }
      
      
    //   switch (event.key) {
    //     case "Down": // IE specific value
    //     case "ArrowDown":
    //       // Do something for "down arrow" key press.
    //       if (document.activeElement.tagName == 'UL') {
    //         ulIndex = parseInt(document.activeElement.className);
    //         editUl = document.querySelector('ul.' + CSS.escape(ulIndex + 1));
    //         handlers.moveSentenceDown(ulIndex);
    //         console.log(editUl);
    //         editUl.focus();
    //       }
    //       break;
    //     case "Up": // IE specific value
    //     case "ArrowUp":
    //       // Do something for "up arrow" key press.
    //       if (document.activeElement.tagName == 'UL') {
    //         handlers.moveSentenceUp(ulIndex);
    //         editUl.focus();
    //       }
    //       break;
    //     case "Enter":
    //       // Do something for "enter" or "return" key press.
    //       break;
    //     case "Escape":
    //       // Do something for "esc" key press.
    //       document.activeElement.blur();
    //       break;
    //     default:
    //       return; // Quit when this doesn't handle the key event.
    //   }
    
    //   // Cancel the default action to avoid it being handled twice
    //   event.preventDefault();
    // }, true);

  }
};

view.setUpEventListeners();



