// Import SDK
// eslint-disable-next-line import/no-unresolved
import DA_SDK from 'https://da.live/nx/utils/sdk.js';

(async function init() {
  // Add loading message
  document.body.innerHTML = '<p>Loading SDK...</p>';
  
  try {
    // eslint-disable-next-line no-unused-vars
    const { context, token, actions } = await DA_SDK;
    
    // Debug: Log what we received
    console.log('SDK Loaded!');
    console.log('Context:', context);
    console.log('Token:', token ? 'Present' : 'Missing');
    console.log('Actions:', actions);
    
    // Clear loading message
    document.body.innerHTML = '';
    
    // Check if context is empty
    if (!context || Object.keys(context).length === 0) {
      document.body.innerHTML = '<p>No context received. This plugin works best in the Library panel.</p>';
      return;
    }
    
    Object.keys(context).forEach((key) => {
      // Heading
      const h3 = document.createElement('h3');
      h3.textContent = `${key}`;

      // Send button
      const send = document.createElement('button');
      send.textContent = `Send | ${context[key]}`;
      send.addEventListener('click', () => { actions.sendText(context[key]); });

      // Send & close
      const close = document.createElement('button');
      close.textContent = `Send & close | ${context[key]}`;
      close.addEventListener('click', () => {
        actions.sendText(context[key]);
        actions.closeLibrary();
      });

      document.body.append(h3, send, close);
    });
  } catch (error) {
    console.error('SDK Error:', error);
    document.body.innerHTML = `<p>Error: ${error.message}</p>`;
  }
}());
