# Self-RAG Web Interface - Quick Start Guide

## 🚀 Getting Started

### 1. Start the Server
```bash
python start_web_server.py
```
or
```bash
python run_api.py
```

### 2. Open the Web Interface
- Automatic: Browser should open automatically
- Manual: Navigate to `http://localhost:8000`

### 3. Test the Interface
```bash
python test_web_interface.py
```

## 📱 Using the Web Interface

### Home Page
- Overview of Self-RAG capabilities
- Feature highlights
- Quick navigation buttons

### Chat Interface
1. **Optional URLs**: Add web sources (one URL per line)
   ```
   https://example.com/article1
   https://example.com/article2
   ```

2. **Ask Questions**: Type your question and press Enter or click Send
   ```
   What is machine learning?
   How does RAG work?
   Explain the benefits mentioned in the provided URLs
   ```

3. **View Responses**: See AI responses with execution times

### Health Status
- Real-time API status monitoring
- System information display
- Manual refresh capability

## 🎨 Features

### Dark/Light Theme
- Click the moon/sun icon in the navigation bar
- Automatically detects system preference
- Settings persist across sessions

### Responsive Design
- Works on desktop, tablet, and mobile
- Adaptive layout for all screen sizes
- Touch-friendly interface

### Real-time Updates
- Live API status monitoring
- Immediate response display
- Loading indicators

## 🔧 Troubleshooting

### Common Issues

1. **"Cannot connect to API"**
   - Ensure the server is running: `python run_api.py`
   - Check if port 8000 is available
   - Verify no firewall blocking

2. **"Static files not found"**
   - Ensure `public/` directory exists
   - Check all files are present:
     - `public/index.html`
     - `public/css/styles.css`
     - `public/js/app.js`

3. **"Theme not working"**
   - Clear browser cache
   - Check browser localStorage support
   - Verify CSS is loading correctly

### API Endpoints

- **Web Interface**: `http://localhost:8000/`
- **Health Check**: `http://localhost:8000/health`
- **API Docs**: `http://localhost:8000/docs`
- **Generate Answer**: `POST http://localhost:8000/generate`

### File Structure
```
e2e-casestudy/
├── public/                 # Web interface files
│   ├── index.html         # Main HTML
│   ├── css/styles.css     # All styles
│   └── js/app.js          # JavaScript logic
├── e2e_lg_rag/
│   └── api.py             # FastAPI server
├── start_web_server.py    # Server startup script
├── test_web_interface.py  # Testing script
└── WEB_INTERFACE_README.md # Detailed docs
```

## 💡 Tips

1. **Multiple URLs**: Add one URL per line in the URL input field
2. **Long Messages**: Text areas auto-resize as you type
3. **Mobile Usage**: Interface is fully touch-friendly
4. **Keyboard Shortcuts**: Press Enter to send messages
5. **Theme Preference**: Your theme choice is remembered

## 🧪 Testing

Run the comprehensive test suite:
```bash
python test_web_interface.py
```

Tests verify:
- ✅ API health endpoint
- ✅ Frontend serving
- ✅ Static file access
- ✅ Generate endpoint functionality

## 📞 Support

If you encounter issues:
1. Check the console for error messages
2. Verify all dependencies are installed
3. Ensure the Self-RAG system is properly configured
4. Review the detailed README: `WEB_INTERFACE_README.md`
