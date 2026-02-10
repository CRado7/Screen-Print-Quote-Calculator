import { Container, Navbar, Nav } from "react-bootstrap";
import { Routes, Route, Link, Navigate } from "react-router-dom";

import CatalogPage from "./pages/CatalogPage.jsx";
import ProductPage from "./pages/ProductPage.jsx";
import QuotePage from "./pages/QuotePage.jsx";

export default function App() {
  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/catalog">
            Quote Tool
          </Navbar.Brand>
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/catalog">Catalog</Nav.Link>
            <Nav.Link as={Link} to="/quote">Quote</Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      <Container className="py-4">
        <Routes>
          <Route path="/" element={<Navigate to="/catalog" replace />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/product/:supplier/:productId" element={<ProductPage />} />
          <Route path="/quote" element={<QuotePage />} />
        </Routes>
      </Container>
    </>
  );
}
