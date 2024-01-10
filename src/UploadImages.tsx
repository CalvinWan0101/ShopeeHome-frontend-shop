import axios from 'axios';
import { baseURL } from './APIconfig';
import React, { useState } from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Box, Grid, ImageList, ImageListItem } from '@mui/material';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

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

function UploadImages(props: any) {
    const [images, setImages] = useState<string[]>([]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;

        const newImages: string[] = [];
        if (files) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const reader = new FileReader();

                reader.onload = (e: ProgressEvent<FileReader>) => {
                    const outputstring = e.target?.result as string;
                    newImages.push(outputstring);

                    if (newImages.length === files.length) {
                        setImages(newImages);
                        putImagesToDB(newImages);
                    }
                };

                reader.readAsDataURL(file);
            }
        }
    };

    const putImagesToDB = async (images: string[]) => {

        let newProduct = {
            name: props.infoChanged.name,
            amount: props.infoChanged.quantity,
            price: props.infoChanged.originalPrice,
            description: props.infoChanged.description,
            discountRate: props.infoChanged.discount,
            discountDate: props.infoChanged.discountDate,
            shopId: props.shopId,
            images: [...props.infoChanged.image, ...images],
            isDeleted: false
        }

        axios
            .put(baseURL + "product/" + props.infoChanged.id, newProduct)
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.log(error);
            })
    };

    return (
        <div>
            <Box sx={style} >
                <Button component="label" variant="contained" startIcon={<FolderOpenIcon />}>
                    Upload
                    <VisuallyHiddenInput type="file" onChange={handleFileChange} multiple />
                </Button>
                <ImageList sx={{ width: "100%", height: 450, }} cols={3} rowHeight={164}>
                    {images.map((value, index) => (
                        <ImageListItem key={index} >
                            <img
                                src={value}
                                alt={`Image ${index}`}
                                loading="lazy"
                                width={300}
                                height={200}
                            />
                        </ImageListItem>
                    ))}
                </ImageList>
                <Grid container justifyContent="flex-end">
                    <Button
                        component="label"
                        variant="contained"
                        startIcon={<CloudUploadIcon />}
                        onClick={() => {
                            window.onclick = function () {
                                window.location.href = "/SellerProduct/" + props.shopId
                            }
                        }}
                    >
                        Save
                    </Button>
                </Grid>
            </Box>
        </div>
    );
}

export default UploadImages;
