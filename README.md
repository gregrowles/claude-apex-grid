# Claude Apex Grid

A lightweight, customizable hierarchical data grid component for displaying tree-structured data with expand/collapse functionality.

## 🚀 Features

- **Hierarchical Data Support**: Display nested data structures with visual indentation
- **Expand/Collapse**: Expand and collapse rows to show or hide child data
- **Customizable Styling**: Easily apply your own styles to the grid and its elements
- **Event Handling**: Hook into various events like row/cell click, row expand/collapse
- **No Dependencies**: The grid is built using pure JavaScript, with only the Lucide icon library as a dependency

## 🔧 Getting Started

1. Include the `claude-apex-grid.js` script in your HTML:

```html
<script src="js/claude-apex-grid.js"></script>

...

const hierarchicalData = [
  {
    id: 1,
    name: 'John Stag',
    email: 'john.stag@example.com',
    role: 'Manager',
    children: [
      {
        id: 2,
        name: 'Joan Smith',
        email: 'joan.smith@example.com',
        role: 'Developer',
        children: [
          {
            id: 3,
            name: 'Bob Johnson',
            email: 'bob.johnson@example.com',
            role: 'Junior Developer'
          },
          {
            id: 4,
            name: 'Alice Williams',
            email: 'alice.williams@example.com',
            role: 'QA Analyst'
          }
        ]
      },
      {
        id: 5,
        name: 'Michael Brower',
        email: 'michael.brower@example.com',
        role: 'Designer'
      }
    ]
  },
  {
    id: 6,
    name: 'Betty Davis',
    email: 'betty.davis@example.com',
    role: 'HR Specialist',
    children: []
  },
  {
    id: 7,
    name: 'Rosco Wilson',
    email: 'rosco.wilson@example.com',
    role: 'Finance Analyst',
    children: [
      {
        id: 8,
        name: 'Emily Taylor',
        email: 'emily.taylor@example.com',
        role: 'Junior Analyst'
      }
    ]
  }
];


const columns = [
    {
        field: 'name',
        label: 'Name',
        width: '40%',
        cellClasses: 'font-medium'
    },
    {
        field: 'email',
        label: 'Email',
        width: '30%',
        cellClasses: 'text-gray-600'
    },
    {
        field: 'role',
        label: 'Role',
        width: '30%',
        cellClasses: 'text-green-500 font-medium'
    }
];

... basic example

const grid = new ClaudeApexGrid({
    container: '#myGrid',
    data: hierarchicalData,
    columns: columns
});

... advanced example

const grid = new ClaudeApexGrid({
    container: '#myGrid',
    data: hierarchicalData,
    columns: columns,
    rowClasses: 'hover:bg-gray-100',
    cellClasses: 'py-3 px-4',
    expanderClasses: 'text-blue-500 hover:text-blue-600',
    onRowClick: (item) => console.log('Row clicked:', item),
    onCellClick: (item, column) => console.log('Cell clicked:', item, column)
});

```
