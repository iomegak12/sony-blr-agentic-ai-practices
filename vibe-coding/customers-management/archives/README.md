# Archives Folder

This folder contains temporary files and alternative demos that were created during development but are not part of the core library.

## Files Moved to Archives:

### Testing and Demo Files:
- **`example.js`** - Original interactive demo (had readline hanging issues on Windows)
- **`test-connection.js`** - Simple MongoDB connection test script
- **`simple-test.js`** - Non-interactive comprehensive test suite  
- **`working-demo.js`** - Alternative interactive demo with simplified UI
- **`DEMO-INSTRUCTIONS.md`** - Detailed testing instructions and troubleshooting guide

## Why These Files Were Archived:

1. **example.js** - Original interactive demo that had hanging issues with readline on Windows
2. **test-connection.js** - Was a debugging tool to fix connection issues, no longer needed
3. **simple-test.js** - Created for testing without user interaction, superseded by working demos
4. **working-demo.js** - Alternative demo created to fix readline issues, but also archived for cleanup
5. **DEMO-INSTRUCTIONS.md** - Troubleshooting guide that's no longer needed

## Core Library Files (Not Archived):

- **`src/`** - Main library source code
- **`package.json`** - Project configuration
- **`README.md`** - Main documentation
- **`.gitignore`** - Git ignore rules
- **`.env.example`** - Environment configuration template

## Usage:

You can run these archived demo files if needed:
```bash
# Run from the archives folder
node archives/example.js
node archives/test-connection.js
node archives/simple-test.js  
node archives/working-demo.js
```

However, the main library should be used by importing it directly:
```javascript
import CustomersManagement from './src/index.js';
```
