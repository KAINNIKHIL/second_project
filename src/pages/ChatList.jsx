import React, { useEffect, useState } from "react";
import { databases, account } from "../appwrite/config";
import { Query } from "appwrite";
import { useNavigate } from "react-router-dom";


export default function ChatList() {
  const [chats, setChats] = useState([]);
  const [userId, setUserId] = useState("");
  const [users, setUsers] = useState({});
  const navigate = useNavigate();
  useEffect(() => {
    const getChats = async () => {
      try {
        const user = await account.get();
        setUserId(user.$id);

        // Fetch chats where the current user is a participant
        const response = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_CHATS_COLLECTION_ID,
          [Query.contains("participants", user.$id)]  // Ensure participants field exists
        );
        
        setChats(response.documents);

        // Fetch other users' details for chat participants
        const participantIds = response.documents.flatMap(chat => chat.participants);
        const uniqueUserIds = [...new Set(participantIds.filter(id => id !== user.$id))];

        // Fetch user info for the unique participant IDs
        const userInfoPromises = uniqueUserIds.map((id) =>
          // Adjust the query to search by the 'userId' field (instead of the document ID)
          databases.listDocuments(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            import.meta.env.VITE_APPWRITE_USERPROFILES_COLLECTION_ID,
            [Query.equal("userId", id)]  // Use 'userId' as the field to search by
          )
        );

        const userInfoResponses = await Promise.all(userInfoPromises);

        // Log the user info responses to see what we are getting
        

        // Handle cases where user info might be missing or invalid
        const usersMap = userInfoResponses.reduce((acc, response, index) => {
          if (response.documents.length > 0) {
            const user = response.documents[0]; // Assuming only one document per userId
            acc[user.userId] = user;  // Use the user document's ID as the key
          } else {
            console.log(`No user found for ID ${uniqueUserIds[index]}`); // Log missing user
          }
          return acc;
        }, {});
        setUsers(usersMap);
        
      } catch (err) {
        console.error("Error fetching chats or user info", err);
      }
    };

    getChats();
  }, []);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Log the users state to verify profilePicUrl
  

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
    {/* Background Glow */}
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
            Chats ✨
          </h1>

          <p className="text-sm text-gray-400 mt-1">
            Connect with your vibe circle
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
          {chats.length} Chats
        </div>
      </div>

      {/* Loading / Empty */}
      {chats.length === 0 ? (
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
            💬
          </div>

          <h2 className="text-xl font-semibold">
            No Chats Yet
          </h2>

          <p className="text-gray-400 mt-2 text-sm">
            Start connecting with other souls.
          </p>
        </div>
      ) : (

        /* Chat List */
        <div className="space-y-4">
          {chats.map((chat) => {

            const otherUserId =
              chat.participants.find(
                (id) => id !== userId
              );

            const otherUser =
              users[otherUserId];

            return (
              <div
                key={chat.$id}
                onClick={() =>
                  navigate(`/chat/${otherUserId}`)
                }
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
                  cursor-pointer
                "
              >
                {/* Left */}
                <div className="flex items-center gap-4">

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
                        otherUser?.profilePicUrl ||
                        "/default-avatar.png"
                      }
                      alt={otherUserId}
                      className="
                        relative
                        w-14
                        h-14
                        rounded-full
                        object-cover
                        border-2
                        border-pink-500/40
                      "
                    />
                  </div>

                  {/* User Info */}
                  <div>
                    <h2
                      className="
                        font-semibold
                        text-lg
                        group-hover:text-pink-300
                        transition
                      "
                    >
                      {otherUser?.username ||
                        "VibeSoul User"}
                    </h2>

                    <p
                      className="
                        text-sm
                        text-gray-400
                        mt-1
                        max-w-[200px]
                        truncate
                      "
                    >
                      {chat.lastMessage ||
                        "Start chatting ✨"}
                    </p>
                  </div>
                </div>

                {/* Time */}
                <div
                  className="
                    flex
                    flex-col
                    items-end
                    gap-2
                  "
                >
                  <span
                    className="
                      text-xs
                      text-gray-500
                    "
                  >
                    {formatTimestamp(
                      chat.timestamp
                    )}
                  </span>

                  {/* Online Dot UI */}
                  <div
                    className="
                      w-2.5
                      h-2.5
                      rounded-full
                      bg-green-400
                      shadow-lg
                      shadow-green-400/50
                    "
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
);
}
