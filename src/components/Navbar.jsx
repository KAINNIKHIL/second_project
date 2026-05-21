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

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await account.get();
        setCurrentUserId(user.$id);
      } catch (err) {
        console.error("Error getting user in Navbar", err);
      }
    };

    fetchUser();
  }, []);

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
          px-4
          py-3
          flex
          items-center
          justify-between
          gap-4
        "
      >
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          onClick={() => navigate("/feed")}
          className="
            flex
            items-center
            gap-1
            text-2xl
            font-extrabold
            cursor-pointer
            select-none
          "
        >
          <span className="text-pink-500">Vibe</span>

          <span className="text-white">Soul</span>
        </motion.div>

        {/* Search */}
        <div className="hidden sm:flex flex-1 justify-center px-2">
          <div className="w-full max-w-md">
            <SearchBar />
          </div>
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-2">

          {/* Home */}
          {currentUserId && (
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/feed")}
              className="
                p-3
                rounded-2xl
                bg-white/5
                border
                border-white/10
                text-gray-300
                hover:text-pink-400
                hover:bg-pink-500/10
                transition
              "
            >
              <Home size={20} />
            </motion.button>
          )}

          {/* Chat */}
          {currentUserId && (
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/chatlist")}
              className="
                p-3
                rounded-2xl
                bg-white/5
                border
                border-white/10
                text-gray-300
                hover:text-pink-400
                hover:bg-pink-500/10
                transition
              "
            >
              <MessageCircleMoreIcon size={20} />
            </motion.button>
          )}

          {/* Notification */}
          {currentUserId && (
            <div
              className="
                p-2
                rounded-2xl
                bg-white/5
                border
                border-white/10
                hover:bg-pink-500/10
                transition
              "
            >
              <NotificationBell currentUserId={currentUserId} />
            </div>
          )}

          {/* Profile */}
          {currentUserId && (
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/profile")}
              className="
                p-3
                rounded-2xl
                bg-white/5
                border
                border-white/10
                text-gray-300
                hover:text-pink-400
                hover:bg-pink-500/10
                transition
              "
            >
              <User size={20} />
            </motion.button>
          )}

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDark((prev) => !prev)}
            className="
              p-3
              rounded-2xl
              bg-white/5
              border
              border-white/10
              text-gray-300
              hover:text-yellow-400
              hover:bg-yellow-500/10
              transition
            "
          >
            {isDark ? (
              <Sun size={20} className="text-yellow-400" />
            ) : (
              <Moon size={20} />
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="sm:hidden px-4 pb-3">
        <SearchBar />
      </div>
    </nav>
  );
};

export default Navbar;