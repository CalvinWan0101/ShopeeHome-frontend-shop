import { Box } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

const columns: GridColDef[] = [
    {
        field: 'name',
        headerName: 'Product Name',
        // width: 150,
        editable: true,
        flex: 1,
    },
    {
        field: 'quantity',
        headerName: 'Quantity',
        headerAlign: 'center',
        align: 'center',
        width: 150,
        editable: true,
        valueFormatter(params) {
            if (params.value === undefined || params.value === null) {
                params.value = 0;
            }
            return `${params.value} 個`;
        },
    },
    {
        field: 'price',
        headerName: 'Total Price',
        headerAlign: 'center',
        align: 'center',
        type: 'number',
        width: 110,
        editable: true,
        valueFormatter(params) {
            if (params.value === undefined) {
                params.value = 0;
            }
            return `${params.value} 元`;
        },
    },
];

const rows: any[] = [];

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 700,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

function productsDetail(props: any) {

    const details = props.details;

    return (
        <div>
            <Box sx={style}>
                <DataGrid
                    rows={details}
                    columns={columns}
                    sx={{
                        "& .MuiDataGrid-cell": {
                            border: "1px solid #ccc",
                        },
                        "& .MuiDataGrid-columnHeader": {
                            border: "1px solid #ccc",
                            borderBottom: 0,
                        },
                        border: '1px solid #ccc',
                    }}
                    pageSizeOptions={[5]}
                    checkboxSelection
                    disableRowSelectionOnClick
                    hideFooter={true}
                />
            </Box>
        </div>
    );
}

export default productsDetail;