import { createRoot } from "react-dom/client";
import "@opennihongo/ui/styles.css";
import { Gallery } from "./Gallery";
import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("The gallery root element is missing.");
}

createRoot(root).render(<Gallery />);
