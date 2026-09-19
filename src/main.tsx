import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Clear localStorage if we're on an undefined dashboard route
if (window.location.pathname.includes('/dashboard/undefined')) {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
}

createRoot(document.getElementById("root")!).render(<App />);
