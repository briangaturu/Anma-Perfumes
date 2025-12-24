import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./Pages/Home";
import PerfumesPage from "./Pages/Perfumes";
import CosmeticsPage from "./Pages/cosmetic";
import JewelryPage from "./Pages/Jewelery";
import BranchesPage from "./Pages/branches";
import CustomPerfumePage from "./Pages/customperfumes";
import CartPage from "./Pages/cartPAge";
import LoginPage from "./Pages/AuthPAges/Login";
import CategoryDetails from "./components/categoryDetailes";

const App = () => {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Home />
    },
    {
      path: '/perfumes',
      element: <PerfumesPage />
    },
    {
      path: '/cosmetics',
      element: <CosmeticsPage />
    },
    {
      path: '/jewels',
      element: <JewelryPage />
    },
     {
      path: '/branches',
      element: <BranchesPage />
    },
     {
      path: '/custom-perfume',
      element: <CustomPerfumePage />
    },
    {
      path: '/cart',
      element: <CartPage />
    },
     {
      path: '/login',
      element: <LoginPage />
    },
{ 
  path: '/categories/:id', 
  element: <CategoryDetails /> 
},
  ]);

  return <RouterProvider router={router} />;
};

export default App;