import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import StoryPreviewBar from "./StoryPreviewBar";
import StoryViewer from "./StoryViewer";
import StoryUploader from "./StoryUploader";

const Stories = ({ currentUser }) => {
  const [activeGroup, setActiveGroup] = useState(null);

  return (
    <>
      {/* Stories Container */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          relative
          w-full
          overflow-hidden
        "
      >
        {/* Glow Background */}
        <div
          className="
            absolute
            inset-0
            bg-gradient-to-r
            from-pink-500/5
            via-violet-500/5
            to-cyan-500/5
            blur-3xl
            pointer-events-none
          "
        />

        {/* Stories Row */}
        <div
          className="
            relative
            flex
            items-center
            gap-4
            px-4
            py-4
            overflow-x-auto
            scrollbar-hide
          "
        >
          {/* Add Story */}
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            <StoryUploader currentUser={currentUser} />
          </motion.div>

          {/* Story Previews */}
          <StoryPreviewBar
            onStoryClick={(group) => {
              setActiveGroup(group.items);
            }}
          />
        </div>

        {/* Bottom Fade */}
        <div
          className="
            absolute
            bottom-0
            left-0
            right-0
            h-[1px]
            bg-gradient-to-r
            from-transparent
            via-white/10
            to-transparent
          "
        />
      </motion.div>

      {/* Story Viewer Modal */}
      <AnimatePresence>
        {activeGroup && (
          <StoryViewer
            activeStoryGroup={activeGroup}
            onClose={() => setActiveGroup(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Stories;