import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { databases } from "../appwrite/config";
import { Query } from "appwrite";

const FollowerList = () => {
  const { userId } = useParams();
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        //  Get all documents where this user is being followed
        const followRes = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_FOLLOW_COLLECTION_ID,
          [Query.equal("followingId", userId)]
        );

        const followerIds = followRes.documents.map(doc => doc.followerId);

        //  Fetch user profiles of all followers
        if (followerIds.length > 0) {
        const profileRes = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_USERPROFILES_COLLECTION_ID,
          [Query.contains("userId", followerIds)]
        );

        setFollowers(profileRes.documents);
      } else{
        setFollowers([]); // No followers found
      }
    }
        catch (err) {
        console.error("Failed to fetch followers", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, [userId]);

  if (loading) return <div className="flex items-center justify-center h-full py-4">
  <div className="w-10 h-10 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
</div>;

  if (followers.length === 0) return <p className="text-center">No followers yet.</p>;

return (
  <div
    className="
      min-h-screen
      bg-[#0b1120]
      text-white
      relative
      overflow-hidden
      px-4
      py-8
    "
  >
    {/* Glow Background */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="
          absolute
          top-[-120px]
          left-[-80px]
          w-[300px]
          h-[300px]
          bg-pink-500/20
          blur-3xl
          rounded-full
        "
      />

      <div
        className="
          absolute
          bottom-[-120px]
          right-[-80px]
          w-[320px]
          h-[320px]
          bg-violet-500/20
          blur-3xl
          rounded-full
        "
      />
    </div>

    <div
      className="
        relative
        z-10
        max-w-3xl
        mx-auto
      "
    >
      {/* Header */}
      <div
        className="
          flex
          items-center
          justify-between
          mb-8
        "
      >
        <div>
          <h1 className="text-3xl font-bold">
            Followers ✨
          </h1>

          <p className="text-sm text-gray-400 mt-1">
            Souls following this user
          </p>
        </div>

        <div
          className="
            px-4
            py-2
            rounded-2xl
            bg-white/[0.05]
            border
            border-white/10
            text-sm
            text-gray-300
          "
        >
          {followers.length} Followers
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div
            className="
              w-12
              h-12
              border-4
              border-pink-500
              border-t-transparent
              rounded-full
              animate-spin
            "
          />
        </div>
      ) : followers.length === 0 ? (

        /* Empty State */
        <div
          className="
            rounded-3xl
            border
            border-white/10
            bg-white/[0.04]
            backdrop-blur-xl
            p-12
            text-center
          "
        >
          <div className="text-5xl mb-4">
            🫧
          </div>

          <h2 className="text-xl font-semibold">
            No Followers Yet
          </h2>

          <p className="text-gray-400 mt-2 text-sm">
            This soul hasn’t gained followers yet.
          </p>
        </div>

      ) : (

        /* Followers List */
        <div className="space-y-4">
          {followers.map((follower) => (
            <div
              key={follower.$id}
              className="
                group
                flex
                items-center
                justify-between
                rounded-3xl
                border
                border-white/10
                bg-white/[0.05]
                backdrop-blur-xl
                p-4
                hover:border-pink-500/30
                hover:bg-white/[0.07]
                transition-all
                duration-300
              "
            >
              {/* Left */}
              <Link
                to={`/profile/${follower.userId}`}
                className="flex items-center gap-4"
              >
                {/* Avatar */}
                <div className="relative">
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

                  <img
                    src={
                      follower.profilePicUrl ||
                      "/default-avatar.png"
                    }
                    alt="Follower"
                    className="
                      relative
                      w-16
                      h-16
                      rounded-full
                      object-cover
                      border-2
                      border-pink-500/40
                    "
                  />
                </div>

                {/* Info */}
                <div>
                  <h2
                    className="
                      font-semibold
                      text-lg
                      group-hover:text-pink-300
                      transition
                    "
                  >
                    {follower.username ||
                      "VibeSoul User"}
                  </h2>

                  {follower.mbtiType && (
                    <div
                      className="
                        inline-flex
                        mt-2
                        px-3
                        py-1
                        rounded-full
                        bg-pink-500/10
                        border
                        border-pink-500/20
                        text-pink-300
                        text-xs
                        font-medium
                      "
                    >
                      ✨ {follower.mbtiType.toUpperCase()}
                    </div>
                  )}
                </div>
              </Link>

              {/* View Button */}
              <Link
                to={`/profile/${follower.userId}`}
                className="
                  px-4
                  py-2
                  rounded-2xl
                  bg-gradient-to-r
                  from-pink-500
                  to-violet-500
                  text-sm
                  font-medium
                  shadow-lg
                  shadow-pink-500/20
                  hover:opacity-90
                  transition
                "
              >
                View
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);
};

export default FollowerList;
