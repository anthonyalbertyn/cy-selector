const fs = require("fs");
const cheerio = require("cheerio");
const path = require("path");
const camelCase = require("lodash.camelcase"); // Use lodash to convert to camelCase

// Create output directory and clear its content if it exists
const outputDir = path.join(__dirname, "output");
if (fs.existsSync(outputDir)) {
  fs.readdirSync(outputDir).forEach((file) => {
    const filePath = path.join(outputDir, file);
    fs.unlinkSync(filePath);
  });
} else {
  fs.mkdirSync(outputDir);
}

// Read and load source.html
const html = fs.readFileSync("source.html", "utf-8");
const $ = cheerio.load(html);

// Utility function to create valid camelCase keys
const createCamelCaseKey = (str) => {
  return camelCase(str.replace(/[^a-zA-Z0-9]/g, ""));
};

// Function to generate Cypress selectors
const generateSelector = (attr, value) => `[${attr}="${value}"]`;

// Initialize objects for selectors
const idSelectors = {};
const nameSelectors = {};
const testIdSelectors = {};
const labelSelectors = {};
const formFieldSelectors = {};

// List of form element types
const formElementTypes = [
  "input",
  "select",
  "textarea",
  "button",
  "fieldset",
  "legend",
  "optgroup",
  "option",
  "datalist",
  "file",
  "submit",
  "reset",
  "image",
  "hidden",
];

// Find elements with id attribute
$("[id]").each((_, elem) => {
  const id = $(elem).attr("id");
  const key = createCamelCaseKey(id);
  idSelectors[key] = `#${id}`;
});

// Find elements with name attribute
$("[name]").each((_, elem) => {
  const name = $(elem).attr("name");
  const key = createCamelCaseKey(name);
  nameSelectors[key] = generateSelector("name", name);
});

// Find elements with data-testid attribute
$("[data-testid]").each((_, elem) => {
  const testId = $(elem).attr("data-testid");
  const key = createCamelCaseKey(testId);
  testIdSelectors[key] = generateSelector("data-testid", testId);
});

// Find elements with label associations
$("label").each((_, label) => {
  const forAttr = $(label).attr("for");
  if (forAttr) {
    const labelText = $(label).text().trim();
    const key = createCamelCaseKey(labelText + forAttr);
    labelSelectors[key] = `label[for="${forAttr}"] + *`;
  }
});

// Find form fields
$(
  "input, select, textarea, button, fieldset, legend, optgroup, option, datalist, file, submit, reset, image, hidden"
).each((_, elem) => {
  const $elem = $(elem);
  const tagName = $elem.prop("tagName").toLowerCase();
  const name = $elem.attr("name");
  const id = $elem.attr("id");
  const testId = $elem.attr("data-testid");

  if (testId) {
    const key = createCamelCaseKey(testId);
    formFieldSelectors[key] = generateSelector("data-testid", testId);
  } else if (name) {
    const key = createCamelCaseKey(name);
    if (!formFieldSelectors[key]) {
      formFieldSelectors[key] = generateSelector("name", name);
    }
  } else if (id) {
    const key = createCamelCaseKey(id);
    if (!formFieldSelectors[key]) {
      formFieldSelectors[key] = generateSelector("id", id);
    }
  } else {
    const parentSelectors = $elem
      .parents()
      .map((_, el) => {
        return (
          el.tagName.toLowerCase() +
          (el.id ? `#${el.id}` : "") +
          (el.className ? `.${el.className.replace(/\s+/g, ".")}` : "")
        );
      })
      .get()
      .join(" ");

    const key = createCamelCaseKey(parentSelectors + " " + tagName);
    formFieldSelectors[key] = tagName;
  }
});

// Remove key-value pairs where the value matches one of the form element types
Object.keys(formFieldSelectors).forEach((key) => {
  if (formElementTypes.includes(formFieldSelectors[key])) {
    delete formFieldSelectors[key];
  }
});

// Function to write objects to files
const writeObjectToFile = (filename, obj) => {
  const sortedObj = Object.keys(obj)
    .sort()
    .reduce((sorted, key) => {
      sorted[key] = obj[key];
      return sorted;
    }, {});

  const content = `const ${filename.replace(".js", "")} = ${JSON.stringify(
    sortedObj,
    null,
    2
  )};\n\nmodule.exports = ${filename.replace(".js", "")};\n`;

  // Replace string literals with plain keys
  const finalContent = content.replace(/"(\w+)"(?=:)/g, "$1");

  fs.writeFileSync(path.join(outputDir, filename), finalContent);
};

// Write the objects to respective files
writeObjectToFile("idSelectors.js", idSelectors);
writeObjectToFile("nameSelectors.js", nameSelectors);
writeObjectToFile("testIdSelectors.js", testIdSelectors);
writeObjectToFile("labelSelectors.js", labelSelectors);
writeObjectToFile("formFieldSelectors.js", formFieldSelectors);

console.log("Selectors have been generated and saved in the output directory.");
