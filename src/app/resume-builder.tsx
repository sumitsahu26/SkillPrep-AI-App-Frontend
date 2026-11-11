import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  UserRound,
  BriefcaseBusiness,
  GraduationCap,
  Code2,
  FileText,
} from "lucide-react-native";

import {
  createResume,
  getResumeById,
  updateResume,
  CreateResumeInput,
  ResumeExperience,
  ResumeEducation,
  ResumeProject,
} from "../services/resumeApi";
import PageSkeleton from "@/components/PageSkeleton";

  //  TYPES


interface PersonalDetails {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
}

interface FormData {
  title: string;
  personalInfo: PersonalDetails;
  summary: string;
  skills: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  projects: ResumeProject[];
}

const initialForm: FormData = {
  title: "Full Stack Developer",
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    portfolio: "",
  },
  summary: "",
  skills: "",
  experience: [],
  education: [],
  projects: [],
};

  //  REUSABLE INPUT


interface FieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad" | "url";
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType = "default",
}: FieldProps) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        placeholderTextColor="#a1a1aa"
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === "email-address" ? "none" : "sentences"}
        textAlignVertical={multiline ? "top" : "center"}
        className={`rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 dark:border-white/[0.08] dark:bg-[#11131a] dark:text-white ${
          multiline ? "min-h-[110px] py-3" : "h-12"
        }`}
      />
    </View>
  );
}

  //  SECTION HEADER


function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <View className="mb-5 flex-row items-center">
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-500/15">
        {icon}
      </View>

      <View className="flex-1">
        <Text className="text-base font-bold text-zinc-900 dark:text-white">
          {title}
        </Text>
        <Text className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

  //  MAIN SCREEN


