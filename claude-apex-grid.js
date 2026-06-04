class ClaudeApexGrid {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) throw new Error(`Container with ID '${containerId}' not found`);
    this.options = {
      columns: [], data: [], expanderColumn: 0, autoExpandLevel: 0, showHeader: true,
      tableClasses: 'w-full border-collapse bg-white shadow-lg rounded-lg overflow-hidden',
      headerClasses: 'bg-gray-50 border-b border-gray-200',
      headerCellClasses: 'px-4 py-3 text-left text-sm font-semibold text-gray-700',
      rowClasses: 'border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150',
      cellClasses: 'px-4 py-3 text-sm text-gray-900',
      expanderClasses: 'inline-flex items-center justify-center w-6 h-6 rounded hover:bg-gray-200 cursor-pointer transition-colors duration-150',
      expanderSize: 16, onRowExpand: null, onRowCollapse: null, onCellClick: null, onRowClick: null, ...options
    };
    this.expandedRows = new Set();
    this.table = null; this.tbody = null; this.rowIdCounter = 0; this.flattenedData = [];
    this.init();
  }
  init() { this.createTable(); this.flattenData(); this.render(); this.autoExpand(); }
  createTable() {
    this.container.innerHTML = '';
    this.table = document.createElement('table');
    this.table.className = this.options.tableClasses;
    if (this.options.showHeader) this.createHeader();
    this.tbody = document.createElement('tbody');
    this.table.appendChild(this.tbody);
    this.container.appendChild(this.table);
  }

    createHeader() {
    const thead = document.createElement('thead');
    thead.className = this.options.headerClasses;
    const headerRow = document.createElement('tr');
    this.options.columns.forEach(column => {
      const th = document.createElement('th');
      th.className = this.options.headerCellClasses;
      th.textContent = column.title || column.field;
      if (column.width) th.style.width = column.width;
      if (column.headerClass) th.className += ' ' + column.headerClass;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    this.table.appendChild(thead);
  }
  flattenData(data = this.options.data) {
    this.rowIdCounter = 0; this.flattenedData = [];
    this.flattenDataRecursive(data, 0, null);
  }
  flattenDataRecursive(data, level, parentId) {
    data.forEach(item => {
      const id = ++this.rowIdCounter;
      const flatItem = { ...item, _id: id, _level: level, _parentId: parentId,
        _hasChildren: item.children && item.children.length > 0, _visible: level === 0 };
      this.flattenedData.push(flatItem);
      if (item.children && item.children.length > 0) {
        this.flattenDataRecursive(item.children, level + 1, id);
      }
    });
  }
  render() {
    this.tbody.innerHTML = '';
    this.flattenedData.forEach(item => {
      if (item._visible) {
        const row = this.createRow(item);
        this.tbody.appendChild(row);
      }
    });
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
  createRow(item) {
    const row = document.createElement('tr');
    row.className = this.options.rowClasses;
    row.dataset.rowId = item._id;
    row.dataset.level = item._level;
    if (item.rowClass) row.className += ' ' + item.rowClass;
    if (item.rowStyle) {
      Object.keys(item.rowStyle).forEach(key => {
        row.style[key] = item.rowStyle[key];
      });
    }
    if (this.options.onRowClick) {
      row.style.cursor = 'pointer';
      row.addEventListener('click', (e) => {
        if (!e.target.closest('.claude-apex-grid-expander')) {
          this.options.onRowClick(item, e);
        }
      });
    }
    this.options.columns.forEach((column, colIndex) => {
      const cell = this.createCell(item, column, colIndex);
      row.appendChild(cell);
    });
    return row;
  }
  createCell(item, column, colIndex) {
    const cell = document.createElement('td');
    cell.className = this.options.cellClasses;
    if (column.cellClass) cell.className += ' ' + column.cellClass;
    if (item.cellClass && item.cellClass[column.field]) {
      cell.className += ' ' + item.cellClass[column.field];
    }
    if (item.cellStyle && item.cellStyle[column.field]) {
      Object.keys(item.cellStyle[column.field]).forEach(key => {
        cell.style[key] = item.cellStyle[column.field][key];
      });
    }
    const content = document.createElement('div');
    content.className = 'flex items-center';
    if (colIndex === this.options.expanderColumn) {
      const indent = document.createElement('span');
      indent.style.width = `${item._level * 20}px`;
      indent.style.display = 'inline-block';
      content.appendChild(indent);
      if (item._hasChildren) {
        const expander = this.createExpander(item);
        content.appendChild(expander);
      } else {
        const spacer = document.createElement('span');
        spacer.style.width = '24px';
        spacer.style.display = 'inline-block';
        content.appendChild(spacer);
      }
    }
    const textSpan = document.createElement('span');
    if (column.render) {
      const rendered = column.render(item[column.field], item);
      if (typeof rendered === 'string') {
        textSpan.innerHTML = rendered;
      } else {
        textSpan.appendChild(rendered);
      }
    } else {
      textSpan.textContent = item[column.field] || '';
    }
    content.appendChild(textSpan);
    cell.appendChild(content);
    if (this.options.onCellClick) {
      cell.style.cursor = 'pointer';
      cell.addEventListener('click', (e) => {
        if (!e.target.closest('.claude-apex-grid-expander')) {
          this.options.onCellClick(item, column, e);
        }
      });
    }
    return cell;
  }
  createExpander(item) {
    const expander = document.createElement('span');
    expander.className = 'claude-apex-grid-expander ' + this.options.expanderClasses;
    const isExpanded = this.expandedRows.has(item._id);
    const icon = document.createElement('i');
    icon.setAttribute('data-lucide', isExpanded ? 'chevron-down' : 'chevron-right');
    icon.style.width = this.options.expanderSize + 'px';
    icon.style.height = this.options.expanderSize + 'px';
    expander.appendChild(icon);
    expander.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleRow(item._id);
    });
    return expander;
  }
  toggleRow(rowId) {
    if (this.expandedRows.has(rowId)) {
      this.collapseRow(rowId);
    } else {
      this.expandRow(rowId);
    }
  }
  expandRow(rowId) {
    this.expandedRows.add(rowId);
    this.updateChildrenVisibility(rowId, true);
    this.render();
    if (this.options.onRowExpand) {
      const item = this.flattenedData.find(i => i._id === rowId);
      this.options.onRowExpand(item);
    }
  }
  collapseRow(rowId) {
    this.expandedRows.delete(rowId);
    this.updateChildrenVisibility(rowId, false);
    this.render();
    if (this.options.onRowCollapse) {
      const item = this.flattenedData.find(i => i._id === rowId);
      this.options.onRowCollapse(item);
    }
  }
  updateChildrenVisibility(parentId, visible) {
    this.flattenedData.forEach(item => {
      if (item._parentId === parentId) {
        item._visible = visible;
        if (!visible && this.expandedRows.has(item._id)) {
          this.updateChildrenVisibility(item._id, false);
        } else if (visible && this.expandedRows.has(item._id)) {
          this.updateChildrenVisibility(item._id, true);
        }
      }
    });
  }
  autoExpand() {
    if (this.options.autoExpandLevel > 0) {
      this.flattenedData.forEach(item => {
        if (item._level < this.options.autoExpandLevel && item._hasChildren) {
          this.expandRow(item._id);
        }
      });
    }
  }
  expandAll() {
    this.flattenedData.forEach(item => {
      if (item._hasChildren) {
        this.expandedRows.add(item._id);
        this.updateChildrenVisibility(item._id, true);
      }
    });
    this.render();
  }
  collapseAll() {
    this.expandedRows.clear();
    this.flattenedData.forEach(item => {
      item._visible = item._level === 0;
    });
    this.render();
  }
  refresh(newData) {
    if (newData) {
      this.options.data = newData;
    }
    this.expandedRows.clear();
    this.flattenData();
    this.render();
    this.autoExpand();
  }
  destroy() {
    if (this.table && this.table.parentNode) {
      this.table.parentNode.removeChild(this.table);
    }
    this.expandedRows.clear();
    this.flattenedData = [];
    this.table = null;
    this.tbody = null;
  }
}
