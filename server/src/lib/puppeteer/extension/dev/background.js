// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
//     console.log("Page has finished loading from background.js");
//     if (changeInfo.status === 'complete' && tab.url) {
//         chrome.scripting.executeScript({
//             target: {tabId: tabId},
//             files: ['your_script.js']
//         });
//     }
// });
chrome.webNavigation.onCompleted.addListener(function(details) {
    console.log("Page has finished loading from background.js");
});
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        // Open a new tab
        // chrome.tabs.create({url: 'https://example.com'}); // Change URL to your desired new tab URL

        
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
    }
    
});