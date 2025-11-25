//===================================================================================//
// Imports
import { createBrowserRouter, RouterProvider } from "react-router"

import HomePage from "./Pages/HomePage/HomePage"
import SignupPage from "./Pages/SignupPage/SignupPage"
import LoginPage from "./Pages/LoginPage/LoginPage"
import StoragePage from "./Pages/StoragePage/StoragePage"
import SettingsPage from "./Pages/SettingsPage/SettingsPage"
//===================================================================================//
// Variables
//===================================================================================//
// Functions
//===================================================================================//
// Router
const Router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage/>,
    errorElement: <div>Error 404 page not found</div>
  },
  {
    path: '/signup',
    element: <SignupPage/>
  },
  {
    path: '/login',
    element: <LoginPage/>
  },
  {
    path: '/storage',
    element: <StoragePage/>
  },
  {
    path: '/settings',
    element: <SettingsPage/>
  }
])
//===================================================================================//
// Element
function App() {

  return (
    <RouterProvider router={Router}/>
  )
}
//===================================================================================//
// Export
export default App
//===================================================================================//