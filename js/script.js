class Model {
  constructor() {
    this.revision = [
      [
        [
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
          'Loremka ipsumka dolorka sitka ametka.',
        ],
        [
          'Morbi cursus aliquam eros, vel cursus ligula hendrerit vitae.',
          'Morbinka cursuska aliquamka roska, velka cursuska ligualka.',
        ],
        [
          'Etiam imperdiet vitae nisl sed volutpat.',
          'Etiamka imperdietka vitaenka nislanka sedanka volutatka.',
        ],
      ],
      [
        ['Quisque tristique tellus quis blandit rhoncus.'],
        ['Morbi fringilla imperdiet orci.', 'Praesent id dictum nunc.'],
        [
          'Sed sit amet ornare nunc.',
          'Sedka sitka ametka ornanertka.',
          'Amenka ornarka nunancunka.',
        ],
        ['Vestibulum quis leo mollis, commodo turpis et, porta tortor.'],
        [
          'Vestibulum eget vehicula tellus, vel congue sapien. Etiam non vulputate purus.',
        ],
      ],
    ];
  }

  bindRevisionChanged(callback) {
    this.onRevisionChanged = callback;
  }

  bindSentenceDeleted(callback) {
    this.onSentenceDeleted = callback;
  }

  // Modifying the revision's data
  // 'p' is paragraph index, 's' is sentence index
  // 'p2' and 's2' are next position indexes

  // Add sentence by its indexes
  addSentence(text, p, s) {
    this.revision[p].splice(s, 0, [text]);

    this.onRevisionChanged(this.revision);
  }

  // Delete sentence
  deleteSentence(p, s) {
    this.revision[p].splice(s, 1);

    this.onRevisionChanged(this.revision);
    this.onSentenceDeleted(this.revision, p, s);
  }

  // Split paragraph in two paragraphs
  splitParagraph(p, s) {
    let part = this.revision[p].splice(s + 1);
    this.revision.splice(p + 1, 0, part);

    this.onRevisionChanged(this.revision);
  }

  // Combine paragraph with next paragraph
  combineParagraphs(p) {
    let combined = this.revision[p].concat(this.revision[p + 1]);
    this.revision.splice(p, 2, combined);

    this.onRevisionChanged(this.revision);
  }

  // Add sentence variant
  addVariant(text, p, s) {
    this.revision[p][s].unshift(text);

    this.onRevisionChanged(this.revision);
  }

  // Delete sentence variant
  deleteVariant(p, s, v) {
    this.revision[p][s].splice(v, 1);

    this.onRevisionChanged(this.revision);
  }

  // Choose best sentence variant
  chooseBest(p, s, v) {
    let best = this.revision[p][s].splice(v, 1);
    this.revision[p][s].unshift(best[0]);

    this.onRevisionChanged(this.revision);
  }

  // Move sentence by start and end indexes
  moveSentence(p, s, p2, s2) {
    let sentence = this.revision[p].splice(s, 1);
    this.revision[p2].splice(s2, 0, sentence[0]);

    this.onRevisionChanged(this.revision);
  }

  // Move paragraph by start and end indexes
  moveParagraph(p, p2) {
    let paragraph = this.revision.splice(p, 1);
    this.revision.splice(p2, 0, paragraph[0]);

    this.onRevisionChanged(this.revision);
  }
}

class View {
  constructor() {
    this.paragraphList = this.getElement('.paragraph-list');
  }

