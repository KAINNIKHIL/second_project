import React, { useEffect, useState } from "react";
import { account, databases } from "../appwrite/config";
import { Query } from "appwrite";
import { Link } from "react-router-dom";
import { Pencil, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";




const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [vibes, setVibes] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

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
    const fetchData = async () => {
      try {
        // Get Authenticated User
        const userData = await account.get();
        setUser(userData);
        await fetchFollowCounts(userData.$id);

        // Get Extended Profile from your new collection
        const profileRes = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_USERPROFILES_COLLECTION_ID,
          [ // only fetch the document matching user ID
            Query.equal("userId", userData.$id),
          ]
        );

        if (profileRes.documents.length > 0) {
          const profileDoc = profileRes.documents[0];
          setUserProfile(profileDoc);
        } else {
          console.warn("No user profile found for userId:", userData.$id);
        }
        

        // Get Vibes posted by the user
        const vibeRes = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_COLLECTION_ID
        );

        const userVibes = vibeRes.documents.filter(v => v.userId === userData.$id);
        setVibes(userVibes);

      } catch (err) {
        console.error("Error loading user profile:", err);
      }
      
    };

    fetchData();
  }, []);

  if (!user || !userProfile)
    return (
      <div className="flex items-center justify-center h-full py-4">
        <div className="w-10 h-10 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  

  
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
          top-[-100px]
          left-[-80px]
          w-[280px]
          h-[280px]
          bg-pink-500/20
          blur-3xl
          rounded-full
        "
      />

      <div
        className="
          absolute
          bottom-[-120px]
          right-[-100px]
          w-[320px]
          h-[320px]
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
          bg-white/[0.05]
          border
          border-white/10
          backdrop-blur-2xl
          rounded-3xl
          p-6
          shadow-2xl
          shadow-pink-500/5
        "
      >

        {/* Top */}
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
                  userProfile?.profilePicUrl ||
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
                {user.name || user.email}
              </h1>

              <p
                className="
                  text-gray-400
                  text-sm
                  mt-1
                "
              >
                @{userProfile?.username}
              </p>

              {userProfile?.mbtiType && (
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
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">

            <Link
              to="/edit-profile"
              className="
                flex
                items-center
                gap-2
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
              <Pencil className="w-4 h-4" />
              Edit Profile
            </Link>

            <Link
              to="/post"
              className="
                flex
                items-center
                gap-2
                px-5
                py-3
                rounded-2xl
                bg-gradient-to-r
                from-pink-500
                to-violet-500
                hover:opacity-90
                transition
                shadow-lg
                shadow-pink-500/20
              "
            >
              <Send className="w-4 h-4" />
              Post Vibe
            </Link>
          </div>
        </div>

        {/* Bio */}
        {userProfile?.bio && (
          <div
            className="
              mt-6
              text-gray-300
              leading-relaxed
              border-l-2
              border-pink-500/50
              pl-4
            "
          >
            {userProfile.bio}
          </div>
        )}

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
            to={`/profile/${user.$id}/followers`}
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
            to={`/profile/${user.$id}/following`}
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

      {/* User Vibes */}
      <div className="mt-8">

        <div className="flex items-center justify-between mb-5">

          <h2
            className="
              text-2xl
              font-bold
            "
          >
            Your Vibes ✨
          </h2>

          <p className="text-gray-400 text-sm">
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
            No vibes posted yet.
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
);};
    
export default UserProfile;
