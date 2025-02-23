// platformDetector.js

/**
 * Detecta la plataforma (ChatGPT, DeepSeek, Claude, Gemini, etc.)
 * Devuelve un string identificando la plataforma o 'unknown' si no coincide nada.
 */
export function detectPlatform() {
  // ChatGPT: busca el ID habitual
  if (document.querySelector('#prompt-textarea')) {
    return 'chatgpt';
  }

  // DeepSeek: id="chat-input"
  if (document.querySelector('#chat-input')) {
    return 'deepseek';
  }

  // Claude AI: contenteditable con aria-label="Write your prompt to Claude"
  if (
    document.querySelector(
      '[aria-label="Write your prompt to Claude"] .ProseMirror[contenteditable="true"]'
    )
  ) {
    return 'claude';
  }

  // Gemini: div con class="ql-editor textarea new-input-ui" contenteditable="true"
  if (
    document.querySelector('.ql-editor.textarea.new-input-ui[contenteditable="true"]')
  ) {
    return 'gemini';
  }

  // Si no cae en ninguno, retornamos 'unknown'
  return 'unknown';
}

/**
 * Cada “driver” define cómo obtener/leer/escribir el input de la plataforma.
 */
const chatgptDriver = {
  getInputElement: () => document.querySelector('#prompt-textarea'),
  getText: (el) => el?.innerText || '',
  setText: (el, text) => {
    // Ejemplo simplificado
    if (el) el.innerText = text;
  },
};

const deepseekDriver = {
  getInputElement: () => document.querySelector('#chat-input'),
  getText: (el) => el?.value || '',
  setText: (el, text) => {
    if (el) el.value = text;
  },
};

const claudeDriver = {
  getInputElement: () =>
    document.querySelector(
      '[aria-label="Write your prompt to Claude"] .ProseMirror[contenteditable="true"]'
    ),
  getText: (el) => el?.innerText || '',
  setText: (el, text) => {
    // Para un contentEditable
    if (el) el.innerHTML = `<p>${text}</p>`;
  },
};

const geminiDriver = {
  getInputElement: () =>
    document.querySelector('.ql-editor.textarea.new-input-ui[contenteditable="true"]'),
  getText: (el) => el?.innerText || '',
  setText: (el, text) => {
    if (el) el.innerHTML = `<p>${text}</p>`;
  },
};

/**
 * Devuelve el "driver" (adaptador) según la plataforma detectada.
 */
export function getPlatformDriver(platform) {
  switch (platform) {
    case 'chatgpt':
      return chatgptDriver;
    case 'deepseek':
      return deepseekDriver;
    case 'claude':
      return claudeDriver;
    case 'gemini':
      return geminiDriver;
    default:
      return null;
  }
}
