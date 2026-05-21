import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";

import { useParams, Link } from "react-router-dom";

import client, {
  databases,
  account,
} from "../appwrite/config";

import { Query, ID } from "appwrite";

import {
  ArrowLeft,
  SendHorizontal,
} from "lucide-react";

const Chat = () => {
  const { otherUserId } = useParams();

  const [currentUserId, setCurrentUserId] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  const [newMsg, setNewMsg] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [isOtherUserTyping, setIsOtherUserTyping] =
    useState(false);

  const [receiverProfile, setReceiverProfile] =
    useState(null);

  const typingTimeoutRef = useRef(null);

  const messagesEndRef = useRef(null);

  // Fetch Current User
  useEffect(() => {
    const getUser = async () => {
      try {
        const user = await account.get();

        setCurrentUserId(user.$id);
      } catch (err) {
        console.error(err);
      }
    };

    getUser();
  }, []);

  // Fetch Receiver Profile
  useEffect(() => {
    const fetchReceiverProfile = async () => {
      try {
        const res =
          await databases.listDocuments(
            import.meta.env
              .VITE_APPWRITE_DATABASE_ID,

            import.meta.env
              .VITE_APPWRITE_USERPROFILES_COLLECTION_ID,

            [
              Query.equal(
                "userId",
                otherUserId
              ),
            ]
          );

        if (res.documents.length > 0) {
          setReceiverProfile(
            res.documents[0]
          );
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (otherUserId) {
      fetchReceiverProfile();
    }
  }, [otherUserId]);

  // Typing Status Update
  const updateTypingStatus =
    useCallback(
      async (status) => {
        if (!currentUserId) return;

        try {
          await databases.updateDocument(
            import.meta.env
              .VITE_APPWRITE_DATABASE_ID,

            import.meta.env
              .VITE_APPWRITE_TYPING_COLLECTION_ID,

            currentUserId,

            {
              userId: currentUserId,
              chatWith: otherUserId,
              isTyping: status,
            }
          );
        } catch (err) {
          if (err.code === 404) {
            try {
              await databases.createDocument(
                import.meta.env
                  .VITE_APPWRITE_DATABASE_ID,

                import.meta.env
                  .VITE_APPWRITE_TYPING_COLLECTION_ID,

                currentUserId,

                {
                  userId: currentUserId,
                  chatWith: otherUserId,
                  isTyping: status,
                }
              );
            } catch (createErr) {
              console.error(createErr);
            }
          }
        }
      },
      [currentUserId, otherUserId]
    );

  // Listen Typing Status
  useEffect(() => {
    if (!otherUserId) return;

    const unsubscribe =
      client.subscribe(
        `databases.${
          import.meta.env
            .VITE_APPWRITE_DATABASE_ID
        }.collections.${
          import.meta.env
            .VITE_APPWRITE_TYPING_COLLECTION_ID
        }.documents.${otherUserId}`,

        (response) => {
          if (
            response.payload?.isTyping !==
            undefined
          ) {
            setIsOtherUserTyping(
              response.payload.isTyping
            );
          }
        }
      );

    return () => unsubscribe();
  }, [otherUserId]);

  // Fetch Messages
  useEffect(() => {
    if (
      !currentUserId ||
      !otherUserId
    )
      return;

    const fetchMessages = async () => {
      try {
        const res =
          await databases.listDocuments(
            import.meta.env
              .VITE_APPWRITE_DATABASE_ID,

            import.meta.env
              .VITE_APPWRITE_MESSAGES_COLLECTION_ID,

            [
              Query.or([
                Query.and([
                  Query.equal(
                    "senderId",
                    currentUserId
                  ),

                  Query.equal(
                    "receiverId",
                    otherUserId
                  ),
                ]),

                Query.and([
                  Query.equal(
                    "senderId",
                    otherUserId
                  ),

                  Query.equal(
                    "receiverId",
                    currentUserId
                  ),
                ]),
              ]),

              Query.orderAsc(
                "timestamp"
              ),
            ]
          );

        setMessages(res.documents);

        // Mark as Read
        const unreadMessages =
          res.documents.filter(
            (msg) =>
              msg.senderId ===
                otherUserId &&
              msg.receiverId ===
                currentUserId &&
              !msg.isRead
          );

        for (const msg of unreadMessages) {
          await databases.updateDocument(
            import.meta.env
              .VITE_APPWRITE_DATABASE_ID,

            import.meta.env
              .VITE_APPWRITE_MESSAGES_COLLECTION_ID,

            msg.$id,

            {
              isRead: true,
            }
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Realtime Subscription
    const unsubscribe =
      client.subscribe(
        `databases.${
          import.meta.env
            .VITE_APPWRITE_DATABASE_ID
        }.collections.${
          import.meta.env
            .VITE_APPWRITE_MESSAGES_COLLECTION_ID
        }.documents`,

        (response) => {
          const msg =
            response.payload;

          const isRelevant =
            (msg.senderId ===
              currentUserId &&
              msg.receiverId ===
                otherUserId) ||
            (msg.senderId ===
              otherUserId &&
              msg.receiverId ===
                currentUserId);

          // Create
          if (
            isRelevant &&
            response.events.includes(
              "databases.*.collections.*.documents.*.create"
            )
          ) {
            setMessages((prev) => {
              const exists =
                prev.some(
                  (m) =>
                    m.$id ===
                    msg.$id
                );

              if (exists) return prev;

              return [
                ...prev,
                msg,
              ];
            });
          }

          // Update
          if (
            isRelevant &&
            response.events.includes(
              "databases.*.collections.*.documents.*.update"
            )
          ) {
            setMessages((prev) =>
              prev.map((m) =>
                m.$id === msg.$id
                  ? {
                      ...m,
                      ...msg,
                    }
                  : m
              )
            );
          }
        }
      );

    return () => unsubscribe();
  }, [
    currentUserId,
    otherUserId,
  ]);

  // Auto Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView(
      {
        behavior: "smooth",
      }
    );
  }, [messages]);

  // Cleanup Typing
  useEffect(() => {
    return () => {
      updateTypingStatus(false);
    };
  }, [updateTypingStatus]);

  // Handle Typing
  const handleTyping = (e) => {
    setNewMsg(e.target.value);

    updateTypingStatus(true);

    clearTimeout(
      typingTimeoutRef.current
    );

    typingTimeoutRef.current =
      setTimeout(() => {
        updateTypingStatus(false);
      }, 2000);
  };

  // Send Message
  const sendMessage = async () => {
    if (!newMsg.trim()) return;

    const messageData = {
      senderId: currentUserId,
      receiverId: otherUserId,
      messageText: newMsg,
      timestamp:
        new Date().toISOString(),
      isRead: false,
    };

    try {
      // Create Message
      await databases.createDocument(
        import.meta.env
          .VITE_APPWRITE_DATABASE_ID,

        import.meta.env
          .VITE_APPWRITE_MESSAGES_COLLECTION_ID,

        ID.unique(),

        messageData
      );

      // Find Existing Chat
      const chatResponse =
        await databases.listDocuments(
          import.meta.env
            .VITE_APPWRITE_DATABASE_ID,

          import.meta.env
            .VITE_APPWRITE_CHATS_COLLECTION_ID,

          [
            Query.contains(
              "participants",
              currentUserId
            ),

            Query.contains(
              "participants",
              otherUserId
            ),
          ]
        );

      // Create Chat
      if (
        chatResponse.documents
          .length === 0
      ) {
        await databases.createDocument(
          import.meta.env
            .VITE_APPWRITE_DATABASE_ID,

          import.meta.env
            .VITE_APPWRITE_CHATS_COLLECTION_ID,

          ID.unique(),

          {
            participants: [
              currentUserId,
              otherUserId,
            ],

            lastMessage: newMsg,

            timestamp:
              messageData.timestamp,
          }
        );
      } else {
        // Update Chat
        await databases.updateDocument(
          import.meta.env
            .VITE_APPWRITE_DATABASE_ID,

          import.meta.env
            .VITE_APPWRITE_CHATS_COLLECTION_ID,

          chatResponse.documents[0]
            .$id,

          {
            lastMessage: newMsg,

            timestamp:
              messageData.timestamp,
          }
        );
      }

      setNewMsg("");

      updateTypingStatus(false);
    } catch (err) {
      console.error(
        "Error sending message:",
        err
      );
    }
  };

  // Loading
  if (loading) {
    return (
      <div
        className="
          flex
          items-center
          justify-center
          h-screen
          bg-white
          dark:bg-gray-900
        "
      >
        <div
          className="
            w-10
            h-10
            border-4
            border-pink-600
            border-t-transparent
            rounded-full
            animate-spin
          "
        />
      </div>
    );
  }

  return (
  <div
    className="
      h-[100dvh]
      bg-white
      dark:bg-gray-900
      text-black
      dark:text-white
      flex
      flex-col
      overflow-hidden
    "
  >
    {/* HEADER */}
    {receiverProfile && (
      <div
        className="
          shrink-0
          sticky
          top-0
          z-20
          bg-white/90
          dark:bg-gray-900/90
          backdrop-blur-xl
          border-b
          border-gray-200
          dark:border-gray-800
        "
      >
        <div
          className="
            max-w-3xl
            mx-auto
            px-4
            py-3
            flex
            items-center
            gap-4
          "
        >
          <Link
            to="/chatlist"
            className="text-pink-500"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>

          <Link
            to={`/profile/${receiverProfile.userId}`}
            className="
              flex
              items-center
              gap-3
            "
          >
            <img
              src={
                receiverProfile.profilePicUrl ||
                "/default-avatar.png"
              }
              alt="profile"
              className="
                w-11
                h-11
                rounded-full
                object-cover
                border-2
                border-pink-500/40
              "
            />

            <div>
              <h2 className="font-semibold">
                {receiverProfile.username}
              </h2>

              <p
                className="
                  text-xs
                  text-gray-500
                "
              >
                {receiverProfile.mbtiType}
              </p>
            </div>
          </Link>
        </div>
      </div>
    )}

    {/* MESSAGES AREA */}
    <div
      className="
        flex-1
        overflow-y-auto
        hide-scrollbar
        px-4
        py-5
      "
    >
      <div
        className="
          max-w-3xl
          mx-auto
          space-y-3
        "
      >
        {messages.map((msg) => (
          <div
            key={msg.$id}
            className={`
              flex
              ${
                msg.senderId === currentUserId
                  ? "justify-end"
                  : "justify-start"
              }
            `}
          >
            <div
              className={`
                p-3
                rounded-2xl
                max-w-[75%]
                break-words
                shadow-lg

                ${
                  msg.senderId === currentUserId
                    ? `
                      bg-gradient-to-r
                      from-pink-500
                      to-violet-500
                      text-white
                    `
                    : `
                      bg-gray-200
                      dark:bg-gray-800
                    `
                }
              `}
            >
              <p>{msg.messageText}</p>

              <div
                className="
                  flex
                  justify-end
                  mt-1
                "
              >
                <p
                  className="
                    text-[10px]
                    opacity-70
                  "
                >
                  {new Date(
                    msg.timestamp
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}

        {isOtherUserTyping && (
          <p
            className="
              text-sm
              text-gray-400
              italic
            "
          >
            typing...
          </p>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>

    {/* INPUT */}
    <div
      className="
        shrink-0
        border-t
        border-gray-200
        dark:border-gray-800
        bg-white/90
        dark:bg-gray-900/90
        backdrop-blur-xl
      "
    >
      <div
        className="
          max-w-3xl
          mx-auto
          p-4
          flex
          gap-3
        "
      >
        <input
          type="text"
          placeholder="Type your vibe..."
          value={newMsg}
          onChange={handleTyping}
          onKeyDown={async (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              await sendMessage();
            }
          }}
          className="
            flex-1
            px-4
            py-3
            rounded-full
            border
            border-gray-300
            dark:border-gray-700
            bg-gray-100
            dark:bg-gray-800
            focus:outline-none
            focus:ring-2
            focus:ring-pink-500
          "
        />

        <button
          onClick={sendMessage}
          className="
            bg-gradient-to-r
            from-pink-500
            to-violet-500
            text-white
            p-3
            rounded-full
          "
        >
          <SendHorizontal size={20} />
        </button>
      </div>
    </div>
  </div>
);
};

export default Chat;