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
        name: 'Maple Realty Group',
        type: 'company',
        location: 'San Francisco, CA',
        children: [
          {
            id: 2,
            name: 'Downtown Loft',
            type: 'listing',
            price: '$1,250,000',
            image: 'https://via.placeholder.com/320x200?text=Loft',
            description: 'Bright 2BR loft with exposed beams and city views.',
            // per-row expansionContent as HTML string
            expansionContent: `
              <div class="p-4 bg-white shadow rounded-md flex gap-4">
                <img src="https://via.placeholder.com/240x160?text=Loft" class="w-48 h-32 object-cover rounded" />
                <div class="flex-1">
                  <h3 class="text-lg font-semibold">Downtown Loft</h3>
                  <p class="text-sm text-gray-600 mt-1">Bright 2BR loft with exposed beams and city views.</p>
                  <div class="mt-3 text-green-600 font-semibold">Price: $1,250,000</div>
                </div>
              </div>
            `
          },
          {
            id: 3,
            name: 'Bayview Cottage',
            type: 'listing',
            price: '$850,000',
            image: 'https://via.placeholder.com/320x200?text=Cottage',
            description: 'Cozy 3BR cottage with garden and bay glimpse.',
            // use a flag to let global expansionRenderer render a card from item fields
            // no expansionContent here => global renderer used
          }
        ]
      },
      {
        id: 4,
        name: 'Independent Agent - Sara Kim',
        role: 'Agent',
        email: 'sara@agents.example',
        // leaf row but we want custom expansion card produced by a per-row function (returns DOM Node)
        expansionContent: (function createNode() {
          const node = document.createElement('div');
          node.className = 'p-4 bg-white shadow rounded-md flex gap-4';
          const img = document.createElement('img');
          img.src = 'https://via.placeholder.com/200x140?text=Agent';
          img.className = 'w-40 h-28 object-cover rounded';
          node.appendChild(img);
          const meta = document.createElement('div');
          const h = document.createElement('h3');
          h.className = 'text-lg font-semibold';
          h.textContent = 'Sara Kim was HERE';
          meta.appendChild(h);
          const p = document.createElement('p');
          p.className = 'text-sm text-gray-600';
          p.textContent = 'Top-performing agent specializing in luxury condos.';
          meta.appendChild(p);
          node.appendChild(meta);
          return node;
        })()
      },
      {
        id: 5,
        name: 'Vacant Lot',
        type: 'listing',
        price: '$300,000',
        // no expansionContent and no children: example of leaf expansion enabled by grid option enableLeafExpansion
      },
      {
        id: 6,
        name: 'Development Portfolio',
        type: 'portfolio',
        children: [
          {
            id: 7,
            name: 'Site A',
            type: 'listing',
            price: '$3,200,000',
            image: 'https://via.placeholder.com/320x200?text=Site+A',
            description: '18-unit development site near transit.'
            // expansion will be rendered by global renderer
          }
        ]
      }
    ];




const columns = [
{
  label: 'General Info',
  columns: [
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
  ]
},
{
  label: 'Gender',
  columns: [
    {
      field: 'isMale',
      label: 'Male',
      width: '50%',
      cellRenderer: (value,item) => (item?.isMale ? 'Yes' : '')
    },
    {
      field: 'isFemale',
      label: 'Female',
      width: '50%',
      cellRenderer: (value,item) => (item?.isFemale ? 'Yes' : '')
    }
  ]
}
];

... basic example

const grid = new ClaudeApexGrid({
    container: '#myGrid',
    data: hierarchicalData,
    columns: columns
});

... advanced example 1

const gridAdv1 = new ClaudeApexGrid({
    container: '#myGrid1',
    data: hierarchicalData,
    columns: columns,
    rowClasses: 'hover:bg-gray-100',
    cellClasses: 'py-3 px-4',
    expanderClasses: 'text-blue-500 hover:text-blue-600',
    onRowClick: (item) => console.log('Row clicked:', item),
    onCellClick: (item, column) => console.log('Cell clicked:', item, column)
});

... advanced example 2

  const gridAdv2 = new ClaudeApexGrid({
    containerId: 'myGrid2',
    gridType: 'expansion',
    expansionRenderer: (item) => { expandRender(item) },
    enableLeafExpansion: true, // allows expansion for items without children
    showExpanderColumn: true,
    columns: [
      { field: 'name', label: 'Name' },
      { field: 'type', label: 'Type' },
      { field: 'price', label: 'Price' }
    ],
    data: hierarchicalData
  });



```
