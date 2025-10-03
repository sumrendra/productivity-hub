# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**ProductivePro** is an all-in-one productivity suite that combines notes, links, tasks (projects), and finance tracking in a single web application. It's built with a Node.js/Express backend, PostgreSQL database, and a React-based frontend using Material-UI components.

## Architecture

### Application Structure

The application follows a **monolithic client-server architecture** with clear separation of concerns:

- **Backend**: Express server (`server.js`) that handles API routes and database operations
- **Frontend**: React application with vanilla JSX (no build step) loaded via CDN
- **Database**: PostgreSQL with 4 main tables (notes, links, tasks, expenses)
- **State Management**: Centralized through `ApiService` class that maintains client-side cache

### Key Architectural Patterns

1. **API Service Pattern**: A singleton `ApiService` class manages all API calls and maintains client-side state for notes, links, tasks, and expenses. This is instantiated in multiple places:
   - `src/components/App.jsx` (original implementation)
   - `src/components/app-boot.js` (enhanced boot script)
   - `src/utils/api.js` (centralized export)

2. **Component Loading Strategy**: The app uses a two-phase loading:
   - **Phase 1**: `app-boot.js` loads first and includes the dashboard component
   - **Phase 2**: `components-bundle.js` loads asynchronously with other components (Notes, Links, Projects, Finance)
   - Components are exposed as globals (`window.Notes`, `window.Links`, etc.) for dynamic rendering

3. **Database Schema Conventions**: 
   - PostgreSQL uses snake_case (e.g., `created_at`, `due_date`)
   - JavaScript/React uses camelCase (e.g., `createdAt`, `dueDate`)
   - The ApiService handles transformation between these conventions

4. **UI Theme System**: Material-UI theme with dark mode support, defined in `app-boot.js` with the `createAdvancedTheme()` function

### Directory Structure

```
productivity-hub/
├── server.js              # Express server with API routes and DB initialization
├── index.html             # Entry point that loads React and Material-UI from CDN
├── style.css              # Legacy styles (modern styles in src/styles/)
├── .env                   # Database and server configuration
├── src/
│   ├── components/        # React components
│   │   ├── app-boot.js           # Bootstrap script with enhanced dashboard
│   │   ├── components-bundle.js  # Bundled components (Notes, Links, etc.)
│   │   ├── App.jsx               # Original app container (legacy)
│   │   ├── Dashboard.jsx         # Dashboard component (legacy)
│   │   ├── Notes.jsx             # Notes management with Quill editor
│   │   ├── Links.jsx             # Link bookmarks management
│   │   ├── Projects.jsx          # Task/project management (Kanban board)
│   │   ├── Finance.jsx           # Expense tracking
│   │   └── Modals.jsx            # Shared modal components
│   ├── utils/
│   │   ├── api.js         # API service singleton
│   │   ├── globals.js     # Global utilities
│   │   └── ui.js          # UI utilities
│   └── styles/            # Modern CSS
└── public/                # Static assets
```

## Development Commands

### Setup and Installation

```bash
# Install dependencies
npm install

# Set up PostgreSQL database (ensure PostgreSQL is running)
# Update .env with your database credentials
# Database tables are auto-created on first server start
```

### Running the Application

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# The server runs on http://localhost:3000 by default
# Database tables are automatically initialized if they don't exist
```

### Database Management

```bash
# Connect to PostgreSQL database
psql -h 192.168.1.4 -p 5432 -U admin -d productivity-hub

# View tables
\dt

# Query specific table
SELECT * FROM notes;
SELECT * FROM links;
SELECT * FROM tasks;
SELECT * FROM expenses;

# Reset a table (caution: deletes all data)
TRUNCATE TABLE notes RESTART IDENTITY CASCADE;
```

### Testing and Debugging

```bash
# Check server logs
tail -f server.log

# Test API health
curl http://localhost:3000/api/health

# Test specific API endpoints
curl http://localhost:3000/api/notes
curl http://localhost:3000/api/links
curl http://localhost:3000/api/tasks
curl http://localhost:3000/api/expenses

