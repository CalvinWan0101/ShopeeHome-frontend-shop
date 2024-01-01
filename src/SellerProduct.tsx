import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Close';
import { randomId } from '@mui/x-data-grid-generator';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import {
    GridRowsProp,
    GridRowModesModel,
    GridRowModes,
    DataGrid,
    GridColDef,
    GridToolbarContainer,
    GridActionsCellItem,
    GridEventListener,
    GridRowId,
    GridRowModel,
    GridRowEditStopReasons,
} from '@mui/x-data-grid';

const initialRows: GridRowsProp = [
    {
        id: randomId(),
        name: "Example Product 001",
    },
    {
        id: randomId(),
        name: "Example Product 002",
    },
];

interface EditToolbarProps {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (
        newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
    ) => void;
}

function EditToolbar(props: EditToolbarProps) {
    const { setRows, setRowModesModel } = props;

    const handleClick = () => {
        const id = randomId();
        setRows((oldRows) => [...oldRows, { id, name: '', age: '', isNew: true }]);
        setRowModesModel((oldModel) => ({
            ...oldModel,
            [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
        }));
    };

    return (
        <GridToolbarContainer>
            <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
                Add Product
            </Button>
        </GridToolbarContainer>
    );
}

export default function SellerProduct() {
    const [rows, setRows] = React.useState(initialRows);
    const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});

    const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };

    const handleEditClick = (id: GridRowId) => () => {
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
    };

    const handleSaveClick = (id: GridRowId) => () => {
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    };

    const handleDeleteClick = (id: GridRowId) => () => {
        setRows(rows.filter((row) => row.id !== id));
    };

    const handleCancelClick = (id: GridRowId) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        });

        const editedRow = rows.find((row) => row.id === id);
        if (editedRow!.isNew) {
            setRows(rows.filter((row) => row.id !== id));
        }
    };

    const processRowUpdate = (newRow: GridRowModel) => {
        const updatedRow = { ...newRow, isNew: false };
        setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
        return updatedRow;
    };

    const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    const columns: GridColDef[] = [
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 120,
            cellClassName: 'actions',
            getActions: ({ id }) => {
                const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

                if (isInEditMode) {
                    return [
                        <GridActionsCellItem
                            icon={<SaveIcon />}
                            label="Save"
                            sx={{
                                color: 'primary.main',
                            }}
                            onClick={handleSaveClick(id)}
                        />,
                        <GridActionsCellItem
                            icon={<CancelIcon />}
                            label="Cancel"
                            className="textPrimary"
                            onClick={handleCancelClick(id)}
                            color="inherit"
                        />,
                    ];
                }

                return [
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label="Edit"
                        className="textPrimary"
                        onClick={handleEditClick(id)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon />}
                        label="Delete"
                        onClick={handleDeleteClick(id)}
                        color="inherit"
                    />,
                ];
            },
        },
        {
            field: 'name',
            headerName: 'Product name',
            width: 180,
            editable: true,
            // flex: 1,
        },
        {
            field: 'originalPrice',
            headerName: 'Original price',
            width: 150,
            headerAlign: "center",
            align: "center",
            editable: true,
            type: 'number',
            valueFormatter(params) {
                if (params.value === undefined) {
                    params.value = 0;
                }
                return `${params.value} 元`;
            },
        },
        {
            field: 'discount',
            headerName: 'Discount',
            width: 150,
            headerAlign: "center",
            align: "center",
            editable: true,
            type: 'number',
            valueFormatter(params) {
                if (params.value === undefined) {
                    params.value = 0;
                }
                return `${params.value} 元`;
            },
        },
        {
            field: 'price',
            headerName: 'Price after discount',
            width: 150,
            headerAlign: "center",
            align: "center",
            editable: true,
            type: 'number',
            preProcessEditCellProps: (params) => {
                const originalPrice = params.otherFieldsProps!.originalPrice.value;
                const discountPrice = params.otherFieldsProps!.discount.value;

                console.log("originalPrice: ", originalPrice);
                console.log("discountPrice: ", discountPrice);

                return { ...params.props, value: `${originalPrice - discountPrice}` };
            },
            valueFormatter(params) {
                if (params.value === undefined) {
                    params.value = 0;
                }
                return `${params.value} 元`;
            },
        },
        {
            field: 'quantity',
            headerName: 'Quantity',
            width: 150,
            headerAlign: "center",
            align: "center",
            editable: true,
            type: 'number',
            valueFormatter(params) {
                if (params.value === undefined) {
                    params.value = 0;
                }
                return `${params.value} 個`;
            },
        },
        {
            field: 'description',
            headerName: 'Description',
            // width: 180,
            flex: 1,
            editable: true,
            valueFormatter(params) {
                if (params.value === undefined) {
                    params.value = "This is an example description";
                }
                return `${params.value}`;
            },
        },
    ];

    return (
        <Box
            sx={{
                height: 450,
                width: '90%',
                margin: 'auto',
                '& .actions': {
                    color: 'text.secondary',
                },
                '& .textPrimary': {
                    color: 'text.primary',
                },
                marginTop: '50px',
                marginBottom: '100px',
            }}
        >
            <Typography variant="h4">
                Products
            </Typography>
            <DataGrid
                rows={rows}
                columns={columns}
                editMode="row"
                rowModesModel={rowModesModel}
                onRowModesModelChange={handleRowModesModelChange}
                onRowEditStop={handleRowEditStop}
                processRowUpdate={processRowUpdate}
                slots={{
                    toolbar: EditToolbar,
                }}
                slotProps={{
                    toolbar: { setRows, setRowModesModel },
                }}
                hideFooter={true}
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
            />
        </Box>
    );
}