var textArray = [];
var editor = document.getElementById('editor');

///////////////////////////////
function displayEditorContent() {
  editor.innerHTML = '';
  textArray.forEach(function(sentence, index) {
    createUlElement(index);
    createLiElement(sentence);
    displayByParagraphs(ulElement, liElement);
  });
}

function createUlElement(index) {
  var ulElement = document.createElement('ul');
  ulElement.className = index;
  ulElement.tabIndex = -1;
  editor.appentChild(ulElement);
  return ulElement;
}

function createLiElement(sentence) {
  var liElement = document.createElement('li');
  var lastSentenceVersion = sentence[sentence.length - 1];
  liElement.textContent = lastSentenceVersion;
  return liElement;
}

function displayByParagraphs(ulElement, liElement) {
  if (sentence == '<P>') {
    var separator = document.createElement('hr');
    ulElement.appendChild(separator);
  } else {
    ulElement.appendChild(liElement);
  }
}

//////////////////////
function previewText() {
  var previewTextArea = document.querySelector('textarea');
  joinText();
  previewTextArea.value = joinedText;
}

function joinText() {
  var joinedText = '';

  textArray.forEach(function(sentence) {
    if (sentence != '<P>') {
      joinBestSentences(sentence);
    } else {
      makeNewParagraph(joinedText);
    }
  });

  joinedText = joinedText.slice(0, -1);
  return joinedText;
}

function joinBestSentences(sentence) {
  bestSentence = sentence[sentence.length -1];
  joinedText = joinedText + bestSentence + ' ';
  return joinedText;
}

function makeNewParagraph(joinedText) {
  joinedText = joinedText.slice(0, -1);
  joinedText = joinedText + '\n\n';
  return joinedText;
}

/////////////////////////////
function tokenizePreviewText() {
  textArray = [];
  var tokenizeParagraphsRegex = /\n/;
  var paragraphArray = text.split(tokenizeParagraphsRegex);
  tokenizeParagraphs(paragraphArray);
  textArray.shift();
}

function tokenizeParagraphs(paragraphArray) {
  paragraphArray.forEach(function(paragraph) {
    if (paragraph !== '') {
      var tokenizeSentencesRegex = /(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s/;
      var sentenceArray = paragraph.split(tokenizeSentencesRegex);
      textArray.push(['<P>']);
      tokenizeSentences();
    }
  });
}

function tokenizeSentences() {
  sentenceArray.forEach(function(sentence) {
    textArray.push([sentence]);
  });
}

function copyToClipboard() {
  var textArea = document.querySelector('textarea');
  textArea.select();
  document.execCommand('copy');
}

//////////////////////////////////////////
editor.addEventListener('blur', function() {
  var target = event.target;
  if (target.matches('#sentenceInput')) {
    createSentenceFromInput(target);
  }
}, true);

function createSentenceFromInput(target) {
  sentencePosition = parseInt(target.previousSibling.className) + 1;
  handlers.addSentence(sentencePosition, target.value);
}

editor.addEventListener('keydown', function(event) {
  var target = event.target;
  var selectedSentence = parseInt(target.className);
  var firstSentencePosition = 0;
  var lastSentencePosition = textEditor.textArray.length - 1;

  if (event.defaultPrevented) {
    return;
  }

  switch (event.key) {
    case "Up":
    case "ArrowUp":
      if (target.matches('ul') &&  selectedSentence !== firstSentencePosition) {
        if (event.getModifierState('Alt')) {
          moveSentenceUp(selectedSentence);
        } else {
          moveSelectionUp(selectedSentence);
        }
      }
      break;
    case "Down":
    case "ArrowDown":
      if (target.matches('ul') && selectedSentence !== lastSentencePosition) {
        if (event.getModifierState('Alt')) {
          moveSentenceDown(selectedSentence);
        } else {
          moveSelectionDown(selectedSentence);
        }
      }
      break;
    case "Enter":
      if (target.matches('ul')) {
        if (event.getModifierState('Alt')) {
          createSentenceInput(target);
        } else {
          // TODO: Edit the sentence
        }
      }
      if (target.matches('#sentenceInput')) {
        // target.blur();
        target.nextSibling.focus();
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
        deleteSentence(selectedSentence);
        if (selectedSentence.firstChild.tagName === 'HR') {
          selectedSentence = selectedSentence.previousSibling;
          if (selectedSentence.firstChild.tagName === 'HR') {
            deleteSentence(selectedSentence);
          }
        }
        selectedSentence.focus();
      }
      break;
    default:

      return;
  }

  event.preventDefault();
}, true);

function createSentenceInput(target) {
  var sentenceInput = document.createElement('input');
  sentenceInput.id = 'sentenceInput';
  sentenceInput.type = 'text';
  target.after(sentenceInput);
  target.nextSibling.focus();
}

function deleteSentence(selectedSentence) {
  textArray.splice(selectedSentence, 1);
  displayEditorContent();
}

function moveSentenceUp(selectedSentence) {
  previousSentencePosition = selectedSentence - 1;
  textArray.move(selectedSentence, previousSentencePosition);
  displayEditorContent();
}

function moveSelectionUp(selectedSentence) {
  selectedSentence = selectedSentence.previousSibling;
  if (selectedSentence.firstChild.tagName === 'HR') {
    moveSelectionUp(selectedSentence);
  } else {
    selectedSentence.focus();
  }
} 

function moveSentenceDown(selectedSentence) {
  nextSentencePosition = selectedSentence + 1;
  textArray.move(selectedSentence, nextSentencePosition);
  displayEditorContent();
}

function moveSelectionDown(selectedSentence) {
  selectedSentence = selectedSentence.nextSibling;
  if (selectedSentence.firstChild.tagName === 'HR') {
    moveSelectionDown(selectedSentence);
  } else {
    selectedSentence.focus();
  }

}