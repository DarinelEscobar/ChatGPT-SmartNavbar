
# ChatGPT-SmartNavbar

ChatGPT-SmartNavbar is a Chrome extension that adds an interactive navbar and smart dropdown menu to enhance user experience on the ChatGPT platform. This extension provides features like dynamic option filtering, keyboard navigation, and modern styling powered by Tailwind CSS. 

## Features

- **Dynamic Navbar**: Adds a responsive, interactive navbar to ChatGPT's UI.
- **Smart Dropdown Menu**: Dynamically generates a dropdown based on user input after typing `//`.
- **Keyboard Navigation**: Navigate through dropdown options using arrow keys and select with 'Enter'.
- **Styling with Tailwind CSS**: Clean, modern, and customizable styling using Tailwind CSS.
- **Optimized for Performance**: Fast and responsive interactions using efficient DOM observers.

## Installation

### Prerequisites

- Node.js (version 12 or higher)
- npm (Node package manager)

### Build the App

To build the CSS for the extension, use the following commands:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the Tailwind CSS:
   ```bash
   npm run build:css
   ```

Alternatively, you can run the Tailwind CSS build command manually:
```bash
npx tailwindcss -i ./src/css/styles.css -o ./dist/css/styles.css --minify
```

> Ensure that the input and output paths (`-i` and `-o`) match the locations of your CSS files.

## Project Structure

```plaintext
ChatGPT-SmartNavbar/
├── dist/
│   └── css/
│       └── styles.css  # Minified CSS output
├── src/
│   └── css/
│       └── styles.css  # Source CSS file with Tailwind directives
│   └── js/
│       └── contentScript.js  # Main content script for the extension
│   └── data/
│       └── options.json  # Data file for dropdown menu options
├── manifest.json  # Chrome extension manifest (Version 3)
├── tailwind.config.js  # Tailwind CSS configuration
├── postcss.config.js  # PostCSS configuration for processing CSS
└── package.json  # Project metadata and dependencies
```

## Usage

1. Build the extension's CSS using the above instructions.
2. Load the extension into Chrome by navigating to `chrome://extensions/`.
3. Enable Developer Mode and click "Load unpacked" to select the `dist` folder.
4. The extension will be active on the ChatGPT page (https://chatgpt.com/*).

## Contributing

Feel free to open issues and submit pull requests to improve the project. Make sure to follow best practices in terms of code cleanliness and readability.

---

Enjoy enhanced productivity with ChatGPT-SmartNavbar!
