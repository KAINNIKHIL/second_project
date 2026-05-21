import { Link } from "react-router-dom";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

const VibeCard = ({
  vibe,
  userProfile,
  currentUserId,
  commentInput,
  commentsMap,
  showComments,
  handleLike,
  handleCommentSubmit,
  handleCommentChange,
  setShowComments,
  commentUserProfilesMap,
  commentCount,
}) => {
  const comments = commentsMap[vibe.$id] || [];

  const [showHeart, setShowHeart] = useState(false);

  // Double tap like
  const handleDoubleClick = () => {
    handleLike(vibe);

    setShowHeart(true);

    setTimeout(() => {
      setShowHeart(false);
    }, 700);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -3 }}
      className="
        bg-gradient-to-br
        from-white/[0.07]
        to-white/[0.03]
        backdrop-blur-2xl
        p-5
        rounded-3xl
        shadow-xl
        border
        border-white/10
        transition-all
        duration-300
        hover:border-pink-500/30
        hover:shadow-2xl
        hover:shadow-pink-500/10
      "
    >
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <Link
          to={
            vibe.userId === currentUserId
              ? "/profile"
              : `/profile/${vibe.userId}`
          }
          className="flex items-center gap-3"
        >
          {/* Avatar */}
          <img
            src={userProfile?.profilePicUrl || "/default-avatar.png"}
            alt="user"
            className="
              w-12
              h-12
              rounded-full
              object-cover
              border-2
              border-pink-500/50
            "
          />

          {/* User Info */}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white text-[15px]">
                {userProfile?.username || "Anonymous"}
              </h3>

              {/* MBTI Badge */}
              {userProfile?.mbtiType && (
                <span
                  className="
                    text-[10px]
                    px-2
                    py-1
                    rounded-full
                    bg-pink-500/10
                    text-pink-300
                    border
                    border-pink-500/20
                    font-medium
                  "
                >
                  {userProfile.mbtiType}
                </span>
              )}
            </div>

            {/* Time */}
            <p className="text-xs text-gray-500 mt-1">
              {formatDistanceToNow(
                new Date(vibe.createdAt),
                {
                  addSuffix: true,
                }
              )}
            </p>
          </div>
        </Link>
      </div>

      {/* TEXT */}
      <div className="mt-5">
        <p
          className="
            text-gray-100
            text-[17px]
            leading-8
            tracking-[0.2px]
            whitespace-pre-wrap
          "
        >
          {vibe.vibeText}
        </p>
      </div>

      {/* IMAGE */}
      {vibe.imageUrl && (
        <div
          className="
            relative
            mt-5
            overflow-hidden
            rounded-3xl
          "
          onDoubleClick={handleDoubleClick}
        >
          <motion.img
            whileHover={{ scale: 1.01 }}
            src={vibe.imageUrl}
            alt="vibe-img"
            className="
              rounded-3xl
              max-h-[550px]
              w-full
              object-cover
              border
              border-white/10
              hover:shadow-2xl
              hover:shadow-pink-500/10
              transition-all
              duration-300
            "
          />

          {/* Floating Heart */}
          <AnimatePresence>
            {showHeart && (
              <motion.div
                initial={{
                  scale: 0,
                  opacity: 0,
                }}
                animate={{
                  scale: 1.4,
                  opacity: 1,
                }}
                exit={{
                  scale: 1.8,
                  opacity: 0,
                }}
                transition={{
                  duration: 0.6,
                }}
                className="
                  absolute
                  inset-0
                  flex
                  items-center
                  justify-center
                  text-7xl
                  pointer-events-none
                "
              >
                ❤️
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex items-center justify-between mt-5">

        {/* Comment Toggle */}
        <button
          onClick={() =>
            setShowComments((prev) => ({
              ...prev,
              [vibe.$id]: !prev[vibe.$id],
            }))
          }
          className="
            text-sm
            text-gray-400
            hover:text-pink-400
            transition
            font-medium
          "
        >
          {showComments[vibe.$id]
            ? "Hide comments"
            : `💬 ${commentCount} comment${
                commentCount !== 1 ? "s" : ""
              }`}
        </button>

        {/* Like Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => handleLike(vibe)}
          className={`
            flex
            items-center
            gap-2
            text-sm
            px-4
            py-2
            rounded-full
            font-medium
            transition-all
            duration-300

            ${
              vibe.likedBy?.includes(currentUserId)
                ? "bg-pink-500 text-white shadow-lg shadow-pink-500/20"
                : "bg-white/10 text-pink-300 hover:bg-pink-500/10"
            }
          `}
        >
          ❤️
          <span>{vibe.likes || 0}</span>
        </motion.button>
      </div>

      {/* COMMENTS */}
      <AnimatePresence>
        {showComments[vibe.$id] && (
          <motion.div
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: "auto",
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            transition={{
              duration: 0.3,
            }}
            className="
              mt-5
              bg-white/[0.04]
              rounded-3xl
              border
              border-white/5
              p-5
              space-y-5
              overflow-hidden
            "
          >
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div
                  key={comment.$id}
                  className="
                    border-l-2
                    border-pink-500/70
                    pl-4
                  "
                >
                  {/* Comment Header */}
                  <div className="flex items-center gap-2 mb-2">
                    <Link
                      to={
                        comment.userId === currentUserId
                          ? "/profile"
                          : `/profile/${comment.userId}`
                      }
                      className="flex items-center gap-2"
                    >
                      <img
                        src={
                          commentUserProfilesMap[
                            comment.userId
                          ]?.profilePicUrl ||
                          "/default-avatar.png"
                        }
                        alt="avatar"
                        className="
                          w-8
                          h-8
                          rounded-full
                          object-cover
                          border
                          border-white/10
                        "
                      />

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-200">
                          {commentUserProfilesMap[
                            comment.userId
                          ]?.username || "Anonymous"}
                        </span>

                        {commentUserProfilesMap[
                          comment.userId
                        ]?.mbtiType && (
                          <span
                            className="
                              text-[10px]
                              px-2
                              py-1
                              rounded-full
                              bg-pink-500/10
                              text-pink-300
                              border
                              border-pink-500/20
                            "
                          >
                            {
                              commentUserProfilesMap[
                                comment.userId
                              ]?.mbtiType
                            }
                          </span>
                        )}
                      </div>
                    </Link>
                  </div>

                  {/* Comment Text */}
                  <p className="text-gray-100 text-sm leading-7">
                    {comment.content}
                  </p>

                  {/* Comment Time */}
                  <p className="text-xs text-gray-500 mt-2">
                    {formatDistanceToNow(
                      new Date(comment.createdAt),
                      {
                        addSuffix: true,
                      }
                    )}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">
                No comments yet ✨
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMMENT FORM */}
      <form
        onSubmit={(e) =>
          handleCommentSubmit(e, vibe.$id)
        }
        className="mt-5 flex gap-2"
      >
        <input
          type="text"
          placeholder="Write a comment..."
          value={commentInput[vibe.$id] || ""}
          onChange={(e) =>
            handleCommentChange(e, vibe.$id)
          }
          className="
            flex-1
            rounded-2xl
            px-4
            py-3
            bg-white/5
            border
            border-white/10
            text-white
            placeholder:text-gray-500
            focus:outline-none
            focus:ring-2
            focus:ring-pink-500/30
            focus:border-pink-500
            transition-all
          "
        />

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="
            px-5
            py-3
            rounded-2xl
            bg-gradient-to-r
            from-pink-500
            to-violet-500
            text-white
            font-medium
            shadow-lg
            shadow-pink-500/20
            hover:shadow-pink-500/40
            transition-all
          "
        >
          Send
        </motion.button>
      </form>
    </motion.div>
  );
};

export default VibeCard;