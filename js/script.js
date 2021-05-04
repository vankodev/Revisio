/**
 * @class Model
 *
 * Manages the data of the application.
 */
class Model {
  constructor() {
    this.revision = JSON.parse(localStorage.getItem('Revisio')) || [];
  }

  bindRevisionChanged(callback) {
    this.onRevisionChanged = callback;
  }

  _commit(revision) {
    localStorage.setItem('Revisio', JSON.stringify(revision));
    this.onRevisionChanged(revision);
  }

  bindTextTokenized(callback) {
    this.onTextTokenized = callback;
  }

  bindSentenceDeleted(callback) {
    this.onSentenceDeleted = callback;
  }

  bindSentenceMoved(callback) {
    this.onSentenceMoved = callback;
  }

  removeEmptyParagraphs(revision) {
    for (var i = 0; i < revision.length; i++) {
      if (revision[i].length === 0) {
        revision.splice(i, 1);
      }
    }
  }

  // Modifying the revision's data
  // 'p' is paragraph index, 's' is sentence index
  // 'p2' and 's2' are next position indexes

  // Add sentence by its indexes
  addSentence(text, p, s) {
    this.revision[p].splice(s, 0, [text]);

    this._commit(this.revision);
  }

  // Delete sentence
  deleteSentence(p, s) {
    this.revision[p].splice(s, 1);

    this.removeEmptyParagraphs(this.revision);
    this._commit(this.revision);
    this.onSentenceDeleted(p, s);
  }

  // Split paragraph in two paragraphs
  splitParagraph(p, s) {
    let part = this.revision[p].splice(s + 1);
    this.revision.splice(p + 1, 0, part);

    this._commit(this.revision);
  }

  // Combine paragraph with next paragraph
  combineParagraphs(p) {
    let combined = this.revision[p].concat(this.revision[p + 1]);
    this.revision.splice(p, 2, combined);

    this._commit(this.revision);
  }

  // Add sentence variant
  addVariant(text, p, s) {
    this.revision[p][s].unshift(text);

    this._commit(this.revision);
  }

  // Delete sentence variant
  deleteVariant(p, s, v) {
    this.revision[p][s].splice(v, 1);

    this._commit(this.revision);
  }

  // Choose best sentence variant
  chooseBest(p, s, v) {
    let best = this.revision[p][s].splice(v, 1);
    this.revision[p][s].unshift(best[0]);

    this._commit(this.revision);
  }

  // Move sentence by start and end indexes
  moveSentence(p, s, p2, s2) {
    let sentence = this.revision[p].splice(s, 1);
    this.revision[p2].splice(s2, 0, sentence[0]);

    const unfiltered = this.revision.length;
    this.removeEmptyParagraphs(this.revision);

    // Account for removed emtpy paragraphs
    if (p < p2 && unfiltered !== this.revision.length) {
      p2 -= 1;
    }

    this._commit(this.revision);
    this.onSentenceMoved(p2, s2);
  }

  // Move paragraph by start and end indexes
  moveParagraph(p, p2) {
    let paragraph = this.revision.splice(p, 1);
    this.revision.splice(p2, 0, paragraph[0]);

    this._commit(this.revision);
  }

  // Edit sentence variant
  editVariant(text, p, s, v) {
    this.revision[p][s].splice(v, 1, text);

    this._commit(this.revision);
  }

  tokenizeText(text) {
    // trim spaces
    text = text.replace(/^\s+|\s+$/gm, '\n');

    // split into paragraphs
    let paragraphs = text.split(/\n/);

    // remove empty paragraphs
    paragraphs = paragraphs.filter((p) => p !== '');

    // remove extra spaces
    paragraphs = paragraphs.map((p) => (p = p.replace(/\s+/g, ' ')));

    // split into sentences
    const intoSentences = /(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s/;
    this.revision = paragraphs.map((p) => p.split(intoSentences));

    // put sentences into arrays
    for (let p = 0; p < this.revision.length; p++) {
      for (let s = 0; s < this.revision[p].length; s++) {
        this.revision[p][s] = [this.revision[p][s]];
      }
    }

    this._commit(this.revision);
    this.onTextTokenized();
  }

  clearData() {
    this.revision = [];
    this._commit(this.revision);
  }
}

/**
 * @class View
 *
 * Visual representation of the model.
 */
class View {
  constructor() {
    this.paragraphList = document.querySelector('.paragraph-list');

    this._p, this._s, this._p2, this._s2;
  }

