import axios from 'axios';
import * as React from 'react';
import Cookies from 'js-cookie';
import Box from '@mui/material/Box';
import { baseURL } from "./APIconfig.ts";
import Button from '@mui/material/Button';
import { useNavigate, useParams } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import UploadImages from './UploadImages.tsx';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import { useLoginStore } from './LoginState.ts';
import { Modal, Typography } from '@mui/material';
import CancelIcon from '@mui/icons-material/Close';
import UploadIcon from '@mui/icons-material/Upload';
import { useEffect, useRef, useState } from 'react';
import { Carousel } from "@material-tailwind/react";
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
    GridValidRowModel,
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
            .post(baseURL + "product", {
                name: "",
                amount: null,
                description: "",
                discountRate: null,
                discountDate: null,
                shopId: shopId,
                images: [],
                isDeleted: false,
            })
            .then((response) => {
                const id = response.data.id;
                setRows((oldRows) => [...oldRows, { id, name: response.data.name, isNew: true }]);
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
                Add Product
            </Button>
        </GridToolbarContainer>
    );
}

export default function SellerProduct() {

    const { id } = useParams();
    const shopId = id;

    const [rows, setRows] = React.useState(initialRows);
    const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

    const initialized = useRef(false);
    let newData = useState([]);

    const [isUploadModalOpen, setUploadModalOpen] = useState(false);

    const { Login } = useLoginStore((state) => state);

    useEffect(() => {

        const LoginData = {
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

                            LoginData.email = info.email;
                            LoginData.name = info.name;
                            LoginData.phoneNumber = info.phoneNumber;
                            LoginData.address = info.address;
                            LoginData.description = info.description;
                            LoginData.avatar = info.avatar;
                            LoginData.background = info.background;
                            LoginData.createrId = info.createrId;
                            LoginData.deleterId = info.deleterId;
                            LoginData.deleted = info.deleted;
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
                    email: LoginData.email,
                    name: LoginData.name,
                    phoneNumber: LoginData.phoneNumber,
                    avatar: LoginData.avatar,
                    addresses: [LoginData.address],
                    deleted: LoginData.deleted,
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
                    const response = await axios.get(baseURL + "product/name/shop/" + shopId, {});
                    newData = response.data;
                    await getproductsInfo(newData);
                } catch (error) {
                    console.log(error);
                }
            };

            const getproductsInfo = async (data: any[] = []) => {
                try {
                    const promises = data.map((product: any) => {
                        return axios.get(baseURL + "product/" + product.id, {});
                    });

                    const responses = await Promise.all(promises);

                    const productInfoArray = responses.map((response) => response.data);
                    setInitialRows(productInfoArray);
                } catch (error) {
                    console.log(error);
                }
            };

            const setInitialRows = (data: object[]) => {
                data.forEach((product: any) => {
                    if (!(rows.find(obj => obj.id === product.id))) {
                        const newRow = {
                            id: product.id,
                            name: product.name,
                            description: product.description,
                            originalPrice: product.price,
                            discount: product.discountRate,
                            discountDate: product.discountDate,
                            image: product.images,
                            quantity: product.amount,
                            sales: product.sales,
                        };

                        setTimeout(() => {
                            setRows(oldRows => [...oldRows, newRow]);
                        }, 0);
                    }
                });
            };

            getAllShopProducts();
        }
    });

    const navigate = useNavigate()

    const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };

    const handleEditClick = (id: GridRowId) => () => {
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
        setInfoChanged(rows.find((row) => row.id === id) || undefined);
    };

    const handleSaveClick = (id: GridRowId) => () => {
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    };

    const handleDeleteClick = (id: GridRowId) => () => {
        setRows(rows.filter((row) => row.id !== id));
        console.log(id);
        axios.delete(baseURL + "product/" + id, {})
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

        if (newRow.originalPrice < 0) {
            alert("Price can't be negative");
            return updatedRow;
        }

        if (newRow.discount > 1 || newRow.discount < 0 || newRow.discount === 0) {
            alert("Discount Rate must be between 0 and 1.\nPlease add a new coupon with valid discount rate.");
            return updatedRow;
        }

        if (newRow.quantity < 0) {
            alert("Quantity can't be negative");
            return updatedRow;
        }

        axios
            .put(baseURL + "product/" + newRow.id, {
                name: newRow.name,
                amount: newRow.quantity,
                price: newRow.originalPrice,
                description: newRow.description,
                discountRate: newRow.discount,
                discountDate: newRow.discountDate,
                shopId: shopId,
                images: newRow.image,
                isDeleted: false,
            })
            .catch((error) => {
                console.error(error);
            });

        return updatedRow;
    };

    const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    const handleUploadClick = () => () => {
        setUploadModalOpen(true);
    };

    const handleUploadModalClose = () => {
        setUploadModalOpen(false);
        window.location.reload();
    };

    const [infoChanged, setInfoChanged] = useState<GridValidRowModel | undefined>(undefined);

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
                                marginRight: -1,
                            }}
                            size='small'
                            onClick={handleSaveClick(id)}
                        />,
                        <GridActionsCellItem
                            icon={<CancelIcon />}
                            label="Cancel"
                            className="textPrimary"
                            sx={{
                                marginRight: -1,
                            }}
                            onClick={handleCancelClick(id)}
                            color="inherit"
                        />,
                        <GridActionsCellItem
                            icon={<UploadIcon />}
                            label="Cancel"
                            className="textPrimary"
                            onClick={handleUploadClick()}
                            color="inherit"
                        />,
                    ];
                }

                return [
                    <GridActionsCellItem
                        key="view-actions"
                        icon={<EditIcon />}
                        label="Edit"
                        className="textPrimary"
                        onClick={handleEditClick(id)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        key="delete-actions"
                        icon={<DeleteIcon />}
                        label="Delete"
                        onClick={handleDeleteClick(id)}
                        color="inherit"
                    />
                ];
            },
        },
        {
            field: 'name',
            headerName: 'Product name',
            // width: 180,
            editable: true,
            flex: 1,
            renderCell: (params: any) => {
                if (params.value === undefined || params.value === null || params.value === "") {
                    return (
                        <div>
                            <Typography color={"red"}>
                                Undefined
                            </Typography>
                        </div>
                    );
                }
                return (
                    <div>
                        <Typography>
                            {params.value}
                        </Typography>
                    </div>
                );
            },

        },
        {
            field: 'description',
            headerName: 'Description',
            // width: 180,
            flex: 1,
            editable: true,
        },
        {
            field: 'originalPrice',
            headerName: 'Price',
            width: 120,
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
            headerName: 'DiscountRate',
            width: 120,
            headerAlign: "center",
            align: "center",
            editable: true,
            type: 'number',
            valueFormatter(params) {
                if (params.value === undefined || params.value === null) {
                    return "Null";
                }
                return `${params.value * 100} %`;
            },
        },
        {
            field: 'discountDate',
            headerName: 'DiscountDate',
            headerAlign: "center",
            align: "center",
            type: 'date',
            width: 120,
            editable: true,
            valueFormatter(params) {
                if (params.value === undefined || params.value === null) {
                    return "Null";
                }
                return `${params.value}`;
            },
        },
        {
            field: 'image',
            headerName: 'Images',
            headerAlign: "center",
            align: "center",
            width: 150,
            type: 'string',
            editable: false,
            renderCell: (params: any) => {
                if (Array.isArray(params.value) && params.value.length > 0) {
                    return (
                        <>
                            <Carousel loop placeholder="">
                                {params.value.map((image: string, index: number) => (
                                    <img src={image} key={index} />
                                ))}
                            </Carousel>
                        </>
                    );
                } else {
                    return <div color='red'>沒有圖片</div>;
                }
            },
        },
        {
            field: 'quantity',
            headerName: 'Quantity',
            width: 120,
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
            field: 'sales',
            headerName: 'Sold out',
            width: 120,
            headerAlign: "center",
            align: "center",
            editable: false,
            type: 'number',
            valueFormatter(params) {
                if (params.value === undefined) {
                    params.value = 0;
                }
                return `${params.value} 個`;
            },
        },
    ];

    return (
        <Box
            sx={{
                height: 850,
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
                rowHeight={150} {...rows}
                // getRowHeight={() => 'auto'}
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
            <Modal
                open={isUploadModalOpen}
                onClose={handleUploadModalClose}
                aria-labelledby="upload-modal-title"
                aria-describedby="upload-modal-description"
            >
                <UploadImages infoChanged={infoChanged} shopId={shopId} />
            </Modal>
        </Box>
    );
}