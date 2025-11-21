window.flattenMasterDetailData = function(data) {
  const flattened = [];
  if (!data) return flattened;
  data.forEach(item => {
    if (item._expanded === undefined) item._expanded = true;
    flattened.push(item);
    if (item._expanded) {
      flattened.push({
        _isDetailRow: true,
        _masterData: item
      });
    }
  });
  return flattened;
};

window.MasterToggleRenderer = class MasterToggleRenderer {
  init(params) {
    this.params = params;
    this.eGui = document.createElement('div');
    this.eGui.style.display = 'flex';
    this.eGui.style.alignItems = 'center';
    this.eGui.style.height = '100%';

    this.eIcon = document.createElement('i');
    const isExpanded = params.data._expanded !== false;
    this.eIcon.className = isExpanded ? 'fa fa-minus-square-o' : 'fa fa-plus-square-o';
    this.eIcon.style.cursor = 'pointer';
    this.eIcon.style.marginRight = '5px';
    this.eIcon.onclick = this.onToggle.bind(this);

    this.eValue = document.createElement('span');
    this.eValue.innerText = params.value;

    this.eGui.appendChild(this.eIcon);
    this.eGui.appendChild(this.eValue);
  }

  getGui() {
    return this.eGui;
  }

  onToggle(event) {
    event.stopPropagation();
    const data = this.params.data;
    const wasExpanded = data._expanded !== false;
    const nowExpanded = !wasExpanded;
    data._expanded = nowExpanded;

    this.eIcon.className = nowExpanded ? 'fa fa-minus-square-o' : 'fa fa-plus-square-o';

    const api = this.params.api;
    if (nowExpanded) {
      const masterNode = this.params.node;
      const insertIndex = masterNode.rowIndex + 1;

      const detailRow = {
        _isDetailRow: true,
        _masterData: data
      };

      api.applyTransaction({
        add: [detailRow],
        addIndex: insertIndex
      });
    } else {
      const detailId = data.hash + '_detail';
      const detailNode = api.getRowNode(detailId);
      if (detailNode) {
        api.applyTransaction({
          remove: [detailNode.data]
        });
      }
    }
  }

  refresh(params) {
    return false;
  }
};

window.enableMasterDetail = function(gridOptions) {
  const detailCellRendererParamsFunc = gridOptions.detailCellRendererParams;

  if (!detailCellRendererParamsFunc) {
    console.error("enableMasterDetail: detailCellRendererParams is missing from gridOptions");
    return gridOptions;
  }

  class DetailCellRenderer {
    init(params) {
      this.eGui = document.createElement('div');
      this.eGui.classList.add('detail-grid-container');
      this.eGui.style.width = '100%';
      this.eGui.style.height = '100%';

      const masterData = params.data._masterData;
      const masterParams = {
        data: masterData,
        node: params.node
      };

      const config = detailCellRendererParamsFunc(masterParams);
      const detailGridOptions = config.detailGridOptions;

      let rowData = [];
      if (config.getDetailRowData) {
        config.getDetailRowData({
          data: masterData,
          successCallback: (data) => {
            rowData = data;
          }
        });
      }

      detailGridOptions.rowData = rowData;

      this.detailApi = agGrid.createGrid(this.eGui, detailGridOptions);
    }

    getGui() {
      return this.eGui;
    }

    destroy() {
      if (this.detailApi) {
        this.detailApi.destroy();
      }
    }

    refresh(params) {
      return false;
    }
  }

  gridOptions.isFullWidthRow = function(params) {
    return params.rowNode.data && params.rowNode.data._isDetailRow;
  };

  gridOptions.fullWidthCellRenderer = DetailCellRenderer;

  const originalGetRowHeight = gridOptions.getRowHeight;
  gridOptions.getRowHeight = function(params) {
    if (params.data && params.data._isDetailRow) {
      const masterFiles = params.data._masterData.files;
      const count = masterFiles ? masterFiles.length : 0;
      return (count * 28) + 33 + 60;
    }
    if (originalGetRowHeight) {
      return originalGetRowHeight(params);
    }
    return 28;
  };

  const originalGetRowId = gridOptions.getRowId;
  gridOptions.getRowId = function(params) {
    if (params.data._isDetailRow) {
      const masterId = originalGetRowId ? originalGetRowId({
        data: params.data._masterData
      }) : params.data._masterData.hash;
      return masterId + '_detail';
    }
    if (originalGetRowId) {
      return originalGetRowId(params);
    }
    return params.data.hash;
  };

  return gridOptions;
};
