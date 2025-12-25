import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./Pages/Home";
import PerfumesPage from "./Pages/Perfumes";
import CosmeticsPage from "./Pages/cosmetic";
import BranchesPage from "./Pages/branches";
import CustomPerfumePage from "./Pages/customperfumes";
import CartPage from "./Pages/cartPAge";
import LoginPage from "./Pages/AuthPAges/Login";
import CategoryDetails from "./components/categoryDetailes";
import ProductDetailPage from "./components/ProductDetails";
import { AdminDashBoard } from "./Pages/AdminDashBoard";
import Error from "./Pages/Error";
import ProtectedRoutes from "./components/ProtectedRoutes";
import UnifiedProductManager from "./DashBoards/adminDashboard/ProductMAnager";
import CategoryManager from "./DashBoards/adminDashboard/categoryMAnagers";
import FlashDealManager from "./DashBoards/adminDashboard/FlashDeal";
import MediaManager from "./DashBoards/adminDashboard/Media";
import JewelleryPage from "./Pages/Jewelery";
import BannerMAnagement from "./DashBoards/adminDashboard/BannerMager";
import { MixingLabQueue } from "./DashBoards/adminDashboard/CustomPerfumes";
import BaseScentVault from "./DashBoards/adminDashboard/BaseScentMAnager";
import BranchAdminManager from "./DashBoards/adminDashboard/BranchMAnager";

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
      element: <JewelleryPage/>
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
      path: '/product/:id', 
      element: <ProductDetailPage />
    },
    
{ 
  path: '/categories/:id', 
  element: <CategoryDetails /> 
},
 {
      path: 'Admin-dashboard',
      element: (
        <ProtectedRoutes>
          <AdminDashBoard />
        </ProtectedRoutes>
      ),
      errorElement: <Error />,
      children: [
       {path: "Manage-products", element:<UnifiedProductManager />},
       {path: "Manage-categories", element:<CategoryManager />},
       {path: "flash-deals", element:<FlashDealManager />},
       {path: "product-media", element:<MediaManager/>},
       {path: "Manage-banners", element:<BannerMAnagement/>},
       {path: "Manage-customPerfumes", element:<MixingLabQueue/>},
       {path: "Manage-scents", element:<BaseScentVault/>},
       {path: "Branch-Manager", element:<BranchAdminManager/>},
      ],
    },

  ]);

  return <RouterProvider router={router} />;
};

export default App;