window.flattenMasterDetailData = function(data) {
  const flattened = [];
  if (!data) return flattened;
  data.forEach(item => {
    flattened.push(item);
    flattened.push({
      _isDetailRow: true,
      _masterData: item
    });
  });
  return flattened;
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

      // Get data
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

      // Create Grid
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
      // Formula: (count * 28) + 33 + 60
      return (count * 28) + 33 + 60;
    }
    if (originalGetRowHeight) {
      return originalGetRowHeight(params);
    }
    // Default height for Balham theme is usually 28px
    return 28;
  };

  const originalGetRowId = gridOptions.getRowId;
  gridOptions.getRowId = function(params) {
      if (params.data._isDetailRow) {
           const masterId = originalGetRowId ? originalGetRowId({ data: params.data._masterData }) : params.data._masterData.hash;
           return masterId + '_detail';
      }
      if (originalGetRowId) {
          return originalGetRowId(params);
      }
      // Fallback if originalGetRowId is not defined, though it should be.
      return params.data.hash;
  };

  return gridOptions;
};
