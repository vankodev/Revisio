# Revisio - Text Editor

## Project Overview

A unique text editing tool designed to simplify writing revisions. Written in Vanilla JavaScript utilizing the Model-View-Controller (MVC) architecture.

The purpose of this app is to help users focus on writing instead of copying and pasting by giving them a bird's eye view of their text. It automates tasks like rearranging sentences and paragraphs, and keeps track of different versions of each sentence. Its core strength lies in its keyboard shortcuts, designed to speed up the revision process.

[Live Demo](https://revisio.netlify.app/)

## Key Features

- **Data Persistence:** Utilizes localStorage to retain revision data.
- **Text Tokenization:** Employs Regular Expressions to parse raw text into a structured format, organizing it into paragraphs and sentences.
- **User Interaction:** Utilizes Event Handling to respond to user input, facilitating efficient editing through various keyboard shortcuts and actions.
- **Content Editing:** Offers multiple methods to manipulate paragraphs, sentences, and their variations by handling actions such as addition, deletion, splitting, combining, and moving.
- **Visual Display and Preview:** Provides a real-time preview of the final text alongside the current revision.

## Usage

1.  **Getting Started:**

- Upon launching the app, input your unrevised text in the right window panel.
- Alternatively, initiate the guided tutorial by clicking the 'Tutorial' button in the menu to familiarize yourself with the workflow and shortcuts.

2.  **Revision Workflow:**

- Easily edit your text in the left window panel using only shortcuts.
- Modify or rearrange the order of sentences and paragraphs.
- Access the version history of a sentence and select the most suitable variant.

3.  **Real-time Updates:**

- Witness the final result update in real-time on the right window panel as you make revisions.
