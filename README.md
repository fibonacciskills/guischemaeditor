# Schema Editor

A three-panel OpenAPI schema editor with visual data modeling capabilities.

## Features

- **📝 OpenAPI Schema Editor**: Edit OpenAPI 3.1.0 YAML schemas with Monaco Editor (VS Code editor)
- **🔄 Visual Flowchart**: See your schema as an interactive node diagram
- **📊 Sample API Response**: Auto-generate sample JSON responses from your schema
- **🔁 Bidirectional Sync**: Changes in schema update diagram and sample; changes in diagram update schema

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3001`

### Build for Production

```bash
npm build
```

## Usage

### Load a Schema

1. Click "Load Schema" button in the header
2. Select a YAML or JSON OpenAPI schema file
3. The schema will be parsed and displayed in all three panels

### Edit Schema

**Left Panel - Flowchart Editor:**
- **Add Nodes**: Click "+ Schema" or "+ Property" buttons
- **Edit Nodes**: Double-click any node to edit its properties
- **Connect Nodes**: Drag from one node's handle to another
- **Move Nodes**: Click and drag to reposition
- **Delete Nodes**: Select nodes and press Delete/Backspace key
- **Multi-select**: Click and drag to select multiple nodes

**Middle Panel - Schema Editor:**
- Edit the OpenAPI YAML directly (changes sync after 1 second of inactivity)
- Syntax highlighting and validation

**Right Panel - Sample Response:**
- View the auto-generated sample API response
- Click "Regenerate" for new sample values
- Click "Copy JSON" to copy to clipboard

### Export Schema

Click the "Export" button to download your current schema as a YAML file.

### Regenerate Sample

Click the "Regenerate" button in the Sample panel to generate new random sample values.

## Technology Stack

- **React 18** + **Vite** - Fast modern build tool
- **Tailwind CSS** - Utility-first styling
- **ReactFlow** - Interactive node-based diagrams
- **Monaco Editor** - VS Code editor component
- **Zustand** - Lightweight state management
- **js-yaml** - YAML parsing
- **@faker-js/faker** - Sample data generation

## Project Structure

```
schema_editor/
├── src/
│   ├── components/
│   │   ├── Header/          # Top navigation bar
│   │   ├── Layout/          # Three-panel layout
│   │   ├── FlowchartPanel/  # Visual diagram editor
│   │   ├── SchemaPanel/     # YAML editor
│   │   └── SamplePanel/     # JSON sample viewer
│   ├── store/               # Zustand state management
│   ├── utils/               # Parsers and generators
│   └── hooks/               # React hooks
└── public/
    └── example-schema.yaml  # Default example schema
```

## Alignment with Personal Skills Oracle

This schema editor supports the Personal Skills Oracle project by:

- Visualizing HROpen/TCP skill schemas
- Enabling easy editing of skill proficiency definitions
- Generating sample data for testing skill extraction pipelines
- Supporting the Skills Proficiency API standard

## Future Enhancements

- [ ] Node editing (add/remove/modify properties)
- [ ] Integration with Ollama for AI-powered schema generation
- [ ] Import schemas from live API endpoints
- [ ] Generate TypeScript types from schemas
- [ ] IndexedDB persistence
- [ ] Multi-schema management (tabs)
- [ ] Dark mode
- [ ] Undo/redo functionality

## License

MIT
