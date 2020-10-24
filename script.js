var textArray = [];
var editor = document.getElementById('editor');
loadData();

// Array Operations

function addSentence(sentenceText) {
  textArray.push([sentenceText]);
}

function insertSentence(sentencePosition, sentenceText) {
  if (sentenceText !== '') {
    textArray.splice(sentencePosition, 0, [sentenceText]);
  }
  saveData();
}

function deleteSentence(sentencePosition) {
  textArray.splice(sentencePosition, 1);
  saveData();
}

function moveSentence(sentencePosition, newSentencePosition) {
  textArray.move(sentencePosition, newSentencePosition);
  saveData();
}

function addVersion(sentencePosition, versionText) {
  var sentenceArray = textArray[sentencePosition];
  if (sentenceArray.length > 1) {
    sentenceArray.shift();
  }
  if (versionText !== '') {
    sentenceArray.push(versionText);
  }
}

function editVersion(sentencePosition, versionPosition, versionText) {
  textArray[sentencePosition][versionPosition] = versionText;
}

function selectBestVersion(target) {
  var sentencePosition = findSentencePosition(target);
  var versionPosition = parseInt(target.id);
  moveBestVersion(sentencePosition, versionPosition);
  refreshSentenceVersions(target, sentencePosition);
}

function moveBestVersion(sentencePosition, versionPosition) {
  textArray[sentencePosition].move(versionPosition, -1);
}

// Local Storage

function saveData() {
  localStorage.setItem('revisio', JSON.stringify(textArray));
  displayEditorContent();
  previewText();
}

function loadData() {
  if (localStorage.getItem('revisio') != null) {
    textArray = JSON.parse(localStorage.getItem('revisio'));
    displayEditorContent();
    previewText();
  }
}

function clearData() {
  if (confirm("Confirm to DELETE the revision!")) {
    localStorage.removeItem('revisio');
    textArray = [];
    displayEditorContent();
    previewText();
  } else {
    return;
  }
}

// Display Editor Content

function displayEditorContent() {
  editor.innerHTML = '';
  textArray.forEach(function (sentence, index) {
    var ulElement = createUlElement(index);
    var liElement = createLiElement(sentence);
    displayByParagraphs(sentence, ulElement, liElement);
  });
  activateDragAndDrop();
}

function createUlElement(index) {
  var ulElement = document.createElement('ul');
  ulElement.id = index;
  ulElement.tabIndex = -1;
  ulElement.setAttribute('draggable', 'true');
  editor.appendChild(ulElement);
  return ulElement;
}

function createLiElement(sentence) {
  var liElement = document.createElement('li');
  var lastSentenceVersion = sentence[sentence.length - 1];
  liElement.textContent = lastSentenceVersion;
  return liElement;
}

function displayByParagraphs(sentence, ulElement, liElement) {
  if (sentence == '<P>') {
    var separator = document.createElement('hr');
    ulElement.appendChild(separator);
  } else {
    ulElement.appendChild(liElement);
  }
}

function expandSentenceVersions(target, sentencePosition) {
  disableUlFocus();
  displaySentenceVersions(target, sentencePosition);

  var secondVersion = target.children[1];
  if (!secondVersion) {
    createVersionInput(target);
  } else {
    secondVersion.focus();
  }
}

function disableUlFocus() {
  var ulElements = editor.querySelectorAll('ul');
  ulElements.forEach(function (ulElement) {
    ulElement.removeAttribute('id');
    ulElement.removeAttribute('tabIndex');
    ulElement.className = 'fade';
  });
}

function displaySentenceVersions(target, sentencePosition) {
  target.removeAttribute('class');
  target.removeChild(target.firstChild);
  displayVersionElements(target, sentencePosition);
}

function displayVersionElements(target, sentencePosition) {
  var sentenceArray = textArray[sentencePosition];

  sentenceArray.forEach(function (version, index) {
    var sentenceVersion = createSentenceVersions(version, index);
    target.appendChild(sentenceVersion);
  });
}

