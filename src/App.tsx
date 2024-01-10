import './App.scss'
import LogIn from './Login'
import Header from './Header'
import SellerOrder from './SellerOrder'
import SellerProduct from './SellerProduct'
import SellerInformation from './SellerInfo'
import ShippingCoupons from './ShippingCoupon'
import SeasoningCoupon from './SeasoningCoupon'
import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='' element={<Header />}>
            <Route path='/' element={<LogIn />}></Route>
            <Route path='/login' element={<LogIn />}></Route>
            <Route path='/SellerInfo/:id' element={<SellerInformation />}></Route>
            <Route path='/SellerCoupon/:id' element={<><SeasoningCoupon /> <ShippingCoupons /></>}></Route>
            <Route path='/SellerProduct/:id' element={<SellerProduct />}></Route>
            <Route path='/SellerOrder/:id' element={<SellerOrder />}></Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
