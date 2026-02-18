import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuoteStore } from "../store/quoteStore.js";
import { Card, Nav, Button, Collapse } from "react-bootstrap";
import {
  BsHouse,
  BsFileText,
  BsChevronDown,
  BsChevronRight,
  BsList,
  BsX
} from "react-icons/bs";

export default function Sidebar() {
  const navigate = useNavigate();
  const quotes = useQuoteStore((s) => s.quotes);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [collapsed, setCollapsed] = useState(isMobile);
  const [quotesOpen, setQuotesOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setCollapsed(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const latestQuotes = [...quotes]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);
  const extraQuotesCount = quotes.length - latestQuotes.length;

  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.3)",
    backdropFilter: "blur(3px)",
    zIndex: 998,
    display: collapsed ? "none" : "block",
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && !collapsed && (
        <div style={overlayStyle} onClick={() => setCollapsed(true)}></div>
      )}

      <div
        style={{
          position: isMobile ? "fixed" : "fixed",
          top: 0,
          left: 0,
          width: collapsed ? 60 : 250,
          transition: "width 0.3s, transform 0.3s",
          height: "100vh",
          borderRight: "1px solid #ddd",
          backgroundColor: "#fff",
          zIndex: 999,
          transform: isMobile
            ? collapsed
              ? "translateX(0%)"
              : "translateX(0)"
            : "translateX(0)",
        }}
      >
        <Card style={{ height: "100%", border: "none", boxShadow: "none" }}>
          <Card.Body className="d-flex flex-column p-2">
            {/* Collapse Toggle */}
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={() => setCollapsed(!collapsed)}
              className="mb-3"
            >
              {collapsed ? <BsList size={20} /> : <BsX size={20} />}
            </Button>

            {/* Navigation */}
            <Nav className="flex-column">
              {/* Catalog */}
              <Nav.Link
                onClick={() => navigate("/")}
                className="mb-2 d-flex align-items-center"
              >
                <BsHouse size={18} />
                {!collapsed && <span className="ms-2">Catalog</span>}
              </Nav.Link>

              {/* Quotes Accordion */}
            <div>
                <div
                onClick={() => {
                    if (collapsed) {
                    // If sidebar is collapsed, go straight to /quotes
                    navigate("/quotes");
                    } else {
                    // Otherwise, toggle the submenu
                    setQuotesOpen(!quotesOpen);
                    }
                }}
                style={{
                    cursor: "pointer",
                    fontWeight: "bold",
                    display: "flex",
                    justifyContent: collapsed ? "center" : "space-between",
                    alignItems: "center",
                    marginBottom: 4,
                }}
                >
                <div className="d-flex align-items-center">
                    <BsFileText size={18} />
                    {!collapsed && <span className="ms-2">Quotes</span>}
                </div>
                {!collapsed && (
                    <span style={{ fontSize: 12 }}>
                    {quotesOpen ? <BsChevronDown /> : <BsChevronRight />}
                    </span>
                )}
            </div>


                {/* Submenu */}
                <Collapse in={quotesOpen}>
                  <div>
                    {!collapsed &&
                      latestQuotes.map((q) => (
                        <Nav.Link
                          key={q.id}
                          className="ms-3"
                          onClick={() => navigate(`/quote/${q.id}`)}
                        >
                          {q.name}
                        </Nav.Link>
                      ))}

                    {!collapsed && extraQuotesCount > 0 && (
                      <Nav.Link
                        className="ms-3"
                        onClick={() => navigate("/quotes")}
                      >
                        See all quotes ({quotes.length})
                      </Nav.Link>
                    )}
                  </div>
                </Collapse>
              </div>
            </Nav>
          </Card.Body>
        </Card>
      </div>
    </>
  );
}
