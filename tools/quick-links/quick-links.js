// Quick Links Plugin - Insert common links with one click
import DA_SDK from 'https://da.live/nx/utils/sdk.js';

// Define your common links here
const QUICK_LINKS = {
  'Internal Pages': [
    { label: 'Home Page', url: '/' },
    { label: 'About Us', url: '/about' },
    { label: 'Contact', url: '/contact' },
    { label: 'Privacy Policy', url: '/privacy' },
  ],
  'External Resources': [
    { label: 'Adobe Experience League', url: 'https://experienceleague.adobe.com' },
    { label: 'AEM Documentation', url: 'https://www.aem.live/docs/' },
    { label: 'DA Documentation', url: 'https://docs.da.live/' },
  ],
  'Social Media': [
    { label: 'LinkedIn', url: 'https://linkedin.com/company/adobe' },
    { label: 'Twitter/X', url: 'https://twitter.com/adobe' },
    { label: 'YouTube', url: 'https://youtube.com/adobe' },
  ],
};

(async function init() {
  const app = document.getElementById('app');
  
  try {
    const { context, token, actions } = await DA_SDK;
    
    // Clear loading
    app.innerHTML = '';
    
    // Create quick link buttons
    Object.entries(QUICK_LINKS).forEach(([groupName, links]) => {
      const group = document.createElement('div');
      group.className = 'link-group';
      
      const heading = document.createElement('h3');
      heading.textContent = groupName;
      group.appendChild(heading);
      
      links.forEach(link => {
        const btn = document.createElement('button');
        btn.className = 'link-btn';
        btn.innerHTML = `
          <span class="label">${link.label}</span>
          <span class="url">${link.url}</span>
        `;
        btn.addEventListener('click', () => {
          // Insert as a proper HTML link
          actions.sendHTML(`<a href="${link.url}">${link.label}</a>`);
        });
        group.appendChild(btn);
      });
      
      app.appendChild(group);
    });
    
    // Add custom link section
    const customSection = document.createElement('div');
    customSection.className = 'custom-section';
    customSection.innerHTML = `
      <h3>Insert Custom Link</h3>
      <input type="text" id="link-text" placeholder="Link text (e.g., Click here)">
      <input type="url" id="link-url" placeholder="URL (e.g., https://example.com)">
      <button class="insert-btn" id="insert-custom">Insert Link</button>
    `;
    app.appendChild(customSection);
    
    // Handle custom link insertion
    document.getElementById('insert-custom').addEventListener('click', () => {
      const text = document.getElementById('link-text').value;
      const url = document.getElementById('link-url').value;
      
      if (text && url) {
        actions.sendHTML(`<a href="${url}">${text}</a>`);
        // Clear inputs
        document.getElementById('link-text').value = '';
        document.getElementById('link-url').value = '';
      } else {
        alert('Please enter both link text and URL');
      }
    });
    
  } catch (error) {
    console.error('SDK Error:', error);
    app.innerHTML = `<p>Error loading plugin: ${error.message}</p>`;
  }
}());
