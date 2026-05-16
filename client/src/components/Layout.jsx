import Sidebar from "../pages/Sidebar.jsx";

export default function Layout({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <main className="layout-main">
        {children}
      </main>
    </div>
  );
}