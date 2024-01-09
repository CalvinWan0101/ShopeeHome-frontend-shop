import axios from 'axios';
import * as React from 'react';
import Cookies from 'js-cookie';
import Box from '@mui/material/Box';
import { baseURL } from "./APIconfig.ts";
import { Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { useLoginStore } from './LoginState.ts';
import CancelIcon from '@mui/icons-material/Close';
import { randomId } from '@mui/x-data-grid-generator';
import {
    GridRowsProp,
    GridRowModesModel,
    GridRowModes,
    DataGrid,
    GridColDef,
    GridActionsCellItem,
    GridEventListener,
    GridRowId,
    GridRowModel,
    GridRowEditStopReasons,
} from '@mui/x-data-grid';

const initialRows: GridRowsProp = [
    {
        id: randomId(),
        information: "Name",
    },
    {
        id: randomId(),
        information: "Phone Number",
    },
    {
        id: randomId(),
        information: "Email",
    },
    {
        id: randomId(),
        information: "Address",
    },
    {
        id: randomId(),
        information: "Description",
    }
];

let newData: { [key: string]: any } = {
    email: null,
    password: "calvinshop", // TODO: change this
    name: null,
    phoneNumber: null,
    address: null,
    description: null,
    avatar: null,
    background: null,
    createrId: null,
    deleterId: null,
    deleted: false,
}

export default function SellerInformation() {

    const { id } = useParams();
    const shopId = id;

    const [rows, setRows] = useState(initialRows);
    const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});

    const { Login } = useLoginStore((state) => state);

    useEffect(() => {
        const fetchData = async () => {
            if (shopId) {
                try {
                    if (Cookies.get(shopId.toString()) === "false" || Cookies.get(shopId.toString()) === undefined) {
                        window.location.href = "/login";
                    } else {
                        const response = await axios.get(baseURL + "shop/" + shopId, {});
                        const info = response.data;

                        initialRows[0].info_value = info.name;
                        initialRows[1].info_value = info.phoneNumber;
                        initialRows[2].info_value = info.email;
                        initialRows[3].info_value = info.address;
                        initialRows[4].info_value = info.description;

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

    }, [shopId]);


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

        switch (newRow.information) {
            case "Name":
                newData.name = newRow.info_value;
                break;
            case "Phone Number":
                newData.phoneNumber = newRow.info_value;
                break;
            case "Email":
                newData.email = newRow.info_value;
                break;
            case "Address":
                newData.address = newRow.info_value;
                break;
            case "Description":
                newData.description = newRow.info_value;
                break;
        }

        axios
            .put(baseURL + "shop/" + shopId, {
                email: newData.email,
                password: newData.password,
                name: newData.name,
                phoneNumber: newData.phoneNumber,
                address: newData.address,
                description: newData.description,
                avatar: newData.avatar,
                background: newData.background,
                createrId: newData.createrId,
                deleterId: newData.deleterId,
                deleted: newData.deleted,
            })
            .then((response) => {
                console.log(response.data);
            })
            .catch((error) => {
                console.error(error);
            });

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
                ];
            },
        },
        {
            field: 'information',
            headerName: 'Information',
            width: 180,
            editable: false,
        },
        {
            field: 'info_value',
            headerName: 'Information',
            editable: true,
            flex: 1,
        },
    ];

    return (
        <Box
            sx={{
                width: '90%',
                columnWidth: '100%',
                margin: "auto",
                '& .actions': {
                    color: 'text.secondary',
                },
                '& .textPrimary': {
                    color: 'text.primary',
                },
                marginBottom: "50px",
                marginTop: "50px",
            }}
        >
            <Typography variant="h4">
                Information
            </Typography>
            <DataGrid
                rows={rows}
                columns={columns}
                editMode="row"
                rowModesModel={rowModesModel}
                onRowModesModelChange={handleRowModesModelChange}
                onRowEditStop={handleRowEditStop}
                processRowUpdate={processRowUpdate}
                hideFooter={true}
                columnHeaderHeight={0}
                slots={{
                    columnHeaders: () => null,
                }}
                sx={{
                    "& .MuiDataGrid-cell": {
                        border: "1px solid #ccc",
                    },
                }}
            />
        </Box>
    );
}