import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import "./components/settings.css";
import Nav from "./components/Nav/Nav";
import Home from "./pages/Home";
import { useEffect, useState } from "react";
import LoadingScreen from "./components/LoadingScreen/loadingScreen";

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replace with real loading logic if needed
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);
  function hasSeenLoader() {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  }
  return (
    <>
      {/* <AnimatePresence>{loading && <LoadingScreen />}</AnimatePresence>
        {!loading && (
        )} */}

      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
