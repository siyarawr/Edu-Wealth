const APP_URL = 'https://edu-wealth.replit.app';

chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install') {
    console.log('Edu Wealth extension installed');
  } else if (details.reason === 'update') {
    console.log('Edu Wealth extension updated');
  }
});

chrome.action.onClicked.addListener(function(tab) {
});