  createElement(tag, className) {
    const element = document.createElement(tag);

    if (className) element.classList.add(className);

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
          const variant = this.createElement('p', 'variant');
          variant.textContent = revision[p][s][v];
          sentence.appendChild(variant);
        }
      }
    }
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

  focusAfterSentenceDeletion(revision, p, s) {
    if (revision.length) {
      if (revision[p]) {
        if (!revision[p][s]) {
          s -= 1;
        }
      } else {
        p -= 1;
        s = revision[p].length - 1;
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

  bindSplitParagraph(handler, revision) {
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

          if (s !== revision[p].length - 1) {
            handler(p, s);
          }
        }
      }
    });
  }

  bindCombineParagraphs(handler, revision) {
    this.paragraphList.addEventListener('keydown', (event) => {
      if (event.target.className === 'sentence') {
        if (event.key === 'Backspace' && event.getModifierState('Control')) {
          const p = this.getElementIndex(event.target.closest('.paragraph'));
          const s = this.getElementIndex(event.target);

          if (p !== revision.length - 1) {
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

  bindMoveSentence(handler, revision) {
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
            s2 = revision[p2].length;
          } else {
            p2 = revision.length - 1;
            s2 = revision[p2].length;
          }

          handler(p, s, p2, s2);
        }

        // Move the sentence down
        if (event.key === 'ArrowDown' && event.getModifierState('Shift')) {
          const p = this.getElementIndex(event.target.closest('.paragraph'));
          const s = this.getElementIndex(event.target);
          let p2, s2;

          if (s < revision[p].length - 1) {
            p2 = p;
            s2 = s + 1;
          } else if (p < revision.length - 1) {
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
            p2 = revision.length - 1;
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

          if (p === revision.length - 1) {
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
          let p2, s2;

          // Move the sentence to the beginning of the revision
          if (event.getModifierState('Control')) {
            p2 = 0;
            s2 = 0;
          } else {
            p2 = p;
            s2 = 0;
          }

          handler(p, s, p2, s2);
        }

        // Move the sentence to the end of the paragraph
        if (event.key === 'End' && event.getModifierState('Shift')) {
          const p = this.getElementIndex(event.target.closest('.paragraph'));
          const s = this.getElementIndex(event.target);
          let p2, s2;

          // Move the sentence to the end of the revision
          if (event.getModifierState('Control')) {
            p2 = revision.length - 1;
            s2 = revision[p2].length;
          } else {
            p2 = p;
            s2 = revision[p].length - 1;
          }

          handler(p, s, p2, s2);
        }
      }
    });
  }

  bindChangeFocus(revision) {
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
            s = revision[p].length - 1;
          } else {
            p = revision.length - 1;
            s = revision[p].length - 1;
          }

          this.focusOnElement(p, s);
        }

        // Select the next sentence
        if (event.key === 'ArrowDown' && ignoreModfierKeys) {
          event.preventDefault();
          let p = this.getElementIndex(event.target.closest('.paragraph'));
          let s = this.getElementIndex(event.target);

          if (s < revision[p].length - 1) {
            s += 1;
          } else if (p < revision.length - 1) {
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
            p = revision.length - 1;
          }
          s = 0;

          this.focusOnElement(p, s);
        }

        // Select the first sentence of the next paragraph
        if (event.key === 'PageDown' && ignoreModfierKeys) {
          event.preventDefault();
          let p = this.getElementIndex(event.target.closest('.paragraph'));
          let s = this.getElementIndex(event.target);

          if (p < revision.length - 1) {
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
            p = revision.length - 1;
          }
          s = revision[p].length - 1;

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

  bindMoveParagraph(handler, revision) {
    this.paragraphList.addEventListener('keydown', (event) => {
      if (event.target.className === 'sentence') {
        // Move the paragraph up
        if (event.code === 'Comma' && event.getModifierState('Control')) {
          const p = this.getElementIndex(event.target.closest('.paragraph'));
          const s = this.getElementIndex(event.target);
          let p2;

          if (p === 0) {
            p2 = revision.length - 1;
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

          if (p === revision.length - 1) {
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
}
class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    // Explicit this binding
    this.model.bindRevisionChanged(this.onRevisionChanged);
    this.view.bindAddSentence(this.handleAddSentence);
    this.view.bindDeleteSentence(this.handleDeleteSentence);
    this.model.bindSentenceDeleted(this.onSentenceDeleted);
    this.view.bindSplitParagraph(
      this.handleSplitParagraph,
      this.model.revision
    );
    this.view.bindCombineParagraphs(
      this.handleCombineParagraphs,
      this.model.revision
    );
    this.view.bindAddVariant(this.handleAddVariant);
    this.view.bindDeleteVariant(this.handleDeleteVariant);
    this.view.bindChooseBest(this.handleChooseBest);
    this.view.bindMoveSentence(this.handleMoveSentence, this.model.revision);
    this.view.bindMoveParagraph(this.handleMoveParagraph, this.model.revision);
    this.view.bindChangeFocus(this.model.revision);
    this.view.bindEnterVariantsMode();
    this.view.bindCloseVariantsMode();

    // Display initial revision
    this.onRevisionChanged(this.model.revision);
  }

  onRevisionChanged = (revision) => {
    this.view.displayRevision(revision);
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

  onSentenceDeleted = (revision, p, s) => {
    this.view.focusAfterSentenceDeletion(revision, p, s);
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
    this.view.focusOnElement(p2, s2);
  };

  handleMoveParagraph = (p, s, p2) => {
    this.model.moveParagraph(p, p2);
    this.view.focusOnElement(p2, s);
  };
}

const app = new Controller(new Model(), new View());
