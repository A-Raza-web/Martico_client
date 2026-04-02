import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header/index';
import Home  from './pages/Home';
import Listing  from './pages/Listing/index';
import ProductDetails from './pages/ProductDetails';
import Card from "./pages/Card";
import Footer from './components/Footer';
import AuthForm from './pages/AuthForm';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import MyList from './pages/MyList';
import Checkout from './pages/Checkout';
import Success  from './pages/Success';
import CancelPage from './pages/Cancel';
// import Loader from './pages/Loader';
import SearchResults from './pages/SearchResults';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

function AppRoutes() {
  const location = useLocation();
  const path = location.pathname.toLowerCase();
  const hideOn = ['/signin', '/signup', '/profile', '/orders', '/order', '/my-list', '/success', '/cancel', ];
  const showHeaderFooter = !hideOn.includes(path);

  return (
    <>
      {showHeaderFooter && <Header/>}
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/cat/:id' element={<Listing/>} />
        <Route path='/subcat/:id' element={<Listing/>} />
        <Route path='/search' element={<SearchResults/>} />
        <Route path='/product/:id' element={<ProductDetails/>} />
        <Route path='/card' element={<Card/>} />
        <Route path='/profile' element={<Profile/>} />
        <Route path='/orders' element={<Orders/>} />
        <Route path='/order' element={<Orders/>} />
        <Route path='/my-list' element={<MyList/>} />
        <Route path='/checkout' element={<Checkout/>} />
        <Route path='/signIn' element={<AuthForm />} />
        <Route path='/signUp' element={<AuthForm />} />
        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<CancelPage />} /> 
         {/* <Route path="/Loader" element={<Loader />} />  */}
      </Routes>
      <ToastContainer
        containerId="global"
        position="bottom-left"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />
      <ToastContainer
        containerId="bottom-right"
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />
      {showHeaderFooter && <Footer/>}
    </>
  );
}

export default App;
