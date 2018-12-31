

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
        this.textArray.push(['<P>']);
        for (var j = 0; j < sentenceArray.length; j++) {
          this.textArray.push([sentenceArray[j]]);
        }
      }
    }
    this.textArray.shift();
  },

  addSentence: function(position, sentence) {
    if (sentence !== '') {
      this.textArray.splice(position, 0, [sentence]);
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
    view.displayText();
  },

  addSentence: function(position, sentence) {
    textEditor.addSentence(position, sentence);
    view.displayText();
  },

  editSentence: function(position, sentence) {
    textEditor.editSentence(position, sentence);
    view.displayText();
  },

  deleteSentence: function(position) {
    textEditor.deleteSentence(position);
    view.displayText();
  },

  selectBestSentence: function(sentencePosition, versionPosition) {
    textEditor.selectBestSentence(sentencePosition, versionPosition);
    view.displayText();
  },

  moveSentenceUp: function(target) {
    var sentencePosition = parseInt(target.className);
    textEditor.moveSentenceUp(sentencePosition);
    view.displayText();
  },

  moveSentenceDown: function(position) {
    textEditor.moveSentenceDown(position);
    view.displayText();
  },

  copyToClipboard: function() {
    var textArea = document.querySelector('textarea');
    textArea.select();
    document.execCommand('copy');
  }
};

