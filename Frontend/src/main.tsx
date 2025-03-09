import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Home from "./Home.tsx";
import { ThemeProvider } from "./components/ui/theme-provider.tsx";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { NavigationMenuDemo } from "./components/navbar";
import Dashboard from "./Dashboard.tsx";
import { ModeToggle } from "./components/ui/mode-toggle.tsx";
import { Footer } from "./components/Footer.tsx";
import Chat from "./Chat.tsx";
import AdminPanel from "@/components/admin.tsx";
import AuthForm from "@/components/login.tsx";

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token from localStorage:", token); // Log the token
    if (!token) {
      navigate("/AuthForm");
    } else {
      // Verify token with the backend
      fetch("http://localhost:3001/verifyToken", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Include token in Authorization header
        },
        body: JSON.stringify({ token }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Token verification response:", data); // Log the response
          if (!data.valid) {
            navigate("/AuthForm");
          }
        })
        .catch((error) => {
          console.error("Token verification error:", error); // Log any errors
          navigate("/AuthForm");
        });
    }
  }, [navigate]);

  return (
    <>
      <div className="items: stretch flex justify-center items-center">
        <NavigationMenuDemo />
        <ModeToggle />
      </div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/AuthForm" element={<AuthForm />} />
      </Routes>
      <Footer />
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
