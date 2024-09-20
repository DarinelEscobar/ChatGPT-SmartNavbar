// popup.js

import '../css/popup.css';
import '../css/tailwind.css';
import { getCategories, saveCategories, getTriggerKey, saveTriggerKey } from './storage.js';

document.addEventListener('DOMContentLoaded', async () => {
  const categoriesList = document.getElementById('categories-list');
  const categorySelect = document.getElementById('category-select');
  const addCategoryButton = document.getElementById('add-category-button');
  const addPromptButton = document.getElementById('add-prompt-button');
  const triggerKeyInput = document.getElementById('trigger-key');
  const saveTriggerKeyButton = document.getElementById('save-trigger-key-button');

  let categories = await getCategories();
  const triggerKey = await getTriggerKey();
  triggerKeyInput.value = triggerKey;

  function notifyContentScript() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'USER_DATA_UPDATED' });
      }
    });
  }

  function renderCategories() {
    // Limpiar elementos existentes
    categoriesList.innerHTML = '';
    categorySelect.innerHTML = '';

    categories.forEach((category, index) => {
      // Crear elemento de categoría
      const categoryDiv = document.createElement('div');
      categoryDiv.className = 'category-item';

      const title = document.createElement('h2');
      title.textContent = category.category;
      title.className = 'text-lg font-bold mb-2';
      categoryDiv.appendChild(title);

      // Crear lista de prompts
      const promptsList = document.createElement('ul');
      category.opciones.forEach((prompt, promptIndex) => {
        const promptItem = document.createElement('li');
        promptItem.className = 'prompt-item';

        const promptText = document.createElement('span');
        promptText.textContent = prompt.id;
        promptItem.appendChild(promptText);

        // Botones de editar y eliminar
        const buttonsDiv = document.createElement('div');

        const editButton = document.createElement('button');
        editButton.textContent = 'Editar';
        editButton.className = 'btn btn-sm bg-yellow-500 text-white mr-2';
        editButton.onclick = () => editPrompt(index, promptIndex);
        buttonsDiv.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.className = 'btn btn-sm bg-red-500 text-white';
        deleteButton.onclick = () => deletePrompt(index, promptIndex);
        buttonsDiv.appendChild(deleteButton);

        promptItem.appendChild(buttonsDiv);
        promptsList.appendChild(promptItem);
      });

      categoryDiv.appendChild(promptsList);

      // Botones de editar y eliminar categoría
      const categoryButtonsDiv = document.createElement('div');
      categoryButtonsDiv.className = 'mt-2';

      const editCategoryButton = document.createElement('button');
      editCategoryButton.textContent = 'Editar Categoría';
      editCategoryButton.className = 'btn btn-sm bg-blue-500 text-white mr-2';
      editCategoryButton.onclick = () => editCategory(index);
      categoryButtonsDiv.appendChild(editCategoryButton);

      const deleteCategoryButton = document.createElement('button');
      deleteCategoryButton.textContent = 'Eliminar Categoría';
      deleteCategoryButton.className = 'btn btn-sm bg-red-500 text-white';
      deleteCategoryButton.onclick = () => deleteCategory(index);
      categoryButtonsDiv.appendChild(deleteCategoryButton);

      categoryDiv.appendChild(categoryButtonsDiv);

      categoriesList.appendChild(categoryDiv);

      // Añadir opción al select de categorías
      const option = document.createElement('option');
      option.value = category.category;
      option.textContent = category.category;
      categorySelect.appendChild(option);
    });
  }

  function addCategory() {
    const newCategoryName = document.getElementById('new-category-name').value.trim();
    if (newCategoryName && !categories.find(cat => cat.category === newCategoryName)) {
      categories.push({
        category: newCategoryName,
        opciones: []
      });
      saveCategories(categories);
      notifyContentScript();
      renderCategories();
      document.getElementById('new-category-name').value = '';
    } else {
      alert('El nombre de la categoría es inválido o ya existe.');
    }
  }

  function addPrompt() {
    const selectedCategoryName = categorySelect.value;
    const newPromptId = document.getElementById('new-prompt-id').value.trim();
    const newPromptText = document.getElementById('new-prompt-text').value.trim();

    if (selectedCategoryName && newPromptId && newPromptText) {
      const category = categories.find(cat => cat.category === selectedCategoryName);
      if (category) {
        if (!category.opciones.find(prompt => prompt.id === newPromptId)) {
          category.opciones.push({
            id: newPromptId,
            option: newPromptText
          });
          saveCategories(categories);
          notifyContentScript();
          renderCategories();
          document.getElementById('new-prompt-id').value = '';
          document.getElementById('new-prompt-text').value = '';
        } else {
          alert('Ya existe un prompt con ese ID en esta categoría.');
        }
      }
    } else {
      alert('Por favor, completa todos los campos.');
    }
  }

  function editPrompt(categoryIndex, promptIndex) {
    const currentPrompt = categories[categoryIndex].opciones[promptIndex];

    // Mostrar un diálogo para editar el prompt
    const updatedPromptId = window.prompt(
      'Editar ID del Prompt:',
      currentPrompt.id
    );
    const updatedPromptText = window.prompt(
      'Editar Texto del Prompt:',
      currentPrompt.option
    );

    if (updatedPromptId && updatedPromptText) {
      currentPrompt.id = updatedPromptId;
      currentPrompt.option = updatedPromptText;
      saveCategories(categories);
      notifyContentScript();
      renderCategories();
    } else {
      alert('La edición fue cancelada o los campos están vacíos.');
    }
  }

  function deletePrompt(categoryIndex, promptIndex) {
    if (confirm('¿Estás seguro de que deseas eliminar este prompt?')) {
      categories[categoryIndex].opciones.splice(promptIndex, 1);
      saveCategories(categories);
      notifyContentScript();
      renderCategories();
    }
  }

  function editCategory(categoryIndex) {
    const category = categories[categoryIndex];
    const newCategoryName = prompt('Editar nombre de la categoría:', category.category);
    if (newCategoryName && !categories.find(cat => cat.category === newCategoryName)) {
      category.category = newCategoryName;
      saveCategories(categories);
      notifyContentScript();
      renderCategories();
    } else {
      alert('El nombre es inválido o ya existe otra categoría con ese nombre.');
    }
  }

  function deleteCategory(categoryIndex) {
    if (confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      categories.splice(categoryIndex, 1);
      saveCategories(categories);
      notifyContentScript();
      renderCategories();
    }
  }

  addCategoryButton.addEventListener('click', addCategory);
  addPromptButton.addEventListener('click', addPrompt);

  saveTriggerKeyButton.addEventListener('click', () => {
    const newTriggerKey = triggerKeyInput.value.trim();
    if (newTriggerKey) {
      saveTriggerKey(newTriggerKey);
      notifyContentScript();
      alert('Tecla de activación guardada.');
    } else {
      alert('Por favor, ingresa una tecla de activación válida.');
    }
  });

  // Renderizar categorías inicialmente
  renderCategories();
});