  bindRevision(revision) {
    this.revision = revision;
  }

  bindTokenizationVerified(callback) {
    this.onTokenizationVerified = callback;
  }

  bindClearDataVerified(callback) {
    this.onClearDataVerified = callback;
  }

  createElement(tag, className) {
    const element = document.createElement(tag);

    if (className) element.className = className;

    return element;
  }

  removeElement(element, focusElement) {
    element.remove();
    focusElement.focus();
  }

  getElementIndex(element) {
    var index = 0;
    while ((element = element.previousElementSibling)) {
      index++;
    }
    return index;
  }

  getSentenceIndexes(element) {
    const p = this.getElementIndex(element.closest('.paragraph'));
    const s = this.getElementIndex(element);
    return [p, s];
  }

  getVariantIndexes(element) {
    const p = this.getElementIndex(element.closest('.paragraph'));
    const s = this.getElementIndex(element.closest('.sentence'));
    const v = this.getElementIndex(element);
    return [p, s, v];
  }

  focusOnSentence(p, s) {
    document
      .querySelectorAll('.paragraph')
      [p].querySelectorAll('.sentence')
      [s].focus();
  }

  focusOnVariant(p, s, v) {
    const variants = document
      .querySelectorAll('.paragraph')
      [p].querySelectorAll('.sentence')
      [s].querySelectorAll('.variant');

    variants.forEach((variant) => {
      variant.classList.add('show');
      variant.tabIndex = 0;
    });

    while (!variants[v]) v--;

    variants[v].parentNode.setAttribute('draggable', 'false');
    variants[v].focus();
  }

  createSentenceInput(element) {
    const input = this.createElement('input', 'sentence-input');
    input.type = 'text';
    element.after(input);
    input.focus();
  }

  createVariantInput(element) {
    const input = this.createElement('input', 'variant-input');
    input.type = 'text';
    input.classList.add('show');
    element.firstChild.before(input);
    input.focus();
  }

  createEditInput(element) {
    const input = this.createElement('input', 'edit-input');
    input.type = 'text';
    input.value = element.textContent;
    input.classList.add('show');
    element.classList.remove('show');
    element.before(input);
    input.focus();
  }

  removeEditInput(element) {
    const focusElement = element.nextElementSibling;
    element.remove();
    focusElement.classList.add('show');
    focusElement.focus();
  }

  validateInput(text) {
    if (!/^\s*$/.test(text)) {
      return text.trim().replace(/^./, (e) => e.toUpperCase());
    }
  }

  displayRevision(revision) {
    this.paragraphList.innerHTML = '';

    for (var p = 0; p < revision.length; p++) {
      const paragraph = this.createElement('li', 'paragraph');
      this.paragraphList.appendChild(paragraph);

      const sentenceList = this.createElement('ul', 'sentence-list');
      paragraph.appendChild(sentenceList);

      for (var s = 0; s < revision[p].length; s++) {
        const sentence = this.createElement('li', 'sentence');
        sentence.setAttribute('draggable', 'true');
        sentence.tabIndex = 0;
        sentenceList.appendChild(sentence);

        for (var v = 0; v < revision[p][s].length; v++) {
          const variant = this.createElement('p', 'variant noselect');
          variant.textContent = revision[p][s][v];
          sentence.appendChild(variant);
        }
      }
    }
  }

  previewRevision(revision) {
    var sentencesArray = [];
    var paragraphsArray = [];

    // Filter best sentences
    for (var p = 0; p < revision.length; p++) {
      sentencesArray.push([]);
      for (var s = 0; s < revision[p].length; s++) {
        sentencesArray[p].push(revision[p][s][0]);
      }
    }

    for (var p = 0; p < sentencesArray.length; p++) {
      paragraphsArray.push(sentencesArray[p].join(' '));
    }

    document.querySelector('textarea').value = paragraphsArray.join('\n\n');
  }

