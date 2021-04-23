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
  constructor() {}
}

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }
}

const app = new Controller(new Model(), new View());