export default function ResumeBuilderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();

  const resumeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const isEditing = Boolean(resumeId);

  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);


    //  LOAD EXISTING RESUME
  

  useEffect(() => {
    if (resumeId) {
      loadResume(resumeId);
    }
  }, [resumeId]);

  const loadResume = async (id: string) => {
    try {
      setLoading(true);

      const response = await getResumeById(id);
      const resume = response.resume;

      setForm({
        title: resume.title || "Full Stack Developer",

        personalInfo: {
          fullName: resume.personalInfo?.fullName || "",
          email: resume.personalInfo?.email || "",
          phone: resume.personalInfo?.phone || "",
          location: resume.personalInfo?.location || "",
          linkedin: resume.personalInfo?.linkedin || "",
          github: resume.personalInfo?.github || "",
          portfolio: resume.personalInfo?.portfolio || "",
        },

        summary: resume.summary || "",
        skills: resume.skills?.join(", ") || "",

        experience: resume.experience || [],
        education: resume.education || [],
        projects: resume.projects || [],
      });
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Unable to load resume.");
    } finally {
      setLoading(false);
    }
  };


    //  FORM HANDLERS
  

  const updatePersonalInfo = (key: keyof PersonalDetails, value: string) => {
    setForm((previous) => ({
      ...previous,
      personalInfo: {
        ...previous.personalInfo,
        [key]: value,
      },
    }));
  };

  const updateForm = (key: "title" | "summary" | "skills", value: string) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };


    //  EXPERIENCE HANDLERS
  

  const addExperience = () => {
    setForm((previous) => ({
      ...previous,
      experience: [
        ...previous.experience,
        {
          company: "",
          position: "",
          location: "",
          startDate: "",
          endDate: "",
          currentlyWorking: false,
          description: "",
        },
      ],
    }));
  };

  const updateExperience = (
    index: number,
    key: keyof ResumeExperience,
    value: string | boolean
  ) => {
    setForm((previous) => ({
      ...previous,
      experience: previous.experience.map((item, i) =>
        i === index
          ? {
              ...item,
              [key]: value,
              ...(key === "endDate"
                ? {
                    currentlyWorking: String(value).toLowerCase() === "present",
                  }
                : {}),
            }
          : item
      ),
    }));
  };

  const removeExperience = (index: number) => {
    setForm((previous) => ({
      ...previous,
      experience: previous.experience.filter((_, i) => i !== index),
    }));
  };


    //  EDUCATION HANDLERS
  

  const addEducation = () => {
    setForm((previous) => ({
      ...previous,
      education: [
        ...previous.education,
        {
          institution: "",
          degree: "",
          fieldOfStudy: "",
          startDate: "",
          endDate: "",
          grade: "",
          description: "",
        },
      ],
    }));
  };

  const updateEducation = (
    index: number,
    key: keyof ResumeEducation,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      education: previous.education.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const removeEducation = (index: number) => {
    setForm((previous) => ({
      ...previous,
      education: previous.education.filter((_, i) => i !== index),
    }));
  };


    //  PROJECT HANDLERS
  

  const addProject = () => {
    setForm((previous) => ({
      ...previous,
      projects: [
        ...previous.projects,
        {
          title: "",
          description: "",
          technologies: [],
          projectUrl: "",
          githubUrl: "",
        },
      ],
    }));
  };

  const updateProject = (
    index: number,
    key: keyof ResumeProject,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      projects: previous.projects.map((item, i) =>
        i === index
          ? {
              ...item,
              [key]:
                key === "technologies"
                  ? value
                      .split(",")
                      .map((tech) => tech.trim())
                      .filter(Boolean)
                  : value,
            }
          : item
      ),
    }));
  };

  const removeProject = (index: number) => {
    setForm((previous) => ({
      ...previous,
      projects: previous.projects.filter((_, i) => i !== index),
    }));
  };


    //  SAVE RESUME
  

  const handleSave = async () => {
    const { fullName, email } = form.personalInfo;

    if (!fullName.trim()) {
      Alert.alert("Required", "Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      Alert.alert("Required", "Please enter your email address.");
      return;
    }

    const payload: CreateResumeInput = {
      title: form.title.trim() || "My Resume",

      personalInfo: {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: form.personalInfo.phone.trim(),
        location: form.personalInfo.location.trim(),
        linkedin: form.personalInfo.linkedin.trim(),
        github: form.personalInfo.github.trim(),
        portfolio: form.personalInfo.portfolio.trim(),
      },

      summary: form.summary.trim(),

      skills: form.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),

      experience: form.experience.map((item) => ({
        ...item,
        currentlyWorking:
          item.currentlyWorking ||
          item.endDate.trim().toLowerCase() === "present",
      })),

      education: form.education,

      projects: form.projects,

      languages: [],

      template: "modern",
    };

    try {
      setSaving(true);

      if (resumeId) {
        await updateResume(resumeId, payload);
      } else {
        await createResume(payload);
      }

      Alert.alert(
        "Success",
        isEditing
          ? "Resume updated successfully."
          : "Resume created successfully.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        "Save Failed",
        error?.message || "Unable to save your resume."
      );
    } finally {
      setSaving(false);
    }
  };


    //  LOADING
  

  if (loading) {
    return <PageSkeleton cards={3} />;
  }


    //  UI
  

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-zinc-50 dark:bg-[#08090d]"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* HEADER */}
      {/* HEADER */}
      <View className="border-b border-zinc-200 bg-white px-5 pb-5 pt-14 dark:border-white/10 dark:bg-[#111218]">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.8}
            className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10"
          >
            <ArrowLeft size={20} color="#8b5cf6" />
          </TouchableOpacity>

          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10">
            <FileText size={23} color="#8b5cf6" />
          </View>

          <View className="ml-3 flex-1">
            <Text className="text-xl font-bold text-zinc-900 dark:text-white">
              Resume Preview
            </Text>

            <Text className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Create and customize your resume
            </Text>
          </View>

          <TouchableOpacity
            disabled={saving}
            onPress={handleSave}
            activeOpacity={0.8}
            className="ml-2 flex-row items-center rounded-xl bg-violet-600 px-3 py-2.5"
          >
            {saving ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Save size={15} color="#ffffff" />
                <Text className="ml-2 text-xs font-bold text-white">
                  {isEditing ? "Edit Resume" : "Add Resume"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* RESUME TITLE */}
        <View className="mb-6 rounded-2xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-500/20 dark:bg-violet-500/[0.08]">
          <Text className="mb-2 text-xs font-bold text-violet-700 dark:text-violet-300">
            RESUME TITLE
          </Text>

          <TextInput
            value={form.title}
            onChangeText={(value) => updateForm("title", value)}
            placeholder="Full Stack Developer"
            placeholderTextColor="#a1a1aa"
            className="h-11 rounded-xl border border-violet-200 bg-white px-3 text-sm font-semibold text-zinc-900 dark:border-violet-500/20 dark:bg-[#11131a] dark:text-white"
          />
        </View>

        {/* PERSONAL INFORMATION */}
        <View className="mb-7 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/[0.08] dark:bg-[#11131a]">
          <SectionHeader
            icon={<UserRound size={20} color="#8b5cf6" />}
            title="Personal Information"
            subtitle="Your contact and profile details"
          />

          <Field
            label="Full Name *"
            value={form.personalInfo.fullName}
            onChangeText={(v) => updatePersonalInfo("fullName", v)}
          />

          <Field
            label="Email Address *"
            value={form.personalInfo.email}
            onChangeText={(v) => updatePersonalInfo("email", v)}
            keyboardType="email-address"
          />

          <Field
            label="Phone Number"
            value={form.personalInfo.phone}
            onChangeText={(v) => updatePersonalInfo("phone", v)}
            keyboardType="phone-pad"
          />

          <Field
            label="Location"
            value={form.personalInfo.location}
            onChangeText={(v) => updatePersonalInfo("location", v)}
          />

          <Field
            label="LinkedIn URL"
            value={form.personalInfo.linkedin}
            onChangeText={(v) => updatePersonalInfo("linkedin", v)}
            keyboardType="url"
          />

          <Field
            label="GitHub URL"
            value={form.personalInfo.github}
            onChangeText={(v) => updatePersonalInfo("github", v)}
            keyboardType="url"
          />

          <Field
            label="Portfolio URL"
            value={form.personalInfo.portfolio}
            onChangeText={(v) => updatePersonalInfo("portfolio", v)}
            keyboardType="url"
          />
        </View>

        {/* PROFESSIONAL SUMMARY */}
        <View className="mb-7 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/[0.08] dark:bg-[#11131a]">
          <SectionHeader
            icon={<FileText size={20} color="#8b5cf6" />}
            title="Professional Summary"
            subtitle="Introduce yourself professionally"
          />

          <Field
            label="Summary"
            value={form.summary}
            onChangeText={(v) => updateForm("summary", v)}
            placeholder="Write a short professional summary..."
            multiline
          />
        </View>

        {/* EXPERIENCE */}
        <View className="mb-7 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/[0.08] dark:bg-[#11131a]">
          <SectionHeader
            icon={<BriefcaseBusiness size={20} color="#8b5cf6" />}
            title="Work Experience"
            subtitle="Add your professional experience"
          />

          {form.experience.map((item, index) => (
            <View
              key={index}
              className="mb-5 rounded-xl border border-zinc-200 p-3 dark:border-white/[0.08]"
            >
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-sm font-bold text-zinc-900 dark:text-white">
                  Experience {index + 1}
                </Text>

                <TouchableOpacity onPress={() => removeExperience(index)}>
                  <Trash2 size={17} color="#ef4444" />
                </TouchableOpacity>
              </View>

              <Field
                label="Job Title"
                value={item.position}
                onChangeText={(v) => updateExperience(index, "position", v)}
              />

              <Field
                label="Company"
                value={item.company}
                onChangeText={(v) => updateExperience(index, "company", v)}
              />

              <Field
                label="Location"
                value={item.location || ""}
                onChangeText={(v) => updateExperience(index, "location", v)}
              />

              <Field
                label="Start Date"
                value={item.startDate}
                onChangeText={(v) => updateExperience(index, "startDate", v)}
                placeholder="e.g. Jan 2022"
              />

              <Field
                label="End Date"
                value={item.endDate}
                onChangeText={(v) => updateExperience(index, "endDate", v)}
                placeholder="e.g. Present"
              />

              <Field
                label="Description"
                value={item.description}
                onChangeText={(v) => updateExperience(index, "description", v)}
                multiline
              />
            </View>
          ))}

          <TouchableOpacity
            onPress={addExperience}
            className="flex-row items-center justify-center rounded-xl border border-dashed border-violet-400 py-3"
          >
            <Plus size={17} color="#8b5cf6" />
            <Text className="ml-2 text-sm font-semibold text-violet-600 dark:text-violet-400">
              Add Experience
            </Text>
          </TouchableOpacity>
        </View>

        {/* EDUCATION */}
        <View className="mb-7 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/[0.08] dark:bg-[#11131a]">
          <SectionHeader
            icon={<GraduationCap size={20} color="#8b5cf6" />}
            title="Education"
            subtitle="Add your academic qualifications"
          />

          {form.education.map((item, index) => (
            <View
              key={index}
              className="mb-5 rounded-xl border border-zinc-200 p-3 dark:border-white/[0.08]"
            >
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-sm font-bold text-zinc-900 dark:text-white">
                  Education {index + 1}
                </Text>

                <TouchableOpacity onPress={() => removeEducation(index)}>
                  <Trash2 size={17} color="#ef4444" />
                </TouchableOpacity>
              </View>

              <Field
                label="Degree"
                value={item.degree}
                onChangeText={(v) => updateEducation(index, "degree", v)}
              />

              <Field
                label="Institution"
                value={item.institution}
                onChangeText={(v) => updateEducation(index, "institution", v)}
              />

              <Field
                label="Field of Study"
                value={item.fieldOfStudy || ""}
                onChangeText={(v) => updateEducation(index, "fieldOfStudy", v)}
              />

              <Field
                label="Start Date"
                value={item.startDate}
                onChangeText={(v) => updateEducation(index, "startDate", v)}
                placeholder="e.g. 2018"
              />

              <Field
                label="End Date"
                value={item.endDate}
                onChangeText={(v) => updateEducation(index, "endDate", v)}
                placeholder="e.g. 2022"
              />

              <Field
                label="Grade"
                value={item.grade || ""}
                onChangeText={(v) => updateEducation(index, "grade", v)}
              />

              <Field
                label="Description"
                value={item.description || ""}
                onChangeText={(v) => updateEducation(index, "description", v)}
                multiline
              />
            </View>
          ))}

          <TouchableOpacity
            onPress={addEducation}
            className="flex-row items-center justify-center rounded-xl border border-dashed border-violet-400 py-3"
          >
            <Plus size={17} color="#8b5cf6" />
            <Text className="ml-2 text-sm font-semibold text-violet-600 dark:text-violet-400">
              Add Education
            </Text>
          </TouchableOpacity>
        </View>

        {/* SKILLS */}
        <View className="mb-7 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/[0.08] dark:bg-[#11131a]">
          <SectionHeader
            icon={<Code2 size={20} color="#8b5cf6" />}
            title="Technical Skills"
            subtitle="Add your technical and professional skills"
          />

          <Field
            label="Skills"
            value={form.skills}
            onChangeText={(v) => updateForm("skills", v)}
            placeholder="React, Node.js, MongoDB, TypeScript..."
            multiline
          />

          <Text className="mt-[-8px] text-[11px] text-zinc-500 dark:text-zinc-400">
            Separate each skill using a comma.
          </Text>
        </View>

        {/* PROJECTS */}
        <View className="mb-7 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/[0.08] dark:bg-[#11131a]">
          <SectionHeader
            icon={<Code2 size={20} color="#8b5cf6" />}
            title="Projects"
            subtitle="Showcase your development projects"
          />

          {form.projects.map((item, index) => (
            <View
              key={index}
              className="mb-5 rounded-xl border border-zinc-200 p-3 dark:border-white/[0.08]"
            >
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-sm font-bold text-zinc-900 dark:text-white">
                  Project {index + 1}
                </Text>

                <TouchableOpacity onPress={() => removeProject(index)}>
                  <Trash2 size={17} color="#ef4444" />
                </TouchableOpacity>
              </View>

              <Field
                label="Project Name"
                value={item.title}
                onChangeText={(v) => updateProject(index, "title", v)}
              />

              <Field
                label="Technologies"
                value={item.technologies.join(", ")}
                onChangeText={(v) => updateProject(index, "technologies", v)}
                placeholder="React, Node.js, MongoDB"
              />

              <Field
                label="Project URL"
                value={item.projectUrl || ""}
                onChangeText={(v) => updateProject(index, "projectUrl", v)}
                keyboardType="url"
              />

              <Field
                label="GitHub URL"
                value={item.githubUrl || ""}
                onChangeText={(v) => updateProject(index, "githubUrl", v)}
                keyboardType="url"
              />

              <Field
                label="Description"
                value={item.description}
                onChangeText={(v) => updateProject(index, "description", v)}
                multiline
              />
            </View>
          ))}

          <TouchableOpacity
            onPress={addProject}
            className="flex-row items-center justify-center rounded-xl border border-dashed border-violet-400 py-3"
          >
            <Plus size={17} color="#8b5cf6" />
            <Text className="ml-2 text-sm font-semibold text-violet-600 dark:text-violet-400">
              Add Project
            </Text>
          </TouchableOpacity>
        </View>

        {/* BOTTOM SAVE BUTTON */}
        <TouchableOpacity
          disabled={saving}
          onPress={handleSave}
          className="mb-5 h-14 flex-row items-center justify-center rounded-xl bg-violet-600"
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Save size={18} color="#ffffff" />
              <Text className="ml-2 text-sm font-bold text-white">
                {isEditing ? "Update Resume" : "Save Resume"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