function createSentenceVersions(version, index) {
  var sentenceVersion = document.createElement('li');
  sentenceVersion.id = index;
  sentenceVersion.className = 'expanded';
  sentenceVersion.textContent = version;
  sentenceVersion.tabIndex = -1;
  return sentenceVersion;
}

function createVersionInput(target) {
  var versionInput = createVersionInputElement();
  target.appendChild(versionInput);
  target.lastChild.focus();
}

function createVersionInputElement() {
  var versionInput = document.createElement('input');
  versionInput.id = 'versionInput';
  versionInput.type = 'text';
  return versionInput;
}

function refreshSentenceVersions(target, sentencePosition) {
  target = target.parentNode;
  target.innerHTML = '';
  displayVersionElements(target, sentencePosition);
  target.lastChild.focus();
}

function ignoreVersionEdit(target) {
  var sentencePosition = findSentencePosition(target);
  var versionPosition = parseInt(target.id);
  target = target.parentNode;
  target.innerHTML = '';
  displayVersionElements(target, sentencePosition);
  var focusSentence = document.getElementById(versionPosition);
  focusSentence.focus();
}

// Preview Text

function previewText() {
  var previewTextArea = document.querySelector('textarea');
  var joinedText = joinText();
  previewTextArea.value = joinedText;
}

function joinText() {
  var joinedText = '';

  textArray.forEach(function (sentence) {
    if (sentence != '<P>') {
      joinedText = joinBestSentences(joinedText, sentence);
    } else {
      joinedText = makeNewParagraph(joinedText);
    }
  });

  joinedText = joinedText.slice(0, -1);
  return joinedText;
}

function joinBestSentences(joinedText, sentence) {
  var bestSentence = sentence[sentence.length - 1];
  joinedText = joinedText + bestSentence + ' ';
  return joinedText;
}

function makeNewParagraph(joinedText) {
  joinedText = joinedText.slice(0, -1);
  joinedText = joinedText + '\n\n';
  return joinedText;
}

// Tokenize Text

function tokenizePreviewText() {
  textArray = [];
  var textareaText = document.querySelector('textarea').value;
  tokenizeTextarea(textareaText);
  saveData();
}

function tokenizeTextarea(textareaText) {
  var tokenizeParagraphsRegex = /\n/;
  var paragraphArray = textareaText.split(tokenizeParagraphsRegex);
  tokenizeParagraphs(paragraphArray);
  textArray.shift();
}