  hideVariants() {
    const variants = document.querySelectorAll('.show');

    if (variants[0]) {
      variants[0].parentNode.setAttribute('draggable', 'true');

      variants.forEach((variant) => {
        variant.classList.remove('show');
        variant.removeAttribute('tabindex');
      });
    }
  }

  focusAfterSentenceDeletion(p, s) {
    if (this.revision.length) {
      if (this.revision[p]) {
        if (!this.revision[p][s]) {
          s -= 1;
        }
      } else {
        p -= 1;
        s = this.revision[p].length - 1;
      }

      this.focusOnSentence(p, s);
    }
  }

  getDragAfterElement(paragraph, y) {
    const draggableElements = [
      ...paragraph.querySelectorAll('.sentence:not(.dragging)'),
    ];

    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element;
  }

  verifyTokenization() {
    const text = document.querySelector('textarea').value;

    if (text) {
      if (this.revision.length > 0) {
        if (confirm('Confirm to permanently OVERWRITE the revision!')) {
          this.onTokenizationVerified(text);
        } else {
          return;
        }
      } else {
        this.onTokenizationVerified(text);
      }
    }
  }

  copyToClipboard() {
    document.querySelector('textarea').select();
    document.execCommand('copy');
  }

  verifyClearData() {
    if (confirm('Confirm to permanently DELETE the revision!')) {
      this.onClearDataVerified();
    } else {
      return;
    }
  }

  startTutorial() {
    const tutorial = [
      'Split the paragraphs into sentences by pressing the "Tokenize" button.',
      'Select a sentence in the "Editor Panel" on the left with a mouse click or by using the following keys: "UpArrow", "DownArrow", "PageUp", "PageDown", "Home", "End". Move a sentence by using "drag and drop" or by pressing the selection keys combined with the "Shift" key. Add a new sentence by pressing the "Enter" key.',
      'Add a new sentence variant by pressing the "Shift + Enter" keys. Hide sentence variants by pressing the "Esc" key or "LeftArrow" key. Show sentence variants by double-clicking or by pressing the "RightArrow" key. Add a new variant while in the "Variants Mode" by pressing the "Enter" key. Choose the best sentence variant by pressing the "Space" key. Quick edit a variant by pressing the "F2" key.',
      'Split the paragraph by pressing the "Ctrl + Enter" keys. Join the paragraph with the next one by pressing the "Ctrl + Backspace" keys. Move paragraph up by pressing "Ctrl + <" keys. Move paragraph down by pressing "Ctrl + >" keys.',
      'To permanently delete a sentence or a variant press the "Delete" key. If you are happy with the revision, copy the revised text from the "Preview Panel" on the right, by pressing the "Copy" button. To permanently clear the revision from the editor and the cache of your browser, press the "Clear" button.',
    ];

    document.querySelector('textarea').value = tutorial.join('\n\n');
  }

  // Event Listeners
  // 'p' is the paragraph index, 's' is the sentence index
  // 'p2' and 's2' are the next position indexes

  activateDragAndDrop(handle) {
    const paragraphs = document.querySelectorAll('.paragraph');
    const sentences = document.querySelectorAll('.sentence');

    sentences.forEach((sentence) => {
      sentence.addEventListener('dragstart', (e) => {
        sentence.classList.add('dragging');

        this._s = this.getElementIndex(sentence);
        this._p = this.getElementIndex(sentence.closest('.paragraph'));
      });

      sentence.addEventListener('dragend', (e) => {
        handle(this._p, this._s, this._p2, this._s2);
      });
    });

    paragraphs.forEach((paragraph) => {
      paragraph.addEventListener('dragover', (e) => {
        e.preventDefault();
        const sentence = document.querySelector('.dragging');
        const afterElement = this.getDragAfterElement(paragraph, e.clientY);
        this._p2 = this.getElementIndex(sentence.closest('.paragraph'));

        if (afterElement == null) {
          paragraph.firstChild.appendChild(sentence);
          this._s2 = this.revision[this._p2].length - 1;
        } else {
          paragraph.firstChild.insertBefore(sentence, afterElement);
          this._s2 = this.getElementIndex(afterElement) - 1;
        }
      });
    });
  }

