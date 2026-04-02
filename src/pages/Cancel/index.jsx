import canjcelImg from "../../assets/images/cancel1.png"
import "./Cancel.css";
const Cancel = () => {
  return (
    <div style={{
       textAlign: "center", 
      }}>
       
      <div className="mt-4">
         <img className="cancelImg" src={canjcelImg} alt="Cancel"  />
         <h1>Payment Cancelled</h1>
      </div>
      <p>Don't worry, your money is safe. You can try again whenever you want.</p>
      <a href="/checkout"    className="btn-checkout"
      >
        Go back to Checkout
      </a>
    </div>
  );
};
export default Cancel;