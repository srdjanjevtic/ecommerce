/**
 * AdminLayout component is a layout wrapper for admin pages.
 * It includes a navigation bar with links to different admin sections
 * and renders the children components within a container.
 */
import { Nav, NavLink } from "@/components/Nav"

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <Nav>
        <NavLink href="/admin">Dashboard</NavLink>
        <NavLink href="/admin/products">Products</NavLink>
        <NavLink href="/admin/users">Customers</NavLink>
        <NavLink href="/admin/orders">Sales</NavLink>
        |
        <NavLink href="/">SHOP</NavLink>
      </Nav>
      <div className="container my-6">{children}</div>
    </>
  )
}