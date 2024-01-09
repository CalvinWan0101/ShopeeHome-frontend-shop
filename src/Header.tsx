import '/src/css/Color.scss'
import Cookies from 'js-cookie'
import '/src/css/Animation.scss'
import UserAvater from './UserAvater.tsx'
import { useEffect, useState } from 'react'
import LogoutIcon from '@mui/icons-material/Logout'
import PersonIcon from '@mui/icons-material/Person'
import { Login, useLoginStore } from './LoginState'
import DiscountIcon from '@mui/icons-material/Discount';
import CategoryIcon from '@mui/icons-material/Category';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { IconButton, Icon, ButtonBase, Avatar } from '@mui/material';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom'
import { Drawer, Typography, List, ListItem, ListItemPrefix } from '@material-tailwind/react'

function Header() {

    const { LoginState, User, Logout } = useLoginStore<Login>((state) => state);

    const navigate = useNavigate()

    const [isLogInPage, setIsLogInPage] = useState<boolean>(false)

    const [open, setOpen] = useState<boolean>(false)
    const openDrawer = () => setOpen(true)
    const closeDrawer = () => setOpen(false)

    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [open]);

    const location = useLocation()
    useEffect(() => {
        if (location.pathname === '/login') {
            setIsLogInPage(true)
        }
        else {
            setIsLogInPage(false)
        }
        const autoScoll = document.getElementById('autoScoll') as HTMLElement
        autoScoll.scrollTop = 0;
    }, [location])

    function AccountArea() {

        return (
            <div className=' h-full ml-auto p-1 box-border flex items-center'>
                {!isLogInPage && !LoginState &&
                    <Link to={'login'}>
                        <ButtonBase>
                            <Avatar></Avatar>
                        </ButtonBase>
                    </Link>
                }
                {!isLogInPage && LoginState &&
                    <ButtonBase onClick={openDrawer}>
                        <UserAvater User={User} />
                    </ButtonBase>
                }
            </div>
        )
    }

    function AccountDrawer() {
        return (
            <Drawer open={open} onClose={closeDrawer} placement='right' className=' p-4'>
                <div className=" ml-2 mb-6 flex flex-wrap items-center justify-between">
                    <div className=' w-full flex justify-end'>
                        <IconButton type="button" onClick={closeDrawer}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="h-5 w-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </IconButton>
                    </div>

                    <div className=' flex items-center'>
                        <UserAvater User={User} />
                        <Typography variant="h5" className=' ml-2'>{User.name}</Typography>
                    </div>
                </div>
                <List>
                    <ListItem onClick={() => { closeDrawer(); navigate("/SellerInfo/" + User.id); }}>
                        <ListItemPrefix>
                            <PersonIcon />
                        </ListItemPrefix>
                        Persional Information
                    </ListItem>
                    <ListItem onClick={() => { closeDrawer(); navigate("/SellerCoupon/" + User.id); }}>
                        <ListItemPrefix>
                            <DiscountIcon />
                        </ListItemPrefix>
                        Coupons
                    </ListItem>
                    <ListItem onClick={() => { closeDrawer(); navigate("/SellerProduct/" + User.id); }}>
                        <ListItemPrefix>
                            <CategoryIcon />
                        </ListItemPrefix>
                        Products
                    </ListItem>
                    <ListItem onClick={() => { closeDrawer(); navigate("/SellerOrder/" + User.id); }}>
                        <ListItemPrefix>
                            <ReceiptLongIcon />
                        </ListItemPrefix>
                        Order
                    </ListItem>
                    <ListItem onClick={() => {
                        closeDrawer();
                        Logout();
                        navigate('/login');
                        Cookies.set(User.id, "false");
                    }}
                        className=' text-red-900 hover:text-red-900 active:text-red-900 focus:text-red-900'>
                        <ListItemPrefix>
                            <LogoutIcon />
                        </ListItemPrefix>
                        Log Out
                    </ListItem>
                </List>
            </Drawer>
        )
    }

    function Logo() {
        return (
            <div className=' h-full w-auto rounded-full p-2 box-border hover:animate-pulse'>
                <div id='shopeeLogo' className=' h-full flex items-center'>
                    <Icon component={ShoppingCartIcon} fontSize='large'></Icon>
                    <span className=' flex-nowrap text-2xl ml-2'>Shopee Home Seller</span>
                </div>
            </div>
        )
    }

    return (
        <>
            <AccountDrawer />
            <div id='autoScoll' className=' h-screen overflow-y-scroll'>
                <header className=' h-20 p-3 flex items-center bg3'>
                    <Logo />
                    <AccountArea />
                </header>
                <div className=' h-full '>
                    <Outlet />
                </div>
            </div>
        </>

    )
}

export default Header