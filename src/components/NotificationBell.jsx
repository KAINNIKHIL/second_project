import { useEffect, useState, useRef } from "react";
import client, { databases as db } from "../appwrite/config";
import { Query } from "appwrite";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;

const notifCollection =
  import.meta.env.VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID;

const NotificationBell = ({ currentUserId }) => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [userMap, setUserMap] = useState({});

  const dropdownRef = useRef();

  // Fetch Notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await db.listDocuments(
          databaseId,
          notifCollection,
          [
            Query.equal("receiverId", currentUserId),
            Query.orderDesc("timestamp"),
            Query.limit(10),
          ]
        );

        const notifs = res.documents;

        setNotifications(notifs);

        // Get unique sender ids
        const senderIds = [
          ...new Set(notifs.map((n) => n.senderId)),
        ];

        // Fetch user profiles
        const userResponses = await Promise.all(
          senderIds.map((senderId) =>
            db
              .listDocuments(
                databaseId,
                import.meta.env
                  .VITE_APPWRITE_USERPROFILES_COLLECTION_ID,
                [Query.equal("userId", senderId)]
              )
              .then((res) => res.documents[0])
          )
        );

        const tempMap = {};

        userResponses.forEach((user) => {
          if (user) {
            tempMap[user.userId] = {
              username: user.username || "Anonymous",
              profilePicUrl:
                user.profilePicUrl || "/default-avatar.png",
            };
          }
        });

        setUserMap(tempMap);
      } catch (err) {
        console.error("Error fetching notifications", err);
      }
    };

    if (currentUserId) {
      fetchNotifications();
    }
  }, [currentUserId]);

  // Close dropdown outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  // Mark as read
  const markAsRead = async (notifId) => {
    try {
      await db.updateDocument(
        databaseId,
        notifCollection,
        notifId,
        {
          isRead: true,
        }
      );

      setNotifications((prev) =>
        prev.map((n) =>
          n.$id === notifId
            ? { ...n, isRead: true }
            : n
        )
      );
    } catch (err) {
      console.error(
        "Failed to mark notification as read",
        err
      );
    }
  };

  // Unread count
  const unreadCount = notifications.filter(
    (n) => !n.isRead
  ).length;

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* Bell Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setOpen(!open)}
        className="
          relative
          p-1
          text-gray-300
          hover:text-pink-400
          transition
        "
      >
        <Bell className="w-5 h-5" />

        {/* Notification Dot */}
        {unreadCount > 0 && (
          <>
            <span
              className="
                absolute
                -top-1
                -right-1
                min-w-[18px]
                h-[18px]
                px-1
                flex
                items-center
                justify-center
                text-[10px]
                font-bold
                rounded-full
                bg-pink-500
                text-white
                shadow-lg
                shadow-pink-500/30
              "
            >
              {unreadCount}
            </span>

            <span
              className="
                absolute
                inset-0
                rounded-full
                animate-ping
                bg-pink-500/20
              "
            />
          </>
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            className="
              absolute
              right-0
              mt-4
              w-[360px]
              max-h-[500px]
              overflow-y-auto
              rounded-3xl
              bg-[#0f172a]/95
              backdrop-blur-2xl
              border
              border-white/10
              shadow-2xl
              shadow-pink-500/10
              z-50
            "
          >
            {/* Header */}
            <div
              className="
                sticky
                top-0
                z-10
                px-5
                py-4
                border-b
                border-white/10
                bg-[#0f172a]/95
                backdrop-blur-xl
              "
            >
              <h2 className="text-lg font-bold text-white">
                Notifications
              </h2>

              <p className="text-xs text-gray-400 mt-1">
                Stay updated with your vibe activity
              </p>
            </div>

            {/* Notifications */}
            <div className="p-2">
              {notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-gray-400 text-sm">
                    No notifications yet ✨
                  </p>
                </div>
              ) : (
                notifications.map((notif, index) => {
                  const sender =
                    userMap[notif.senderId];

                  const senderName =
                    sender?.username || "Someone";

                  const senderAvatar =
                    sender?.profilePicUrl ||
                    "/default-avatar.png";

                  let message = "";
                  let emoji = "🔔";

                  if (notif.type === "like") {
                    emoji = "❤️";
                    message = "liked your vibe";
                  } else if (notif.type === "comment") {
                    emoji = "💬";
                    message =
                      "commented on your vibe";
                  } else if (notif.type === "follow") {
                    emoji = "👥";
                    message =
                      "started following you";
                  }

                  return (
                    <motion.div
                      key={notif.$id}
                      initial={{
                        opacity: 0,
                        x: 10,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay: index * 0.03,
                      }}
                    >
                      <Link
                        to={
                          notif.vibeId
                            ? `/vibe/${notif.vibeId}`
                            : `/profile/${notif.senderId}`
                        }
                        onClick={() => {
                          markAsRead(notif.$id);
                          setOpen(false);
                        }}
                        className={`
                          flex
                          items-start
                          gap-3
                          p-4
                          rounded-2xl
                          transition-all
                          duration-200
                          mb-2

                          ${
                            notif.isRead
                              ? "bg-transparent"
                              : "bg-pink-500/10 border border-pink-500/10"
                          }

                          hover:bg-white/5
                        `}
                      >
                        {/* Avatar */}
                        <img
                          src={senderAvatar}
                          alt="avatar"
                          className="
                            w-12
                            h-12
                            rounded-full
                            object-cover
                            border
                            border-pink-500/40
                          "
                        />

                        {/* Content */}
                        <div className="flex-1">
                          <p className="text-sm text-gray-200 leading-relaxed">
                            <span className="mr-1">
                              {emoji}
                            </span>

                            <span className="font-semibold text-white">
                              {senderName}
                            </span>{" "}
                            {message}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
  {formatDistanceToNow(
    new Date(notif.timestamp),
    {
      addSuffix: true,
    }
  )}
</p>
                        </div>

                        {/* Unread Dot */}
                        {!notif.isRead && (
                          <div
                            className="
                              w-2.5
                              h-2.5
                              rounded-full
                              bg-pink-500
                              mt-2
                            "
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;