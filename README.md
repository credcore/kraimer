# Kraimer CLI

Kraimer is a terminal app that allows you to extract information from documents via various "strategies".

![image](https://github.com/credcore/kraimer/assets/90258085/824171b3-7abd-4359-a852-d964fcc56b89)

## Installation

### Prerequisites

- Node.js (version 14 or higher)
- PostgreSQL (version 12 or higher)
- Python (version 3.6 or higher)

### Clone the Repository

```bash
git clone https://github.com/credcore/kraimer.git
cd kraimer
```

### Install Dependencies

```bash
npm install
```

### Set Up Environment Variables

Copy .env.sample file into .env and assign corresponding values.
```

### Build the Project

```bash
npm run build
```

## Database Setup

### Initialize the Database

Before using Kraimer CLI, initialize the database:

```
npm run db:migrate:latest
```

### Creating Documents and Document Groups

#### Create a Document

```bash
kraimer document create --type <document_type> --file-path <path_to_file> --name <document_name> --description <document_description>
```

#### Create a Document Group

```bash
kraimer document-group create --name <group_name> --description <group_description>
```

#### Add a Document to a Document Group

```bash
kraimer document-group add-document --document-group-id <group_id> --document-id <document_id>
```

### Applying a Strategy (Extracting Fields)

To apply a strategy and extract fields from documents, use the following command:

```bash
kraimer extract field --strategy 'node dist/strategies/pdf/pageToPng.js' --extraction-id <extraction_id>
```

### Example Workflow

Here is an example workflow to create a document, add it to a group, and create an extraction:

1. Create a document:

   ```bash
   kraimer document create --type "pdf" --file-path "./path/to/document.pdf" --name "Sample Document" --description "This is a sample document."
   ```

2. Create a document group:

   ```bash
   kraimer document-group create --name "Sample Group" --description "This is a sample document group."
   ```

3. Add the document to the document group:

   ```bash
   kraimer document-group add-document --document-group-id 1 --document-id 1
   ```

4. Create an extraction:

   ```bash
   kraimer extraction create --name "Sample Extraction" --document-group-id 1 --status "started"
   ```

5. Apply a strategy to the extraction:

   ```bash
   kraimer extract field --strategy 'node dist/strategies/pdf/pageToPng.js' --extraction-id 1
   ```

## Additional Commands

### Document Commands

- `create`: Create a new document.
- `delete`: Delete a document by ID.
- `get`: Get a document by ID.
- `getAll`: Get all documents with optional filters.
- `saveProperty`: Add a property to a document.
- `removeProperty`: Remove a property from a document.
- `getProperty`: Get a property from a document.
- `getProperties`: Get all properties from a document.

### Document Group Commands

- `create`: Create a new document group.
- `delete`: Delete a document group by ID.
- `get`: Get a document group by ID.
- `getAll`: Get all document groups with optional filters.
- `saveProperty`: Add a property to a document group.
- `removeProperty`: Remove a property from a document group.
- `getProperty`: Get a property from a document group.
- `addDocument`: Add a document to a document group.

### File Content Commands

- `create`: Create file content from a file path.
- `delete`: Delete file content by ID.

### Extraction Commands

- `create`: Create a new extraction.
- `delete`: Delete an extraction by ID.
- `get`: Get an extraction by ID.
- `getAll`: Get all extractions for a document group.
- `saveProperty`: Add a property to an extraction.
- `removeProperty`: Remove a property from an extraction.
- `getProperty`: Get a property from an extraction.
- `getDocuments`: Get documents in an extraction.
- `getProperties`: Get properties of an extraction.
- `getCost`: List the total cost of an extraction.

### Extracted Field Commands

- `save`: Create an extracted field.
- `delete`: Delete an extracted field by ID.
- `get`: Get an extracted field by ID.
- `getAll`: Get all extracted fields for an extraction.
- `getByName`: Get an extracted field by name.

### Extracted Field Error Commands

- `create`: Create an extracted field error.
- `delete`: Delete an extracted field error by ID.
- `get`: Get an extracted field error by ID.
- `getAll`: Get all extracted field errors for an extraction.
