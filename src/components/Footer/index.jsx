import { LuShirt } from "react-icons/lu";
import { TbTruckDelivery } from "react-icons/tb";
import { RiDiscountPercentLine } from "react-icons/ri";
import { AiOutlineDollarCircle } from "react-icons/ai";
import { Link } from "react-router-dom";
import { FaFacebookF } from "react-icons/fa";
import { AiFillInstagram } from "react-icons/ai";
import { FaTwitter } from "react-icons/fa6";

import "./Footer.css"
const footer = () => {
    return(
        <footer>
          <div className="container">
            
            <div className="row topInfo">
               <div className="col d-flex ">
                  <span><LuShirt /></span>
                  <span className="ml-2">Everyday fresh products</span>
               </div> 
               <div className="col d-flex ">
                  <span><TbTruckDelivery /></span>
                  <span className="ml-2">Free delivery for order over $70</span>
               </div> 
               <div className="col d-flex ">
                  <span><RiDiscountPercentLine/></span>
                  <span className="ml-2">Daily Mega Discounts</span>
               </div> 
               <div className="col d-flex ">
                  <span><AiOutlineDollarCircle /></span>
                  <span className="ml-2">Best price on the market</span>
               </div>   
            </div>
            
            <div className="row mt-5 linksWrap">
                <div className="col ">
                    <h5>FRUIT & VEGETABLES</h5>
                    <ul>
                        <li><Link to="/fresh-vegetables">Fresh Vegetables</Link></li>
                        <li><Link to="/herbs">Herbs & Seasonings</Link></li>
                        <li><Link to="/fruits">Fresh Fruits</Link></li>
                        <li><Link to="/cuts">Cuts & Sprouts</Link></li>
                        <li><Link to="/exotic">Exotic Fruits & Veggies</Link></li>
                        <li><Link to="/packaged">Packaged Produce</Link></li>
                        <li><Link to="/party-trays">Party Trays</Link></li>
                    </ul>
                </div>
                <div className="col ">
                    <h5>BREAKFAST & DAIRY</h5>
                    <ul>
                        <li><Link to="/fresh-vegetables">Fresh Vegetables</Link></li>
                        <li><Link to="/herbs">Herbs & Seasonings</Link></li>
                        <li><Link to="/fruits">Fresh Fruits</Link></li>
                        <li><Link to="/cuts">Cuts & Sprouts</Link></li>
                        <li><Link to="/exotic">Exotic Fruits & Veggies</Link></li>
                        <li><Link to="/packaged">Packaged Produce</Link></li>
                        <li><Link to="/party-trays">Party Trays</Link></li>
                    </ul>
                </div>
                <div className="col ">
                    <h5>MEAT & SEAFOOD</h5>
                    <ul>
                        <li><Link to="/fresh-vegetables">Fresh Vegetables</Link></li>
                        <li><Link to="/herbs">Herbs & Seasonings</Link></li>
                        <li><Link to="/fruits">Fresh Fruits</Link></li>
                        <li><Link to="/cuts">Cuts & Sprouts</Link></li>
                        <li><Link to="/exotic">Exotic Fruits & Veggies</Link></li>
                        <li><Link to="/packaged">Packaged Produce</Link></li>
                        <li><Link to="/party-trays">Party Trays</Link></li>
                    </ul>
                </div>
                <div className="col ">
                    <h5>BEVERAGES</h5>
                    <ul>
                        <li><Link to="/fresh-vegetables">Fresh Vegetables</Link></li>
                        <li><Link to="/herbs">Herbs & Seasonings</Link></li>
                        <li><Link to="/fruits">Fresh Fruits</Link></li>
                        <li><Link to="/cuts">Cuts & Sprouts</Link></li>
                        <li><Link to="/exotic">Exotic Fruits & Veggies</Link></li>
                        <li><Link to="/packaged">Packaged Produce</Link></li>
                        <li><Link to="/party-trays">Party Trays</Link></li>
                    </ul>
                </div>
                <div className="col ">
                    <h5>BREADS & BAKERY</h5>
                    <ul>
                        <li><Link to="/fresh-vegetables">Fresh Vegetables</Link></li>
                        <li><Link to="/herbs">Herbs & Seasonings</Link></li>
                        <li><Link to="/fruits">Fresh Fruits</Link></li>
                        <li><Link to="/cuts">Cuts & Sprouts</Link></li>
                        <li><Link to="/exotic">Exotic Fruits & Veggies</Link></li>
                        <li><Link to="/packaged">Packaged Produce</Link></li>
                        <li><Link to="/party-trays">Party Trays</Link></li>
                    </ul>
                
                </div>      
            </div>
            
          </div>
          <div  className="copyRight w-100 mt-4 pt-3 pb-3"> 
                <p className="mb-0">Copyright 2025. All rights reserved</p>
                 
                 <ul className="list list-inline">
                   
                   <li className="list list-inline-items">
                    <Link to="#"><FaFacebookF/></Link>
                   </li>
                   
                   <li className="list list-inline-items">
                    <Link to="#"><AiFillInstagram/></Link>
                   </li>
                   
                   <li className="list list-inline-items">
                    <Link to="#"><FaTwitter/></Link>
                   </li>
                 </ul> 
          </div>
        </footer>
    )
}
export default footer;