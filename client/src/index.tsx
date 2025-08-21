import React, { lazy } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "@mantine/core/styles.css";
import "./index.css";

const Home = lazy(() => import("@/pages/home"));
const SignIn = lazy(() => import("@/pages/signin"));
const Lobby = lazy(() => import("@/pages/lobby"));
const Play = lazy(() => import("@/pages/play"));

const queryClient = new QueryClient();

const router = createBrowserRouter([
    { path: "/", element: <Home/> },
    { path: "/signin", element: <SignIn/> },
    { path: "/lobby", element: <Lobby/> },
    { path: "/play", element: <Play/> }
]);

const root = createRoot(
    document.querySelector("#root")!
);

root.render(<QueryClientProvider client={queryClient}>
    <MantineProvider defaultColorScheme="dark">
        <RouterProvider router={router} />
    </MantineProvider>
</QueryClientProvider>);