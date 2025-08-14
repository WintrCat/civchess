import React, { lazy } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { MantineProvider } from "@mantine/core";

import "@mantine/core/styles.css";
import "./index.css";

const Home = lazy(() => import("@/pages/home"));
const Play = lazy(() => import("@/pages/play"));

const router = createBrowserRouter([
    { path: "/", element: <Home/> },
    { path: "/play", element: <Play/> }
]);

const root = createRoot(
    document.querySelector("#root")!
);

root.render(<MantineProvider>
    <RouterProvider router={router} />
</MantineProvider>);