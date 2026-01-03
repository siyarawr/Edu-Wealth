const APP_URL = 'https://edu-wealth.replit.app';

document.addEventListener('DOMContentLoaded', function() {
  const openAppBtn = document.getElementById('openApp');
  const quickLinks = document.querySelectorAll('.quick-link');
  
  openAppBtn.addEventListener('click', function() {
    chrome.tabs.create({ url: APP_URL });
  });
  
  quickLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const page = this.getAttribute('data-page');
      chrome.tabs.create({ url: APP_URL + page });
    });
  });
});
