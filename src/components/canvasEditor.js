

import { getTextFromPromptTextarea, setTextToPromptTextarea } from '../utils/utils.js';

export function openCanvasEditor() {

  let canvasOverlay = document.getElementById('canvas-overlay');
  if (!canvasOverlay) {
    canvasOverlay = document.createElement('div');
    canvasOverlay.id = 'canvas-overlay';
    canvasOverlay.classList.add('canvas-overlay');
    document.body.appendChild(canvasOverlay);
  } else {
    canvasOverlay.classList.remove('hidden');
  }


  let canvasEditor = document.getElementById('canvas-editor');
  if (canvasEditor) {
    canvasEditor.classList.remove('hidden');
    return;
  }

  canvasEditor = document.createElement('div');
  canvasEditor.id = 'canvas-editor';
  canvasEditor.classList.add('canvas-editor');


  const header = document.createElement('div');
  header.classList.add('canvas-header');


  const headerIcon = document.createElement('img');
  headerIcon.src = chrome.runtime.getURL('assets/icons/square.svg');
  headerIcon.classList.add('canvas-header-icon');
  header.appendChild(headerIcon);


  const title = document.createElement('div');
  title.classList.add('canvas-title');
  title.textContent = 'Combai editing form';
  header.appendChild(title);


  const closeIcon = document.createElement('img');
  closeIcon.src = chrome.runtime.getURL('assets/icons/maximize.svg');
  closeIcon.classList.add('canvas-close-icon');
  closeIcon.addEventListener('click', () => {
    const text = getTextFromCanvas();
    setTextToPromptTextarea(text);
    closeCanvasEditor();
  });
  header.appendChild(closeIcon);

  canvasEditor.appendChild(header);


  const mainContent = document.createElement('div');
  mainContent.classList.add('canvas-main-content');


  const lineNumbers = document.createElement('div');
  lineNumbers.classList.add('canvas-line-numbers');


  const textArea = document.createElement('textarea');
  textArea.classList.add('canvas-textarea');
  textArea.spellcheck = false;

  const promptText = getTextFromPromptTextarea();
  textArea.value = promptText;

  mainContent.appendChild(lineNumbers);
  mainContent.appendChild(textArea);

  canvasEditor.appendChild(mainContent);


  const footer = document.createElement('div');
  footer.classList.add('canvas-footer');

  const insertTextButton = document.createElement('button');
  insertTextButton.classList.add('insert-text-button');


  const insertTextIcon = document.createElement('img');
  insertTextIcon.src = chrome.runtime.getURL('assets/icons/file-text.svg');
  insertTextIcon.classList.add('insert-text-icon');
  insertTextButton.appendChild(insertTextIcon);


  const buttonText = document.createElement('span');
  buttonText.textContent = 'Insert Text';
  insertTextButton.appendChild(buttonText);

  insertTextButton.addEventListener('click', () => {
    const text = getTextFromCanvas();
    setTextToPromptTextarea(text);
    closeCanvasEditor();
  });

  footer.appendChild(insertTextButton);

  canvasEditor.appendChild(footer);

  document.body.appendChild(canvasEditor);

  initializeCanvasEditor(textArea, lineNumbers);
}

function closeCanvasEditor() {
  const canvasEditor = document.getElementById('canvas-editor');
  const canvasOverlay = document.getElementById('canvas-overlay');
  if (canvasEditor) {
    canvasEditor.classList.add('hidden');
  }
  if (canvasOverlay) {
    canvasOverlay.classList.add('hidden');
  }
}

function getTextFromCanvas() {
  const textArea = document.querySelector('.canvas-textarea');
  return textArea ? textArea.value : '';
}

function initializeCanvasEditor(textArea, lineNumbers) {
  let collapsedSections = {};

  const updateContent = () => {
    const lines = textArea.value.split('\n');
    lineNumbers.innerHTML = '';

    let insideCollapsible = false;
    let collapsibleStartIndex = null;

    lines.forEach((lineText, index) => {
      const lineNumber = index + 1;
      const lineNumberElement = document.createElement('div');
      lineNumberElement.classList.add('line-number');
      lineNumberElement.textContent = lineNumber;


      if (isCurrentLine(index, textArea)) {
        lineNumberElement.classList.add('current-line');
      }


      if (lineText.trim().endsWith('<>')) {
        if (insideCollapsible) {

          insideCollapsible = false;
          addExpandIcon(lineNumberElement, collapsibleStartIndex, index, textArea, collapsedSections);
        } else {

          insideCollapsible = true;
          collapsibleStartIndex = index;
          addCollapseIcon(lineNumberElement, collapsibleStartIndex, textArea, collapsedSections);
        }
      }

      lineNumbers.appendChild(lineNumberElement);
    });
  };

  const isCurrentLine = (lineIndex, textArea) => {
    const selectionStart = textArea.selectionStart;
    const textBeforeCursor = textArea.value.substr(0, selectionStart);
    const currentLineIndex = textBeforeCursor.split('\n').length - 1;
    return lineIndex === currentLineIndex;
  };

  textArea.addEventListener('input', updateContent);
  textArea.addEventListener('scroll', () => {
    lineNumbers.scrollTop = textArea.scrollTop;
  });

  textArea.addEventListener('click', updateContent);
  textArea.addEventListener('keyup', updateContent);

  updateContent();


  function addCollapseIcon(lineNumberElement, startIndex, textArea, collapsedSections) {
    const collapseIcon = document.createElement('img');
    collapseIcon.src = chrome.runtime.getURL('assets/icons/chevron-down.svg');
    collapseIcon.classList.add('collapse-icon');

    collapseIcon.addEventListener('click', () => {
      collapseSection(startIndex, textArea, collapsedSections);
    });

    lineNumberElement.appendChild(collapseIcon);
  }

  function addExpandIcon(lineNumberElement, startIndex, endIndex, textArea, collapsedSections) {
    const expandIcon = document.createElement('img');
    expandIcon.src = chrome.runtime.getURL('assets/icons/chevron-up.svg');
    expandIcon.classList.add('expand-icon');

    expandIcon.addEventListener('click', () => {
      expandSection(startIndex, endIndex, textArea, collapsedSections);
    });

    lineNumberElement.appendChild(expandIcon);
  }

  function collapseSection(startIndex, textArea, collapsedSections) {
    const lines = textArea.value.split('\n');
    const endIndex = lines.findIndex((line, idx) => idx > startIndex && line.trim().endsWith('<>'));
    if (endIndex === -1) return;

    const collapsedContent = lines.slice(startIndex + 1, endIndex);
    collapsedSections[startIndex] = collapsedContent;

    lines.splice(startIndex + 1, endIndex - startIndex - 1, '[COLLAPSED TEXT]');
    textArea.value = lines.join('\n');


    const newCursorPosition = lines.slice(0, startIndex + 2).join('\n').length;
    textArea.setSelectionRange(newCursorPosition, newCursorPosition);

    textArea.focus();


    updateContent();
  }

  function expandSection(startIndex, endIndex, textArea, collapsedSections) {
    if (!collapsedSections[startIndex]) return;

    const lines = textArea.value.split('\n');
    lines.splice(startIndex + 1, 1, ...collapsedSections[startIndex]);
    delete collapsedSections[startIndex];
    textArea.value = lines.join('\n');

    textArea.focus();


    updateContent();
  }
}

