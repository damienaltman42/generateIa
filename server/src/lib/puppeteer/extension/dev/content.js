console.log("This script runs when the page loads.");
const code = `
(() => {
  Object.defineProperties(Navigator.prototype, {
    language: {
      value: 'fr',
      configurable: false,
      enumerable: true,
      writable: false
    },
    languages: {
      value: ['fr'],
      configurable: false,
      enumerable: true,
      writable: false
    }
  });
})();`;

const script = document.createElement("script");
script.textContent = code;
document.documentElement.prepend(script);