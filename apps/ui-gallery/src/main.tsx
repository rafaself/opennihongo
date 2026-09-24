import { RouterProvider } from "@tanstack/react-router";
import { createRoot } from "react-dom/client";
import { TooltipProvider } from "@opennihongo/ui";
import { router } from "./app/router";
import "@opennihongo/ui/styles.css";
import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("The gallery root element is missing.");
}

createRoot(root).render(
  <TooltipProvider>
    <RouterProvider router={router} />
  </TooltipProvider>,
);
