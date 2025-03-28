import React, { useState } from "react";
import { useUser } from "../context/UserContext";
import { useAuth } from "../context/AuthContext";
import { Upload, Loader2, User as UserIcon, Mail, Calendar } from "lucide-react";
import { supabase } from "../lib/supabase";

function Account() {
  const { user } = useAuth();
  const { userData, subscription, usageData } = useUser();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError(null);
      setUploading(true);

      const file = event.target.files?.[0];
      if (!file || !user) return;

      if (!file.type.startsWith("image/")) {
        throw new Error("Please upload an image file");
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Image size must be less than 5MB");
      }

      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) throw updateError;
    } catch (err) {
      console.error("Error uploading avatar:", err);
      setError(err instanceof Error ? err.message : "Error uploading avatar");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-medium text-primary-900">Account Settings</h1>

      <div className="mt-8 space-y-8">
        {/* Profile Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="card p-8 h-full flex flex-col justify-center">
              <div className="flex flex-col items-center text-center">
                {userData?.avatar_url ? (
                  <img
                    src={userData.avatar_url}
                    alt="Profile"
                    className="h-32 w-32 rounded-full object-cover ring-4 ring-primary-100"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-primary-100 flex items-center justify-center ring-4 ring-primary-50">
                    <UserIcon className="h-16 w-16 text-primary-400" />
                  </div>
                )}

                <label
                  htmlFor="avatar-upload"
                  className={`btn-secondary mt-4 inline-flex items-center ${
                    uploading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 mr-2" />
                      Change Avatar
                    </>
                  )}
                  <input
                    id="avatar-upload"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                </label>
                <p className="mt-2 text-sm text-primary-500">PNG, JPG, GIF up to 5MB</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="card p-8 h-full">
              <h2 className="text-xl font-medium text-primary-900 mb-6">Profile Information</h2>

              {error && (
                <div className="bg-error-50 text-error-700 p-4 rounded-lg text-sm mb-6">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <div className="bg-primary-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 text-primary-700 mb-1">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <p className="text-lg text-primary-900">{user?.email}</p>
                </div>

                <div className="bg-primary-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 text-primary-700 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">Member Since</span>
                  </div>
                  <p className="text-lg text-primary-900">
                    {new Date(userData?.created_at || "").toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats and Subscription Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card p-8 hover:shadow-surface-lg transition-all duration-200">
            <h2 className="text-xl font-medium text-primary-900 mb-6">Subscription</h2>
            <div className="bg-gradient-to-br from-accent-50 to-primary-50 p-6 rounded-lg">
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-primary-700">Current Plan</span>
                  <p className="mt-1 text-3xl font-medium text-accent-600 capitalize">
                    {subscription?.plan || "Free"}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-primary-700">Status</span>
                  <p className="mt-1">
                    <span className="badge-success">{subscription?.status || "Active"}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-8 hover:shadow-surface-lg transition-all duration-200">
            <h2 className="text-xl font-medium text-primary-900 mb-6">Usage Stats</h2>
            <div className="bg-gradient-to-br from-primary-50 to-accent-50 p-6 rounded-lg">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-sm font-medium text-primary-700">Generated Images</span>
                  <p className="mt-1 text-3xl font-medium text-accent-600">
                    {usageData?.generated_images || 0}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-primary-700">Edited Images</span>
                  <p className="mt-1 text-3xl font-medium text-accent-600">
                    {usageData?.edited_images || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Account;
