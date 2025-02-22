

import { replaceTextInDiv } from '../utils/utils.js';

export function initializeEventHandlers(div, dropdownManager, state) {
  if (window.__smartNavbarKeyDownInitialized) {
    return;
  }
  window.__smartNavbarKeyDownInitialized = true;

  function updateDebugInfo() {}
  div.addEventListener('input', () => {
    dropdownManager.handleInput(state.selectedCategory, state.escapedTriggerKey);
  });

  document.addEventListener(
    'keydown',
    function (e) {
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        const categories = state.categories;

        if (e.key === 'ArrowLeft') {
          state.selectedCategoryIndex =
            (state.selectedCategoryIndex - 1 + categories.length) % categories.length;
          state.selectedCategory = categories[state.selectedCategoryIndex];
          state.updateNavbarSelection();
          dropdownManager.updateDropdown(state.selectedCategory, state.escapedTriggerKey);

          updateDebugInfo();
          e.preventDefault();
          e.stopPropagation();
        } else if (e.key === 'ArrowRight') {
          state.selectedCategoryIndex =
            (state.selectedCategoryIndex + 1) % categories.length;
          state.selectedCategory = categories[state.selectedCategoryIndex];
          state.updateNavbarSelection();
          dropdownManager.updateDropdown(state.selectedCategory, state.escapedTriggerKey);

          updateDebugInfo();
          e.preventDefault();
          e.stopPropagation();
        }
      }

      if (!dropdownManager.dropdownElement.classList.contains('hidden')) {
        if (
          e.key === 'ArrowDown' ||
          e.key === 'ArrowUp' ||
          e.key === 'Enter' ||
          e.key === 'Escape'
        ) {
          e.preventDefault();
          e.stopPropagation();

          const currentOptions = dropdownManager.getCurrentOptions();
          let selectedIndex = dropdownManager.getSelectedIndex();

          if (e.key === 'ArrowDown') {
            selectedIndex = (selectedIndex + 1) % currentOptions.length;
            dropdownManager.setSelectedIndex(selectedIndex);
          } else if (e.key === 'ArrowUp') {
            selectedIndex =
              (selectedIndex - 1 + currentOptions.length) % currentOptions.length;
            dropdownManager.setSelectedIndex(selectedIndex);
          } else if (e.key === 'Enter') {
            if (selectedIndex >= 0 && selectedIndex < currentOptions.length) {
              const selectedItem = currentOptions[selectedIndex];
              replaceTextInDiv(div, selectedItem.option, state.triggerKey);
              dropdownManager.dropdownElement.classList.add('hidden');
              dropdownManager.clearOptions();
            }
          } else if (e.key === 'Escape') {
            dropdownManager.dropdownElement.classList.add('hidden');
          }
        }
      }
    },
    true
  );
}