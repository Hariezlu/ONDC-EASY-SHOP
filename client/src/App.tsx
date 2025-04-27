import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ProductPage from "@/pages/product-page";
import ProductsPage from "@/pages/products-page";
import BrandsPage from "@/pages/brands-page";
import OrderPage from "@/pages/order-page";
import CheckoutPage from "@/pages/checkout-page";
import ProfilePage from "@/pages/profile-page";
import NavbarBasic from "./components/layout/navbar-basic";
import Footer from "./components/layout/footer";

function Router() {
  return (
    <>
      <NavbarBasic />
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/brands" component={BrandsPage} />
        <Route path="/products" component={ProductsPage} />
        <Route path="/product/:id" component={ProductPage} />
        <Route path="/order/:id" component={OrderPage} />
        <ProtectedRoute path="/checkout" component={CheckoutPage} />
        <ProtectedRoute path="/profile" component={ProfilePage} />
        <Route component={NotFound} />
      </Switch>
      <Footer />
    </>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;
