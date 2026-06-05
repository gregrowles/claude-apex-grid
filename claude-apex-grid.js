      class ClaudeApexGrid {
  constructor(options = {}) {
    this.container = document.getElementById(options.containerId);
    if (!this.container) throw new Error(`Container with ID '${options.containerId}' not found`);
    this.options = {
      columns: [], data: [], expanderColumn: 0, autoExpandLevel: 0, showHeader: true,
      showExpanderColumn: true, expanderColumnWidth: '48px', expanderLabel: '',
      tableClasses: 'w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden',
      headerClasses: 'bg-gray-50', headerCellClasses: 'px-4 py-2 text-left text-sm font-semibold text-gray-700',
      rowClasses: 'border-b border-gray-100 hover:bg-gray-50',
      cellClasses: 'px-4 py-2 text-sm text-gray-900',
      expanderClasses: 'inline-flex items-center justify-center w-6 h-6 rounded hover:bg-gray-200 cursor-pointer',
      expanderSize: 16,
      onRowExpand: null, onRowCollapse: null, onCellClick: null, onRowClick: null,
      ...options
    };
    this.expandedRows = new Set();
    this.table = null; this.tbody = null; this.rowIdCounter = 0; this.flattenedData = [];
    this.flatColumns = []; this.headerRows = [];
    this.init();
  }
  init() {
    this.flattenColumns();
    this.createTable();
    this.flattenData();
    this.render();
    this.autoExpand();
  }
  // Build headerRows multi-level tree and flatColumns (leaf order)
  flattenColumns() {
    this.flatColumns = [];
    this.headerRows = [];
    const build = (cols, level = 0) => {
      this.headerRows[level] = this.headerRows[level] || [];
      (cols || []).forEach(col => {
        const node = Object.assign({}, col);
        node._level = level;
        this.headerRows[level].push(node);
        if (col.columns && col.columns.length) {
          build(col.columns, level + 1);
        } else {
          this.flatColumns.push(node);
        }
      });
    };
    build(this.options.columns || []);
    // inject expander synthetic column as left-most leaf and header placeholder
    if (this.options.showExpanderColumn) {
      const expCol = {
        field: '__expander', label: this.options.expanderLabel || '', cellClass: '',
        width: this.options.expanderColumnWidth, isExpander: true
      };
      // ensure expander is first in flatColumns
      this.flatColumns.unshift(expCol);
    }
  }
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
    // compute header depth
    const getDepth = (cols) => {
      let max = 0;
      (cols || []).forEach(c => {
        const d = c.columns && c.columns.length ? 1 + getDepth(c.columns) : 1;
        if (d > max) max = d;
      });
      return max;
    };
    const totalDepth = getDepth(this.options.columns || []);
    // assign levels to original tree nodes
    const assignLevels = (cols, level = 0) => {
      (cols || []).forEach(c => {
        c._level = level;
        if (c.columns && c.columns.length) assignLevels(c.columns, level + 1);
      });
    };
    assignLevels(this.options.columns || []);
    // compute colSpan/_rowSpan from original tree
    const computeSpans = (node) => {
      if (node.columns && node.columns.length) {
        let span = 0;
        node.columns.forEach(ch => span += computeSpans(ch));
        node._colSpan = span;
        node._rowSpan = 1;
        return span;
      } else {
        node._colSpan = 1;
        node._rowSpan = totalDepth - (node._level || 0);
        return 1;
      }
    };
    (this.options.columns || []).forEach(c => computeSpans(c));
    // build rows array
    const rows = Array.from({ length: totalDepth }, () => []);
    const traverse = (cols) => {
      (cols || []).forEach(c => {
        rows[c._level].push(c);
        if (c.columns && c.columns.length) traverse(c.columns);
      });
    };
    traverse(this.options.columns || []);
    // if expander column enabled, add synthetic cell to first header row with rowspan = totalDepth
    if (this.options.showExpanderColumn) {
      const expTh = { _isSyntheticExpander: true, label: this.options.expanderLabel || '', _rowSpan: totalDepth, _colSpan: 1, width: this.options.expanderColumnWidth };
      rows[0].unshift(expTh);
    }
    // render header rows
    rows.forEach(rowNodes => {
      const tr = document.createElement('tr');
      rowNodes.forEach(node => {
        const th = document.createElement('th');
        th.className = this.options.headerCellClasses + (node.headerClass ? ' ' + node.headerClass : '');
        th.textContent = node.label || node.title || node.field || '';
        if (node._colSpan && node._colSpan > 1) th.colSpan = node._colSpan;
        if (node._rowSpan && node._rowSpan > 1) th.rowSpan = node._rowSpan;
        if (node.width && !node.columns) th.style.width = node.width;
        if (node._isSyntheticExpander) {
          th.style.width = node.width || this.options.expanderColumnWidth;
          th.style.textAlign = 'center';
          th.style.verticalAlign = 'middle';
        }
        tr.appendChild(th);
      });
      thead.appendChild(tr);
    });
    this.table.appendChild(thead);
    // cleanup temporary props to avoid collisions on next build
    const cleanup = (cols) => {
      (cols || []).forEach(c => {
        delete c._colSpan; delete c._rowSpan; delete c._level;
        if (c.columns) cleanup(c.columns);
      });
    };
    cleanup(this.options.columns || []);
  }
  flattenData(data = this.options.data) {
    this.rowIdCounter = 0; this.flattenedData = [];
    this.flattenDataRecursive(data, 0, null);
  }
  flattenDataRecursive(data, level, parentId) {
    (data || []).forEach(item => {
      const id = ++this.rowIdCounter;
      const flatItem = {
        ...item, _id: id, _level: level, _parentId: parentId,
        _hasChildren: item.children && item.children.length > 0, _visible: level === 0
      };
      this.flattenedData.push(flatItem);
      if (item.children && item.children.length) this.flattenDataRecursive(item.children, level + 1, id);
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
    const tr = document.createElement('tr');
    tr.className = this.options.rowClasses + (item.rowClass ? ' ' + item.rowClass : '');
    tr.dataset.rowId = item._id;
    tr.dataset.level = item._level;
    if (item.rowStyle) Object.assign(tr.style, item.rowStyle);
    if (this.options.onRowClick) {
      tr.style.cursor = 'pointer';
      tr.addEventListener('click', e => {
        if (!e.target.closest('.claude-apex-grid-expander')) this.options.onRowClick(item, e);
      });
    }
    // render cells in flatColumns order; expander synthetic col is first if enabled
    this.flatColumns.forEach((col, colIndex) => {
      const td = this.createCell(item, col, colIndex);
      tr.appendChild(td);
    });
    return tr;
  }
  createCell(item, column, colIndex) {
    const td = document.createElement('td');
    td.className = this.options.cellClasses + (column.cellClass ? ' ' + column.cellClass : '');
    if (item.cellClass && item.cellClass[column.field]) td.className += ' ' + item.cellClass[column.field];
    if (item.cellStyle && item.cellStyle[column.field]) Object.assign(td.style, item.cellStyle[column.field]);
    // handle expander synthetic column
    if (column.isExpander || column.field === '__expander') {
      td.style.width = column.width || this.options.expanderColumnWidth;
      td.style.textAlign = 'center';
      td.style.verticalAlign = 'middle';
      const wrapper = document.createElement('div');
      wrapper.className = 'flex items-center justify-center';
      const indent = document.createElement('span');
      indent.style.width = `${(item._level || 0) * 16}px`;
      indent.style.display = 'inline-block';
      wrapper.appendChild(indent);
      if (item._hasChildren) wrapper.appendChild(this.createExpander(item));
      else {
        const spacer = document.createElement('span');
        spacer.style.width = this.options.expanderSize + 'px';
        spacer.style.display = 'inline-block';
        wrapper.appendChild(spacer);
      }
      td.appendChild(wrapper);
      return td;
    }
    // normal cell rendering continues below
    const wrapper = document.createElement('div');
    wrapper.className = 'flex items-center';
    // If expanderColumn index refers to flatColumns, keep indent on that column only
    if (colIndex === this.options.expanderColumn && !this.options.showExpanderColumn) {
      const indent = document.createElement('span');
      indent.style.width = `${(item._level || 0) * 20}px`;
      indent.style.display = 'inline-block';
      wrapper.appendChild(indent);
      if (item._hasChildren) wrapper.appendChild(this.createExpander(item));
      else {
        const spacer = document.createElement('span');
        spacer.style.width = '24px';
        spacer.style.display = 'inline-block';
        wrapper.appendChild(spacer);
      }
    }
    const contentNode = this.renderCellContent(item, column);
    wrapper.appendChild(contentNode);
    td.appendChild(wrapper);
    if (this.options.onCellClick) {
      td.style.cursor = 'pointer';
      td.addEventListener('click', e => {
        if (!e.target.closest('.claude-apex-grid-expander')) this.options.onCellClick(item, column, e);
      });
    }
    return td;
  }
  renderCellContent(item, column) {
    const node = document.createElement('span');
    const value = column.field ? item[column.field] : undefined;
    const renderer = column.cellRenderer || column.render || column.cellRender || column.renderer;
    try {
      if (typeof renderer === 'function') {
        const out = renderer(value, item);
        if (out instanceof Node) return out;
        if (typeof out === 'string') { node.innerHTML = out; return node; }
        node.textContent = out == null ? '' : String(out);
        return node;
      } else {
        node.textContent = value == null ? '' : String(value);
        return node;
      }
    } catch (err) {
      node.textContent = value == null ? '' : String(value);
      return node;
    }
  }
  createExpander(item) {
    const span = document.createElement('span');
    span.className = 'claude-apex-grid-expander ' + this.options.expanderClasses;
    const isExpanded = this.expandedRows.has(item._id);
    const icon = document.createElement('i');
    icon.setAttribute('data-lucide', isExpanded ? 'chevron-down' : 'chevron-right');
    icon.style.width = this.options.expanderSize + 'px';
    icon.style.height = this.options.expanderSize + 'px';
    span.appendChild(icon);
    span.addEventListener('click', e => {
      e.stopPropagation();
      this.toggleRow(item._id);
    });
    return span;
  }
  toggleRow(rowId) {
    if (this.expandedRows.has(rowId)) this.collapseRow(rowId);
    else this.expandRow(rowId);
  }
  expandRow(rowId) {
    this.expandedRows.add(rowId);
    this.updateChildrenVisibility(rowId, true);
    this.render();
    if (this.options.onRowExpand) {
      const it = this.flattenedData.find(i => i._id === rowId);
      this.options.onRowExpand(it);
    }
  }
  collapseRow(rowId) {
    this.expandedRows.delete(rowId);
    this.updateChildrenVisibility(rowId, false);
    this.render();
    if (this.options.onRowCollapse) {
      const it = this.flattenedData.find(i => i._id === rowId);
      this.options.onRowCollapse(it);
    }
  }
  updateChildrenVisibility(parentId, visible) {
    this.flattenedData.forEach(item => {
      if (item._parentId === parentId) {
        item._visible = visible;
        if (!visible && this.expandedRows.has(item._id)) {
          this.expandedRows.delete(item._id);
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
          this.expandedRows.add(item._id);
          this.updateChildrenVisibility(item._id, true);
        }
      });
      this.render();
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
    this.flattenedData.forEach(item => { item._visible = item._level === 0; });
    this.render();
  }
  refresh(newData) {
    if (newData) this.options.data = newData;
    this.expandedRows.clear();
    this.flattenData();
    this.render();
    this.autoExpand();
  }
  destroy() {
    if (this.table && this.table.parentNode) this.table.parentNode.removeChild(this.table);
    this.expandedRows.clear();
    this.flattenedData = []; this.table = null; this.tbody = null;
  }
}
// End of ClaudeApexGrid
