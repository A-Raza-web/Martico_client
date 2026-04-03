import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import { MdOutlineDelete } from "react-icons/md";
import { IoBagCheckOutline } from "react-icons/io5";
import './card.css';

const CART_API_BASE = 'martico-server.vercel.app/api/cart';

const toPrice = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const formatCurrency = (value) => `$${toPrice(value).toFixed(2)}`;
const truncateWords = (text, wordLimit = 3) => {
  if (!text) return "";
  const words = String(text).trim().split(/\s+/);
  if (words.length <= wordLimit) return words.join(" ");
  return `${words.slice(0, wordLimit).join(" ")}...`;
};

const Card = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const userId = localStorage.getItem('userId');

  const fetchCartItems = async () => {
    if (!userId) {
      setCartItems([]);
      setLoading(false);
      setError('Please sign in to view your cart.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${CART_API_BASE}/user/${userId}`);
      const json = await res.json();

      if (!res.ok || !json?.success) {
        throw new Error(json?.message || 'Failed to load cart items.');
      }

      setCartItems(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      setCartItems([]);
      setError(err.message || 'Failed to load cart items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

const handleDelete = async (id) => {
  try {
    setDeletingId(id);
    const res = await fetch(`${CART_API_BASE}/delete/${id}`, {
      method: 'DELETE'
    });
    const json = await res.json();

    if (!res.ok || !json?.success) {
      throw new Error(json?.message || 'Failed to delete cart item.');
    }

    setCartItems((prev) => prev.filter((item) => item._id !== id));

    // Update cart count in header
    window.dispatchEvent(new Event('cartUpdated'));

  } catch (err) {
    setError(err.message || 'Failed to delete cart item.');
  } finally {
    setDeletingId('');
  }
};

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + toPrice(item.subtotal || (item.price * item.quantity)), 0),
    [cartItems]
  );

  const shipping = 0;
  const total = subtotal + shipping;

  return (
    <section className="section card-section">
      <div className="container">
        <h2 className="hd mb-1">Your Cart</h2>
        <p>
          There are <b className='text-red'>{cartItems.length}</b> products in your cart.
        </p>

        {error && <p className="cartAlert mb-3">{error}</p>}

        <div className="controiler">
          <div className='row'>
            <div className="col-md-9 pr-5">
              <table className="table">
                <thead>
                  <tr>
                    <th width="40%">Products</th>
                    <th width="15%">Price</th>
                    <th width="15%">Quantity</th>
                    <th width="20%">Subtotal</th>
                    <th width="10%">Remove</th>
                  </tr>
                </thead>

                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan="5" className="cartStateCell">Loading cart items...</td>
                    </tr>
                  )}

                  {!loading && cartItems.length === 0 && (
                    <tr>
                      <td colSpan="5" className="cartStateCell">No items found in your cart.</td>
                    </tr>
                  )}

                  {!loading && cartItems.map((item) => {
                    const itemId = item._id;
                    const productId = item.productId?._id || item.productId;
                    const itemSubtotal = toPrice(item.subtotal || (item.price * item.quantity));

                    return (
                      <tr key={itemId}>
                        <td width="40%">
                          <Link to={productId ? `/product/${productId}` : '/card'}>
                            <div className="d-flex align-items-center cardProductItem">
                              <img
                                src={item.image || 'https://via.placeholder.com/100'}
                                alt={item.name || 'Cart Item'}
                                className="imgWapper"
                              />
                              <div className="info px-3">
                                <h6>{truncateWords(item.name || 'Product')}</h6>
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td width="15%" className='fond-weight'>{formatCurrency(item.price)}</td>
                        <td width="15%">
                          <span className="qtyReadOnly">{item.quantity || 1}</span>
                        </td>
                        <td width="20%" className='fond-weight'>{formatCurrency(itemSubtotal)}</td>
                        <td width="10%">
                          <Button
                            className="deleteBtn"
                            onClick={() => handleDelete(itemId)}
                            disabled={deletingId === itemId}
                          >
                            <MdOutlineDelete />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="col-md-3">
              <div className='card border p-3 cardDetail'>
                <h4>Cart Summary</h4>
                <div className="d-flex align-items-center mb-3">
                  <span>Subtotal</span>
                  <span className="text-red ml-auto font-weight-bold">{formatCurrency(subtotal)}</span>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <span>Shipping</span>
                  <span className=" ml-auto"><b>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</b></span>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <span>Estimate for</span>
                  <span className="ml-auto"><b>United States</b></span>
                </div>
                <div className="d-flex align-items-center ">
                  <span>Total</span>
                  <span className="text-red ml-auto font-weight-bold">{formatCurrency(total)}</span>
                </div>
                <br />
                <Button
                  className='checkBtn'
                  component={Link}
                  to="/checkout"
                  disabled={!cartItems.length}
                >
                  <IoBagCheckOutline />
                  <span className='ml-2'>Checkout</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Card;