  bindAddSentence(handler) {
    this.paragraphList.addEventListener('keydown', (event) => {
      if (event.target.className === 'sentence') {
        // Create 'Add Sentence' Input
        if (
          event.key === 'Enter' &&
          !event.getModifierState('Control') &&
          !event.getModifierState('Alt') &&
          !event.getModifierState('Shift')
        ) {
          this.createSentenceInput(event.target);
        }
      }

      if (event.target.className === 'sentence-input') {
        const focusElement = event.target.previousElementSibling;

        // Create new sentence
        if (event.key === 'Enter') {
          const text = this.validateInput(event.target.value);
          const [p, s] = this.getSentenceIndexes(event.target);

          if (text) {
            handler(text, p, s);
          } else {
            this.removeElement(event.target, focusElement);
          }
        }

        if (event.key === 'Escape') {
          this.removeElement(event.target, focusElement);
        }
      }
    });
  }

  bindDeleteSentence(handler) {
    this.paragraphList.addEventListener('keydown', (event) => {
      if (event.target.className === 'sentence') {
        if (event.key === 'Delete') {
          const [p, s] = this.getSentenceIndexes(event.target);

          handler(p, s);
        }
      }
    });
  }

  bindSplitParagraph(handler) {
    this.paragraphList.addEventListener('keydown', (event) => {
      if (event.target.className === 'sentence') {
        if (
          event.key === 'Enter' &&
          event.getModifierState('Control') &&
          !event.getModifierState('Alt') &&
          !event.getModifierState('Shift')
        ) {
          const [p, s] = this.getSentenceIndexes(event.target);

          if (s !== this.revision[p].length - 1) {
            handler(p, s);
          }
        }
      }
    });
  }

  bindCombineParagraphs(handler) {
    this.paragraphList.addEventListener('keydown', (event) => {
      if (event.target.className === 'sentence') {
        if (event.key === 'Backspace' && event.getModifierState('Control')) {
          const [p, s] = this.getSentenceIndexes(event.target);

          if (p !== this.revision.length - 1) {
            handler(p, s);
          }
        }
      }
    });
  }

  bindAddVariant(handler) {
    this.paragraphList.addEventListener('keydown', (event) => {
      if (event.target.className === 'sentence') {
        if (
          event.key === 'Enter' &&
          event.getModifierState('Shift') &&
          !event.getModifierState('Control') &&
          !event.getModifierState('Alt')
        ) {
          const [p, s] = this.getSentenceIndexes(event.target);

          this.focusOnVariant(p, s, 0);
          this.createVariantInput(event.target, 'variant-input');
        }
      }

      if (event.target.classList.contains('variant')) {
        if (event.key === 'Enter') {
          this.createVariantInput(event.target.parentNode, 'variant-input');
        }
      }

      if (event.target.classList.contains('variant-input')) {
        const focusElement = event.target.nextElementSibling;

        // Create new variant
        if (event.key === 'Enter') {
          const text = this.validateInput(event.target.value);
          const [p, s] = this.getVariantIndexes(event.target);

          if (text) {
            handler(text, p, s);
          } else {
            this.removeElement(event.target, focusElement);
          }
        }

        if (event.key === 'Escape') {
          this.removeElement(event.target, focusElement);
        }
      }
    });
  }

  bindDeleteVariant(handler) {
    this.paragraphList.addEventListener('keydown', (event) => {
      if (event.target.classList.contains('variant')) {
        if (event.code === 'Delete') {
          const [p, s, v] = this.getVariantIndexes(event.target);
          const variants = event.target.parentNode.querySelectorAll('.variant');

          if (variants.length > 1) handler(p, s, v);
        }
      }
    });
  }

  bindChooseBest(handler) {
    this.paragraphList.addEventListener('keydown', (event) => {
      if (event.target.classList.contains('variant')) {
        if (event.code === 'Space') {
          event.preventDefault();
          const [p, s, v] = this.getVariantIndexes(event.target);

          handler(p, s, v);
        }
      }
    });
  }

