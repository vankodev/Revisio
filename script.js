var textArray = [];
var editor = document.querySelector('.paragraph-list');
loadData();

// Array Operations

function addSentence(sentenceText) {
  textArray.push([sentenceText]);
}

function createSentence(sentence) {
  var text = document.querySelector('.sentence-input').value;
  var s = getIndex(next(sentence));
  var p = getIndex(next(sentence).closest('.paragraph'));

  textArray[p].splice(s, 0, text);
  saveData();
  focusOn(p, s);
}

function deleteSentence(par, el) {
  textArray[par].splice(el, 1);

  const firstSentence = el === 0,
    lastSentence = textArray[par].length === el,
    lastParagraph = textArray.length - 1 === par,
    oneSentenceLeft = par === 0 && el === 0 && textArray.length === 1 && textArray[par].length === 0;

  if (oneSentenceLeft) {
    saveData();
    return
  } else if (firstSentence && lastSentence && lastParagraph) {
    par -= 1
    el = textArray[par].length - 1;
  } else if (firstSentence && lastSentence) {
    el = 0;
  } else if (lastSentence) {
    el -= 1;
  }

  saveData();
  focusOn(par, el);
}

function move(startPar, startSent, endPar, endSent) {
  if (startPar === endPar && startSent < endSent) {
    endSent -= 1;
  }

  var e = textArray[startPar].splice(startSent, 1)[0];
  textArray[endPar].splice(endSent, 0, e)

  saveData();
  focusOn(endPar, endSent);
}

function moveUp(par, el) {
  var e = textArray[par].splice(el, 1)[0];
  el -= 1;
  textArray[par].splice(el, 0, e); 

  saveData();
  focusOn(par, el);
}

function moveDown(par, el) {
  var e = textArray[par].splice(el, 1)[0];
  el += 1;
  textArray[par].splice(el, 0, e); 

  saveData();
  focusOn(par, el);
}

function jumpUp(par) {
  par -= 1;
  textArray[par].push(textArray[par + 1].shift());
  el = textArray[par].length - 1;

  saveData();
  focusOn(par, el);
}

function jumpDown(par) {
  par += 1;
  textArray[par].unshift(textArray[par - 1].pop());
  el = 0;

  saveData();
  focusOn(par, el);
}

function toPrevious(par, el) {
  var e = textArray[par].splice(el, 1);
  par -= 1;
  textArray[par].unshift(e[0]);

  saveData();
  focusOn(par, 0);
}

function toNext(par, el) {
  var e = textArray[par].splice(el, 1);
  par += 1;
  textArray[par].unshift(e[0]);
 
  saveData();
  focusOn(par, 0);
}

function toLast(par, el) {
  var e = textArray[par].splice(el, 1);
  textArray[textArray.length - 1].unshift(e[0]);
  par = textArray.length - 1;

  saveData();
  focusOn(par, 0);
}

function toFirst(par, el) {
  var e = textArray[par].splice(el, 1);
  textArray[0].unshift(e[0]);

  saveData();
  focusOn(0, 0);
}

