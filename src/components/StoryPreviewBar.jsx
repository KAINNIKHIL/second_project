import { useEffect, useState } from "react";
import { fetchActiveStories } from "../lib/fetchStories";

import client, {
  account,
  databases,
} from "../appwrite/config";

import { Query } from "appwrite";

import { motion } from "framer-motion";

const StoryPreviewBar = ({ onStoryClick }) => {
  const [groupedStories, setGroupedStories] =
    useState({});

  useEffect(() => {
    const loadStories = async () => {
      try {
        // Current User
        const currentUser = await account.get();

        const currentUserId = currentUser.$id;

        // Fetch Following
        const followRes =
          await databases.listDocuments(
            import.meta.env
              .VITE_APPWRITE_DATABASE_ID,

            import.meta.env
              .VITE_APPWRITE_FOLLOW_COLLECTION_ID,

            [Query.equal("followerId", currentUserId)]
          );

        const followingIds =
          followRes.documents.map(
            (doc) => doc.followingId
          );

        // Include self
        followingIds.push(currentUserId);

        // Fetch Stories
        const res = await fetchActiveStories();

        const allStories = Array.isArray(res)
          ? res
          : res.documents;

        // Group Stories
        const grouped = {};

        allStories.forEach((story) => {
          if (followingIds.includes(story.userId)) {
            if (!grouped[story.userId]) {
              grouped[story.userId] = {
                userId: story.userId,
                username: story.username,
                profilePicUrl:
                  story.profilePicUrl,
                items: [],
              };
            }

            grouped[story.userId].items.push(
              story
            );
          }
        });

        // Put current user first
        const sorted = {};

        if (grouped[currentUserId]) {
          sorted[currentUserId] =
            grouped[currentUserId];
        }

        for (const userId in grouped) {
          if (userId !== currentUserId) {
            sorted[userId] = grouped[userId];
          }
        }

        setGroupedStories(sorted);

      } catch (error) {
        console.error(
          "Failed to load stories:",
          error
        );
      }
    };

    loadStories();

    // Realtime Updates
    const unsubscribe = client.subscribe(
      `databases.${import.meta.env.VITE_APPWRITE_DATABASE_ID}.collections.${import.meta.env.VITE_APPWRITE_STORIES_COLLECTION_ID}.documents`,
      () => {
        loadStories();
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div
      className="
        flex
        items-center
        gap-5
        overflow-x-auto
        px-1
        py-2
        scrollbar-hide
      "
    >
      {/* Empty State */}
      {Object.keys(groupedStories).length ===
      0 ? (
        <div
          className="
            text-sm
            text-gray-400
            px-3
          "
        >
          No stories yet ✨
        </div>
      ) : (
        Object.values(groupedStories).map(
          (userStory, index) => (
            <motion.div
              key={userStory.userId}
              initial={{
                opacity: 0,
                y: 12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: index * 0.05,
              }}
              whileHover={{
                y: -3,
              }}
              whileTap={{
                scale: 0.95,
              }}
              className="
                flex
                flex-col
                items-center
                cursor-pointer
                min-w-fit
              "
              onClick={() => {
                onStoryClick({
                  ...userStory,
                  currentIndex: 0,
                });
              }}
            >
              {/* Story Ring */}
              <div className="relative">

                

                {/* Gradient Border */}
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
                        userStory.profilePicUrl ||
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

                {/* Live Pulse */}
                <span
                  className="
                    absolute
                    inset-0
                    rounded-full
                    animate-pulse
                    bg-pink-500/10
                    blur-lg
                    -z-10
                  "
                />
              </div>

              {/* Username */}
              <span
                className="
                  text-xs
                  mt-2
                  text-gray-300
                  font-medium
                  truncate
                  max-w-[72px]
                  text-center
                "
              >
                {userStory.username}
              </span>
            </motion.div>
          )
        )
      )}
    </div>
  );
};

export default StoryPreviewBar;