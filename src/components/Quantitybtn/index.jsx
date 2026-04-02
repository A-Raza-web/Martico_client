import  { useState } from 'react';
import { FiMinus, FiPlus } from "react-icons/fi";
import Button from '@mui/material/Button';
import './quantity.css'

const QuantityBtn = ()  => {
    const [qty, setQty] = useState(1);
 return(
        <div className="qty-wrapper">
            <div className="qty-wrapper">
                <Button
                className="qty-btn"
                disabled={qty === 1}
                onClick={() => setQty(qty - 1)}
                >
                <FiMinus />
                </Button>

                <span className="qty-value">{qty}</span>

                <Button
                className="qty-btn"
                onClick={() => setQty(qty + 1)}
                >
                <FiPlus />
                </Button>
            </div>
       </div>
       )
 }
export default QuantityBtn;
