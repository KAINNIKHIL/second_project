// src/components/SearchBar.jsx

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { databases } from "../appwrite/config";
import { Query } from "appwrite";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const timeoutRef = useRef(null);

  const fetchSuggestions = async (searchTerm) => {
    if (!searchTerm) {
      setSuggestions([]);
      return;
    }

    try {
      setLoading(true);

      const res = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_USERPROFILES_COLLECTION_ID,
        [Query.startsWith("username", searchTerm)]
      );

      setSuggestions(res.documents);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    clearTimeout(timeoutRef.current);

    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    timeoutRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);

    return () => clearTimeout(timeoutRef.current);
  }, [query]);

  return (
    <div className="relative w-full">
      
      {/* Search Input */}
      <div
        className="
          relative
          group
        "
      >
        <Search
          className="
            absolute
            left-4
            top-1/2
            -translate-y-1/2
            w-5
            h-5
            text-gray-500
            group-focus-within:text-pink-400
            transition
          "
        />

        <input
          type="text"
          placeholder="Search vibes, people..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="
            w-full
            py-3
            pl-12
            pr-4
            rounded-2xl
            bg-white/[0.05]
            border
            border-white/10
            backdrop-blur-xl
            text-white
            placeholder:text-gray-500
            focus:outline-none
            focus:ring-2
            focus:ring-pink-500/30
            focus:border-pink-500
            transition-all
            duration-300
          "
        />
      </div>

      {/* Suggestions */}
      <AnimatePresence>
        {query && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="
              absolute
              mt-3
              w-full
              bg-[#0f172a]/95
              backdrop-blur-2xl
              border
              border-white/10
              shadow-2xl
              shadow-pink-500/5
              rounded-3xl
              z-50
              overflow-hidden
              max-h-[350px]
              overflow-y-auto
            "
          >
            {/* Loading */}
            {loading ? (
              <div className="p-4 text-sm text-gray-400">
                Searching vibes...
              </div>
            ) : suggestions.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">
                No users found
              </div>
            ) : (
              suggestions.map((user, index) => (
                <motion.div
                  key={user.$id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Link
                    to={`/profile/${user.userId}`}
                    onClick={() => {
                      setQuery("");
                      setSuggestions([]);
                    }}
                    className="
                      flex
                      items-center
                      gap-3
                      px-4
                      py-3
                      hover:bg-pink-500/10
                      transition-all
                      duration-200
                      border-b
                      border-white/5
                      last:border-none
                    "
                  >
                    {/* Avatar */}
                    <img
                      src={
                        user.profilePicUrl || "/default-avatar.png"
                      }
                      alt="Profile"
                      className="
                        w-11
                        h-11
                        rounded-full
                        object-cover
                        border
                        border-pink-500/40
                      "
                    />

                    {/* Info */}
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">
                        {user.username}
                      </span>

                      <span className="text-xs text-gray-400">
                        @{user.username?.toLowerCase()}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;