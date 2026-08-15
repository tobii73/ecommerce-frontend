import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { Register } from '../pages/Register'
import { Login } from '../pages/Login'
import { Admin } from '../pages/Admin'
import { Products } from '../pages/Products'
import { Home } from '../pages/Home'
import { Business } from '../pages/Business'
import { Cart } from "../pages/Cart";
import { MyOrders } from '../pages/MyOrders'
import { OrderDetail } from '../pages/OrderDetail'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { NotFound } from '../pages/NotFound'
import { ProductDetail } from '../pages/ProductDetail'




export const AppRouter = () => {
  return (
    <div>
        <Routes>
          {/* Rutas publicas */}
          <Route path='/register' element={<Register  />} />
          <Route path='/login' element={<Login   />} />
          <Route path='/' element={<Home   />} />
          <Route path="/cart" element={<Cart  />}/>
          <Route path="/products/:productId" element={<ProductDetail />} />

          {/* Rutas protegidas */}
          <Route 
            path="/orders/:order_id" 
            element={
                <ProtectedRoute>
                    <OrderDetail />
                </ProtectedRoute>
            } 
          />
                  <Route 
            path='/orders/my-orders' 
            element={
            <ProtectedRoute>
              <MyOrders/>
            </ProtectedRoute>
            } 
          />
          
          <Route 
            path='/admin' 
            element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Admin/>
            </ProtectedRoute>

            } 
          />
        
          <Route
            path="/business"
            element={
              <ProtectedRoute>
                <Business />
              </ProtectedRoute>
            }
          />

          <Route
            path="/products"
            element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <Products />
              </ProtectedRoute>
            }
          />

          {/* Debe quedar al final: captura cualquier URL no reconocida. */}
          <Route path="*" element={<NotFound />} />
        </Routes>
    </div>
  )
}
