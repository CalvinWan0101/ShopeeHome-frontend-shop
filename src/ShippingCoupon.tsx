import axios from 'axios';
import Cookies from 'js-cookie';
import Box from '@mui/material/Box';
import { baseURL } from './APIconfig';
import Button from '@mui/material/Button';
import { Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import { useEffect, useRef, useState } from 'react';
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

const initialRows: GridRowsProp = [];

interface EditToolbarProps {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (
        newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
    ) => void;
}

function EditToolbar(props: EditToolbarProps) {
    const { setRows, setRowModesModel } = props;

    const { id } = useParams();
    const shopId = id;

    const handleClick = () => {
        axios
            .post(baseURL + "coupon/shipping", {
                date: null,
                shopId: shopId,
                shippingLimit: null,
            })
            .then((response) => {
                const id = response.data.id;
                setRows((oldRows) => [...oldRows, { id, name: '', shippingLimit: '', deadline: '', isNew: true }]);
                setRowModesModel((oldModel) => ({
                    ...oldModel,
                    [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
                }));
            })
            .catch((error) => {
                console.error(error);
            });
    };

    return (
        <GridToolbarContainer>
            <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
                Add Coupon
            </Button>
        </GridToolbarContainer>
    );
}

export default function ShippingCoupons() {

    const { id } = useParams();
    const shopId = id;

    const [rows, setRows] = useState(initialRows);
    const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;

            if (shopId) {
                if (Cookies.get(shopId.toString()) === "false" || Cookies.get(shopId.toString()) === undefined) {
                    window.location.href = "/login";
                }
            }

            const getAllShopProducts = async () => {
                try {
                    const response = await axios.get(baseURL + "coupon/shop/" + shopId, {});
                    let shippingCoupons = response.data.shippingCoupons;
                    await getproductsInfo(shippingCoupons);
                } catch (error) {
                    console.log(error);
                }
            };

            const getproductsInfo = async (data: any[] = []) => {
                data.forEach((product: any) => {
                    if (product.deleted === false) {
                        const newRow = {
                            id: product.id,
                            name: product.shippingLimit,
                            shippingLimit: product.shippingLimit,
                            deadline: product.date,
                        };
                        setRows(oldRows => [...oldRows, newRow]);
                    }
                });
            };

            getAllShopProducts();
        }
    });

    const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };

    const handleSaveClick = (id: GridRowId) => () => {
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    };

    const handleDeleteClick = (id: GridRowId) => () => {
        setRows(rows.filter((row) => row.id !== id));
        axios.delete(baseURL + "coupon/" + id, {})
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

        if (newRow.shippingLimit === undefined || newRow.shippingLimit === null || newRow.shippingLimit === "" || newRow.shippingLimit === 0) {
            confirm("Shipping limit cannot be empty.\nPlease add a new coupon with valid shipping limit rate.");
            axios.delete(baseURL + "coupon/" + newRow.id, {})
            window.location.reload();
        } else if (newRow.shippingLimit < 0) {
            confirm("Shipping limit cannot be negative.\nPlease add a new coupon with valid shipping limit rate.");
            axios.delete(baseURL + "coupon/" + newRow.id, {})
            window.location.reload();
        } else {
            axios
                .put(baseURL + "coupon/shipping/" + newRow.id, {
                    "date": newRow.deadline,
                    "shopId": shopId,
                    "shippingLimit": newRow.shippingLimit,
                })
                .catch((error) => {
                    console.error(error);
                });

            return updatedRow;
        }
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
            headerName: 'Name',
            width: 180,
            editable: false,
            flex: 1,
            valueGetter(params) {
                if (params.row.shippingLimit === undefined || params.row.shippingLimit === null || params.row.shippingLimit === "" || params.row.shippingLimit === 0) {
                    return "Can not be edited";
                }
                return `單筆滿$${params.row.shippingLimit}免運費`;
            },
        },
        {
            field: 'shippingLimit',
            headerName: 'Shipping Limit',
            width: 150,
            editable: true,
            type: 'number',
            headerAlign: "center",
            align: "center",
            valueFormatter(params) {
                if (params.value === undefined) {
                    params.value = 0;
                }
                return `${params.value} 元`;
            },

        },
        {
            field: 'deadline',
            headerName: 'Deadline',
            headerAlign: "center",
            align: "center",
            type: 'date',
            width: 180,
            editable: true,
            valueFormatter(params) {
                if (params.value === undefined || params.value === null || params.value === "") {
                    return "Null";
                }
                const date = new Date(params.value);
                return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
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
                Shipping Coupon
            </Typography>
            <DataGrid
                rows={rows}
                columns={columns}
                editMode="row"
                rowModesModel={rowModesModel}
                onRowModesModelChange={handleRowModesModelChange}
                onRowEditStop={handleRowEditStop}
                processRowUpdate={processRowUpdate}
                isCellEditable={(params) => params.row.isNew === true && (params.field === 'shippingLimit' || params.field === 'deadline')}
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