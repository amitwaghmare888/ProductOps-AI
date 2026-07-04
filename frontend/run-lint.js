const { ESLint } = require("eslint");

(async function main() {
  const eslint = new ESLint();
  const results = await eslint.lintFiles(["./**/*.{js,jsx,ts,tsx}"]);
  const formatter = await eslint.loadFormatter("stylish");
  const resultText = formatter.format(results);
  
  if (resultText) {
    console.log(resultText);
  }
  
  const hasErrors = results.some(r => r.errorCount > 0);
  if (hasErrors) {
    console.log("Linting failed.");
    process.exit(1);
  } else {
    console.log("Linting passed successfully.");
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
