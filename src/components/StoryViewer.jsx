import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import "./storyProgress.css";

import {
  X,
  Volume2,
  VolumeX,
} from "lucide-react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

const StoryViewer = ({
  activeStoryGroup = [],
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [muted, setMuted] =
    useState(false);

  const currentStory =
    activeStoryGroup[currentIndex];

  // Auto Next
  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        currentIndex <
        activeStoryGroup.length - 1
      ) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        onClose();
      }
    }, 5000);

    return () => clearTimeout(timer);

  }, [currentIndex]);

  // Prev
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Next
  const handleNext = () => {
    if (
      currentIndex <
      activeStoryGroup.length - 1
    ) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  if (!currentStory) return null;

  const isVideo =
    currentStory.mediaUrl
      ?.toLowerCase()
      .match(/\.(mp4|webm|ogg)$/);

  return createPortal(
    <AnimatePresence>
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
          fixed
          inset-0
          z-50
          bg-black/95
          backdrop-blur-md
          flex
          items-center
          justify-center
        "
      >
        {/* Story Container */}
        <motion.div
          initial={{
            scale: 0.95,
            opacity: 0,
          }}
          animate={{
            scale: 1,
            opacity: 1,
          }}
          exit={{
            scale: 0.96,
            opacity: 0,
          }}
          transition={{
            duration: 0.25,
          }}
          className="
            relative
            w-full
            max-w-md
            h-full
            bg-black
            overflow-hidden
            rounded-none
            md:rounded-3xl
            border
            border-white/10
            shadow-2xl
          "
        >
          {/* Background Glow */}
          <div
            className="
              absolute
              inset-0
              bg-gradient-to-b
              from-pink-500/10
              via-transparent
              to-violet-500/10
              pointer-events-none
            "
          />

          {/* Progress Bars */}
          <div
            className="
              absolute
              top-0
              left-0
              right-0
              z-20
              p-3
              flex
              gap-1
            "
          >
            {activeStoryGroup.map(
              (_, index) => (
                <div
                  key={index}
                  className="
                    flex-1
                    h-1
                    bg-white/20
                    rounded-full
                    overflow-hidden
                    backdrop-blur-sm
                  "
                >
                  <div
                    className={`
                      h-full
                      rounded-full
                      bg-gradient-to-r
                      from-pink-500
                      via-violet-500
                      to-cyan-400

                      ${
                        index <
                        currentIndex
                          ? "w-full"
                          : ""
                      }

                      ${
                        index ===
                        currentIndex
                          ? "animate-progress"
                          : ""
                      }
                    `}
                  />
                </div>
              )
            )}
          </div>

          {/* Top Info */}
          <div
            className="
              absolute
              top-5
              left-4
              right-4
              z-20
              flex
              items-center
              justify-between
            "
          >
            {/* User */}
            <div className="flex items-center gap-3">
              <img
                src={
                  currentStory.profilePicUrl ||
                  "/default-avatar.png"
                }
                alt="user"
                className="
                  w-10
                  h-10
                  rounded-full
                  object-cover
                  border-2
                  border-pink-500/60
                "
              />

              <div>
                <p
                  className="
                    text-white
                    font-semibold
                    text-sm
                  "
                >
                  {currentStory.username}
                </p>

                <p
                  className="
                    text-xs
                    text-gray-300
                  "
                >
                  Story
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">

              {/* Mute */}
              {isVideo && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMuted(!muted);
                  }}
                  className="
                    w-10
                    h-10
                    rounded-full
                    bg-black/40
                    backdrop-blur-md
                    flex
                    items-center
                    justify-center
                    text-white
                  "
                >
                  {muted ? (
                    <VolumeX size={18} />
                  ) : (
                    <Volume2 size={18} />
                  )}
                </button>
              )}

              {/* Close */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="
                  w-10
                  h-10
                  rounded-full
                  bg-black/40
                  backdrop-blur-md
                  flex
                  items-center
                  justify-center
                  text-white
                "
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Story Media */}
          <div
            className="
              w-full
              h-full
              flex
              items-center
              justify-center
            "
          >
            {isVideo ? (
              <video
                src={currentStory.mediaUrl}
                autoPlay
                muted={muted}
                playsInline
                className="
                  w-full
                  h-full
                  object-contain
                "
              />
            ) : (
              <motion.img
                key={currentStory.mediaUrl}
                initial={{
                  opacity: 0,
                  scale: 1.02,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  duration: 0.3,
                }}
                src={currentStory.mediaUrl}
                alt="story"
                className="
                  max-h-full
                  max-w-full
                  object-contain
                "
              />
            )}
          </div>

          {/* Navigation Areas */}
          <div
            className="
              absolute
              inset-0
              flex
              z-10
            "
          >
            {/* Left */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="
                w-1/2
                h-full
                cursor-pointer
              "
            />

            {/* Right */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="
                w-1/2
                h-full
                cursor-pointer
              "
            />
          </div>
        </motion.div>
      </motion.div>
        </AnimatePresence>,
    document.body
  );
};

export default StoryViewer;