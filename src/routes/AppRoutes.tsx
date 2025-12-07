import { Routes, Route, Navigate } from 'react-router-dom'
import { RoleGuard } from './RoleGuard'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Usuarios from '@/pages/usuarios/Usuarios'
import Roles from '@/pages/roles/Roles'
import Categorias from '@/pages/categorias/Categorias'
import Almacenes from '@/pages/almacenes/Almacenes'
import Proveedores from '@/pages/proveedores/Proveedores'
import Productos from '@/pages/productos/Productos'
import Ubicaciones from '@/pages/ubicaciones/Ubicaciones'
import Movimientos from '@/pages/movimientos/Movimientos'
import Alertas from '@/pages/alertas/Alertas'

import NotFound from '@/pages/NotFound'
import DashboardLayout from '@/layouts/DashboardLayout'

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={<DashboardLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />

                <Route
                    path="usuarios"
                    element={
                        <RoleGuard allowedRoles={['superadmin']}>
                            <Usuarios />
                        </RoleGuard>
                    }
                />
                <Route
                    path="roles"
                    element={
                        <RoleGuard allowedRoles={['superadmin']}>
                            <Roles />
                        </RoleGuard>
                    }
                />
                <Route
                    path="categorias"
                    element={
                        <RoleGuard allowedRoles={['superadmin', 'admin']}>
                            <Categorias />
                        </RoleGuard>
                    }
                />
                <Route
                    path="almacenes"
                    element={
                        <RoleGuard allowedRoles={['superadmin', 'admin']}>
                            <Almacenes />
                        </RoleGuard>
                    }
                />
                <Route
                    path="proveedores"
                    element={
                        <RoleGuard allowedRoles={['superadmin', 'admin']}>
                            <Proveedores />
                        </RoleGuard>
                    }
                />
                <Route
                    path="productos"
                    element={
                        <RoleGuard allowedRoles={['superadmin', 'admin', 'operador']}>
                            <Productos />
                        </RoleGuard>
                    }
                />
                <Route
                    path="ubicaciones"
                    element={
                        <RoleGuard allowedRoles={['superadmin', 'admin']}>
                            <Ubicaciones />
                        </RoleGuard>
                    }
                />
                <Route
                    path="movimientos"
                    element={
                        <RoleGuard allowedRoles={['superadmin', 'admin', 'operador']}>
                            <Movimientos />
                        </RoleGuard>
                    }
                />
                <Route
                    path="alertas"
                    element={
                        <RoleGuard allowedRoles={['superadmin', 'admin']}>
                            <Alertas />
                        </RoleGuard>
                    }
                />

            </Route>

            {/* Catch all - 404 */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}
