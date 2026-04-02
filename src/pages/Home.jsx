import HomeBanner from "../components/HomeBanner";
import List from '../components/ProductList/List1'; 
import HomeCat  from "../components/HomeCat";
import Letter from "../components/Letters"
const Home = () => { 
  return (
    <>
      <HomeBanner />
      <HomeCat />
      <List />
      <Letter/>
    </>
  );
};

export default Home;
