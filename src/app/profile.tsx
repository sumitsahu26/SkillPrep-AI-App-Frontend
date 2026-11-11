import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import {
  ArrowLeft,
  Camera,
  Code2,
  BriefcaseBusiness,
  LogOut,
  MapPin,
  Pencil,
  Plus,
  Save,
  Trash2,
  User,
  Globe,
  UserRound,
} from "lucide-react-native";

import {
  Profile,
  getProfile,
  updateProfile,
  updateUserName,
  addProfileSkill,
  removeProfileSkill,
  uploadProfileImage,
} from "@/services/profileApi";
import PageSkeleton from "@/components/PageSkeleton";

const EMPTY_PROFILE: Profile = {
  phone: "",
  location: "",
  headline: "",
  bio: "",
  currentRole: "",
  experience: 0,
  skills: [],
  github: "",
  linkedin: "",
  portfolio: "",
  userId: {
    name: "",
    email: "",
    profileImage: "",
  },
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [name, setName] = useState("");
  const [skillInput, setSkillInput] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);

      const data = await getProfile();

      setProfile({
        ...EMPTY_PROFILE,
        ...data,
        userId: {
          ...EMPTY_PROFILE.userId,
          ...data.userId,
        },
        skills: data.skills || [],
      });

      setName(data.userId?.name || "");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Unable to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof Profile, value: string | number) => {
    setProfile((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Name is required.");
      return;
    }

    try {
      setSaving(true);

      await updateUserName(name.trim());

      const updatedProfile = await updateProfile({
        phone: profile.phone,
        location: profile.location,
        headline: profile.headline,
        bio: profile.bio,
        currentRole: profile.currentRole,
        experience: Number(profile.experience) || 0,
        skills: profile.skills,
        github: profile.github,
        linkedin: profile.linkedin,
        portfolio: profile.portfolio,
      });

      setProfile((previous) => ({
        ...previous,
        ...updatedProfile,
        userId: {
          ...previous.userId,
          ...updatedProfile.userId,
          name: name.trim(),
        },
      }));

      setEditing(false);
      Alert.alert("Success", "Profile updated successfully.");
    } catch (error) {
      Alert.alert(
        "Update failed",
        error instanceof Error ? error.message : "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async () => {
    const skill = skillInput.trim();

    if (!skill) return;

    try {
      const updated = await addProfileSkill(skill);

      setProfile((previous) => ({
        ...previous,
        ...updated,
        userId: previous.userId,
      }));

      setSkillInput("");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Unable to add skill."
      );
    }
  };

  const handleRemoveSkill = (skill: string) => {
    Alert.alert("Remove skill", `Remove ${skill} from your profile?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            const updated = await removeProfileSkill(skill);

            setProfile((previous) => ({
              ...previous,
              ...updated,
              userId: previous.userId,
            }));
          } catch (error) {
            Alert.alert(
              "Error",
              error instanceof Error ? error.message : "Unable to remove skill."
            );
          }
        },
      },
    ]);
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Please allow photo library access to select a profile picture."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];

    try {
      setUploadingImage(true);

      const fileName = asset.fileName || `profile-${Date.now()}.jpg`;

      const mimeType = asset.mimeType || "image/jpeg";

      await uploadProfileImage(asset.uri, fileName, mimeType);

      await loadProfile();

      Alert.alert("Success", "Profile picture updated.");
    } catch (error) {
      Alert.alert(
        "Upload failed",
        error instanceof Error ? error.message : "Unable to upload image."
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await SecureStore.deleteItemAsync("accessToken");
          router.replace("/login");
        },
      },
    ]);
  };

  const InputField = ({
    label,
    value,
    field,
    multiline = false,
    keyboardType = "default",
  }: {
    label: string;
    value: string | number;
    field: keyof Profile;
    multiline?: boolean;
    keyboardType?: "default" | "phone-pad" | "numeric" | "url";
  }) => (
    <View className="mb-4">
      <Text className="mb-2 text-xs font-semibold text-zinc-500">{label}</Text>

      <TextInput
        value={String(value ?? "")}
        onChangeText={(text) =>
          updateField(field, field === "experience" ? Number(text) || 0 : text)
        }
        editable={editing}
        multiline={multiline}
        keyboardType={keyboardType}
        textAlignVertical={multiline ? "top" : "center"}
        placeholder={`Enter ${label.toLowerCase()}`}
        placeholderTextColor="#71717a"
        className={`rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-[#171722] dark:text-white ${
          multiline ? "min-h-[100px]" : "h-12"
        }`}
      />
    </View>
  );

  if (loading) {
    return <PageSkeleton cards={3} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-[#08090d]">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* HEADER */}
        <View className="flex-row items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <View className="flex-1 flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.8}
              className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10"
            >
              <ArrowLeft size={20} color="#8b5cf6" />
            </TouchableOpacity>

            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10">
              <UserRound size={23} color="#8b5cf6" />
            </View>

            <View className="ml-3 flex-1">
              <Text className="text-xl font-bold text-zinc-900 dark:text-white">
                My Profile
              </Text>

              <Text className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                Manage your professional information
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={editing ? handleSave : () => setEditing(true)}
            disabled={saving}
            activeOpacity={0.8}
            className="ml-2 flex-row items-center rounded-xl bg-violet-600 px-3.5 py-2.5"
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : editing ? (
              <Save size={15} color="#fff" />
            ) : (
              <Pencil size={15} color="#fff" />
            )}

            <Text className="ml-2 text-xs font-bold text-white">
              {saving ? "Saving" : editing ? "Save" : "Edit"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        >
          {/* PROFILE CARD */}
          <View className="mb-5 items-center rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-[#15151f]">
            <View className="relative">
              {profile.userId.profileImage ? (
                <Image
                  source={{ uri: profile.userId.profileImage }}
                  className="h-24 w-24 rounded-full"
                />
              ) : (
                <View className="h-24 w-24 items-center justify-center rounded-full bg-violet-600">
                  <User size={42} color="#fff" />
                </View>
              )}

              <TouchableOpacity
                onPress={handlePickImage}
                disabled={uploadingImage}
                className="absolute bottom-0 right-0 h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-violet-600 dark:border-[#15151f]"
              >
                {uploadingImage ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Camera size={17} color="#fff" />
                )}
              </TouchableOpacity>
            </View>

            <Text className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">
              {profile.userId.name || "Your Name"}
            </Text>

            <Text className="mt-1 text-xs text-zinc-500">
              {profile.userId.email}
            </Text>

            {!!profile.headline && (
              <Text className="mt-3 text-center text-sm text-violet-500">
                {profile.headline}
              </Text>
            )}

            {!!profile.location && (
              <View className="mt-3 flex-row items-center">
                <MapPin size={14} color="#a1a1aa" />
                <Text className="ml-1 text-xs text-zinc-500">
                  {profile.location}
                </Text>
              </View>
            )}
          </View>

          {/* PERSONAL INFORMATION */}
          <View className="mb-5 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-[#15151f]">
            <Text className="mb-4 text-sm font-bold text-zinc-900 dark:text-white">
              Personal Information
            </Text>

            <View className="mb-4">
              <Text className="mb-2 text-xs font-semibold text-zinc-500">
                Full Name
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                editable={editing}
                placeholder="Your name"
                placeholderTextColor="#71717a"
                className="h-12 rounded-xl border border-zinc-200 bg-zinc-100 px-4 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-[#171722] dark:text-white"
              />
            </View>

            <View className="mb-4">
              <Text className="mb-2 text-xs font-semibold text-zinc-500">
                Email
              </Text>
              <View className="h-12 justify-center rounded-xl border border-zinc-200 bg-zinc-100 px-4 dark:border-zinc-800 dark:bg-[#171722]">
                <Text className="text-sm text-zinc-500">
                  {profile.userId.email}
                </Text>
              </View>
            </View>

            <InputField
              label="Phone"
              value={profile.phone}
              field="phone"
              keyboardType="phone-pad"
            />

            <InputField
              label="Location"
              value={profile.location}
              field="location"
            />
          </View>

          {/* PROFESSIONAL INFORMATION */}
          <View className="mb-5 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-[#15151f]">
            <Text className="mb-4 text-sm font-bold text-zinc-900 dark:text-white">
              Professional Information
            </Text>

            <InputField
              label="Professional Headline"
              value={profile.headline}
              field="headline"
            />

            <InputField
              label="Current Role"
              value={profile.currentRole}
              field="currentRole"
            />

            <InputField
              label="Experience (Years)"
              value={profile.experience}
              field="experience"
              keyboardType="numeric"
            />

            <InputField
              label="About Me"
              value={profile.bio}
              field="bio"
              multiline
            />
          </View>

          {/* SKILLS */}
          <View className="mb-5 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-[#15151f]">
            <Text className="mb-4 text-sm font-bold text-zinc-900 dark:text-white">
              Technical Skills
            </Text>

            <View className="mb-4 flex-row flex-wrap">
              {profile.skills.map((skill) => (
                <View
                  key={skill}
                  className="mb-2 mr-2 flex-row items-center rounded-lg bg-violet-500/10 px-3 py-2"
                >
                  <Text className="text-xs font-semibold text-violet-500">
                    {skill}
                  </Text>

                  {editing && (
                    <TouchableOpacity
                      onPress={() => handleRemoveSkill(skill)}
                      className="ml-2"
                    >
                      <Trash2 size={13} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              {profile.skills.length === 0 && (
                <Text className="text-xs text-zinc-500">
                  No skills added yet.
                </Text>
              )}
            </View>

            {editing && (
              <View className="flex-row">
                <TextInput
                  value={skillInput}
                  onChangeText={setSkillInput}
                  placeholder="Add a skill"
                  placeholderTextColor="#71717a"
                  className="h-11 flex-1 rounded-xl border border-zinc-200 bg-zinc-100 px-3 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-[#171722] dark:text-white"
                />

                <TouchableOpacity
                  onPress={handleAddSkill}
                  className="ml-2 h-11 w-11 items-center justify-center rounded-xl bg-violet-600"
                >
                  <Plus size={19} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* SOCIAL LINKS */}
          <View className="mb-5 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-[#15151f]">
            <Text className="mb-4 text-sm font-bold text-zinc-900 dark:text-white">
              Social Links
            </Text>

            <View className="mb-3 flex-row items-center">
              <Code2 size={18} color="#a1a1aa" />
              <View className="ml-3 flex-1">
                <InputField
                  label="GitHub URL"
                  value={profile.github}
                  field="github"
                  keyboardType="url"
                />
              </View>
            </View>

            <View className="mb-3 flex-row items-center">
              <BriefcaseBusiness size={18} color="#0a66c2" />
              <View className="ml-3 flex-1">
                <InputField
                  label="LinkedIn URL"
                  value={profile.linkedin}
                  field="linkedin"
                  keyboardType="url"
                />
              </View>
            </View>

            <View className="flex-row items-center">
              <Globe size={18} color="#8b5cf6" />
              <View className="ml-3 flex-1">
                <InputField
                  label="Portfolio URL"
                  value={profile.portfolio}
                  field="portfolio"
                  keyboardType="url"
                />
              </View>
            </View>
          </View>

          {editing && (
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              className="mb-4 h-12 flex-row items-center justify-center rounded-xl bg-violet-600"
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Save size={17} color="#fff" />
                  <Text className="ml-2 text-sm font-bold text-white">
                    Save Profile
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {editing && (
            <TouchableOpacity
              onPress={() => {
                setEditing(false);
                setSkillInput("");
                loadProfile();
              }}
              className="mb-4 h-11 items-center justify-center rounded-xl border border-zinc-300 dark:border-zinc-700"
            >
              <Text className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                Cancel Editing
              </Text>
            </TouchableOpacity>
          )}

          {/* LOGOUT */}
          <TouchableOpacity
            onPress={handleLogout}
            className="mt-2 h-12 flex-row items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5"
          >
            <LogOut size={17} color="#ef4444" />
            <Text className="ml-2 text-sm font-bold text-red-500">Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
