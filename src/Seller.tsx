import SellerInformation from './SellerInfo'
import SeasoningCoupon from './SeasoningCoupon'
import ShippingCoupon from './ShippingCoupon'
import SellerProduct from './SellerProduct'

export default function Seller() {

  return (
    <>
      <SellerInformation />
      <SeasoningCoupon />
      <ShippingCoupon />
      <SellerProduct />
      <br />
    </>
  )
}