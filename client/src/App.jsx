import { Outlet, Link } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";

export default function App() {
  return (
    <div className="container py-4" style={{ maxWidth: 1100 }}>
      < Sidebar />
      <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
        <div>
          <h3 className="mb-1">Ink Hive Quote Generator</h3>
          <div className="text-muted">
            Load brands instantly, filter locally, then browse products.
          </div>
        </div>

        <Link to="/" className="btn btn-outline-secondary">
          Brands
        </Link>
      </div>

      <hr className="my-4" />

      <Outlet />
    </div>
  );
}