var view = {
  displayText: function() {
    var editor = document.getElementById('editor');
    editor.innerHTML = '';
    for (var i = 0; i < textEditor.textArray.length; i++) {
      var sentenceUl = document.createElement('ul');
      sentenceUl.className = i;
      sentenceUl.tabIndex = -1;
      editor.appendChild(sentenceUl);
      // Показва само последнате версия на изречението
      var sentenceLi = document.createElement('li');
      var sentence = textEditor.textArray[i];
      var bestSentence = sentence[sentence.length - 1];
      sentenceLi.textContent = bestSentence;
      if (sentence == '<P>') {
        var separator = document.createElement('hr');
        sentenceUl.appendChild(separator);
      } else {
        sentenceUl.appendChild(sentenceLi);
      }
    }
  },

  displayEditSentence: function() {

      // TODO This code is copied from displayText, so make it work
      for (var j = 0; j < textEditor.textArray[i].length; j++) { 
        var editLi = document.createElement('li');
        editLi.className = j;
        var sentence = textEditor.textArray[i][j];
        editLi.textContent = sentence;
        if (sentence == '<P>') {
          var separator = document.createElement('hr');
          editUl.appendChild(separator);
        } else {
          editUl.appendChild(editLi);
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

  createSentenceInput: function() {
    var sentenceInput = document.createElement('input');
    sentenceInput.id = 'sentenceInput';
    sentenceInput.type = 'text';
    // sentenceInput.onblur = 'view.addInputText()';
    return sentenceInput;
  },

  // addInputText: function() {
  //   var sentenceInput = document.querySelector('#sentenceInput');
  //   sentencePosition = parseInt(sentenceInput.nextSibling.className);
  //   handlers.addSentence(sentencePosition, sentenceInput.value);
  // },

  setUpEventListeners: function() {
    var editor = document.getElementById('editor');
    // editor.addEventListener('click', function() {
    //   var target = event.target;
    //   if (target.matches('ul')) {
    //     var sentenceInput = document.querySelector('#sentenceInput');
    //     if (sentenceInput) {
    //       sentenceInput.parentNode.removeChild(sentenceInput);
    //     }
    //   }
    // });

    editor.addEventListener('blur', function() {
      var target = event.target;
      if (target.matches('#sentenceInput')) {
        view.createSentenceFromInput(target);
      }
    }, true);
    
    editor.addEventListener('keydown', function(event) {
      var target = event.target;
      var sentencePosition = parseInt(target.className);
      var sentenceSelected; // Selects the moved element
      
      if (event.defaultPrevented) {
        return;
      }

      switch (event.key) {
        case "Up":
        case "ArrowUp":
          if (target.matches('ul')) {
            if (sentencePosition > 0) { // if the selected sentence is not the first one
              if (event.getModifierState('Alt')) { // if modificator key alt is pressed
                handlers.moveSentenceUp(target); // move sentence up
              }  
              sentenceSelected = document.querySelector('ul.' + CSS.escape(sentencePosition - 1)); // gets upper element
              if (sentenceSelected.firstChild.tagName === 'HR') {  // if the upper element is line for new paragraph
                sentenceSelected = document.querySelector('ul.' + CSS.escape(sentencePosition - 2));
              }
              sentenceSelected.focus();
            }
          }
          break;
        case "Down":
        case "ArrowDown":
          if (target.matches('ul')) {
            if (sentencePosition < textEditor.textArray.length - 1) { //if the selected sentence is not the last one
              if (event.getModifierState("Alt")) {
                handlers.moveSentenceDown(sentencePosition);
              }
              sentenceSelected = document.querySelector('ul.' + CSS.escape(sentencePosition + 1));
              if (sentenceSelected.firstChild.tagName === 'HR') {
                sentenceSelected = document.querySelector('ul.' + CSS.escape(sentencePosition + 2));
              }
              sentenceSelected.focus();
            }
          }
          break;
        case "Enter":
          var sentenceInput;
          if (target.matches('ul')) {
            if (event.getModifierState('Alt')) { // if alt + enter is pressed adds new sentence.
              // Delete existing input elements in the list.
              sentenceInput = document.querySelector('#sentenceInput');
              if (sentenceInput != null) {
                sentenceInput.parentNode.removeChild(sentenceInput);
              }
              // Creates input element after the selected sentence.
              target.after(view.createSentenceInput());
              sentenceInput = document.querySelector('#sentenceInput');
              sentenceInput.focus();
            } else { //if only enter is pressed edits the sentence

              // TODO
              // Показва версиите на изреченията.
              // Esc скрива версиите на изречението и се връща в редактора.
              // Със стрелки нагоре и надолу да се фокусира върху версиите.
              // Shift + B избира най-доброто изречение.


            }
          }
          if (target.matches('#sentenceInput')) {
            sentencePosition = parseInt(target.nextSibling.className);
            handlers.addSentence(sentencePosition, target.value);
            sentenceSelected = document.querySelector('ul.' + CSS.escape(sentencePosition));
            sentenceSelected.focus();
          }
          break;
        case "Escape":
          if (target.matches('ul')) {
            target.blur();
          }
          if (target.matches('#sentenceInput')) {
            target.parentNode.removeChild(target);
          }
          break;
        case "Delete":
          if (target.matches('ul')) {
            handlers.deleteSentence(sentencePosition);
            sentenceSelected = document.querySelector('ul.' + CSS.escape(sentencePosition));
            if (sentenceSelected.firstChild.tagName === 'HR') {
              sentenceSelected = document.querySelector('ul.' + CSS.escape(sentencePosition - 1));
              if (sentenceSelected.firstChild.tagName === 'HR') {
                handlers.deleteSentence(sentencePosition);
                sentenceSelected = document.querySelector('ul.' + CSS.escape(sentencePosition));
              }
            }
            sentenceSelected.focus();
          }
          break;
        default:
          return;
      }
    
      event.preventDefault();
    }, true);
  },

  createSentenceFromInput: function(target) {
    sentencePosition = parseInt(target.previousSibling.className) + 1;
    handlers.addSentence(sentencePosition, target.value);
  }
};

// Placeholder text for the editor window
// for (var i = 0; i < 3; i++) {
//   sentence = 'This is literaly sentence number ' + (i + 1);
//   handlers.addSentence(sentence);
//   for (var j = 1; j < 3; j++) {
//     version = 'This is my version number ' + j;
//     handlers.editSentence(i, version);
//   }
// }

// Placeholder text for the preview window
document.querySelector('textarea').value = 'There are people who think that the type should be expressive—they have a different point of view from mine. I don’t think type should be expressive at all. I can write the word ‘dog’ with any typeface, and it doesn’t have to look like a dog. But there are people who, when they write ‘dog’ think it should bark, you know? So there are all kinds of people, and therefore, there will always people who will find work designing funky type, and it could be that all of a sudden a funky typeface takes the world by storm, but I doubt it. I’m a strong believer in intellect and intelligence, and I’m a strong believer in intellectual elegance, so that, I think, will prevent vulgarity from really taking over the world more than it has already.\nSome defenses need to be put up, and I think, actually, that the more culture spreads out and the more refined education becomes, the more refined the sensibility about type becomes, too. The more uneducated the person is who you talk to, the more he likes horrible typefaces.\nLook at comics like The Hulk, things like that. It’s not even type. Look at anything which is elegant and refined; you find elegant and refined typefaces. The more culture is refined in the future—this might take a long time, but eventually education might prevail over ignorance—the more you’ll find good typography. I’m convinced of that.';

view.setUpEventListeners();