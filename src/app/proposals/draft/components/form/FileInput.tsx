"use client";
import { useState } from "react";

const FileInput = () => {
  const [fileName, setFileName] = useState("");

  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    console.log(file);
    if (file) {
      setFileName(file.name);
    }
  };

  return (
    <div className="flex items-center justify-center w-full">
      <label
        htmlFor="dropzone-file"
        className="flex flex-col items-center justify-center w-full h-64 border-2 border-agora-stone-100 border-dashed rounded-lg cursor-pointer bg-white hover:bg-agora-stone-50"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <svg
            className="w-8 h-8 mb-4 text-agora-stone-500"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 16"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
            />
          </svg>
          <p className="mb-2 text-sm text-agora-stone-500">
            <span className="font-semibold">Click to upload</span> or drag and
            drop
          </p>
          {fileName && (
            <p className="text-sm text-agora-stone-500">
              <span className="font-semibold">File selected:</span> {fileName}
            </p>
          )}
        </div>
        <input
          id="dropzone-file"
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
};

export default FileInput;
