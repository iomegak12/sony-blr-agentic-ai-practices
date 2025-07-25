# Customer Console Application

A user-friendly console application for managing customers using the customers-management library.

## Features

- **Interactive Menu System** - Easy-to-use console interface with numbered options
- **CRUD Operations** - Complete Create, Read, Update, Delete functionality
- **Smart Input Handling** - Only asks for required fields when creating customers
- **Search Functionality** - Search customers by ID or text search across names/emails
- **Customer Statistics** - View comprehensive statistics about your customer database
- **Data Validation** - Uses the underlying customers-management library validation
- **Graceful Error Handling** - User-friendly error messages

## Prerequisites

1. Make sure you have Node.js v22+ installed
2. Ensure MongoDB is running on your system
3. The customers-management library should be available in the parent directory

## Installation

```bash
# Navigate to the console app directory
cd customer-console-app

# Install dependencies
npm install
```

## Configuration

Create a `.env` file in the customers-management directory (if not already created):

```env
MONGODB_URI=mongodb://localhost:27017/customers_db
NODE_ENV=development
```

## Usage

### Start the application:
```bash
npm start
```

### Development mode (with auto-restart):
```bash
npm run dev
```

## Menu Options

1. **👤 Create New Customer** - Add a new customer with required information only
   - First Name (required)
   - Last Name (required) 
   - Email (required)
   - Phone (required)

2. **📋 List All Customers** - Display all customers with basic information

3. **🔍 Search Customer by ID** - Find a specific customer using their unique ID

4. **✏️ Update Customer** - Modify existing customer information
   - Shows current values
   - Allows partial updates (press Enter to keep current value)

5. **🗑️ Delete Customer** - Remove a customer from the database
   - Shows customer details before deletion
   - Requires confirmation

6. **🔎 Search Customers** - Text search across customer names and emails

7. **📊 View Statistics** - Display comprehensive customer analytics:
   - Total customers
   - Email domain statistics
   - Customer demographics
   - Recent signup trends

8. **🚪 Exit** - Safely disconnect from database and exit

## Key Features

### Smart Input Collection
- Only collects required fields (firstName, lastName, email, phone) when creating customers
- Optional fields can be added later through the update function
- Input validation handled by the underlying library

### User-Friendly Interface
- Clear visual separators and emojis for better readability
- Confirmation prompts for destructive operations
- Progress indicators during operations
- Error messages that are easy to understand

### Robust Error Handling
- Network connection issues
- Database validation errors
- Invalid input handling
- Graceful shutdown on interruption

## Technical Details

- **Runtime**: Node.js with ES6 modules
- **Dependencies**: 
  - `readline-sync` for synchronous user input
  - `customers-management` library for all database operations
- **Architecture**: Object-oriented design with separation of concerns
- **Error Handling**: Try-catch blocks with user-friendly error messages

## Development

The application follows these principles:
- Clean, readable code with proper error handling
- Modular design leveraging the customers-management library
- User experience focused interface design
- Minimal dependencies for maximum compatibility

## Troubleshooting

### Common Issues:

1. **"Cannot connect to MongoDB"**
   - Ensure MongoDB is running: `mongod`
   - Check the MONGODB_URI in .env file

2. **"Module not found" errors**
   - Run `npm install` in the customer-console-app directory
   - Ensure the customers-management library is in the parent directory

3. **"Invalid input" errors**
   - Check that email addresses are in valid format
   - Phone numbers should contain only digits and optional +

### Getting Help

If you encounter issues:
1. Check that MongoDB is running
2. Verify the customers-management library is properly installed
3. Ensure Node.js version is 22 or higher
4. Check the console for detailed error messages

---

*Last updated: July 24, 2025*
