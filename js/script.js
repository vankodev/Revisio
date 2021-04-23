class Model {
  constructor() {
    this.revision = [
      [
        [
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          "Loremka ipsumka dolorka sitka ametka.",
        ],
        [
          "Morbi cursus aliquam eros, vel cursus ligula hendrerit vitae.",
          "Morbinka cursuska aliquamka roska, velka cursuska ligualka."
        ],
        [
          "Etiam imperdiet vitae nisl sed volutpat.",
          "Etiamka imperdietka vitaenka nislanka sedanka volutatka.",
        ],
      ],
      [
        ["Quisque tristique tellus quis blandit rhoncus."],
        ["Morbi fringilla imperdiet orci.", "Praesent id dictum nunc."],
        [
          "Sed sit amet ornare nunc.",
          "Sedka sitka ametka ornanertka.",
          "Amenka ornarka nunancunka.",
        ],
        ["Vestibulum quis leo mollis, commodo turpis et, porta tortor."],
        [
          "Vestibulum eget vehicula tellus, vel congue sapien. Etiam non vulputate purus.",
        ],
      ],
    ];
  }

  // Add sentence by its indexes
  addSentence(text, p, s) {
    this.revision[p].splice(s, 0, text);
  }

  // Delete sentence
  deleteSentence(p, s) {
    this.revision[p].splice(s, 1);
  }

  // Split paragraph in two paragraphs
  splitParagraph(p, s) {
    let part = this.revision[p].splice(s);
    this.revision.splice(p + 1, 0, part);
  }

  // Combine paragraph with next paragraph
  combineParagraphs(p) {
    let combined = this.revision[p].concat(this.revision[p + 1]);
    this.revision.splice(p, p + 2, combined);
  }

  // Add sentence variant
  addVariant(text, p, s) {
    this.revision[p][s].push(text);
  }

  // Delete sentence variant
  deleteVariant(p, s, v) {
    this.revision[p][s].splice(v, 1);
  }

  // Choose best sentence variant
  chooseBest(p, s, v) {
    let best = this.revision[p][s].splice(v, 1);
    this.revision[p][s].unshift(...best);
  }

  // Move sentence by start and end indexes
  moveSentence(p, s, p2, s2) {
    let sentence = this.revision[p].splice(s, 1);
    this.revision[p2].splice(s2, 0, ...sentence);
  }

  // Move paragraph by start and end indexes
  moveParagraph(p, p2) {
    let paragraph = this.revision.splice(p, 1);
    this.revision.splice(p2, 0, ...paragraph);
  }
}

class View {
  constructor() {
    this.paragraphList = this.getElement(".paragraph-list");
  }

  createElement(tag, className) {
    const element = document.createElement(tag);

    if (className) element.classList.add(className);

    return element;
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

  displayRevision(revision) {
    this.paragraphList.innerHTML = "";

    for (var p = 0; p < revision.length; p++) {
      const paragraph = this.createElement("li", "paragraph");
      this.paragraphList.appendChild(paragraph);

      const sentenceList = this.createElement("ul", "sentence-list");
      paragraph.appendChild(sentenceList);

      for (var s = 0; s < revision[p].length; s++) {
        const sentence = this.createElement("li", "sentence");
        sentence.setAttribute("draggable", "true");
        sentence.tabIndex = 0;
        sentenceList.appendChild(sentence);

        for (var v = 0; v < revision[p][s].length; v++) {
          const variant = this.createElement("p", "variant");
          variant.textContent = revision[p][s][v];
          sentence.appendChild(variant);
        }
      }
    }
  }
}

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    // Display initial revision
    this.onRevisionChanged(this.model.revision);
  }

  onRevisionChanged = (revision) => {
    this.view.displayRevision(revision);
  };

  handleAddSentence = (text, p, s) => {
    this.model.addSentence(text, p, s);
  };

  handleDeleteSentence = (p, s) => {
    this.model.deleteSentence(p, s);
  }

  handleSplitParagraph = (p, s) => {
    this.model.splitParagraph(p, s);
  }

  handleCombineParagraphs = (p) => {
    this.model.combineParagraphs(p);
  }

  handleAddVariant = (text, p, s) => {
    this.model.addVariant(text, p, s);
  }

  handleDeleteVariant = (p, s, v) => {
    this.model.deleteVariant(p, s, v);
  }

  handleChooseBest = (p, s, v) => {
    this.model.chooseBest(p, s, v);
  }

  handleMoveSentence = (p, s, p2, s2) => {
    this.model.moveSentence(p, s, p2, s2);
  }

  handleMoveParagraph = (p, p2) => {
    this.model.moveParagraph(p, p2);
  }
}

const app = new Controller(new Model(), new View());