  bindMoveSentence(handler) {
    this.paragraphList.addEventListener('keydown', (event) => {
      if (event.target.className === 'sentence') {
        // Move the sentence up
        if (event.key === 'ArrowUp' && event.getModifierState('Shift')) {
          const [p, s] = this.getSentenceIndexes(event.target);
          let p2, s2;

          if (s > 0) {
            p2 = p;
            s2 = s - 1;
          } else if (p > 0) {
            p2 = p - 1;
            s2 = this.revision[p2].length;
          } else {
            p2 = this.revision.length - 1;
            s2 = this.revision[p2].length;
          }

          handler(p, s, p2, s2);
        }

        // Move the sentence down
        if (event.key === 'ArrowDown' && event.getModifierState('Shift')) {
          const [p, s] = this.getSentenceIndexes(event.target);
          let p2, s2;

          if (s < this.revision[p].length - 1) {
            p2 = p;
            s2 = s + 1;
          } else if (p < this.revision.length - 1) {
            p2 = p + 1;
            s2 = 0;
          } else {
            p2 = 0;
            s2 = 0;
          }

          handler(p, s, p2, s2);
        }

        // Move the sentence to the previous paragraph
        if (event.key === 'PageUp' && event.getModifierState('Shift')) {
          const [p, s] = this.getSentenceIndexes(event.target);
          const s2 = 0;
          let p2;

          if (p === 0) {
            p2 = this.revision.length - 1;
          } else {
            p2 = p - 1;
          }

          handler(p, s, p2, s2);
        }

        // Move the sentence to the next paragraph
        if (event.key === 'PageDown' && event.getModifierState('Shift')) {
          const [p, s] = this.getSentenceIndexes(event.target);
          const s2 = 0;
          let p2;

          if (p === this.revision.length - 1) {
            p2 = 0;
          } else {
            p2 = p + 1;
          }

          handler(p, s, p2, s2);
        }

        // Move the sentence to the beginning of the paragraph
        if (event.key === 'Home' && event.getModifierState('Shift')) {
          const [p, s] = this.getSentenceIndexes(event.target);
          let p2 = p;
          let s2 = 0;

          // Move the sentence to the beginning of the revision
          if (event.getModifierState('Control')) {
            p2 = 0;
            s2 = 0;
          }

          handler(p, s, p2, s2);
        }

        // Move the sentence to the end of the paragraph
        if (event.key === 'End' && event.getModifierState('Shift')) {
          const [p, s] = this.getSentenceIndexes(event.target);
          let p2 = p;
          let s2 = this.revision[p].length - 1;

          // Move the sentence to the end of the revision
          if (event.getModifierState('Control')) {
            p2 = this.revision.length - 1;
            if (p2 === p) {
              s2 = this.revision[p2].length - 1;
            } else {
              s2 = this.revision[p2].length;
            }
          }

          handler(p, s, p2, s2);
        }
      }
    });
  }

