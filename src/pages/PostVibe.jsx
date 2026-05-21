import React, { useState } from "react";
import { toast } from 'react-toastify';
import { databases, storage, IDUtils, account } from "../appwrite/config";

const PostVibe = () => {
  const [vibe, setVibe] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await account.get();
      let imageUrl = "";

      if (image) {
        const uploadedFile = await storage.createFile(
          import.meta.env.VITE_APPWRITE_BUCKET_ID,
          IDUtils.unique(),
          image
        );

        imageUrl = `https://cloud.appwrite.io/v1/storage/buckets/${import.meta.env.VITE_APPWRITE_BUCKET_ID}/files/${uploadedFile.$id}/view?project=${import.meta.env.VITE_APPWRITE_PROJECT_ID}`;
      }

      await databases.createDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_COLLECTION_ID,
        IDUtils.unique(),
        {
          userId: user.$id,
          vibeText: vibe,
          imageUrl: imageUrl,
          createdAt: new Date().toISOString()
        }
      );

      toast.success("Vibe posted!");
      setVibe("");
      setImage(null);
    } catch (err) {
      toast.error("Error posting vibe: " + err.message);
    }

    setLoading(false);
  };

 return (
  <div
    className="
      min-h-screen
      bg-[#0b1120]
      text-white
      relative
      overflow-hidden
      flex
      items-center
      justify-center
      px-4
      py-10
    "
  >

    {/* Background Glow */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">

      <div
        className="
          absolute
          top-[-120px]
          left-[-100px]
          w-[320px]
          h-[320px]
          rounded-full
          bg-pink-500/20
          blur-3xl
        "
      />

      <div
        className="
          absolute
          bottom-[-120px]
          right-[-100px]
          w-[320px]
          h-[320px]
          rounded-full
          bg-violet-500/20
          blur-3xl
        "
      />
    </div>

    {/* Main Card */}
    <form
      onSubmit={handleSubmit}
      className="
        relative
        z-10
        w-full
        max-w-2xl
        rounded-3xl
        border
        border-white/10
        bg-white/[0.05]
        backdrop-blur-2xl
        shadow-2xl
        shadow-pink-500/10
        p-8
        space-y-6
      "
    >

      {/* Heading */}
      <div className="text-center">

        <h2
          className="
            text-4xl
            font-bold
            bg-gradient-to-r
            from-pink-400
            to-violet-400
            bg-clip-text
            text-transparent
          "
        >
          Share Your Vibe ✨
        </h2>

        <p className="text-gray-400 mt-3">
          Express your thoughts, emotions, and energy.
        </p>
      </div>

      {/* Textarea */}
      <div>

        <textarea
          value={vibe}
          onChange={(e) =>
            setVibe(e.target.value)
          }
          rows="5"
          placeholder="What’s on your soul today?"
          className="
            w-full
            rounded-3xl
            border
            border-white/10
            bg-white/[0.05]
            p-5
            text-white
            placeholder:text-gray-500
            outline-none
            resize-none
            focus:border-pink-500/40
            transition
          "
          required
        />

        <div
          className="
            flex
            justify-end
            mt-2
            text-xs
            text-gray-500
          "
        >
          {vibe.length}/500
        </div>
      </div>

      {/* Image Upload */}
      <div
        className="
          rounded-3xl
          border
          border-dashed
          border-white/10
          bg-white/[0.03]
          p-6
        "
      >

        <label
          className="
            block
            text-sm
            text-gray-300
            mb-4
          "
        >
          Add an image (optional)
        </label>

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setImage(e.target.files[0])
          }
          className="
            w-full
            text-sm
            text-gray-300

            file:mr-4
            file:px-5
            file:py-3
            file:rounded-2xl
            file:border-0
            file:bg-gradient-to-r
            file:from-pink-500
            file:to-violet-500
            file:text-white
            file:font-medium
            file:cursor-pointer
          "
        />

        {/* Preview */}
        {image && (
          <div className="mt-6">

            <img
              src={URL.createObjectURL(image)}
              alt="preview"
              className="
                w-full
                max-h-[400px]
                object-cover
                rounded-3xl
                border
                border-white/10
              "
            />
          </div>
        )}
      </div>

      {/* Button */}
      <button
        type="submit"
        disabled={loading}
        className="
          w-full
          py-4
          rounded-2xl
          bg-gradient-to-r
          from-pink-500
          to-violet-500
          text-lg
          font-semibold
          shadow-xl
          shadow-pink-500/20
          hover:opacity-90
          transition-all
          duration-300
          disabled:opacity-50
        "
      >
        {loading
          ? "Posting..."
          : " Post Vibe"}
      </button>
    </form>
  </div>
);
};

export default PostVibe;