function focusOn(par, el) {
  document.querySelectorAll('.paragraph')[par]
    .querySelectorAll('.sentence')[el]
    .focus();
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
  textArray = textArray.filter(e => e.length !== 0);
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

function displayEditorContent () {
  var paragraphList = document.querySelector('.paragraph-list');
  paragraphList.innerHTML = '';

  for (var p = 0; p < textArray.length; p++) {
    var paragraph = document.createElement('li');
    paragraph.classList.add('paragraph');
    paragraph.classList.add(p);
    paragraphList.appendChild(paragraph);

    var sentenceList = document.createElement('ul');
    sentenceList.classList.add('sentence-list');
    paragraph.appendChild(sentenceList);

    for (var s = 0; s < textArray[p].length; s++) {
      var sentence = document.createElement('li');
      sentence.classList.add('sentence');
      sentence.classList.add(s);
      sentence.setAttribute('draggable', 'true');
      sentence.tabIndex = 0;
      sentenceList.appendChild(sentence);

      var sentenceContent = document.createElement('p');
      sentenceContent.classList.add('sentence-content');
      sentenceContent.textContent = textArray[p][s];
      sentence.appendChild(sentenceContent);
    }
  }

  activateDragAndDrop();
}

// Add Sentence Variants

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

function previewText() {
  var text = []
  var paragraphs = document.querySelectorAll('.sentence-list');
  
  paragraphs.forEach(function(p) {
    var result = [];
    var sentences = p.childNodes;
    
    sentences.forEach(function(s) {
      result.push(s.textContent);
    });

    text.push(result.join(' '));
  });

  document.querySelector('textarea').value = text.join('\n\n');
}

function tokenizeText() {
  var text = document.querySelector('textarea').value;
  
  // trim spaces
  text = text.replace(/^\s+|\s+$/gm, '\n');
  
  // split into paragraphs
  var paragraphs = text.split(/\n/);
  
  // remove empty paragraphs
  paragraphs = paragraphs.filter(p => p !== '');
  
  // remove extra spaces
  paragraphs = paragraphs.map(p => p = p.replace(/\s+/g, ' '));
  
  // split into sentences
  var intoSentences = /(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s/;
  textArray = paragraphs.map(p => p.split(intoSentences));
  
  saveData();
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
  var sentence = event.target;
  var sentences = sentence.parentNode.querySelectorAll('.sentence');
  var paragraph = sentence.closest('.paragraph');
  var paragraphs = document.querySelectorAll('.paragraph');

  switch (event.key) {
    case "Up":
    case "ArrowUp":
      event.preventDefault();

      if (sentence.matches('.sentence')) {
        if (sentence === firstFrom(sentences)) {
          if (paragraph === firstFrom(paragraphs)) {
            !event.getModifierState('Alt')
              && lastChildFrom(lastFrom(paragraphs)).focus();
          } else {
            event.getModifierState('Alt')
            ? jumpUp(getIndex(paragraph))
            : lastChildFrom(previous(paragraph)).focus();
          }
        } else {
          event.getModifierState('Alt')
            ? moveUp(getIndex(paragraph), getIndex(sentence))
            : previous(sentence).focus();
        }
      }
      break;
    case "Down":
    case "ArrowDown":
      event.preventDefault();

      if (sentence.matches('.sentence')) {
        if (sentence === lastFrom(sentences)) {
          if (paragraph === lastFrom(paragraphs)) {
            ! event.getModifierState('Alt')
              && firstChildFrom(firstFrom(paragraphs)).focus();
          } else {
            event.getModifierState('Alt')
            ? jumpDown(getIndex(paragraph))
            : firstChildFrom(next(paragraph)).focus();
          }
        } else {
          event.getModifierState('Alt')
            ? moveDown(getIndex(paragraph), getIndex(sentence))
            : next(sentence).focus();
        }
      }
      break;
    case "PageUp":
      event.preventDefault();

      if (sentence.matches('.sentence')) {
        if (paragraph === firstFrom(paragraphs)) {
          event.getModifierState('Alt')
            ? toLast(getIndex(paragraph), getIndex(sentence))
            : firstChildFrom(lastFrom(paragraphs)).focus();
        } else {
          event.getModifierState('Alt')
            ? toPrevious(getIndex(paragraph), getIndex(sentence))
            : firstChildFrom(previous(paragraph)).focus();
        }
      }
      break;
    case "PageDown":
      event.preventDefault();

      if (sentence.matches('.sentence')) {
        if (paragraph === lastFrom(paragraphs)) {
          event.getModifierState('Alt')
            ? toFirst(getIndex(paragraph), getIndex(sentence))
            : firstChildFrom(firstFrom(paragraphs)).focus();
        } else {
          event.getModifierState('Alt')
            ? toNext(getIndex(paragraph), getIndex(sentence))
            : firstChildFrom(next(paragraph)).focus();
        }
      }
      break;
    case "Enter":
      if (sentence.matches('.sentence')) {
        if (event.getModifierState('Alt')) {
          createSentenceInput(sentence);
        } else {
          // expandSentenceVersions(sentence, getIndex(sentence));
        }
      }
      // if (sentence.matches('li')) {
      //   if (event.getModifierState('Alt')) {
      //     createVersionInput(sentence.parentNode);
      //   } else if (sentence.isContentEditable) {
      //     saveEdit(sentence);
      //   } else {
      //     selectBestVersion(sentence);
      //   }
      // }
      if (sentence.matches('.sentence-input')) {
        createSentence(sentence);
      }
      if (sentence.matches('.version-input')) {
        createVersion(sentence);
      }
      break;
    case "Escape":
      if (sentence.matches('ul')) {
        sentence.blur();
      }
      if (sentence.matches('li')) {
        if (sentence.isContentEditable) {
          ignoreVersionEdit(sentence);
        } else {
          colapseSentenceVersions(sentence);
        }
      }
      if (sentence.matches('#sentenceInput')) {
        removeSentenceInput(sentence);
      }
      if (sentence.matches('#versionInput')) {
        removeVersionInput(sentence);
      }
      break;
    case "Delete":
      if (sentence.matches('.sentence')) {
        deleteSentence(getIndex(paragraph), getIndex(sentence));
      }
      break;
    case "p":
      if (sentence.matches('ul') && event.getModifierState('Alt')) {
        createNewParagraph(sentenceIndex);
      }
      break;
    default:
      return;
  }
}, true);

// Handlers

function previous(element) {
  return element.previousSibling;
}

function next(element) {
  return element.nextSibling;
}

function firstFrom(elements) {
  return elements[0];
}

function lastFrom(elements) {
  return elements[elements.length -1];
}

function firstChildFrom(paragraph) {
  return firstFrom(paragraph.querySelectorAll('.sentence'));
}

function lastChildFrom(paragraph) {
  return lastFrom(paragraph.querySelectorAll('.sentence'));
}

function getIndex(element) { 
  return Number(element.classList[1]);
};

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

function createSentenceInput(sentence) {
  var sentenceInput = document.createElement('input');
  sentenceInput.classList.add('sentence-input');
  sentenceInput.type = 'text';
  sentence.after(sentenceInput);
  
  sentence.nextSibling.focus();
}

function createVersion(target) {
  var sentencePosition = findSentencePosition(target);
  var versionText = target.value;
  addVersion(sentencePosition, versionText);
  refreshSentenceVersions(target, sentencePosition);
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
  const paragraphs = document.querySelectorAll('.paragraph');
  const sentences = document.querySelectorAll('.sentence');

  sentences.forEach(sentence => {
    sentence.addEventListener('dragstart', e => {
      sentence.classList.add('dragging');

      startSent = getIndex(sentence);
      startPar = getIndex(sentence.closest('.paragraph'));
    })

    sentence.addEventListener('dragend', e => {
      move(startPar, startSent, endPar, endSent);
    })
  })

  paragraphs.forEach(paragraph => {
    paragraph.addEventListener('dragover', e => {
      e.preventDefault();
      const sentence = document.querySelector('.dragging');
      const afterElement = getDragAfterElement(paragraph, e.clientY);
      endPar = getIndex(sentence.closest('.paragraph'));

      if (afterElement == null) {
        paragraph.firstChild.appendChild(sentence);
        endSent = textArray[endPar].length;
      } else {
        paragraph.firstChild.insertBefore(sentence, afterElement);
        endSent = getIndex(afterElement);
      }
    })
  })

  function getDragAfterElement(paragraph, y) {
    const draggableElements = [...paragraph.querySelectorAll('.sentence:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height /2;
      if (offset < 0  && offset > closest.offset) {
        return { offset: offset, element: child }
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }
}