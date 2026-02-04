import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import About from "./pages/About";
import SubmitFacility from "./pages/SubmitFacility";
import MapViewPage from "./pages/MapView";
import Admin from "./pages/Admin";
import Favorites from "./pages/Favorites";
import FacilityDetail from "./pages/FacilityDetail";
import StatesIndex from "./pages/StatesIndex";
import StatePage from "./pages/StatePage";
import Blog from "./pages/Blog";
import BlogArticle from "./pages/BlogArticle";
import Directory from "./pages/Directory";
import { RecyclingChatbot } from "./components/RecyclingChatbot";
import { InstallAppBanner } from "./components/InstallAppBanner";
import { BottomNav } from "./components/BottomNav";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/directory" component={Directory} />
      <Route path="/map" component={MapViewPage} />
      <Route path="/about" component={About} />
      <Route path="/submit" component={SubmitFacility} />
      <Route path="/admin" component={Admin} />
      <Route path="/favorites" component={Favorites} />
      <Route path="/facility/:id" component={FacilityDetail} />
      <Route path="/states" component={StatesIndex} />
      <Route path="/state/:stateSlug" component={StatePage} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogArticle} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
          <RecyclingChatbot />
          <InstallAppBanner />
          <BottomNav />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
