import React, { useState } from "react";
import { account } from "../appwrite/config";
import { ID } from "appwrite";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const Signup = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      await account.create(ID.unique(), email, password, name);

      toast.success("Account created 🎉 Now login!");

      navigate("/");
    } catch (err) {
      toast.error("Signup failed: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center relative overflow-hidden px-6">
      
      {/* Background Glow */}
      <div className="absolute top-[-100px] left-[-100px] w-[350px] h-[350px] bg-pink-500/20 blur-3xl rounded-full"></div>

      <div className="absolute bottom-[-100px] right-[-100px] w-[350px] h-[350px] bg-violet-500/20 blur-3xl rounded-full"></div>

      {/* Main Container */}
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-10 items-center z-10">

        {/* Left Section */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="hidden lg:block"
        >
          <h1 className="text-6xl font-extrabold text-white leading-tight">
            <span className="text-pink-500">Vibe</span>
            <span className="text-white">Soul</span>
          </h1>

          <p className="mt-6 text-gray-300 text-xl max-w-md leading-relaxed">
            Join a world where personalities connect through vibes,
            emotions, memes, and stories that truly resonate.
          </p>

          {/* MBTI Pills */}
          <div className="flex flex-wrap gap-3 mt-8">
            {["INFJ", "ENFP", "INTJ", "ISFP", "ENTP"].map((type) => (
              <div
                key={type}
                className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 backdrop-blur-md"
              >
                {type}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Signup Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl"
        >
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white">
              Create Account
            </h2>

            <p className="text-gray-400 mt-3">
              Start your VibeSoul journey today.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="mt-10 space-y-5">

            {/* Name */}
            <div>
              <label className="text-sm text-gray-300 block mb-2">
                Full Name
              </label>

              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="
                  w-full
                  px-4
                  py-3
                  rounded-2xl
                  bg-white/5
                  border border-white/10
                  text-white
                  placeholder:text-gray-500
                  focus:outline-none
                  focus:ring-2
                  focus:ring-pink-500/40
                  focus:border-pink-500
                  transition
                "
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm text-gray-300 block mb-2">
                Email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="
                  w-full
                  px-4
                  py-3
                  rounded-2xl
                  bg-white/5
                  border border-white/10
                  text-white
                  placeholder:text-gray-500
                  focus:outline-none
                  focus:ring-2
                  focus:ring-pink-500/40
                  focus:border-pink-500
                  transition
                "
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-gray-300 block mb-2">
                Password
              </label>

              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="
                  w-full
                  px-4
                  py-3
                  rounded-2xl
                  bg-white/5
                  border border-white/10
                  text-white
                  placeholder:text-gray-500
                  focus:outline-none
                  focus:ring-2
                  focus:ring-pink-500/40
                  focus:border-pink-500
                  transition
                "
              />
            </div>

            {/* Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="
                w-full
                py-3
                rounded-2xl
                bg-gradient-to-r
                from-pink-500
                to-violet-500
                text-white
                font-semibold
                shadow-lg
                shadow-pink-500/20
                hover:shadow-pink-500/40
                transition
              "
            >
              Create Account
            </motion.button>

            {/* Login Link */}
            <p className="text-center text-gray-400 pt-3">
              Already have an account?{" "}
              <Link
                to="/"
                className="text-pink-400 hover:text-pink-300 transition"
              >
                Login
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;