# View server logs in real-time while developing
npm run dev | tee server.log
```

### Code Quality

```bash
# Check for syntax errors in JSX files (basic validation)
node check_parens.js

# Note: No linting or formatting tools are currently configured
```

## Database Configuration

The application requires PostgreSQL. Configure via `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=productivity-hub
DB_USER=your_username
DB_PASSWORD=your_password
PORT=3000
NODE_ENV=development
```

**Important**: The `.env` file contains sensitive credentials and is gitignored. Never commit database credentials to version control.

## Common Development Workflows

### Adding a New API Endpoint

1. Add route handler in `server.js` following the existing pattern:
   ```javascript
   app.get('/api/your-endpoint', async (req, res) => {
     try {
       const result = await pool.query('SELECT * FROM your_table');
       res.json(result.rows);
     } catch (error) {
       console.error('Error:', error);
       res.status(500).json({ error: 'Failed to fetch data' });
     }
   });
   ```

2. Add corresponding method in `ApiService` class (in `src/utils/api.js`, `src/components/app-boot.js`, and update `src/components/App.jsx` if needed)

3. Test the endpoint with curl or the browser console

### Adding a New Component

1. Create new component file in `src/components/YourComponent.jsx`
2. Follow the existing pattern - use Material-UI components from the global `MaterialUI` object
3. Accept `apiService` as a prop to interact with the backend
4. Add the component to `components-bundle.js` and expose it as `window.YourComponent`
5. Add menu item in `app-boot.js` in the `menuItems` array
6. Add conditional rendering logic in the `renderView()` function

### Modifying Database Schema

1. Update the table creation SQL in `server.js` `initDatabase()` function
2. If modifying existing tables, you may need to manually alter them or drop/recreate:
   ```sql
   DROP TABLE IF EXISTS your_table CASCADE;
   ```
3. Restart the server to run the initialization again
4. Update corresponding ApiService methods to handle new fields

## Technical Notes

### React Without Build Tools

This project uses React directly from CDN without webpack/vite/etc. Important implications:

- JSX is NOT transpiled - the code must use `React.createElement()` syntax
- All React components in `.jsx` files actually use createElement, despite the extension
- Material-UI is loaded via UMD bundle and available as global `MaterialUI` object
- No hot module replacement - full page refresh needed for changes
- MIME types are set in server.js to serve `.jsx` files as JavaScript

### State Management

- No Redux/Context API - state is managed component-locally with React hooks
- `ApiService` maintains cached copies of all data (`notes`, `links`, `tasks`, `expenses`)
- Components receive `apiService` instance as prop and call methods directly
- Data flows: Component → ApiService → Express API → PostgreSQL → Response → ApiService cache → Component state

### Charts and Visualizations

The Dashboard uses Chart.js for visualizations:
- Line chart for monthly expense trends
- Doughnut chart for expense categories
- Bar chart for task status distribution
- Charts are rendered to canvas elements with refs and destroyed/recreated on theme changes

### Rich Text Editing

The Notes component uses Quill editor for rich text:
- Loaded from CDN in index.html
- Custom toolbar configuration in `src/components/quill-toolbar-options.js`
- Supports formatting, lists, links, images, code blocks
- Content stored as HTML in PostgreSQL TEXT field

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `pg_isready -h 192.168.1.4 -p 5432`
- Check credentials in `.env` match your PostgreSQL user
- Ensure database exists: `createdb productivity-hub`
- Check PostgreSQL logs for connection errors

### Component Not Loading

- Check browser console for JavaScript errors
- Verify `components-bundle.js` is loading: check Network tab
- Ensure component is exported to global scope: `window.YourComponent`
- Clear browser cache if stale bundle is cached

### API Errors

- Check `server.log` for backend errors
- Verify Express server is running on expected port
- Test API endpoint directly with curl to isolate frontend/backend issues
- Check database connection in server logs

### Chart Rendering Issues

- Charts require canvas refs to be available before rendering
- Charts must be destroyed before recreating to avoid canvas reuse errors
- Dark mode changes require chart recreation with new theme colors
- Ensure Chart.js is loaded before components render
