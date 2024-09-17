(async function() {
  const triggerKey = '<<'; // Cambia esto si es necesario
  const escapedTriggerKey = triggerKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Cargar categorías desde el JSON
  const response = await fetch(chrome.runtime.getURL('data/options.json'));
  const categories = await response.json();

  // Agregar categoría 'Todos' al inicio
  categories.unshift({
    category: 'Todos',
    opciones: [] // Esto se llenará con las opciones de todas las categorías
  });

  // Combinar todas las opciones en la categoría 'Todos' sin usar flatMap
  categories[0].opciones = categories.slice(1).reduce((acc, cat) => {
    if (Array.isArray(cat.opciones)) {
      return acc.concat(cat.opciones);
    }
    return acc;
  }, []);

  // Categoría seleccionada por defecto
  let selectedCategoryIndex = 0;
  let selectedCategory = categories[selectedCategoryIndex];

  // Función para reemplazar el triggerKey y el texto después por la opción seleccionada
  function replaceTextInDiv(el, option) {
    const sel = window.getSelection();
    if (sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);

    // Obtener el texto completo del div
    let text = el.innerText;
    const regex = new RegExp(escapedTriggerKey + '\\S*$', 'i');
    const match = text.match(regex);

    if (match) {
      const before = text.substring(0, match.index);
      const after = text.substring(match.index + match[0].length);
      el.innerText = before + option + after;

      // Mover el cursor al final del texto insertado
      const newRange = document.createRange();
      newRange.setStart(el.firstChild, before.length + option.length);
      newRange.setEnd(el.firstChild, before.length + option.length);
      sel.removeAllRanges();
      sel.addRange(newRange);
    }
  }

  // Función para manejar la lógica una vez que el elemento está disponible
  function initializeExtension(div) {
    // Crear el navbar
    const navbar = document.createElement('div');
    navbar.id = 'custom-navbar';
    navbar.classList.add(
      'fixed',
      'top-0',
      'left-1/2',
      'transform',
      '-translate-x-1/2',
      'w-full',
      'max-w-2xl',
      'bg-gray-800',
      'flex',
      'justify-center',
      'items-center',
      'z-50',
      'rounded-b-lg'
    );

    // Crear pestañas para cada categoría
    categories.forEach((category, index) => {
      const tab = document.createElement('div');
      tab.textContent = category.category;
      tab.classList.add(
        'px-4',
        'py-2',
        'cursor-pointer',
        'text-gray-200',
        'hover:bg-gray-700'
      );

      if (index === selectedCategoryIndex) {
        tab.classList.add('bg-gray-700');
      }

      tab.addEventListener('click', () => {
        selectedCategoryIndex = index;
        selectedCategory = categories[selectedCategoryIndex];
        updateNavbarSelection();
        updateDropdown(); // Actualizar el contenido del dropdown
      });

      navbar.appendChild(tab);
    });

    document.body.appendChild(navbar);

    function updateNavbarSelection() {
      const tabs = navbar.querySelectorAll('div');
      tabs.forEach((tab, idx) => {
        if (idx === selectedCategoryIndex) {
          tab.classList.add('bg-gray-700');
        } else {
          tab.classList.remove('bg-gray-700');
        }
      });
    }

    // Crear menú desplegable
    const dropdown = document.createElement('div');
    dropdown.id = 'custom-dropdown';
    dropdown.classList.add(
      'fixed',
      'bg-gray-800',
      'border',
      'border-gray-700',
      'shadow-lg',
      'rounded-md',
      'z-50',
      'hidden',
      'max-h-60',
      'overflow-auto'
    );

    document.body.appendChild(dropdown);

    let currentOptions = [];
    let selectedIndex = -1; // Índice de la opción seleccionada

    function updateDropdown() {
      // Limpiar el menú
      dropdown.innerHTML = '';

      // Obtener el texto después del triggerKey
      const textContent = div.innerText;
      const regex = new RegExp(escapedTriggerKey + '(\\S*)$', 'i');
      const match = textContent.match(regex);

      if (!match) {
        dropdown.classList.add('hidden');
        selectedIndex = -1;
        return;
      }

      const searchText = match[1].toLowerCase();

      // Verificar que selectedCategory.opciones es un arreglo
      if (!Array.isArray(selectedCategory.opciones)) {
        console.error('selectedCategory.opciones no es un arreglo');
        dropdown.classList.add('hidden');
        selectedIndex = -1;
        return;
      }

      // Obtener opciones de la categoría seleccionada y filtrar elementos válidos
      currentOptions = selectedCategory.opciones.filter(
        (item) => item && item.id && item.id.toLowerCase().includes(searchText)
      );

      // Limitar el número de opciones a 10
      currentOptions = currentOptions.slice(0, 10);

      if (currentOptions.length > 0) {
        selectedIndex = 0;

        currentOptions.forEach((item, index) => {
          const optionDiv = document.createElement('div');
          optionDiv.textContent = item.id;
          optionDiv.classList.add(
            'px-4',
            'py-2',
            'cursor-pointer',
            'text-gray-200',
            'hover:bg-gray-700'
          );

          if (index === selectedIndex) {
            optionDiv.classList.add('bg-gray-700');
          }

          optionDiv.addEventListener('mouseenter', () => {
            selectedIndex = index;
            updateDropdownSelection();
          });

          optionDiv.addEventListener('click', () => {
            replaceTextInDiv(div, item.option);
            dropdown.classList.add('hidden');
          });
          dropdown.appendChild(optionDiv);
        });

        dropdown.classList.remove('hidden');

        const divRect = div.getBoundingClientRect();
        const dropdownHeight = dropdown.offsetHeight;

        dropdown.style.left = `${divRect.left}px`;
        dropdown.style.top = `${divRect.top - dropdownHeight - 5}px`;
        dropdown.style.minWidth = '150px';
        dropdown.style.zIndex = '1000';

        updateDropdownSelection();
      } else {
        dropdown.classList.add('hidden');
        selectedIndex = -1;
      }
    }

    // Función para actualizar la selección visual en el menú
    function updateDropdownSelection() {
      const optionDivs = dropdown.querySelectorAll('div');
      optionDivs.forEach((optionDiv, index) => {
        if (index === selectedIndex) {
          optionDiv.classList.add('bg-gray-700');
        } else {
          optionDiv.classList.remove('bg-gray-700');
        }
      });
    }

    div.addEventListener('input', () => {
      updateDropdown();
    });

    // Mover el listener de 'keydown' al objeto 'document' en fase de captura
    document.addEventListener(
      'keydown',
      function (e) {
        // Verificar si el foco está en el textarea o en el cuerpo del documento
        if (e.target !== div && e.target !== document.body) {
          return; // Ignorar si el foco no está en el área relevante
        }

        if (e.key === 'ArrowLeft') {
          // Cambiar a la pestaña anterior
          selectedCategoryIndex =
            (selectedCategoryIndex - 1 + categories.length) % categories.length;
          selectedCategory = categories[selectedCategoryIndex];
          updateNavbarSelection();
          updateDropdown();
          e.preventDefault();
          e.stopPropagation();
        } else if (e.key === 'ArrowRight') {
          // Cambiar a la siguiente pestaña
          selectedCategoryIndex =
            (selectedCategoryIndex + 1) % categories.length;
          selectedCategory = categories[selectedCategoryIndex];
          updateNavbarSelection();
          updateDropdown();
          e.preventDefault();
          e.stopPropagation();
        } else if (!dropdown.classList.contains('hidden')) {
          // Navegación dentro del dropdown
          if (
            e.key === 'ArrowDown' ||
            e.key === 'ArrowUp' ||
            e.key === 'Enter' ||
            e.key === 'Escape'
          ) {
            e.preventDefault();
            e.stopPropagation();

            if (e.key === 'ArrowDown') {
              selectedIndex = (selectedIndex + 1) % currentOptions.length;
              updateDropdownSelection();
            } else if (e.key === 'ArrowUp') {
              selectedIndex =
                (selectedIndex - 1 + currentOptions.length) % currentOptions.length;
              updateDropdownSelection();
            } else if (e.key === 'Enter') {
              if (selectedIndex >= 0 && selectedIndex < currentOptions.length) {
                const selectedItem = currentOptions[selectedIndex];
                replaceTextInDiv(div, selectedItem.option);
                dropdown.classList.add('hidden');
              }
            } else if (e.key === 'Escape') {
              dropdown.classList.add('hidden');
            }
          }
        }
      },
      true
    );

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && e.target !== div) {
        dropdown.classList.add('hidden');
      }
    });
  }

  // Función para esperar hasta que el elemento esté disponible
  function waitForElement(selector, callback) {
    const element = document.querySelector(selector);
    if (element) {
      callback(element);
    } else {
      requestAnimationFrame(() => waitForElement(selector, callback));
    }
  }

  // Iniciar la espera por el elemento 'prompt-textarea'
  waitForElement('#prompt-textarea', (div) => {
    initializeExtension(div);
  });
})();