function tokenizeParagraphs(paragraphArray) {
  paragraphArray.forEach(function (paragraph) {
    if (paragraph !== '') {
      var tokenizeSentencesRegex = /(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s/;
      var sentenceArray = paragraph.split(tokenizeSentencesRegex);
      textArray.push(['<P>']);
      tokenizeSentences(sentenceArray);
    }
  });
}

function tokenizeSentences(sentenceArray) {
  sentenceArray.forEach(function (sentence) {
    textArray.push([sentence]);
  });
}

function copyToClipboard() {
  var textArea = document.querySelector('textarea');
  textArea.select();
  document.execCommand('copy');
}

// Event Listeners

editor.addEventListener('blur', function (event) {
  var target = event.target;
  if (target.matches('#sentenceInput') || target.matches('#versionInput')) {
    target.focus();
  }
  if (target.matches('li') && target.isContentEditable) {
    target.focus();
  }
}, true);

editor.addEventListener('dblclick', function (event) {
  var target = event.target;

  if (target.matches('.expanded')) {
    makeEditable(target);
  }
}, true);

editor.addEventListener('keydown', function (event) {
  var target = event.target;
  var sentencePosition = parseInt(target.id);
  var newSentencePosition;
  var firstSentencePosition = 0;
  var lastSentencePosition = parseInt(target.parentNode.lastChild.id);

  switch (event.key) {
    case "Up":
    case "ArrowUp":
      if (sentencePosition !== firstSentencePosition) {
        var previousSentencePosition = sentencePosition - 1;

        if (target.matches('ul')) {
          event.preventDefault();

          if (event.getModifierState('Alt')) {
            moveSentence(sentencePosition, previousSentencePosition);
          }

          selectNewPosition(previousSentencePosition);
        }

        if (target.matches('li')) {
          selectNewPosition(previousSentencePosition);
        }
      }
      break;
    case "Down":
    case "ArrowDown":
      if (sentencePosition !== lastSentencePosition) {
        var nextSentencePosition = sentencePosition + 1;

        if (target.matches('ul')) {
          event.preventDefault();

          if (event.getModifierState('Alt')) {
            moveSentence(sentencePosition, nextSentencePosition);
          }

          selectNewPosition(nextSentencePosition);
        }

        if (target.matches('li')) {
          selectNewPosition(nextSentencePosition);
        }
      }
      break;
    case "PageUp":
      if (target.matches('ul') && sentencePosition !== firstSentencePosition) {
        event.preventDefault();
        newSentencePosition = getPreviousParagraph(target);

        if (event.getModifierState('Alt')) {
          moveSentence(sentencePosition, newSentencePosition);
        }

        selectNewPosition(newSentencePosition);
      }
      break;
    case "PageDown":
      if (target.matches('ul') && sentencePosition !== lastSentencePosition) {
        event.preventDefault();
        newSentencePosition = getNextParagraph(target);

        if (event.getModifierState('Alt')) {
          moveSentence(sentencePosition, newSentencePosition);
        }

        selectNewPosition(newSentencePosition);
      }
      break;
    case "Enter":
      if (target.matches('ul')) {
        if (event.getModifierState('Alt')) {
          createSentenceInput(target);
        } else {
          expandSentenceVersions(target, sentencePosition);
        }
      }
      if (target.matches('li')) {
        if (event.getModifierState('Alt')) {
          createVersionInput(target.parentNode);
        } else if (target.isContentEditable) {
          saveEdit(target);
        } else {
          selectBestVersion(target);
        }
      }
      if (target.matches('#sentenceInput')) {
        createSentence(target);
      }
      if (target.matches('#versionInput')) {
        createVersion(target);
      }
      break;
    case "Escape":
      if (target.matches('ul')) {
        target.blur();
      }
      if (target.matches('li')) {
        if (target.isContentEditable) {
          ignoreVersionEdit(target);
        } else {
          colapseSentenceVersions(target);
        }
      }
      if (target.matches('#sentenceInput')) {
        removeSentenceInput(target);
      }
      if (target.matches('#versionInput')) {
        removeVersionInput(target);
      }
      break;
    case "Delete":
      if (target.matches('ul')) {
        deleteSentence(sentencePosition);
        selectSentence(sentencePosition);
      }
      break;
    case "p":
      if (target.matches('ul') && event.getModifierState('Alt')) {
        createNewParagraph(sentencePosition);
      }
      break;
    default:
      return;
  }
}, true);

// Handlers

function getPreviousParagraph(target) {
  do {
    target = target.previousSibling;
  } while (target.firstChild.nodeName !== 'HR' && target !== target.parentNode.firstChild);

  return parseInt(target.id);
}

function getNextParagraph(target) {
  do {
    target = target.nextSibling;
  } while (target.firstChild.nodeName !== 'HR' && target !== target.parentNode.lastChild);

  return parseInt(target.id);
}

function selectNewPosition(newSentencePosition) {
  var newPosition = document.getElementById(newSentencePosition);
  newPosition.focus();
}

function makeEditable(target) {
  var c = target.parentNode.children;

  for (var i = 0; i < c.length; i++) {
    c[i].removeAttribute('contentEditable');
  }

  target.contentEditable = 'true';
}

function saveEdit(target) {
  target.removeAttribute('contentEditable');
  var sentencePosition = findSentencePosition(target);
  var versionPosition = parseInt(target.id);
  var versionText = target.innerText;
  editVersion(sentencePosition, versionPosition, versionText);
}

function removeVersionInput(target) {
  var focusSentence = target.previousSibling;
  target.parentNode.removeChild(target);
  focusSentence.focus();
}

function createNewParagraph(sentencePosition) {
  var sentenceText = '<P>';
  var lastSentencePosition = textArray.length - 1;

  if (sentencePosition !== lastSentencePosition) {
    sentencePosition = sentencePosition + 1;
    insertSentence(sentencePosition, sentenceText);
    var focusSentence = document.getElementById(sentencePosition - 1);
    focusSentence.focus();
  }
}

function colapseSentenceVersions(target) {
  var sentencePosition = findSentencePosition(target);
  saveData();
  var focusSentence = document.getElementById(sentencePosition);
  focusSentence.focus();
}

function findSentencePosition(target) {
  var sentence = target.parentNode;
  var i = 0;
  while ((sentence = sentence.previousSibling) != null)
    i++;
  return i;
}

function createSentenceInput(target) {
  var sentenceInput = document.createElement('input');
  sentenceInput.id = 'sentenceInput';
  sentenceInput.type = 'text';
  target.after(sentenceInput);
  target.nextSibling.focus();
}

function createVersion(target) {
  var sentencePosition = findSentencePosition(target);
  var versionText = target.value;
  addVersion(sentencePosition, versionText);
  refreshSentenceVersions(target, sentencePosition);
}

function createSentence(target) {
  var sentencePosition = selectSentencePosition(target);
  createSentenceFromInput(target);
  var focusSentence = document.getElementById(sentencePosition);
  focusSentence.focus();
}

function selectSentencePosition(target) {
  var sentencePosition;

  if (target.nextSibling) {
    sentencePosition = parseInt(target.nextSibling.id);
  } else {
    sentencePosition = parseInt(target.previousSibling.id) + 1;
  }

  return sentencePosition;
}

function createSentenceFromInput(target) {
  var sentencePosition = parseInt(target.previousSibling.id) + 1;
  var sentenceText = target.value;
  insertSentence(sentencePosition, sentenceText);
}

function removeSentenceInput(target) {
  var focusSentence = target.previousSibling;
  target.parentNode.removeChild(target);
  focusSentence.focus();
}

function selectSentence(sentencePosition) {
  var focusSentence = document.getElementById(sentencePosition);
  if (!focusSentence) {
    focusSentence = document.getElementById(sentencePosition - 1);
  }
  focusSentence.focus();
}

// Drag and Drop

function activateDragAndDrop() {
  var items = document.querySelectorAll("ul");

  for (const item of items) {
    item.addEventListener('dragstart', dragStart);
    item.addEventListener('drag', drag);
    item.addEventListener('dragend', dragEnd);
    item.addEventListener('dragenter', dragEnter, true);
    item.addEventListener('dragover', dragOver);
    item.addEventListener('dragleave', dragLeave, true);
    item.addEventListener('drop', drop);
  }
}

function dragStart(event) {
  var target = event.target;

  if (target.matches('li')) {
    target = target.parentNode;
  }

  target.classList.add('nodropzone');
  if (target.nextSibling) {
    target.nextSibling.classList.add('nodropzone');
  }
  
  var draggedSentencePosition = String(target.id);
  event.dataTransfer.setData('text/plain', draggedSentencePosition);
}

function drag() {
  // Fires as a draggable element is being dragged around the screen
}

function dragEnd() {
  // Occurs at the very end of the drag-and-drop action
}

function dragEnter(event) {
  var target = event.target;

  if (target.matches('li')) {
    target = target.parentNode;
  }

  if (!target.matches('.nodropzone')) {
    target.classList.add('dropzone');
  }
}

function dragOver(event) {
  event.preventDefault();
}

function dragLeave(event) {
  var target = event.target;
  target.classList.remove('dropzone');
}

function drop(event) {
  var target = event.target;

  if (target.matches('li')) {
    target = target.parentNode;
  }

  event.preventDefault();
  var draggedSentencePosition = parseInt(event.dataTransfer.getData('text/plain'));
  var newSentencePosition = parseInt(target.id);

  if (draggedSentencePosition < newSentencePosition) {
    newSentencePosition--;
  }

  moveSentence(draggedSentencePosition, newSentencePosition);
}