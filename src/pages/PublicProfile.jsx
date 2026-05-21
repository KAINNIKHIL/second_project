import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { databases,account } from "../appwrite/config";
import { Query } from "appwrite";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const PublicProfile = () => {
  const { userId } = useParams();
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const targetUserId = userId;
  const [isFollowing, setIsFollowing] = useState(false);
  const [vibes, setVibes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchFollowCounts = async (userId) => {
    try {
      const followersRes = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_FOLLOW_COLLECTION_ID,
        [Query.equal("followingId", userId)]
      );
      setFollowersCount(followersRes.total);
  
      const followingRes = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_FOLLOW_COLLECTION_ID,
        [Query.equal("followerId", userId)]
      );
      setFollowingCount(followingRes.total);
    } catch (err) {
      console.error("Failed to fetch follow counts", err);
    }
  };
  

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await account.get();
        setCurrentUserId(user.$id);
      } catch (err) {
        console.error("Failed to get current user", err);
      }
    };
  
    fetchCurrentUser();
  }, []);
  
  useEffect(() => {
    const checkIfFollowing = async () => {
      if (!currentUserId || !userProfile?.userId) return;
  
      try {
        const followRes = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_FOLLOW_COLLECTION_ID, 
          [
            Query.equal("followerId", currentUserId),
            Query.equal("followingId", userProfile.userId),
          ]
        );
  
        setIsFollowing(followRes.documents.length > 0);
      } catch (error) {
        console.error("Failed to check follow status", error);
      }
    };
  
    checkIfFollowing();
  }, [currentUserId, userProfile]);
  
  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        // Get public profile info
        const profileRes = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_USERPROFILES_COLLECTION_ID,
          [Query.equal("userId", userId)]
        );

        if (profileRes.documents.length > 0) {
          setUserProfile(profileRes.documents[0]);
        }

        // Get this user's vibes
        const vibesRes = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_COLLECTION_ID,
          [Query.equal("userId", userId), Query.orderDesc("$createdAt")]
        );

        setVibes(vibesRes.documents);
      } catch (err) {
        console.error("Error loading public profile:", err);
      } finally {
        setLoading(false);
      }
      await fetchFollowCounts(userId);

    };

    fetchPublicData();
  }, [userId]);
  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        // Unfollow: find and delete the follow document
        const followRes = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_FOLLOW_COLLECTION_ID,
          [
            Query.equal("followerId", currentUserId),
            Query.equal("followingId", targetUserId),
          ]
        );
  
        if (followRes.documents.length > 0) {
          await databases.deleteDocument(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            import.meta.env.VITE_APPWRITE_FOLLOW_COLLECTION_ID,
            followRes.documents[0].$id
          );
        }
  
        setIsFollowing(false);
        await fetchFollowCounts(targetUserId);
      } else {
        // Follow: create a new follow document
        await databases.createDocument(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_FOLLOW_COLLECTION_ID,
          'unique()', // auto-generate ID
          {
            followerId: currentUserId,
            followingId: targetUserId,
            createdAt: new Date().toISOString()
          }
        );

        await databases.createDocument(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID, // use correct env var
          'unique()',
          {
            type: "follow",
            senderId: currentUserId,
            receiverId: targetUserId,
            isRead: false,
            timestamp: new Date().toISOString()
          }
        );
  
        setIsFollowing(true);
        await fetchFollowCounts(targetUserId);
      }
    } catch (error) {
      console.error("Failed to toggle follow status", error);
    }
    

  };
  
  if (loading) return <div className="flex items-center justify-center h-full py-4">
        <div className="w-10 h-10 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
      </div>

  if (!userProfile) return <p className="text-center">User not found.</p>;

  return (
  <div
    className="
      relative
      min-h-screen
      overflow-hidden
      bg-[#0b1120]
      text-white
    "
  >
    {/* Background Glow */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">

      <div
        className="
          absolute
          top-[-120px]
          left-[-80px]
          w-[320px]
          h-[320px]
          bg-pink-500/20
          blur-3xl
          rounded-full
        "
      />

      <div
        className="
          absolute
          bottom-[-140px]
          right-[-100px]
          w-[340px]
          h-[340px]
          bg-violet-500/20
          blur-3xl
          rounded-full
        "
      />
    </div>

    {/* Main */}
    <div
      className="
        relative
        z-10
        max-w-4xl
        mx-auto
        px-4
        py-6
      "
    >

      {/* Profile Card */}
      <div
        className="
          rounded-3xl
          border
          border-white/10
          bg-white/[0.05]
          backdrop-blur-2xl
          p-6
          shadow-2xl
          shadow-pink-500/5
        "
      >

        {/* Header */}
        <div
          className="
            flex
            flex-col
            md:flex-row
            md:items-center
            md:justify-between
            gap-6
          "
        >

          {/* Left */}
          <div className="flex items-center gap-5">

            {/* Avatar */}
            <div className="relative">

              <div
                className="
                  absolute
                  inset-0
                  rounded-full
                  bg-pink-500/30
                  blur-xl
                  scale-110
                "
              />

              <img
                src={
                  userProfile.profilePicUrl ||
                  "/default-avatar.png"
                }
                alt="Profile"
                className="
                  relative
                  w-24
                  h-24
                  rounded-full
                  object-cover
                  border-4
                  border-pink-500/50
                  shadow-xl
                "
              />
            </div>

            {/* Info */}
            <div>

              <h1
                className="
                  text-2xl
                  font-bold
                "
              >
                {userProfile.username ||
                  "VibeSoul User"}
              </h1>

              {userProfile.mbtiType && (
                <div
                  className="
                    inline-flex
                    mt-3
                    px-3
                    py-1
                    rounded-full
                    bg-pink-500/10
                    border
                    border-pink-500/20
                    text-pink-300
                    text-sm
                    font-medium
                  "
                >
                  ✨ {userProfile.mbtiType}
                </div>
              )}

              {/* Bio */}
              {userProfile?.bio && (
                <p
                  className="
                    mt-4
                    text-sm
                    text-gray-300
                    leading-relaxed
                    max-w-md
                  "
                >
                  {userProfile.bio}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          {currentUserId !== targetUserId && (
            <div className="flex gap-3">

              {/* Follow */}
              <button
                onClick={handleFollowToggle}
                className={`
                  px-5
                  py-3
                  rounded-2xl
                  font-medium
                  transition-all
                  duration-300

                  ${
                    isFollowing
                      ? `
                        bg-white/[0.08]
                        border
                        border-white/10
                        hover:bg-white/[0.12]
                      `
                      : `
                        bg-gradient-to-r
                        from-pink-500
                        to-violet-500
                        shadow-lg
                        shadow-pink-500/20
                        hover:opacity-90
                      `
                  }
                `}
              >
                {isFollowing
                  ? "Following"
                  : "Follow"}
              </button>

              {/* Message */}
              <button
                onClick={() =>
                  navigate(
                    "/chat/" +
                    targetUserId
                  )
                }
                className="
                  px-5
                  py-3
                  rounded-2xl
                  bg-white/[0.06]
                  border
                  border-white/10
                  hover:bg-white/[0.08]
                  transition
                "
              >
                Message
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div
          className="
            grid
            grid-cols-3
            gap-4
            mt-8
          "
        >

          {/* Vibes */}
          <div
            className="
              rounded-2xl
              bg-white/[0.04]
              border
              border-white/10
              p-4
              text-center
            "
          >
            <h2 className="text-2xl font-bold">
              {vibes.length}
            </h2>

            <p className="text-gray-400 text-sm">
              Vibes
            </p>
          </div>

          {/* Followers */}
          <Link
            to={`/profile/${targetUserId}/followers`}
            className="
              rounded-2xl
              bg-white/[0.04]
              border
              border-white/10
              p-4
              text-center
              hover:bg-white/[0.06]
              transition
            "
          >
            <h2 className="text-2xl font-bold">
              {followersCount}
            </h2>

            <p className="text-gray-400 text-sm">
              Followers
            </p>
          </Link>

          {/* Following */}
          <Link
            to={`/profile/${targetUserId}/following`}
            className="
              rounded-2xl
              bg-white/[0.04]
              border
              border-white/10
              p-4
              text-center
              hover:bg-white/[0.06]
              transition
            "
          >
            <h2 className="text-2xl font-bold">
              {followingCount}
            </h2>

            <p className="text-gray-400 text-sm">
              Following
            </p>
          </Link>
        </div>
      </div>

      {/* Vibes */}
      <div className="mt-8">

        {/* Title */}
        <div
          className="
            flex
            items-center
            justify-between
            mb-5
          "
        >
          <h2
            className="
              text-2xl
              font-bold
            "
          >
            Vibes ✨
          </h2>

          <p className="text-sm text-gray-400">
            {vibes.length} posts
          </p>
        </div>

        {vibes.length === 0 ? (

          <div
            className="
              rounded-3xl
              bg-white/[0.04]
              border
              border-white/10
              p-10
              text-center
              text-gray-400
            "
          >
            This soul hasn’t posted any vibes yet.
          </div>

        ) : (

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              gap-5
            "
          >
            {vibes.map((vibe) => (
              <div
                key={vibe.$id}
                className="
                  group
                  rounded-3xl
                  overflow-hidden
                  bg-white/[0.05]
                  border
                  border-white/10
                  hover:border-pink-500/30
                  transition-all
                  duration-300
                "
              >

                {/* Image */}
                {vibe.imageUrl && (
                  <div className="overflow-hidden">
                    <img
                      src={vibe.imageUrl}
                      alt="vibe-img"
                      className="
                        h-72
                        w-full
                        object-cover
                        group-hover:scale-105
                        transition-transform
                        duration-500
                      "
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-4">

                  <p
                    className="
                      text-sm
                      text-gray-200
                      line-clamp-3
                    "
                  >
                    {vibe.vibeText}
                  </p>

                  <span
                    className="
                      text-xs
                      text-gray-500
                      block
                      mt-3
                    "
                  >
                    {formatDistanceToNow(
  new Date(vibe.$createdAt),
  {
    addSuffix: true,
  }
)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);
};

export default PublicProfile;
