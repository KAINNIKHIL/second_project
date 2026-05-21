import React, { useEffect, useState } from "react";
import { account, databases, storage, IDUtils as ID } from "../appwrite/config";
import { Query } from "appwrite";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';


const EditProfile = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [user, setUser] = useState(null);
  const [userDocId, setUserDocId] = useState(null);
  const [showMBTITest, setShowMBTITest] = useState(false);
  const navigate = useNavigate();
  const [mbti, setMbti] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    mbtiType: "",
    bio: "",
    profilePicUrl: "",
  });
  const [file, setFile] = useState(null);
   useEffect(() => {
      const getUser = async () => {
        try {
          const res = await account.get();
          setUser(res);
        } catch (error) {
          console.error("Not logged in 💔", error);
          navigate("/"); // redirect to login if not logged in
        }
      };
      getUser();
    }, []);
  
    const handleLogout = async () => {
      try {
        await account.deleteSession("current");
        toast.success("Logged out 🌙");
        navigate("/"); 
      } catch (err) {
        toast.error("Error logging out 💔");
      }
    };
  useEffect(() => {
    const fetchData = async () => {
      const userData = await account.get();
      setUser(userData);

      const profileRes = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_USERPROFILES_COLLECTION_ID,
        [Query.equal("userId", userData.$id)]
      );

      if (profileRes.documents.length > 0) {
        const doc = profileRes.documents[0];
        setUserDocId(doc.$id);
        setFormData({
          username: doc.username || "",
          mbtiType: doc.mbtiType || "",
          bio: doc.bio || "",
          profilePicUrl: doc.profilePicUrl || "",
        });
      } const savedMbti = localStorage.getItem("mbtiResult");
      if (savedMbti) {
        setFormData((prev) => ({ ...prev, mbtiType: savedMbti }));
        localStorage.removeItem("mbtiResult"); 
      }
    
    };
    
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


const handleFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  setIsUploading(true);

  try {
    const uploadedFile = await storage.createFile(
      import.meta.env.VITE_APPWRITE_BUCKET_ID,
      ID.unique(),
      file
    );

    const previewUrl = storage.getFileView(
      import.meta.env.VITE_APPWRITE_BUCKET_ID,
      uploadedFile.$id
    );

    // Save this in your form data for later DB update
    setFormData((prev) => ({
      ...prev,
      profilePicUrl: previewUrl,
    }));

    console.log("Uploaded and preview URL:", previewUrl);
  } catch (err) {
    console.error("Error uploading file:", err);
    toast.error("Failed to update profile ");
  }finally {
    setIsUploading(false); //  stop spinner
  }
};


const handleSubmit = async (e) => {
  e.preventDefault();

  await databases.updateDocument(
    import.meta.env.VITE_APPWRITE_DATABASE_ID,
    import.meta.env.VITE_APPWRITE_USERPROFILES_COLLECTION_ID,
    userDocId,
    {
      username: formData.username,
      mbtiType: formData.mbtiType,
      bio: formData.bio,
      profilePicUrl: formData.profilePicUrl,
    }
  );
  toast.success("Profile updated!");
  navigate(`/profile`); 
};
useEffect(() => {
  const storedMBTI = localStorage.getItem("mbtiResult");
  if (storedMBTI) {
    setMbti(storedMBTI);
    localStorage.removeItem("mbtiResult"); 
  }
}, []);


  return (
  <div
    className="
      min-h-screen
      bg-[#0b1120]
      text-white
      relative
      overflow-hidden
      px-4
      py-10
    "
  >
    {/* Background Glow */}
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className="
          absolute
          top-[-120px]
          left-[-80px]
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
          right-[-80px]
          w-[320px]
          h-[320px]
          rounded-full
          bg-violet-500/20
          blur-3xl
        "
      />
    </div>

    {/* Card */}
    <div
      className="
        relative
        z-10
        max-w-2xl
        mx-auto
        rounded-3xl
        border
        border-white/10
        bg-white/[0.05]
        backdrop-blur-2xl
        shadow-2xl
        shadow-pink-500/10
        p-8
      "
    >
      {/* Heading */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold">
          Edit Profile ✨
        </h2>

        <p className="text-sm text-gray-400 mt-2">
          Customize your vibe identity
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        {/* Profile Preview */}
        <div className="flex justify-center">
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
                formData.profilePicUrl ||
                "/default-avatar.png"
              }
              alt="Profile"
              className="
                relative
                w-28
                h-28
                rounded-full
                object-cover
                border-4
                border-pink-500/40
              "
            />
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="block mb-2 text-sm text-gray-300">
            Username
          </label>

          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="Enter username"
            className="
              w-full
              rounded-2xl
              border
              border-white/10
              bg-white/[0.05]
              px-4
              py-3
              outline-none
              focus:border-pink-500/40
              transition
            "
          />
        </div>

        {/* MBTI */}
        <div>
          <label className="block mb-2 text-sm text-gray-300">
            MBTI Type
          </label>

          <div className="flex gap-3">
            <input
              type="text"
              name="mbtiType"
              value={mbti || formData.mbtiType}
              onChange={(e) => {
                const value = e.target.value
                  .toUpperCase()
                  .slice(0, 4);

                setFormData({
                  ...formData,
                  mbtiType: value,
                });
              }}
              placeholder="INFJ"
              className="
                flex-1
                rounded-2xl
                border
                border-white/10
                bg-white/[0.05]
                px-4
                py-3
                outline-none
                focus:border-pink-500/40
              "
            />

            <button
              type="button"
              onClick={() =>
                navigate("/mbti-test")
              }
              className="
                px-5
                py-3
                rounded-2xl
                bg-gradient-to-r
                from-pink-500
                to-violet-500
                font-medium
                hover:opacity-90
                transition
              "
            >
              Test
            </button>
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block mb-2 text-sm text-gray-300">
            Bio
          </label>

          <textarea
            value={formData.bio}
            onChange={(e) =>
              setFormData({
                ...formData,
                bio: e.target.value,
              })
            }
            placeholder="Write something about yourself..."
            className="
              w-full
              min-h-[120px]
              rounded-2xl
              border
              border-white/10
              bg-white/[0.05]
              px-4
              py-3
              outline-none
              resize-none
              focus:border-pink-500/40
            "
          />
        </div>

        {/* Profile Upload */}
        <div>
          <label className="block mb-2 text-sm text-gray-300">
            Profile Picture
          </label>

          <input
            type="file"
            onChange={handleFileChange}
            className="
              w-full
              text-sm
              file:mr-4
              file:px-4
              file:py-2
              file:rounded-xl
              file:border-0
              file:bg-pink-500
              file:text-white
              file:cursor-pointer
              file:hover:bg-pink-600
            "
          />

          {isUploading && (
            <p className="mt-3 text-sm text-pink-300 animate-pulse">
              Uploading...
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">

          {/* Update */}
          <button
            type="submit"
            className="
              flex-1
              py-3
              rounded-2xl
              bg-gradient-to-r
              from-pink-500
              to-violet-500
              font-semibold
              hover:opacity-90
              transition
            "
          >
            Update Profile
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="
              px-6
              py-3
              rounded-2xl
              border
              border-white/10
              bg-white/[0.05]
              hover:bg-white/[0.08]
              transition
            "
          >
            Logout
          </button>
        </div>
      </form>
    </div>
  </div>
);
};

export default EditProfile;
