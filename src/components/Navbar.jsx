import React, { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  Moon,
  Sun,
  Home,
  MessageCircleMoreIcon,
  User,
} from "lucide-react";

import SearchBar from "./SearchBar";
import NotificationBell from "./NotificationBell";
import { account } from "../appwrite/config";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Navbar = () => {
  const { isDark, setIsDark } = useTheme();

  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await account.get();
        setCurrentUserId(user.$id);
      } catch (err) {
        console.error("Error getting user in Navbar", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const IconButtonClass = `
    p-2.5
    sm:p-3
    rounded-xl
    sm:rounded-2xl
    bg-white/5
    border
    border-white/10
    text-gray-300
    flex
    items-center
    justify-center
    shrink-0
    transition-all
    duration-300
  `;

  const Skeleton = () => (
    <div className="animate-pulse flex items-center gap-3">
      <div className="w-32 h-6 bg-white/10 rounded-lg" />
    </div>
  );

  const IconSkeleton = () => (
    <div className="w-10 h-10 rounded-xl bg-white/10 animate-pulse shrink-0" />
  );

  return (
    <nav
      className="
        sticky
        top-0
        z-50
        backdrop-blur-xl
        bg-[#0b1120]/80
        border-b
        border-white/10
      "
    >
      <div
        className="
          max-w-6xl
          mx-auto
          px-3
          sm:px-4
          py-2
          sm:py-3
          flex
          items-center
          justify-between
          gap-2
          sm:gap-4
        "
      >
        {/* Logo */}
        {loading ? (
          <div className="w-28 h-6 bg-white/10 rounded-lg animate-pulse shrink-0" />
        ) : (
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/feed")}
            className="
              flex
              items-center
              gap-1
              text-xl
              sm:text-2xl
              font-extrabold
              cursor-pointer
              select-none
              shrink-0
            "
          >
            <span className="text-pink-500">Vibe</span>
            <span className="text-white">Soul</span>
          </motion.div>
        )}

        {/* Desktop Search */}
        <div className="hidden sm:flex flex-1 justify-center px-2">
          <div className="w-full max-w-md">
            {loading ? (
              <div className="w-full h-10 bg-white/10 rounded-2xl animate-pulse" />
            ) : (
              <SearchBar />
            )}
          </div>
        </div>

        {/* Right Icons */}
        <div
          className="
            flex
            items-center
            gap-1
            sm:gap-2
            overflow-x-auto
            scrollbar-hide
          "
        >
          {/* Home */}
          {loading ? (
            <IconSkeleton />
          ) : (
            currentUserId && (
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/feed")}
                className={IconButtonClass}
              >
                <Home size={18} className="sm:w-5 sm:h-5" />
              </motion.button>
            )
          )}

          {/* Chat */}
          {loading ? (
            <IconSkeleton />
          ) : (
            currentUserId && (
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/chatlist")}
                className={IconButtonClass}
              >
                <MessageCircleMoreIcon
                  size={18}
                  className="sm:w-5 sm:h-5"
                />
              </motion.button>
            )
          )}

          {/* Notification */}
          {loading ? (
            <IconSkeleton />
          ) : (
            currentUserId && (
              <div
                className="
                  p-1.5
                  sm:p-2
                  rounded-xl
                  sm:rounded-2xl
                  bg-white/5
                  border
                  border-white/10
                  shrink-0
                "
              >
                <NotificationBell currentUserId={currentUserId} />
              </div>
            )
          )}

          {/* Profile */}
          {loading ? (
            <IconSkeleton />
          ) : (
            currentUserId && (
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/profile")}
                className={IconButtonClass}
              >
                <User size={18} className="sm:w-5 sm:h-5" />
              </motion.button>
            )
          )}

          {/* Theme */}
          {loading ? (
            <IconSkeleton />
          ) : (
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDark((prev) => !prev)}
              className={IconButtonClass}
            >
              {isDark ? (
                <Sun
                  size={18}
                  className="text-yellow-400 sm:w-5 sm:h-5"
                />
              ) : (
                <Moon size={18} className="sm:w-5 sm:h-5" />
              )}
            </motion.button>
          )}
        </div>
      </div>

      {/* Mobile Search */}
      <div className="sm:hidden px-3 pb-2">
        {loading ? (
          <div className="w-full h-10 bg-white/10 rounded-2xl animate-pulse" />
        ) : (
          <SearchBar />
        )}
      </div>
    </nav>
  );
};

export default Navbar;