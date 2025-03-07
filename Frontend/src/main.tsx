import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Home from "./Home.tsx";
import { ThemeProvider } from "./components/theme-provider";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NavigationMenuDemo } from "./components/navbar";
import Dashboard from "./Dashboard.tsx";
import { ModeToggle } from "./components/mode-toggle.tsx";
import { Footer } from "./components/Footer.tsx";
import Chat from "./Chat.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <div className="items: stretch flex justify-center items-center">
          <NavigationMenuDemo />
          <ModeToggle />
        </div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