  bindChangeFocus() {
    this.paragraphList.addEventListener('keydown', (event) => {
      if (event.target.className === 'sentence') {
        const ignoreModfierKeys =
          !event.getModifierState('Shift') &&
          !event.getModifierState('Alt') &&
          !event.getModifierState('Control');

        // Select the previous sentence
        if (event.key === 'ArrowUp' && ignoreModfierKeys) {
          event.preventDefault();
          let [p, s] = this.getSentenceIndexes(event.target);

          if (s > 0) {
            s -= 1;
          } else if (p > 0) {
            p -= 1;
            s = this.revision[p].length - 1;
          } else {
            p = this.revision.length - 1;
            s = this.revision[p].length - 1;
          }

          this.focusOnSentence(p, s);
        }

        // Select the next sentence
        if (event.key === 'ArrowDown' && ignoreModfierKeys) {
          event.preventDefault();
          let [p, s] = this.getSentenceIndexes(event.target);

          if (s < this.revision[p].length - 1) {
            s += 1;
          } else if (p < this.revision.length - 1) {
            p += 1;
            s = 0;
          } else {
            p = 0;
            s = 0;
          }

          this.focusOnSentence(p, s);
        }

        // Select the first sentence of the previous paragraph
        if (event.key === 'PageUp' && ignoreModfierKeys) {
          event.preventDefault();
          let [p, s] = this.getSentenceIndexes(event.target);

          if (p > 0) {
            p -= 1;
          } else {
            p = this.revision.length - 1;
          }
          s = 0;

          this.focusOnSentence(p, s);
        }

        // Select the first sentence of the next paragraph
        if (event.key === 'PageDown' && ignoreModfierKeys) {
          event.preventDefault();
          let [p, s] = this.getSentenceIndexes(event.target);

          if (p < this.revision.length - 1) {
            p += 1;
          } else {
            p = 0;
          }
          s = 0;

          this.focusOnSentence(p, s);
        }

        // Select the first sentence in the paragraph
        if (
          event.key === 'Home' &&
          !event.getModifierState('Shift') &&
          !event.getModifierState('Alt')
        ) {
          event.preventDefault();
          let [p, s] = this.getSentenceIndexes(event.target);

          // Select the first sentence in the revision
          if (event.getModifierState('Control')) {
            p = 0;
          }
          s = 0;

          this.focusOnSentence(p, s);
        }

        // Select the last sentence in the paragraph
        if (
          event.key === 'End' &&
          !event.getModifierState('Shift') &&
          !event.getModifierState('Alt')
        ) {
          event.preventDefault();
          let [p, s] = this.getSentenceIndexes(event.target);

          // Select the last sentence in the revision
          if (event.getModifierState('Control')) {
            p = this.revision.length - 1;
          }
          s = this.revision[p].length - 1;

          this.focusOnSentence(p, s);
        }
      }
    });

    this.paragraphList.addEventListener('keydown', (event) => {
      if (event.target.classList.contains('variant')) {
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          const previous = event.target.previousElementSibling;

          if (previous) previous.focus();
        }

        if (event.key === 'ArrowDown') {
          event.preventDefault();
          const next = event.target.nextElementSibling;

          if (next) next.focus();
        }

        if (
          event.key === 'PageUp' ||
          event.key === 'PageDown' ||
          event.key === 'Home' ||
          event.key === 'End'
        ) {
          event.preventDefault();
        }
      }
    });
  }

  bindMoveParagraph(handler) {
    this.paragraphList.addEventListener('keydown', (event) => {
      if (event.target.className === 'sentence') {
        // Move the paragraph up
        if (event.code === 'Comma' && event.getModifierState('Control')) {
          const [p, s] = this.getSentenceIndexes(event.target);
          let p2;

          if (p === 0) {
            p2 = this.revision.length - 1;
          } else {
            p2 = p - 1;
          }

          handler(p, s, p2);
        }

        // Move the paragraph down
        if (event.code === 'Period' && event.getModifierState('Control')) {
          const [p, s] = this.getSentenceIndexes(event.target);
          let p2;

          if (p === this.revision.length - 1) {
            p2 = 0;
          } else {
            p2 = p + 1;
          }

          handler(p, s, p2);
        }
      }
    });
  }

  bindEnterVariantsMode() {
    this.paragraphList.addEventListener('keydown', (event) => {
      if (event.target.className === 'sentence') {
        if (event.key === 'ArrowRight') {
          const [p, s] = this.getSentenceIndexes(event.target);

          this.focusOnVariant(p, s, 0);
        }
      }
    });

    this.paragraphList.addEventListener('dblclick', (event) => {
      if (event.target.classList.contains('variant')) {
        const [p, s] = this.getVariantIndexes(event.target);

        this.focusOnVariant(p, s, 0);
      }
    });
  }

  bindCloseVariantsMode() {
    this.paragraphList.addEventListener('keydown', (event) => {
      if (event.target.classList.contains('variant')) {
        if (event.key === 'Escape' || event.key === 'ArrowLeft') {
          this.hideVariants();
          event.target.closest('.sentence').focus();
        }
      }
    });

    document.addEventListener('focusin', (event) => {
      if (!event.target.classList.contains('show')) {
        this.hideVariants();
      }
    });
  }

  bindMaintainInputFocus() {
    this.paragraphList.addEventListener('focusout', (event) => {
      if (
        event.target.classList.contains('sentence-input') ||
        event.target.classList.contains('variant-input') ||
        event.target.classList.contains('edit-input')
      ) {
        event.target.focus();
      }
    });
  }

  bindEditVariant(handle) {
    this.paragraphList.addEventListener('keydown', (event) => {
      if (event.target.classList.contains('variant')) {
        if (event.key === 'F2') {
          this.createEditInput(event.target);
        }
      }

      if (event.target.classList.contains('edit-input')) {
        if (event.key === 'Enter') {
          const text = this.validateInput(event.target.value);
          const [p, s, v] = this.getVariantIndexes(event.target);

          if (text) {
            handle(text, p, s, v);
          } else {
            this.removeEditInput(event.target);
          }
        }

        if (event.key === 'Escape') {
          this.removeEditInput(event.target);
        }
      }
    });
  }
}

