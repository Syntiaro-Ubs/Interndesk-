import React, { useRef, useState, useCallback, useEffect } from "react";
import { X, ZoomIn, ZoomOut, Check } from "lucide-react";
function ImageCropModal({ imageSrc, onSave, onCancel, shape = "circle" }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });
  const SIZE = 280;
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.save();
    if (shape === "circle") {
      ctx.beginPath();
      ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2);
      ctx.clip();
    }
    const scale = zoom;
    const iw = img.naturalWidth * scale;
    const ih = img.naturalHeight * scale;
    const x = SIZE / 2 - iw / 2 + offset.x;
    const y = SIZE / 2 - ih / 2 + offset.y;
    ctx.drawImage(img, x, y, iw, ih);
    ctx.restore();
    if (shape === "circle") {
      ctx.beginPath();
      ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 1, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0,0,0,0.1)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [zoom, offset, shape]);
  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      imgRef.current = img;
      const scaleW = SIZE / img.naturalWidth;
      const scaleH = SIZE / img.naturalHeight;
      setZoom(Math.max(scaleW, scaleH));
      setOffset({ x: 0, y: 0 });
    };
  }, [imageSrc]);
  useEffect(() => {
    draw();
  }, [draw]);
  const onMouseDown = (e) => {
    setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onMouseMove = (e) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.mx;
    const dy = e.clientY - dragStart.current.my;
    setOffset({ x: dragStart.current.ox + dx, y: dragStart.current.oy + dy });
  };
  const onMouseUp = () => setDragging(false);
  const onTouchStart = (e) => {
    const t = e.touches[0];
    setDragging(true);
    dragStart.current = { mx: t.clientX, my: t.clientY, ox: offset.x, oy: offset.y };
  };
  const onTouchMove = (e) => {
    if (!dragging) return;
    const t = e.touches[0];
    const dx = t.clientX - dragStart.current.mx;
    const dy = t.clientY - dragStart.current.my;
    setOffset({ x: dragStart.current.ox + dx, y: dragStart.current.oy + dy });
  };
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSave(canvas.toDataURL("image/png"));
  };
  return /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-card border border-border rounded-2xl shadow-xl w-full max-w-sm p-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-5" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-base font-medium text-foreground" }, "Adjust Photo"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground mt-0.5" }, "Drag to reposition \xB7 scroll or slide to zoom")), /* @__PURE__ */ React.createElement("button", { onClick: onCancel, className: "p-1.5 rounded-lg hover:bg-border/60 text-muted-foreground transition-colors" }, /* @__PURE__ */ React.createElement(X, { className: "w-4 h-4" }))), /* @__PURE__ */ React.createElement("div", { className: "flex justify-center mb-5" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      ref: containerRef,
      className: "relative select-none",
      style: { width: SIZE, height: SIZE, cursor: dragging ? "grabbing" : "grab" },
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onMouseLeave: onMouseUp,
      onTouchStart,
      onTouchMove,
      onTouchEnd: onMouseUp
    },
    /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "absolute inset-0",
        style: {
          backgroundImage: "repeating-conic-gradient(#e5e7eb 0% 25%, white 0% 50%)",
          backgroundSize: "16px 16px",
          borderRadius: shape === "circle" ? "50%" : "12px"
        }
      }
    ),
    /* @__PURE__ */ React.createElement(
      "canvas",
      {
        ref: canvasRef,
        width: SIZE,
        height: SIZE,
        className: "relative z-10",
        style: { borderRadius: shape === "circle" ? "50%" : "12px" }
      }
    )
  )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 mb-6" }, /* @__PURE__ */ React.createElement("button", { onClick: () => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2))), className: "p-1.5 rounded-lg border border-border hover:border-primary text-muted-foreground hover:text-primary transition-colors flex-shrink-0" }, /* @__PURE__ */ React.createElement(ZoomOut, { className: "w-4 h-4" })), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "range",
      min: 0.5,
      max: 3,
      step: 0.01,
      value: zoom,
      onChange: (e) => setZoom(Number(e.target.value)),
      className: "flex-1 accent-primary h-1.5 rounded-full cursor-pointer"
    }
  ), /* @__PURE__ */ React.createElement("button", { onClick: () => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2))), className: "p-1.5 rounded-lg border border-border hover:border-primary text-muted-foreground hover:text-primary transition-colors flex-shrink-0" }, /* @__PURE__ */ React.createElement(ZoomIn, { className: "w-4 h-4" }))), /* @__PURE__ */ React.createElement("div", { className: "flex gap-3" }, /* @__PURE__ */ React.createElement("button", { onClick: onCancel, className: "flex-1 px-4 py-2.5 border border-border text-foreground rounded-xl text-sm font-medium hover:border-primary hover:text-primary transition-colors" }, "Cancel"), /* @__PURE__ */ React.createElement("button", { onClick: handleSave, className: "flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2" }, /* @__PURE__ */ React.createElement(Check, { className: "w-4 h-4" }), " Apply"))));
}
export {
  ImageCropModal
};
