import { useMemo, useState } from "react";
import { Button, ButtonGroup } from "react-bootstrap";

export default function ImageViewer({ images }) {
  const list = Array.isArray(images) ? images : [];

  const views = useMemo(() => {
    const unique = new Map();
    for (const img of list) {
      const view = img.view || "front";
      if (!unique.has(view)) unique.set(view, img);
    }
    return Array.from(unique.entries()).map(([view, img]) => ({ view, img }));
  }, [list]);

  const [activeView, setActiveView] = useState(views[0]?.view || "front");

  const active = views.find((v) => v.view === activeView) || views[0];

  return (
    <div>
      <div
        style={{
          width: "100%",
          height: 420,
          borderRadius: 8,
          background: "#f6f7f8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden"
        }}
      >
        {active?.img?.url ? (
          <img
            src={active.img.url}
            alt={active.view}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        ) : (
          <div className="text-muted">No image</div>
        )}
      </div>

      {views.length > 1 ? (
        <div className="pt-3 d-flex justify-content-center">
          <ButtonGroup>
            {views.map((v) => (
              <Button
                key={v.view}
                size="sm"
                variant={v.view === activeView ? "primary" : "outline-primary"}
                onClick={() => setActiveView(v.view)}
              >
                {v.view}
              </Button>
            ))}
          </ButtonGroup>
        </div>
      ) : null}
    </div>
  );
}