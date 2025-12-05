import { lazy } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MantineProvider, MantineThemeComponents } from "@mantine/core";

import "@mantine/core/styles.css";
import "./index.css";

const Home = lazy(() => import("@/pages/home"));
const SignIn = lazy(() => import("@/pages/sign-in"));
const Lobby = lazy(() => import("@/pages/lobby"));
const Profile = lazy(() => import("@/pages/profile"));
const Play = lazy(() => import("@/pages/play"));

const queryClient = new QueryClient();

const router = createBrowserRouter([
    { path: "/", element: <Navigate to="/lobby"/> },
    { path: "/sign-in", element: <SignIn/> },
    { path: "/lobby", element: <Lobby/> },
    { path: "/profile/:username", element: <Profile/> },
    { path: "/play/:worldCode", element: <Play/> },

    // create 404 page later
    { path: "/*", element: <Home/> }
]);

const mantineTheme: MantineThemeComponents = {
    Button: {
        styles: {
            root: {
                transition: "background-color 0.2s"
            }
        }
    },
    Modal: {
        styles: {
            title: {
                fontFamily: "Texturina",
                fontSize: "1.4rem"
            }
        }
    }
};

const root = createRoot(
    document.querySelector("#root")!
);

root.render(<QueryClientProvider client={queryClient}>
    <MantineProvider defaultColorScheme="dark" theme={{
        cursorType: "pointer",
        components: mantineTheme
    }}>
        <RouterProvider router={router} />
    </MantineProvider>
</QueryClientProvider>);