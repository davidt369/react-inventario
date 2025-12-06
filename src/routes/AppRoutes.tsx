import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import NotFound from '@/pages/NotFound'
import DashboardLayout from '@/layouts/DashboardLayout'

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={<DashboardLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                {/* Add other protected routes here later */}
            </Route>

            {/* Catch all - 404 */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}
