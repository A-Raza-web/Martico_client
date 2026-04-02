import img from "../../assets/images/coupon.png"
import Button from '@mui/material/Button'; 
import { IoMailOutline } from "react-icons/io5";
import "./Letter.css"
const Letter = () => {
  return(
    <>
      <div className="letterSec mt-3 mb-3 ">
        <div className="container">
          <div className="row">
              <div className="col-md-6  ">
                 <p  className="text-white mb-1">$20 discount for your first order</p>
                 <h3 className="text-white">Join our newsletter and get...</h3>
                 <p  className="text-light">Join our email subscription now to get updates<br/> on
                    promotions and coupons.</p>
                  <form>
                    <IoMailOutline />
                    <input  type="text" placeholder="Your Email Address"/>
                    <Button>Subscribe</Button>
                  </form>   
              </div>
               <div className="col-md-6">
                  <img src={img}/>
              </div>
          </div>
        </div>    
      </div>
      
    </>
  )
}
export  default Letter;