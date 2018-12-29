//временно генерира превю текст за тестване. 
document.querySelector('textarea').value = 'There are people who think that the type should be expressive—they have a different point of view from mine. I don’t think type should be expressive at all. I can write the word ‘dog’ with any typeface, and it doesn’t have to look like a dog. But there are people who, when they write ‘dog’ think it should bark, you know? So there are all kinds of people, and therefore, there will always people who will find work designing funky type, and it could be that all of a sudden a funky typeface takes the world by storm, but I doubt it. I’m a strong believer in intellect and intelligence, and I’m a strong believer in intellectual elegance, so that, I think, will prevent vulgarity from really taking over the world more than it has already.\nSome defenses need to be put up, and I think, actually, that the more culture spreads out and the more refined education becomes, the more refined the sensibility about type becomes, too. The more uneducated the person is who you talk to, the more he likes horrible typefaces.\nLook at comics like The Hulk, things like that. It’s not even type. Look at anything which is elegant and refined; you find elegant and refined typefaces. The more culture is refined in the future—this might take a long time, but eventually education might prevail over ignorance—the more you’ll find good typography. I’m convinced of that.';



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
    this.textArray.move(position, position - 1);
  },
  moveSentenceDown: function(position) {
    this.textArray.move(position, position + 1);
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
    var addSentenceInput = document.querySelector('#addSentenceInput');
    if (addSentenceInput) { // !!! временно за да не ми дава грешки, последната тестова функция го активира в неподходящо време
      addSentenceInput.value = '';
    }
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
    var editor = document.getElementById('editor');
    editor.innerHTML = '';
    for (var i = 0; i < textEditor.textArray.length; i++) {
      var editUl = document.createElement('ul');
      editUl.className = i;
      editUl.tabIndex = -1;
      editor.appendChild(editUl);
      //да показва само последнате версия на изречението
      var editLi = document.createElement('li');
      var sentence = textEditor.textArray[i];
      var bestSentence = sentence[sentence.length - 1];
      editLi.textContent = bestSentence;

      if (sentence == '<P>') {
        var hr = document.createElement('hr');
        editUl.appendChild(hr);
      } else {
        editUl.appendChild(editLi);
      }

      //този код да ходи в view.editSentence
      // for (var j = 0; j < textEditor.textArray[i].length; j++) { 
      //   var editLi = document.createElement('li');
      //   editLi.className = j;
      //   var sentence = textEditor.textArray[i][j];
      //   editLi.textContent = sentence;
      //   if (sentence == '<P>') {
      //     var hr = document.createElement('hr');
      //     editUl.appendChild(hr);
      //   } else {
      //     editUl.appendChild(editLi);
      //   }
      // }
    }
    view.editorEventListeners();
  },
  editSentence: function() {

    //премахни първо view.editorEventListeners();
    view.editSentenceEventListeners();





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

  createSentence: function(event) {
    if (event.defaultPrevented) {
      return; // Do nothing if the event was already processed
    }

    switch (event.key) {
      case "Enter":
        var addSentenceInput = document.querySelector('#sentenceInput');
        handlers.addSentence(addSentenceInput.value);
        break;
      default:
        return; // Quit when this doesn't handle the key event.
    } 


    // Cancel the default action to avoid it being handled twice
    event.preventDefault();
  },

  //бутоните ще се премахнат евентуално защото са ненужни
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

  //функцията за създаване на инпут за изречение ще е една.
  createSentenceInput: function() {
    var sentenceInput = document.createElement('input');
    sentenceInput.id = 'sentenceInput';
    sentenceInput.type = 'text';
    sentenceInput.addEventListener('keydown', this.createSentence(event), false);
    return sentenceInput;
  },

  //това ще трябва да се премахне евентуално
  setUpEventListeners: function() {
    // Listening for clicks in the editor window.
    var editor = document.getElementById('editor');
    editor.addEventListener('click', function() {
      if (event.target.className === 'deleteButton') { // event.target is the clicked element
        handlers.deleteSentence(parseInt(event.target.parentNode.className)); // parseInt converts string into a number
      }
      if (event.target.className === 'moveUpButton') {
        handlers.moveSentenceUp(parseInt(event.target.parentNode.className));
      }
      if (event.target.className === 'moveDownButton') {
        handlers.moveSentenceDown(parseInt(event.target.parentNode.className));
      }
      if (event.target.className === 'bestButton') {
        var sentencePosition = parseInt(event.target.parentNode.parentNode.className);
        var versionPosition = parseInt(event.target.parentNode.className); 
        handlers.selectBestSentence(sentencePosition, versionPosition);
      }
      if (event.target.className === 'editButton') {
        // Delete existing input elements in the list
        var editSentenceInput = document.querySelector('ul input');
        if (editSentenceInput != null) {
          editSentenceInput.parentNode.removeChild(editSentenceInput);
        }

        // Creates input element on the selected ul
        var ulIndex = parseInt(event.target.parentNode.className); // избираме индекса
        var editUl = document.querySelector('ul.' + CSS.escape(ulIndex)); // избираме UL елемента по индекс
        editUl.appendChild(view.createEditSentenceInput()); // добавяме нов инпут елемент в UL елемента
        editSentenceInput = document.querySelector('ul input'); // избираме го
        editSentenceInput.focus(); // фокусираме се върху него

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
  
    // Listening for pressed key in the editor
    editor.addEventListener('keydown', function (event) {
      if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
      }

      var ulIndex;
      var editUl; 

      switch (event.key) {
        case "Up": // IE specific value
        case "ArrowUp":
          if (document.activeElement.tagName === 'UL') {
            ulIndex = parseInt(document.activeElement.className);
            if (ulIndex > 0) { // if the selected sentence is not the first one
              if (event.getModifierState('Alt')) { // if modificator key alt is pressed
                handlers.moveSentenceUp(ulIndex); // move sentence up
              }  
              editUl = document.querySelector('ul.' + CSS.escape(ulIndex - 1)); // gets upper element
              if (editUl.firstChild.tagName === 'HR') {  // if the upper element is line for new paragraph
                editUl = document.querySelector('ul.' + CSS.escape(ulIndex - 2));
              }
              editUl.focus();
            }
          }
          break;
        case "Down": // IE specific value
        case "ArrowDown":
          if (document.activeElement.tagName === 'UL') {
            ulIndex = parseInt(document.activeElement.className);
            if (ulIndex < textEditor.textArray.length - 1) { //if the selected sentence is not the last one
              if (event.getModifierState("Alt")) {
                handlers.moveSentenceDown(ulIndex);
              }
              editUl = document.querySelector('ul.' + CSS.escape(ulIndex + 1));
              if (editUl.firstChild.tagName === 'HR') {
                editUl = document.querySelector('ul.' + CSS.escape(ulIndex + 2));
              }
              editUl.focus();
            }
          }
          break;
        case "Enter":
          if (event.getModifierState('Alt')) { // if alt + enter is pressed adds new sentence.

            // Delete existing input elements in the list.
            var addSentenceInput = document.querySelector('#sentenceInput');
            if (addSentenceInput != null) {
              addSentenceInput.parentNode.removeChild(addSentenceInput);
            }

            // Creates input element after the selected ul.
            editUl = document.activeElement;
            editUl.after(view.createSentenceInput()); // Adds new input element after the selected element.
            addSentenceInput = document.querySelector('#sentenceInput');
            addSentenceInput.focus();



          } else { //if only enter is pressed edits the sentence


          }

          
          // Показва версиите на изреченията.

          // Esc скрива версиите на изречението и се връща в редактора.

          // Със стрелки нагоре и надолу да се фокусира върху версиите.

          // Shift + B избира най-доброто изречение.




          break;
        case "Escape":
          // Deselects the sentence
          document.activeElement.blur();
          break;
        case "Delete":
          // Deletes the sentence
          if (document.activeElement.tagName === 'UL') {
            ulIndex = parseInt(document.activeElement.className);
            handlers.deleteSentence(ulIndex);
            editUl = document.querySelector('ul.' + CSS.escape(ulIndex));
            editUl.focus();

          }
          break;
        default:
          return; // Quit when this doesn't handle the key event.
      }
    
      // Cancel the default action to avoid it being handled twice
      event.preventDefault();
    }, true);

    // On double click choose best sentence.
    editor.addEventListener('dblclick', function() {
      var sentencePosition = parseInt(event.target.parentNode.className);
      var versionPosition = parseInt(event.target.className); 
      handlers.selectBestSentence(sentencePosition, versionPosition);
    });


    // Listening for Enter key to add the new sentence.
    // var addSentenceInput = document.querySelector('#sentenceInput');
    // addSentenceInput.addEventListener('keypress', function (e) {
    //   addSentenceInput = document.querySelector('#sentenceInput');
    //   var key = e.which || e.keyCode;
    //   if (key === 13) { // 13 is enter
    //     handlers.addSentence(addSentenceInput.value);
    //   } else if (key === 27) { // esc doesn't work!!!
    //     addSentenceInput.parentNode.removeChild(addSentenceInput);
    //   }
    // });





    // Adds the sentence to the list.
    // handlers.addSentence(editSentenceInput.value);

    // Adds the sentence when Enter key is pressed
    // var editSentenceInput = document.querySelector('.')
    // editSentenceInput.addEventListener('keypress', function (e) {
    //   var key = e.which || e.keyCode;
    //   if (key === 13) { // 13 is enter
    //     handlers.addSentence(editSentenceInput.value);
    //   } else if (key === 27) { // esc doesn't work!!!
    //     editSentenceInput.parentNode.removeChild(editSentenceInput);
    //   }
    // });

  },

  //това също ще трябва да се премахне евентуално
  inputEventListeners: function() {
    // Listening for Enter key to add the new sentence.
    var addSentenceInput = document.querySelector('#addSentenceInput');
    addSentenceInput.addEventListener('keypress', function (e) {
      var key = e.which || e.keyCode;
      if (key === 13) { // 13 is enter
        handlers.addSentence(addSentenceInput.value);
      } else if (key === 27) { // esc doesn't work!!!
        addSentenceInput.parentNode.removeChild(addSentenceInput);
      }
    });
  },

  editorEventListeners: function () {
    //тук ще е кода за добавяне, триене, и разместване на изречения.
  
  },

  editSentenceEventListeners: function () {
    //тук ще е кода за добавяне и триене на нови версии на изреченията, както и за избиране на най-добрата версия.
  }
};







// //временно създава арей за тестване
// for (var i = 0; i < 3; i++) {
//   sentence = 'This is literaly sentence number ' + (i + 1);
//   handlers.addSentence(sentence);
//   for (var j = 1; j < 3; j++) {
//     version = 'This is my version number ' + j;
//     handlers.editSentence(i, version);
//   }
// }


view.setUpEventListeners();