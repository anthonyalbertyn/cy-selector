# Cypress Selector Generator

This script generates Cypress-compatible selectors for HTML elements in a source HTML file. It inspects the DOM of the source file and creates JavaScript files containing selectors for elements with `id`, `name`, `data-test-id` attributes, and those associated with `label` elements. Additionally, it generates selectors for various form fields.

## Purpose

The purpose of this script is to simplify the process of writing Cypress tests by automatically generating selectors for elements in your HTML. This helps to ensure that selectors are consistent and correctly formatted, reducing the risk of errors in your tests.

## Getting Started

### Prerequisites

- Node.js installed on your machine.

### Installation

1. Clone the repository or download the script files.
2. Navigate to the directory containing the script.
3. Install the required dependencies by running:

```sh
npm install
```

### Usage

1. Place your HTML file to be inspected in the same directory as the script and name it `source.html`.
2. Run the script using the following command:

```sh
npm start
```

### Output

The script will generate an `output` directory containing the following JavaScript files with selectors:

- `idSelectors.js`
- `nameSelectors.js`
- `testIdSelectors.js`
- `labelSelectors.js`
- `formFieldSelectors.js`

Each file will export an object containing the selectors.

### Example

For example, if your `source.html` contains:

```html
<input type="text" id="username" name="username" data-test-id="usernameField" />
```

The `testIdSelectors.js` will contain:

```javascript
const testIdSelectors = {
  usernameField: '[data-test-id="usernameField"]',
};

module.exports = testIdSelectors;
```

## Limitations

- The script assumes that the `source.html` file is well-formed and valid HTML.
- The script does not handle dynamic elements that are added to the DOM after the initial load.
- The script uses the `lodash.camelcase` library to generate camelCase keys for the selectors, which may not always produce the desired results if element attributes contain unusual characters.
- The script overwrites any existing content in the `output` directory each time it runs.
- Only elements present at the time of running the script are considered. Any dynamically added elements won't be captured.
