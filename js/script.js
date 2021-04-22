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

  // Add sentence

  // Delete sentence

  // Split paragraph in two paragraphs

  // Combine paragraph with next paragraph

  // Add sentence variant

  // Delete sentence variant

  // Chose best sentence variant

  // Move Sentence

  // Move Paragraph
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