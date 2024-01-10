import axios from 'axios';
import * as React from 'react';
import Box from '@mui/material/Box';
import Cookies from 'js-cookie';
import { baseURL } from "./APIconfig.ts";
import Button from '@mui/material/Button';
import { useParams } from 'react-router-dom';
import { useLoginStore } from './LoginState.ts';
import DoneIcon from '@mui/icons-material/Done';
import ListIcon from '@mui/icons-material/List';
import { Modal, Typography } from '@mui/material';
import ProductsDetail from './ProductsDetail.tsx';
import { useEffect, useRef, useState } from 'react';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import {
    GridRowsProp,
    GridRowModesModel,
    DataGrid,
    GridColDef,
    GridEventListener,
    GridRowId,
    GridRowModel,
    GridRowEditStopReasons,
    GridValidRowModel,
} from '@mui/x-data-grid';

const initialRows: GridRowsProp = [];

export default function SellerOrder() {

    const { id } = useParams();
    const shopId = id;

    const [rows, setRows] = React.useState(initialRows);
    const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

    const initialized = useRef(false);
    let newData = useState([]);

    const { Login } = useLoginStore((state: any) => state);

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
                    const response = await axios.get(baseURL + "order/shop_id/" + shopId, {});
                    newData = response.data;
                    await setInitialRows(newData);
                } catch (error) {
                    console.log(error);
                }
            };

            const setInitialRows = async (data: object[]) => {
                data.forEach((product: any) => {
                    if (!(rows.find(obj => obj.id === product.id))) {

                        let state = "";
                        if (product.startTime === null) {
                            state = "prepare"
                        } else if (product.startTime !== null && product.deliverTime === null) {
                            state = "shipping"
                        } else if (product.startTime !== null && product.deliverTime !== null) {
                            state = "completed"
                        }

                        let discount = "";
                        if (product.rate === 0 && product.shippingLimit === 0) {
                            discount = "No discount"
                        } else if (product.rate !== 0 && product.shippingLimit === 0) {
                            discount = `單筆訂單打${product.rate.toString().split(".")[1]}折`;
                        } else if (product.rate === 0 && product.shippingLimit !== 0) {
                            discount = "單筆滿" + product.shippingLimit + "免運費"
                        }

                        const newRow = {
                            id: product.id,
                            address: product.address,
                            totalPrice: product.totalPrice,
                            products: product.products,
                            shippingState: state,
                            discount: discount,
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

    const [isUploadModalOpen, setUploadModalOpen] = useState(false);

    const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };

    const handleShipClick = (id: GridRowId) => () => {
        setRows(rows.map((row) => (row.id === id ? { ...row, shippingState: "shipping" } : row)));
        axios.put(baseURL + "order/ship/" + id, {})
    };

    const handleCancelClick = () => () => {
        confirm("The order is already shipped.");
    };

    const processRowUpdate = (newRow: GridRowModel) => {
        const updatedRow = { ...newRow, isNew: false };
        setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
        return updatedRow;
    };

    const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    const [details, setdetails] = useState<GridValidRowModel[] | undefined>(undefined);

    const handleUploadClick = (id: GridRowId) => () => {
        setUploadModalOpen(true);
        const row = rows.find((row) => row.id === id) || undefined;
        if (row) {
            setdetails(row.products);
        }
    };

    const handleUploadModalClose = () => {
        setUploadModalOpen(false);
    };

    const columns: GridColDef[] = [
        {
            field: 'id',
            headerName: 'Order ID',
            width: 300,
            editable: false,
            // flex: 1,
        },
        {
            field: 'address',
            headerName: 'Address',
            width: 180,
            flex: 1,
            editable: false,
        },
        {
            field: 'products',
            headerName: 'Products',
            align: "center",
            headerAlign: "center",
            width: 180,
            // flex: 1,
            editable: false,
            renderCell: (params: any) => {
                return (
                    <>
                        <Button
                            onClick={
                                handleUploadClick(params.id)}
                            component="label"
                            variant="outlined"
                            startIcon={<ListIcon />}
                            style={{
                                border: '1px solid #1876d2',
                                width: '130px',
                                color: '#1876d2',
                            }}>
                            details
                        </Button>
                    </>
                );
            },
        },
        {
            field: 'totalPrice',
            headerName: 'Total Price',
            width: 120,
            headerAlign: "center",
            align: "center",
            editable: false,
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
            headerName: 'Coupon',
            width: 200,
            headerAlign: "center",
            align: "center",
            editable: false,
        },
        {
            field: 'shippingState',
            headerName: 'Shipping State',
            headerAlign: "center",
            align: "center",
            width: 180,
            editable: false,
            renderCell: (params: any) => {
                if (params.formattedValue === "prepare") {
                    return (
                        <>
                            <Button
                                onClick={handleShipClick(params.id)}
                                component="label"
                                variant="outlined"
                                startIcon={<LocalShippingIcon />}
                                style={{
                                    border: '1px solid #FFA500',
                                    width: '145px',
                                    color: '#FFA500',
                                }}>
                                ship
                            </Button>
                        </>
                    );
                } else if (params.formattedValue === "shipping") {
                    return (
                        <>
                            <Button
                                onClick={handleCancelClick()}
                                component="label"
                                variant="outlined"
                                startIcon={<PendingActionsIcon />}
                                style={{
                                    border: '1px solid #1876d2',
                                    width: '145px',
                                    color: '#1876d2',
                                }}>
                                shipping
                            </Button>
                        </>
                    );
                } else if (params.formattedValue === "completed") {
                    return (
                        <>
                            <Button
                                onClick={handleCancelClick()}
                                component="label"
                                variant="outlined"
                                startIcon={<DoneIcon />}
                                style={{
                                    border: '1px solid #008000',
                                    width: '145px',
                                    color: '#008000',
                                }}>
                                completed
                            </Button>
                        </>
                    );
                }
            },
        },
    ];

    return (
        <Box
            sx={{
                // height: 850,
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
                Orders
            </Typography>
            <DataGrid
                rows={rows}
                columns={columns}
                editMode="row"
                rowModesModel={rowModesModel}
                onRowModesModelChange={handleRowModesModelChange}
                onRowEditStop={handleRowEditStop}
                processRowUpdate={processRowUpdate}
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
                <ProductsDetail details={details} />
            </Modal>
        </Box>
    );
}