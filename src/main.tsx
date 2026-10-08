import React from "react";
import {createRoot} from "react-dom/client";
import ReciprocalLab from "./reciprocal-lab";
import "./globals.css";
createRoot(document.getElementById("root")!).render(<React.StrictMode><ReciprocalLab/></React.StrictMode>);
