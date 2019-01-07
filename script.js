var textArray = [];
var editor = document.getElementById('editor');

function addSentence(sentencePosition, sentenceText) {
  if (sentenceText !== '') {
    textArray.splice(sentencePosition, 0, [sentenceText]);
  }
  displayEditorContent();
}

function deleteSentence(sentencePosition) {
  textArray.splice(sentencePosition, 1);
  displayEditorContent();
}

function moveSentenceUp(sentencePosition) {
  previousSentencePosition = sentencePosition - 1;
  textArray.move(sentencePosition, previousSentencePosition);
  displayEditorContent();
}

function moveSentenceDown(sentencePosition) {
  nextSentencePosition = sentencePosition + 1;
  textArray.move(sentencePosition, nextSentencePosition);
  displayEditorContent();
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

function selectBestVersion(sentencePosition, versionPosition) {
  textArray[sentencePosition].move(versionPosition, - 1);
  displayEditorContent();
}

///////////////////////////////
function displayEditorContent() {
  editor.innerHTML = '';
  textArray.forEach(function(sentence, index) {
    var ulElement = createUlElement(index);
    var liElement = createLiElement(sentence);
    displayByParagraphs(sentence, ulElement, liElement);
  });
}

function createUlElement(index) {
  var ulElement = document.createElement('ul');
  ulElement.id = index;
  ulElement.tabIndex = -1;
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
  createVersionInput(target);
}

function disableUlFocus() {
  var ulElements = document.querySelectorAll('ul');
  ulElements.forEach(function(ulElement) {
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

  sentenceArray.forEach(function(version, index) {
    var sentenceVersion = createSentenceVersions(version, index);
    target.appendChild(sentenceVersion);
  });
}

function createSentenceVersions(version, index) {
  var sentenceVersion = document.createElement('li');
  sentenceVersion.id = index;
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
  var textareaText = document.querySelector('textarea').value;
  tokenizeTextarea(textareaText);
  displayEditorContent();
}

function tokenizeTextarea(textareaText) {
  var tokenizeParagraphsRegex = /\n/;
  var paragraphArray = textareaText.split(tokenizeParagraphsRegex);
  tokenizeParagraphs(paragraphArray);
  textArray.shift();
}

function tokenizeParagraphs(paragraphArray) {
  paragraphArray.forEach(function(paragraph) {
    if (paragraph !== '') {
      var tokenizeSentencesRegex = /(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s/;
      var sentenceArray = paragraph.split(tokenizeSentencesRegex);
      textArray.push(['<P>']);
      tokenizeSentences(sentenceArray);
    }
  });
}

function tokenizeSentences(sentenceArray) {
  sentenceArray.forEach(function(sentence) {
    textArray.push([sentence]);
  });
}

function copyToClipboard() {
  var textArea = document.querySelector('textarea');
  textArea.select();
  document.execCommand('copy');
}

////////////////////////////////////////
editor.addEventListener('blur', function(event) {
  var target = event.target;
  if (target.matches('#sentenceInput')) {
    target.focus();
  }
}, true);

editor.addEventListener('keydown', function(event) {
  var target = event.target;
  var sentencePosition = parseInt(target.id);
  var firstSentencePosition = 0;
  var lastSentencePosition = textArray.length - 1;

  if (event.defaultPrevented) {
    return;
  }

  switch (event.key) {
    case "Up":
    case "ArrowUp":
      if (target.matches('ul') &&  sentencePosition !== firstSentencePosition) {
        if (event.getModifierState('Alt')) {
          moveSentenceUp(sentencePosition);
        }
        moveSelectionUp(sentencePosition);
      }
      if (target.matches('li')) {
        moveSelectionUp(sentencePosition);
      }
      break;
    case "Down":
    case "ArrowDown":
      if (target.matches('ul') && sentencePosition !== lastSentencePosition) {
        if (event.getModifierState('Alt')) {
          moveSentenceDown(sentencePosition);
        }
        moveSelectionDown(sentencePosition);
      }
      if (target.matches('li')) {
        moveSelectionDown(sentencePosition);
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
      if (target.matches('#sentenceInput')) {
        removeSentenceInput(target);
      }
      if (target.matches('li')) {
        colapseSentenceVersions(target);
      }
      break;
    case "Delete":
      if (target.matches('ul')) {
        deleteSentence(sentencePosition);
        selectSentence(sentencePosition);
      }
      break;
    default:
      return;
  }

  event.preventDefault();
}, true);

function colapseSentenceVersions(target) {
  var sentencePosition = findSentencePosition(target);
  displayEditorContent();
  var selectedSentence = document.getElementById(sentencePosition);
  selectedSentence.focus();
}

function findSentencePosition(target) {
  var sentence = target.parentNode;
  var i = 0;
  while((sentence = sentence.previousSibling) != null)
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
  var selectedSentence = document.getElementById(sentencePosition);
  selectedSentence.focus();
}

function selectSentencePosition(target) {
  if (target.nextSibling) {
    sentencePosition = parseInt(target.nextSibling.id);
  } else {
    sentencePosition = parseInt(target.previousSibling.id) + 1;
  }

  return sentencePosition;
}

function createSentenceFromInput(target) {
  sentencePosition = parseInt(target.previousSibling.id) + 1;
  sentenceText = target.value;
  addSentence(sentencePosition, sentenceText);
}

function removeSentenceInput(target) {
  previousSentencePosition = target.previousSibling.id;
  target.parentNode.removeChild(target);
  previousSentence = document.getElementById(previousSentencePosition);
  previousSentence.focus();
}

function moveSelectionUp(sentencePosition) {
  var previousSentence = document.getElementById(sentencePosition - 1);
  if (previousSentence) {
    if (previousSentence.firstChild.tagName === 'HR') {
      previousSentence = document.getElementById(sentencePosition - 2);
    }
    previousSentence.focus();
  }
} 

function moveSelectionDown(sentencePosition) {
  nextSentence = document.getElementById(sentencePosition + 1);
  if (nextSentence) {
    if (nextSentence.firstChild.tagName === 'HR') {
      nextSentence = document.getElementById(sentencePosition + 2);
    }
    nextSentence.focus();
  }
}

function selectSentence(sentencePosition) {
  var selectedSentence = document.getElementById(sentencePosition);
  if (!selectedSentence) {
    selectedSentence = document.getElementById(sentencePosition - 1);
  }
  selectedSentence.focus();
}

// Placeholder text for the preview window
document.querySelector('textarea').value = 'There are people who think that the type should be expressive—they have a different point of view from mine. I don’t think type should be expressive at all. I can write the word ‘dog’ with any typeface, and it doesn’t have to look like a dog. But there are people who, when they write ‘dog’ think it should bark, you know? So there are all kinds of people, and therefore, there will always people who will find work designing funky type, and it could be that all of a sudden a funky typeface takes the world by storm, but I doubt it. I’m a strong believer in intellect and intelligence, and I’m a strong believer in intellectual elegance, so that, I think, will prevent vulgarity from really taking over the world more than it has already.\nSome defenses need to be put up, and I think, actually, that the more culture spreads out and the more refined education becomes, the more refined the sensibility about type becomes, too. The more uneducated the person is who you talk to, the more he likes horrible typefaces.\nLook at comics like The Hulk, things like that. It’s not even type. Look at anything which is elegant and refined; you find elegant and refined typefaces. The more culture is refined in the future—this might take a long time, but eventually education might prevail over ignorance—the more you’ll find good typography. I’m convinced of that.';

// Placeholder text for the editor window
for (var i = 0; i < 3; i++) {
  sentence = 'This is literaly sentence number ' + (i + 1);
  textArray.push([sentence]);
  for (var j = 1; j < 3; j++) {
    version = 'This is my version number ' + j;
    addVersion(i, version);
  }
}
