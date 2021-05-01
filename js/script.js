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

  tokenizeText() {
    var text = document.querySelector('textarea').value;

    // trim spaces
    text = text.replace(/^\s+|\s+$/gm, '\n');

    // split into paragraphs
    var paragraphs = text.split(/\n/);

    // remove empty paragraphs
    paragraphs = paragraphs.filter((p) => p !== '');

    // remove extra spaces
    paragraphs = paragraphs.map((p) => (p = p.replace(/\s+/g, ' ')));

    // split into sentences
    var intoSentences = /(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s/;
    this.revision = paragraphs.map((p) => p.split(intoSentences));

    // put sentences into arrays
    for (var p = 0; p < this.revision.length; p++) {
      for (var s = 0; s < this.revision[p].length; s++) {
        this.revision[p][s] = [this.revision[p][s]];
      }
    }

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
    this.paragraphList = this.getElement('.paragraph-list');
  }

  bindRevision(revision) {
    this.revision = revision;
  }

  createElement(tag, className) {
    const element = document.createElement(tag);

    if (className) element.className = className;

    return element;
  }

  removeElement(element, nextTarget) {
    element.remove();
    nextTarget.focus();
  }

  getElement(selector) {
    const element = document.querySelector(selector);

    return element;
  }

  getElementIndex(element) {
    var index = 0;
    while ((element = element.previousElementSibling)) {
      index++;
    }
    return index;
  }

  focusOnElement(p, s) {
    document
      .querySelectorAll('.paragraph')
      [p].querySelectorAll('.sentence')
      [s].focus();
  }

  createInput(sentence, className) {
    const input = this.createElement('input', className);
    input.type = 'text';

    if (className === 'variant-input') {
      input.classList.add('show');
      sentence.firstChild.before(input);
    } else if (className === 'sentence-input') {
      sentence.after(input);
    }

    input.focus();
  }

  validateInput(text) {
    if (!/^\s*$/.test(text)) {
      return text.trim().replace(/^./, (w) => w.toUpperCase());
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

  enterVariantsMode(p, s) {
    const variants = document
      .querySelectorAll('.paragraph')
      [p].querySelectorAll('.sentence')
      [s].querySelectorAll('.variant');

    variants.forEach((variant) => {
      variant.classList.add('show');
      variant.tabIndex = 0;
    });

    variants[0].focus();
  }

  exitVariantsMode() {
    const variants = document.querySelectorAll('.show');

    variants.forEach((variant) => {
      variant.classList.remove('show');
      variant.removeAttribute('tabindex');
    });
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

      this.focusOnElement(p, s);
    }
  }

  // Event Listeners
  // 'p' is the paragraph index, 's' is the sentence index
  // 'p2' and 's2' are the next position indexes

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
          this.createInput(event.target, 'sentence-input');
        }
      }

      if (event.target.className === 'sentence-input') {
        const nextTarget = event.target.previousElementSibling;

        // Create new sentence
        if (event.key === 'Enter') {
          let text = event.target.value;
          const p = this.getElementIndex(event.target.closest('.paragraph'));
          const s = this.getElementIndex(event.target);

          const validText = this.validateInput(text);

          if (validText) {
            handler(validText, p, s);
          } else {
            this.removeElement(event.target, nextTarget);
          }
        }

        if (event.key === 'Escape') {
          this.removeElement(event.target, nextTarget);
        }
      }
    });
  }

  bindDeleteSentence(handler) {
    this.paragraphList.addEventListener('keydown', (event) => {
      if (event.target.className === 'sentence') {
        if (event.key === 'Delete') {
          const p = this.getElementIndex(event.target.closest('.paragraph'));
          const s = this.getElementIndex(event.target);

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
          const p = this.getElementIndex(event.target.closest('.paragraph'));
          const s = this.getElementIndex(event.target);

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
          const p = this.getElementIndex(event.target.closest('.paragraph'));
          const s = this.getElementIndex(event.target);

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
          const p = this.getElementIndex(event.target.closest('.paragraph'));
          const s = this.getElementIndex(event.target);

          this.enterVariantsMode(p, s);
          this.createInput(event.target, 'variant-input');
        }
      }

      if (event.target.classList.contains('variant')) {
        if (event.key === 'Enter') {
          const sentence = event.target.closest('.sentence');

          this.createInput(sentence, 'variant-input');
        }
      }

      if (event.target.classList.contains('variant-input')) {
        const nextTarget = event.target.nextElementSibling;

        // Create new variant
        if (event.key === 'Enter') {
          let text = event.target.value;
          const p = this.getElementIndex(event.target.closest('.paragraph'));
          const s = this.getElementIndex(event.target.closest('.sentence'));

          const validText = this.validateInput(text);

          if (validText) {
            handler(validText, p, s);
          } else {
            this.removeElement(event.target, nextTarget);
          }
        }

        if (event.key === 'Escape') {
          this.removeElement(event.target, nextTarget);
        }
      }
    });
  }

  bindDeleteVariant(handler) {
    this.paragraphList.addEventListener('keydown', (event) => {
      if (event.target.classList.contains('variant')) {
        if (event.code === 'Delete') {
          const p = this.getElementIndex(event.target.closest('.paragraph'));
          const s = this.getElementIndex(event.target.closest('.sentence'));
          const v = this.getElementIndex(event.target);
          const variants = event.target.parentNode.querySelectorAll('.variant');

          if (variants.length > 1) {
            handler(p, s, v);
            this.enterVariantsMode(p, s);
          }
        }
      }
    });
  }

  bindChooseBest(handler) {
    this.paragraphList.addEventListener('keydown', (event) => {
      if (event.target.classList.contains('variant')) {
        if (event.code === 'Space') {
          const p = this.getElementIndex(event.target.closest('.paragraph'));
          const s = this.getElementIndex(event.target.closest('.sentence'));
          const v = this.getElementIndex(event.target);

          handler(p, s, v);
          this.enterVariantsMode(p, s);
        }
      }
    });
  }

  bindMoveSentence(handler) {
    this.paragraphList.addEventListener('keydown', (event) => {
      if (event.target.className === 'sentence') {
        // Move the sentence up
        if (event.key === 'ArrowUp' && event.getModifierState('Shift')) {
          const p = this.getElementIndex(event.target.closest('.paragraph'));
          const s = this.getElementIndex(event.target);
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
          const p = this.getElementIndex(event.target.closest('.paragraph'));
          const s = this.getElementIndex(event.target);
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
          const p = this.getElementIndex(event.target.closest('.paragraph'));
          const s = this.getElementIndex(event.target);
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
          const p = this.getElementIndex(event.target.closest('.paragraph'));
          const s = this.getElementIndex(event.target);
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
          const p = this.getElementIndex(event.target.closest('.paragraph'));
          const s = this.getElementIndex(event.target);
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
          const p = this.getElementIndex(event.target.closest('.paragraph'));
          const s = this.getElementIndex(event.target);
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
          let p = this.getElementIndex(event.target.closest('.paragraph'));
          let s = this.getElementIndex(event.target);

          if (s > 0) {
            s -= 1;
          } else if (p > 0) {
            p -= 1;
            s = this.revision[p].length - 1;
          } else {
            p = this.revision.length - 1;
            s = this.revision[p].length - 1;
          }

          this.focusOnElement(p, s);
        }

        // Select the next sentence
        if (event.key === 'ArrowDown' && ignoreModfierKeys) {
          event.preventDefault();
          let p = this.getElementIndex(event.target.closest('.paragraph'));
          let s = this.getElementIndex(event.target);

          if (s < this.revision[p].length - 1) {
            s += 1;
          } else if (p < this.revision.length - 1) {
            p += 1;
            s = 0;
          } else {
            p = 0;
            s = 0;
          }

          this.focusOnElement(p, s);
        }

        // Select the first sentence of the previous paragraph
        if (event.key === 'PageUp' && ignoreModfierKeys) {
          event.preventDefault();
          let p = this.getElementIndex(event.target.closest('.paragraph'));
          let s = this.getElementIndex(event.target);

          if (p > 0) {
            p -= 1;
          } else {
            p = this.revision.length - 1;
          }
          s = 0;

          this.focusOnElement(p, s);
        }

        // Select the first sentence of the next paragraph
        if (event.key === 'PageDown' && ignoreModfierKeys) {
          event.preventDefault();
          let p = this.getElementIndex(event.target.closest('.paragraph'));
          let s = this.getElementIndex(event.target);

          if (p < this.revision.length - 1) {
            p += 1;
          } else {
            p = 0;
          }
          s = 0;

          this.focusOnElement(p, s);
        }

        // Select the first sentence in the paragraph
        if (
          event.key === 'Home' &&
          !event.getModifierState('Shift') &&
          !event.getModifierState('Alt')
        ) {
          event.preventDefault();
          let p = this.getElementIndex(event.target.closest('.paragraph'));
          let s = this.getElementIndex(event.target);

          // Select the first sentence in the revision
          if (event.getModifierState('Control')) {
            p = 0;
          }
          s = 0;

          this.focusOnElement(p, s);
        }

        // Select the last sentence in the paragraph
        if (
          event.key === 'End' &&
          !event.getModifierState('Shift') &&
          !event.getModifierState('Alt')
        ) {
          event.preventDefault();
          let p = this.getElementIndex(event.target.closest('.paragraph'));
          let s = this.getElementIndex(event.target);

          // Select the last sentence in the revision
          if (event.getModifierState('Control')) {
            p = this.revision.length - 1;
          }
          s = this.revision[p].length - 1;

          this.focusOnElement(p, s);
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
      }
    });
  }

  bindMoveParagraph(handler) {
    this.paragraphList.addEventListener('keydown', (event) => {
      if (event.target.className === 'sentence') {
        // Move the paragraph up
        if (event.code === 'Comma' && event.getModifierState('Control')) {
          const p = this.getElementIndex(event.target.closest('.paragraph'));
          const s = this.getElementIndex(event.target);
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
          const p = this.getElementIndex(event.target.closest('.paragraph'));
          const s = this.getElementIndex(event.target);
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
          const p = this.getElementIndex(event.target.closest('.paragraph'));
          const s = this.getElementIndex(event.target);

          this.enterVariantsMode(p, s);
        }
      }
    });

    this.paragraphList.addEventListener('dblclick', (event) => {
      if (event.target.className === 'variant') {
        const p = this.getElementIndex(event.target.closest('.paragraph'));
        const s = this.getElementIndex(event.target.closest('.sentence'));

        this.enterVariantsMode(p, s);
      }
    });
  }

  bindCloseVariantsMode() {
    this.paragraphList.addEventListener('keydown', (event) => {
      if (event.target.classList.contains('variant')) {
        if (event.key === 'Escape' || event.key === 'ArrowLeft') {
          this.exitVariantsMode();
          event.target.closest('.sentence').focus();
        }
      }
    });

    document.addEventListener('focusin', (event) => {
      if (!event.target.classList.contains('show')) {
        this.exitVariantsMode();
      }
    });
  }

  bindMaintainInputFocus() {
    this.paragraphList.addEventListener('focusout', (event) => {
      if (
        event.target.classList.contains('sentence-input') ||
        event.target.classList.contains('variant-input')
      ) {
        event.target.focus();
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

    // Display initial revision
    this.onRevisionChanged(this.model.revision);
  }

  onRevisionChanged = (revision) => {
    this.view.bindRevision(revision);
    this.view.displayRevision(revision);
    this.view.previewRevision(revision);
  };

  onSentenceDeleted = (p, s) => {
    this.view.focusAfterSentenceDeletion(p, s);
  };

  onSentenceMoved = (p, s) => {
    this.view.focusOnElement(p, s);
  };

  // Handlers
  // 'p' is paragraph index, 's' is sentence index
  // 'p2' and 's2' are next position indexes
  handleAddSentence = (text, p, s) => {
    this.model.addSentence(text, p, s);
    this.view.focusOnElement(p, s);
  };

  handleDeleteSentence = (p, s) => {
    this.model.deleteSentence(p, s);
  };

  handleSplitParagraph = (p, s) => {
    this.model.splitParagraph(p, s);
    this.view.focusOnElement(p, s);
  };

  handleCombineParagraphs = (p, s) => {
    this.model.combineParagraphs(p);
    this.view.focusOnElement(p, s);
  };

  handleAddVariant = (text, p, s) => {
    this.model.addVariant(text, p, s);
    this.view.enterVariantsMode(p, s);
  };

  handleDeleteVariant = (p, s, v) => {
    this.model.deleteVariant(p, s, v);
  };

  handleChooseBest = (p, s, v) => {
    this.model.chooseBest(p, s, v);
  };

  handleMoveSentence = (p, s, p2, s2) => {
    this.model.moveSentence(p, s, p2, s2);
  };

  handleMoveParagraph = (p, s, p2) => {
    this.model.moveParagraph(p, p2);
    this.view.focusOnElement(p2, s);
  };
}

const app = new Controller(new Model(), new View());
