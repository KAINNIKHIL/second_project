import React, { useState } from "react";
import { uploadStory } from "../lib/uploadStory";
import { useUser } from "../hooks/useUser";
import { motion } from "framer-motion";
import { ImagePlus, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

const AddStory = () => {
  const { user, loading } = useUser();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  // File Change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    setFile(selectedFile);

    // Preview
    const fileUrl = URL.createObjectURL(selectedFile);
    setPreview(fileUrl);
  };

  // Upload
  const handleUpload = async () => {
    if (!file || !user) return;

    setUploading(true);

    try {
      await uploadStory(file, user);

      toast.success("Story uploaded ✨");

      setFile(null);
      setPreview(null);
    } catch (error) {
      console.error(error);

      toast.error("Failed to upload story");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-gray-400 text-sm">
        Loading user...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        w-full
        max-w-sm
        rounded-3xl
        border
        border-white/10
        bg-gradient-to-br
        from-white/[0.07]
        to-white/[0.03]
        backdrop-blur-2xl
        p-5
        shadow-xl
      "
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="
            w-12
            h-12
            rounded-full
            bg-gradient-to-r
            from-pink-500
            to-violet-500
            flex
            items-center
            justify-center
            text-white
          "
        >
          <ImagePlus size={22} />
        </div>

        <div>
          <h2 className="text-white font-semibold text-lg">
            Add Story
          </h2>

          <p className="text-gray-400 text-sm">
            Share your current vibe ✨
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <label
        className="
          flex
          flex-col
          items-center
          justify-center
          border-2
          border-dashed
          border-white/10
          rounded-3xl
          p-6
          cursor-pointer
          hover:border-pink-500/40
          hover:bg-pink-500/5
          transition-all
          duration-300
          overflow-hidden
        "
      >
        {preview ? (
          file?.type.startsWith("video") ? (
            <video
              src={preview}
              controls
              className="
                w-full
                max-h-[300px]
                rounded-2xl
                object-cover
              "
            />
          ) : (
            <img
              src={preview}
              alt="preview"
              className="
                w-full
                max-h-[300px]
                rounded-2xl
                object-cover
              "
            />
          )
        ) : (
          <>
            <div
              className="
                w-16
                h-16
                rounded-full
                bg-white/5
                flex
                items-center
                justify-center
                mb-4
              "
            >
              <ImagePlus
                size={28}
                className="text-pink-400"
              />
            </div>

            <p className="text-white text-sm font-medium">
              Upload image or video
            </p>

            <p className="text-gray-500 text-xs mt-1">
              Click to browse files
            </p>
          </>
        )}

        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {/* Upload Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        onClick={handleUpload}
        disabled={!file || uploading}
        className="
          mt-5
          w-full
          py-3
          rounded-2xl
          bg-gradient-to-r
          from-pink-500
          to-violet-500
          text-white
          font-semibold
          shadow-lg
          shadow-pink-500/20
          disabled:opacity-50
          disabled:cursor-not-allowed
          flex
          items-center
          justify-center
          gap-2
        "
      >
        {uploading ? (
          <>
            <Loader2
              size={18}
              className="animate-spin"
            />
            Uploading...
          </>
        ) : (
          "Upload Story"
        )}
      </motion.button>
    </motion.div>
  );
};

export default AddStory;