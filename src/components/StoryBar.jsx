import React from "react";
import { motion } from "framer-motion";

const StoryBar = ({ stories, onStoryClick }) => {
  return (
    <div
      className="
        flex
        items-center
        gap-4
        overflow-x-auto
        px-2
        py-2
        scrollbar-hide
      "
    >
      {stories.map((story, index) => (
        <motion.div
          key={story.$id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04 }}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.95 }}
          className="flex flex-col items-center"
        >
          {/* Story Ring */}
          <div
            onClick={() => onStoryClick(story)}
            className="
              relative
              cursor-pointer
            "
          >
            {/* Animated Gradient Ring */}
            <div
              className="
                p-[2px]
                rounded-full
                bg-gradient-to-tr
                from-pink-500
                via-violet-500
                to-cyan-400
                shadow-lg
                shadow-pink-500/20
              "
            >
              {/* Inner Circle */}
              <div
                className="
                  bg-[#0f172a]
                  rounded-full
                  p-[3px]
                "
              >
                <img
                  src={
                    story.profilePicUrl ||
                    "/default-avatar.png"
                  }
                  alt="story"
                  className="
                    w-16
                    h-16
                    rounded-full
                    object-cover
                  "
                />
              </div>
            </div>

            {/* Active Pulse */}
            <span
              className="
                absolute
                inset-0
                rounded-full
                animate-pulse
                bg-pink-500/10
                blur-md
                -z-10
              "
            />
          </div>

          {/* Username */}
          <span
            className="
              text-xs
              text-gray-300
              text-center
              mt-2
              truncate
              max-w-[70px]
              font-medium
            "
          >
            {story.username}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

export default StoryBar;