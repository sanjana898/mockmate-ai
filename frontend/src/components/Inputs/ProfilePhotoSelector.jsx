import React, { useRef, useState } from 'react';
import { LuUser, LuUpload, LuTrash } from 'react-icons/lu';
import axios from 'axios';

const ProfilePhotoSelector = ({ image, setImage, preview, setPreview }) => {
    const inputRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const upload_preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    const handleImageChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            setImage(file);

            // preview locally
            const localPreview = URL.createObjectURL(file);
            if (setPreview) setPreview(localPreview);
            setPreviewUrl(localPreview);

            // ✅ Upload to Cloudinary
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", upload_preset); // replace with your preset

            try {
                setUploading(true);
                const res = await axios.post(
                    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                    formData
                );

                // ✅ Use Cloudinary URL instead of local preview
                if (setPreview) setPreview(res.data.secure_url);
                setPreviewUrl(res.data.secure_url);
                console.log("Uploaded:", res.data.secure_url);
            } catch (err) {
                console.error("Upload failed", err);
                setError("Upload failed. Please try again.");
            } finally {
                setUploading(false);
            }
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        setPreviewUrl(null);
        if (setPreview) setPreview(null);
    };

    const onChooseFile = () => {
        inputRef.current.click();
    };

    return (
        <div className="flex justify-center mb-6">
            <input
                type="file"
                accept="image/*"
                ref={inputRef}
                onChange={handleImageChange}
                className="hidden"
            />

            {!image ? (
                <div className="w-20 h-20 flex items-center justify-center bg-orange-50 rounded-full relative cursor-pointer">
                    <LuUser className="text-4xl text-orange-500" />

                    <button
                        type="button"
                        className="w-8 h-8 flex items-center justify-center bg-gradient-to-r from-orange-500/85 to-orange-600 text-white rounded-full absolute -bottom-1 -right-1 cursor-pointer"
                        onClick={onChooseFile}
                        disabled={uploading}
                    >
                        <LuUpload />
                    </button>
                </div>
            ) : (
                <div className="relative">
                    <img
                        src={preview || previewUrl}
                        alt="profile photo"
                        className="w-20 h-20 rounded-full object-cover"
                    />
                    <button
                        type="button"
                        className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full absolute -bottom-1 -right-1 cursor-pointer"
                        onClick={handleRemoveImage}
                        disabled={uploading}
                    >
                        <LuTrash />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProfilePhotoSelector;
