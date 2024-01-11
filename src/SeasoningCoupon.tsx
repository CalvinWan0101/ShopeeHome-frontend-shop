import axios from 'axios';
import Cookies from 'js-cookie';
import Box from '@mui/material/Box';
import { baseURL } from './APIconfig';
import Button from '@mui/material/Button';
import { Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useLoginStore } from './LoginState';
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
            .post(baseURL + "coupon/seasoning", {
                date: null,
                shopId: shopId,
                rate: 0.0,
            })
            .then((response) => {
                const id = response.data.id;
                setRows((oldRows) => [...oldRows, { id, name: '', discount: '', deadline: '', isNew: true }]);
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

export default function SeasoningCoupon() {

    const { id } = useParams();
    const shopId = id;

    const [rows, setRows] = useState(initialRows);
    const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

    const initialized = useRef(false);

    const { Login } = useLoginStore((state) => state);

    useEffect(() => {

        const newData = {
            email: "",
            name: "",
            phoneNumber: "",
            avatar: "",
            address: "",
            description: "",
            background: "",
            createrId: "",
            deleterId: "",
            deleted: false,
        };

        if (!initialized.current) {
            initialized.current = true;

            const fetchData = async () => {
                if (shopId) {
                    try {
                        if (Cookies.get(shopId.toString()) === "false" || Cookies.get(shopId.toString()) === undefined) {
                            window.location.href = "/login";
                        } else {
                            const response = await axios.get(baseURL + "shop/" + shopId, {});
                            const info = response.data;

                            newData.email = info.email;
                            newData.name = info.name;
                            newData.phoneNumber = info.phoneNumber;
                            newData.address = info.address;
                            newData.description = info.description;
                            newData.avatar = info.avatar;
                            newData.background = info.background;
                            newData.createrId = info.createrId;
                            newData.deleterId = info.deleterId;
                            newData.deleted = info.deleted;
                        }
                    } catch (error) {
                        console.error(error);
                    }
                }
            };

            const login = async () => {
                await fetchData();
                let loginInfo = {
                    id: shopId || '',
                    email: newData.email,
                    name: newData.name,
                    phoneNumber: newData.phoneNumber,
                    avatar: newData.avatar,
                    addresses: [newData.address],
                    deleted: newData.deleted,
                }
                Login(loginInfo);
            };

            login();

            if (shopId) {
                if (Cookies.get(shopId.toString()) === "false" || Cookies.get(shopId.toString()) === undefined) {
                    window.location.href = "/login";
                }
            }

            const getAllShopProducts = async () => {
                try {
                    const response = await axios.get(baseURL + "coupon/shop/" + shopId, {});
                    let seasoningCoupons = response.data.seasoningCoupons;
                    await getproductsInfo(seasoningCoupons);
                } catch (error) {
                    console.log(error);
                }
            };

            const getproductsInfo = async (data: any[] = []) => {
                data.forEach((product: any) => {
                    const newRow = {
                        id: product.id,
                        name: product.rate,
                        discount: product.rate,
                        deadline: product.date,
                    };
                    setRows(oldRows => [...oldRows, newRow]);
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

        if (newRow.discount === undefined || newRow.discount === null || newRow.discount === "") {
            confirm("Discount Rate cannot be empty.\nPlease add a new coupon with valid discount rate.");
            axios.delete(baseURL + "coupon/" + newRow.id, {})
            window.location.reload();
        } else if (newRow.discount > 1 || newRow.discount < 0 || newRow.discount === 0) {
            confirm("Discount Rate must be between 0 and 1.\nPlease add a new coupon with valid discount rate.");
            axios.delete(baseURL + "coupon/" + newRow.id, {})
            window.location.reload();
        } else {
            axios
                .put(baseURL + "coupon/seasoning/" + newRow.id, {
                    "date": newRow.deadline,
                    "shopId": shopId,
                    "rate": newRow.discount,
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
                let num = (params.value * 100 ).toString().split(".")[0] as unknown as number;
                console.log("num");
                console.log(num);
                if (params.row.discount === undefined || params.row.discount === null || params.row.discount === "" || params.row.discount === 0) {
                    return "Can not be edited";
                }
                if (num % 10 === 0) {
                    return `單筆訂單打${num / 10}折`;
                }
                return `單筆訂單打${num}折`;
            },
        },
        {
            field: 'discount',
            headerName: 'Discount Rate',
            width: 150,
            editable: true,
            type: 'number',
            headerAlign: "center",
            align: "center",
            valueFormatter(params) {
                if (params.value === undefined) {
                    params.value = "null";
                }
                console.log();
                return `${(params.value * 100 ).toString().split(".")[0]} %`;
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
                Seasoning Coupon
            </Typography>
            <DataGrid
                rows={rows}
                columns={columns}
                editMode="row"
                rowModesModel={rowModesModel}
                onRowModesModelChange={handleRowModesModelChange}
                onRowEditStop={handleRowEditStop}
                processRowUpdate={processRowUpdate}
                isCellEditable={(params) => params.row.isNew === true && (params.field === 'deadline' || params.field === 'discount')}
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