import React, { useState, useRef } from "react";
import { uploadStory } from "../lib/uploadStory";
import { toast } from "react-toastify";

import {
  Plus,
  Loader2,
  ImagePlus,
} from "lucide-react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

const StoryUploader = ({ currentUser }) => {
  const [uploading, setUploading] =
    useState(false);

  const [preview, setPreview] =
    useState(null);

  const fileInputRef = useRef();

  // Upload Story
  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (!file || !currentUser) return;

    // Preview
    const previewUrl =
      URL.createObjectURL(file);

    setPreview(previewUrl);

    try {
      setUploading(true);

      await uploadStory(file, currentUser);

      toast.success("Story updated ✨");

      // Remove preview after upload
      setTimeout(() => {
        setPreview(null);
      }, 1200);

    } catch (err) {
      console.error("Upload failed:", err);

      toast.error("Failed to update story");

    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="
        flex
        flex-col
        items-center
        min-w-fit
      "
    >
      {/* Story Circle */}
      <motion.div
        whileHover={{
          y: -3,
          scale: 1.03,
        }}
        whileTap={{
          scale: 0.94,
        }}
        onClick={() =>
          fileInputRef.current.click()
        }
        className="
          relative
          cursor-pointer
        "
      >
        {/* Glow */}
        <div
          className="
            absolute
            inset-0
            rounded-full
            bg-pink-500/20
            blur-lg
            scale-110
          "
        />

        {/* Animated Ring */}
        <div
          className="
            p-[2.5px]
            rounded-full
            bg-gradient-to-tr
            from-pink-500
            via-violet-500
            to-cyan-400
            shadow-lg
            shadow-pink-500/20
            story-ring-pulse
          "
        >
          {/* Inner */}
          <div
            className="
              bg-[#0f172a]
              rounded-full
              p-[3px]
            "
          >
            {/* Preview or Placeholder */}
            {preview ? (
              <img
                src={preview}
                alt="Your Story"
                className="
                  w-16
                  h-16
                  rounded-full
                  object-cover
                "
              />
            ) : (
              <div
                className="
                  w-16
                  h-16
                  rounded-full
                  bg-gradient-to-br
                  from-white/[0.08]
                  to-white/[0.03]
                  flex
                  items-center
                  justify-center
                "
              >
                <ImagePlus
                  size={24}
                  className="text-pink-400"
                />
              </div>
            )}
          </div>
        </div>

        {/* Upload Overlay */}
        <AnimatePresence>
          {uploading && (
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className="
                absolute
                inset-0
                z-10
                rounded-full
                bg-black/50
                backdrop-blur-sm
                flex
                items-center
                justify-center
              "
            >
              <Loader2
                size={22}
                className="
                  text-white
                  animate-spin
                "
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Plus Button */}
        <motion.div
          whileHover={{ rotate: 90 }}
          className="
            absolute
            bottom-0
            right-0
            z-20
            w-6
            h-6
            rounded-full
            bg-gradient-to-r
            from-pink-500
            to-violet-500
            border
            border-[#0f172a]
            flex
            items-center
            justify-center
            text-white
            shadow-lg
            shadow-pink-500/30
          "
        >
          {uploading ? (
            <Loader2
              size={13}
              className="animate-spin"
            />
          ) : (
            <Plus size={14} />
          )}
        </motion.div>
      </motion.div>

      {/* Label */}
      <span
        className="
          text-xs
          mt-2
          text-gray-300
          font-medium
          transition
          hover:text-pink-400
        "
      >
        Your Story
      </span>

      {/* Hidden Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default StoryUploader;