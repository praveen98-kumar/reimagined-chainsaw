"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  ImCross,
  ImArrowLeft,
  ImArrowRight,
  ImDownload,
  ImZoomIn,
  ImZoomOut,
} from "react-icons/im";
import { MdRotate90DegreesCw } from "react-icons/md";
import { cn } from "@/shared/functions/utils";

interface ImageAttachment {
  id: string;
  type: "image" | "document";
  url: string;
  name: string;
  size?: number;
}

interface ImagePreviewModalProps {
  images: ImageAttachment[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImagePreviewModal({
  images,
  initialIndex,
  isOpen,
  onClose,
}: ImagePreviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoom(1);
    setRotation(0);
  }, [initialIndex]);

  const currentImage = images[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setZoom(1);
    setRotation(0);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setZoom(1);
    setRotation(0);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // const handleDownload = () => {
  //   const link = document.createElement("a");
  //   link.href = currentImage.url;
  //   link.download = currentImage.name;
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
        case "Escape":
          onClose();
          break;
        case "+":
        case "=":
          handleZoomIn();
          break;
        case "-":
          handleZoomOut();
          break;
        case "r":
        case "R":
          handleRotate();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!currentImage) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        aria-describedby={"Image Preview"}
        className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95"
      >
        {/* Header */}
        <DialogTitle className="sr-only">Image Preview</DialogTitle>
        <div className="absolute top-0 left-0 right-0 z-10 bg-black/80 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div>
                {currentIndex + 1} of {images.length}
              </div>
              <div>
                <p className="font-medium">{currentImage.name}</p>
                {/*  <p className="text-sm text-gray-300">
                  {formatFileSize(currentImage.size)}
                </p> */}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleZoomOut} disabled={zoom <= 0.5}>
                <ImZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm min-w-[60px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button onClick={handleZoomIn} disabled={zoom >= 3}>
                <ImZoomIn className="w-4 h-4" />
              </button>
              <button onClick={handleRotate}>
                <MdRotate90DegreesCw className="w-4 h-4" />
              </button>
              {/* <button onClick={handleDownload}>
                <ImDownload className="w-4 h-4" />
              </button> */}
              <button onClick={onClose}>
                <ImCross className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Image Container */}
        <div className="flex items-center justify-center h-full pt-16 pb-16 overflow-hidden">
          <img
            src={currentImage.url || "/placeholder.svg"}
            alt={currentImage.name}
            className="max-w-full max-h-full object-contain transition-transform duration-200"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
            }}
          />
        </div>

        {/* Navigation */}
        {images.length > 1 && (
          <>
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
              onClick={goToPrevious}
            >
              <ImArrowLeft className="w-6 h-6" />
            </button>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
              onClick={goToNext}
            >
              <ImArrowRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Bottom Thumbnails */}
        {images.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-4">
            <div
              className={cn(
                "flex gap-2 overflow-x-auto px-1",
                images.length >= 7 ? "justify-center" : "justify-start"
              )}
            >
              {images.map((image, index) => (
                <button
                  key={image.id}
                  className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-all ${
                    index === currentIndex
                      ? "border-white shadow-lg"
                      : "border-gray-600 hover:border-gray-400"
                  }`}
                  onClick={() => {
                    setCurrentIndex(index);
                    setZoom(1);
                    setRotation(0);
                  }}
                >
                  <img
                    src={image.url || "/placeholder.svg"}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
