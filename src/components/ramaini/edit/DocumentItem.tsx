import React, { useRef, useState } from "react";
import Image from "next/image";

type DocumentItemProps = {
  label: string;
  imageUrl: string;
  onUpdate: (file: File) => void;
  onPreview: () => void;
  isFormDisabled?: boolean;
};

const DocumentItem = ({
  label,
  imageUrl,
  onUpdate,
  onPreview,
  isFormDisabled = false,
}: DocumentItemProps) => {
  const [newImage, setNewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const newImageUrl = URL.createObjectURL(file);
      setNewImage(newImageUrl);
      onUpdate(file);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className=" rounded-md border-2 h-12 overflow-hidden items-center flex flex-row group w-full">
      <div className="relative w-12 h-12 ">
        <Image
          src={newImage || imageUrl}
          alt={label}
          fill
          className="absolute h-full w-full object-cover object-center"
        />
      </div>

      <p className="text-sm truncate pl-2">{label}</p>
      <div className="ml-auto px-2 flex gap-2">
        <button
          type="button"
          className="border-2 rounded-md px-3 py-0.5 text-sm"
          onClick={() => onPreview()}
        >
          Preview
        </button>
        <button
          type="button"
          className="border-2 rounded-md px-3 py-0.5 text-sm"
          onClick={handleBrowseClick}
          disabled={isFormDisabled}
        >
          {newImage ? "Change" : "Browse"}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept="image/*"
          disabled={isFormDisabled}
        />
      </div>
    </div>
  );
};

export default DocumentItem;
