# Self-RAG Web Interface

A modern, responsive web interface for the Self-RAG API built with pure HTML, CSS, and JavaScript.

## Features

### 🎨 Modern Design
- Clean, professional interface
- Responsive design that works on desktop, tablet, and mobile
- Dark/Light theme toggle with system preference detection
- Smooth animations and transitions

### 🧭 Navigation
- **Home**: Overview of the Self-RAG system and its capabilities
- **Chat**: Interactive chat interface for asking questions
- **Health Status**: Real-time API health monitoring

### 💬 Chat Interface
- Real-time messaging with the Self-RAG system
- Optional URL input for providing additional data sources
- Message history with timestamps
- Typing indicators and loading states
- Auto-resizing text input
- Execution time display for responses

### 📊 Health Monitoring
- Real-time API status checking
- System information display (version, uptime, etc.)
- Error reporting and troubleshooting guidance
- Manual refresh capability

### 🌙 Theme Support
- Automatic dark/light theme detection based on system preferences
- Manual theme toggle
- Persistent theme selection (stored in localStorage)
- Smooth theme transitions

## File Structure

```
public/
├── index.html          # Main HTML file
├── css/
│   └── styles.css     # All styles with theme support
└── js/
    └── app.js         # Application logic and API interactions
```

## API Integration

The web interface communicates with the Self-RAG API using the following endpoints:

- `GET /health` - Health status checks
- `POST /generate` - Question generation with optional URLs

## Usage

### Starting the Server

1. Ensure your Self-RAG API is properly configured
2. Start the API server:
   ```bash
   python run_api.py
   ```
3. Visit `http://localhost:8000` in your browser

### Testing the Interface

Run the test script to verify everything is working:

```bash
python test_web_interface.py
```

### Using the Chat Interface

1. Navigate to the **Chat** section
2. Optionally provide URLs in the URL input field (one per line)
3. Type your question in the message input
4. Press Enter or click Send
5. View the response with execution time

### Checking System Health

1. Navigate to the **Health Status** section
2. View real-time system status
3. Click "Refresh Status" to update information
4. Monitor API performance metrics

## Customization

### Themes

The interface supports extensive theming through CSS custom properties:

```css
:root {
    --primary-color: #007bff;
    --bg-color: #ffffff;
    --text-color: #212529;
    /* ... more variables */
}

[data-theme="dark"] {
    --bg-color: #1a1a1a;
    --text-color: #e9ecef;
    /* ... dark theme overrides */
}
```

### Adding New Sections

1. Add a new section to `index.html`
2. Update the navigation in the navbar
3. Add corresponding styles in `styles.css`
4. Implement navigation logic in `app.js`

### API Configuration

Update the API configuration in `app.js`:

```javascript
const API_BASE_URL = window.location.origin;
const API_ENDPOINTS = {
    health: '/health',
    generate: '/generate'
};
```

## Browser Compatibility

- Modern browsers (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- Mobile browsers (iOS Safari, Chrome Mobile, Firefox Mobile)
- Progressive enhancement for older browsers

## Performance

- Minimal bundle size (no external dependencies)
- Lazy loading of non-critical resources
- Efficient DOM manipulation
- Responsive images and optimized assets

## Security

- CORS configured for cross-origin requests
- Input validation and sanitization
- XSS protection through proper content handling
- No external CDN dependencies (offline capable)

## Development

### Adding Features

1. Update the HTML structure in `index.html`
2. Add styles to `styles.css` following the existing patterns
3. Implement functionality in `app.js` using the existing architecture
4. Test thoroughly across different themes and screen sizes

### Debugging

- Open browser developer tools
- Check console for JavaScript errors
- Use Network tab to monitor API requests
- Verify theme transitions work correctly

## Troubleshooting

### Common Issues

1. **404 Error on Static Files**: Ensure the `public` directory is properly mounted in the FastAPI app
2. **API Connection Errors**: Verify the Self-RAG API server is running on port 8000
3. **Theme Not Persisting**: Check browser localStorage support
4. **Mobile Layout Issues**: Verify viewport meta tag is present

### Error Messages

The interface provides user-friendly error messages for:
- Network connectivity issues
- API server errors
- Invalid input validation
- Theme switching problems

## Contributing

When contributing to the web interface:

1. Maintain the existing code structure
2. Follow the established naming conventions
3. Ensure responsive design principles
4. Test on multiple devices and browsers
5. Update this README for new features