/**
 * @class Controller
 *
 * Links the user input and the view output.
 *
 * @param model
 * @param view
 */
class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    // Explicit this binding
    this.model.bindRevisionChanged(this.onRevisionChanged);
    this.model.bindSentenceDeleted(this.onSentenceDeleted);
    this.model.bindSentenceMoved(this.onSentenceMoved);
    this.model.bindTextTokenized(this.onTextTokenized);
    this.view.bindTokenizationVerified(this.onTokenizationVerified);
    this.view.bindClearDataVerified(this.onClearDataVerified);
    this.view.bindAddSentence(this.handleAddSentence);
    this.view.bindDeleteSentence(this.handleDeleteSentence);
    this.view.bindSplitParagraph(this.handleSplitParagraph);
    this.view.bindCombineParagraphs(this.handleCombineParagraphs);
    this.view.bindAddVariant(this.handleAddVariant);
    this.view.bindDeleteVariant(this.handleDeleteVariant);
    this.view.bindChooseBest(this.handleChooseBest);
    this.view.bindMoveSentence(this.handleMoveSentence);
    this.view.bindMoveParagraph(this.handleMoveParagraph);
    this.view.bindChangeFocus();
    this.view.bindEnterVariantsMode();
    this.view.bindCloseVariantsMode();
    this.view.bindMaintainInputFocus();
    this.view.bindEditVariant(this.handleEditVariant);

    // Display initial revision
    this.onRevisionChanged(this.model.revision);
  }

  onRevisionChanged = (revision) => {
    this.view.bindRevision(revision);
    this.view.displayRevision(revision);
    this.view.previewRevision(revision);
    this.view.activateDragAndDrop(this.handleDragAndDrop);
  };

  onSentenceDeleted = (p, s) => {
    this.view.focusAfterSentenceDeletion(p, s);
  };

  onSentenceMoved = (p, s) => {
    this.view.focusOnSentence(p, s);
  };

  onTextTokenized = () => {
    this.view.focusOnSentence(0, 0);
  };

  onTokenizationVerified = (text) => {
    this.model.tokenizeText(text);
  };

  onClearDataVerified = () => {
    this.model.clearData();
  };

  // Handles
  // 'p' is paragraph index, 's' is sentence index
  // 'p2' and 's2' are next position indexes
  handleAddSentence = (text, p, s) => {
    this.model.addSentence(text, p, s);
    this.view.focusOnSentence(p, s);
  };

  handleDeleteSentence = (p, s) => {
    this.model.deleteSentence(p, s);
  };

  handleSplitParagraph = (p, s) => {
    this.model.splitParagraph(p, s);
    this.view.focusOnSentence(p, s);
  };

  handleCombineParagraphs = (p, s) => {
    this.model.combineParagraphs(p);
    this.view.focusOnSentence(p, s);
  };

  handleAddVariant = (text, p, s) => {
    this.model.addVariant(text, p, s);
    this.view.focusOnVariant(p, s, 0);
  };

  handleDeleteVariant = (p, s, v) => {
    this.model.deleteVariant(p, s, v);
    this.view.focusOnVariant(p, s, v);
  };

  handleChooseBest = (p, s, v) => {
    this.model.chooseBest(p, s, v);
    this.view.focusOnVariant(p, s, 0);
  };

  handleMoveSentence = (p, s, p2, s2) => {
    this.model.moveSentence(p, s, p2, s2);
  };

  handleMoveParagraph = (p, s, p2) => {
    this.model.moveParagraph(p, p2);
    this.view.focusOnSentence(p2, s);
  };

  handleEditVariant = (text, p, s, v) => {
    this.model.editVariant(text, p, s, v);
    this.view.focusOnVariant(p, s, v);
  };

  handleDragAndDrop = (p, s, p2, s2) => {
    this.model.moveSentence(p, s, p2, s2);
  };
}

const app = new Controller(new Model(), new View());
