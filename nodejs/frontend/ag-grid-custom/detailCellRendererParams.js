window.getDetailCellRendererParams = function(dependencies) {
  const { actionCellRenderer, ActionHeaderComponent, socket, formatBytes } = dependencies;

  return (masterParams) => {
    return {
      detailGridOptions: {
        components: {
          actionCellRenderer: actionCellRenderer,
          actionHeaderComponent: ActionHeaderComponent,
        },
        defaultColDef: {
          suppressHeaderMenuButton: true,
          suppressHeaderContextMenu: true,
        },
        getRowId: params => params.data.ino,
        columnDefs: [
          {
            headerName: '',
            width: 45,
            cellRenderer: (detailParams) => {
              const input = document.createElement('input');
              input.type = 'radio';
              input.name = `radio-group-${masterParams.data.hash}`;
              input.checked = detailParams.data.is_original;
              input.addEventListener('change', () => {
                if (input.checked) {
                  socket.send(JSON.stringify({
                    action: 'setOriginalFile',
                    data: {
                      hash: masterParams.data.hash,
                      ino: detailParams.data.ino,
                    },
                  }));
                }
              });
              return input;
            },
          },
          {
            headerName: '',
            field: 'action',
            width: 70,
            cellRenderer: 'actionCellRenderer',
            headerComponent: 'actionHeaderComponent',
          },
          { field: 'path', headerName: 'Path', flex: 1 },
          {
            field: 'size',
            headerName: 'Size',
            width: 85,
            valueFormatter: params => formatBytes(params.value)
          },
          {
            field: 'mtime',
            headerName: 'Modified',
            width: 185,
            valueFormatter: params => new Date(params.value).toLocaleString()
          },
          {
            field: 'ctime',
            headerName: 'Created',
            width: 185,
            valueFormatter: params => new Date(params.value).toLocaleString()
          }
        ]
      },
      getDetailRowData: window.getDetailRowData,
    }
  };
};
