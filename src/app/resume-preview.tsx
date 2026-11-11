import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { WebView } from "react-native-webview";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import {
  ArrowLeft,
  Check,
  Download,
  Eye,
  FileText,
  Share2,
} from "lucide-react-native";

import { getResumeById } from "../services/resumeApi";
import PageSkeleton from "@/components/PageSkeleton";

/* =========================================================
   TYPES
========================================================= */

interface PersonalInfo {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

interface Experience {
  company?: string;
  position?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  currentlyWorking?: boolean;
  description?: string;
}

interface Education {
  institution?: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  grade?: string;
  description?: string;
}

interface Project {
  title?: string;
  description?: string;
  technologies?: string[];
  projectUrl?: string;
  githubUrl?: string;
}

interface ResumeData {
  _id: string;
  title?: string;
  personalInfo?: PersonalInfo;
  summary?: string;
  skills?: string[];
  experience?: Experience[];
  education?: Education[];
  projects?: Project[];
  languages?: string[];
  template?: string;
}

type TemplateType = "modern" | "classic" | "creative" | "minimal";

const templates: {
  id: TemplateType;
  name: string;
  description: string;
}[] = [
  {
    id: "modern",
    name: "Modern",
    description: "Purple professional design",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional black and white",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Colorful sidebar layout",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple and clean design",
  },
];

/* =========================================================
   HTML HELPERS
========================================================= */

const escapeHtml = (value?: string) => {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const formatDate = (value?: string) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return escapeHtml(value);

  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
};

/* =========================================================
   RESUME HTML GENERATOR
========================================================= */

const generateResumeHTML = (resume: ResumeData, template: TemplateType) => {
  const personal = resume.personalInfo || {};

  const name = escapeHtml(personal.fullName || "Your Name");
  const email = escapeHtml(personal.email);
  const phone = escapeHtml(personal.phone);
  const location = escapeHtml(personal.location);
  const summary = escapeHtml(resume.summary);

  const contact = [email, phone, location]
    .filter(Boolean)
    .join(" &nbsp; | &nbsp; ");

  const links = [personal.linkedin, personal.github, personal.portfolio]
    .filter(Boolean)
    .map((link) => {
      const safeLink = escapeHtml(link);
      return `<span>${safeLink}</span>`;
    })
    .join(" &nbsp; | &nbsp; ");

  const skills = (resume.skills || [])
    .map((skill) => `<span class="skill">${escapeHtml(skill)}</span>`)
    .join("");

  const experience = (resume.experience || [])
    .map(
      (item) => `
        <div class="item">
          <div class="item-heading">
            <strong>${escapeHtml(item.position)}</strong>
            <span>${formatDate(item.startDate)} - ${
        item.currentlyWorking ? "Present" : formatDate(item.endDate)
      }</span>
          </div>
          <div class="subheading">
            ${escapeHtml(item.company)}
            ${item.location ? ` | ${escapeHtml(item.location)}` : ""}
          </div>
          <p>${escapeHtml(item.description)}</p>
        </div>
      `
    )
    .join("");

  const education = (resume.education || [])
    .map(
      (item) => `
        <div class="item">
          <div class="item-heading">
            <strong>${escapeHtml(item.degree)}</strong>
            <span>${formatDate(item.startDate)} - ${formatDate(
        item.endDate
      )}</span>
          </div>
          <div class="subheading">
            ${escapeHtml(item.institution)}
            ${item.fieldOfStudy ? ` | ${escapeHtml(item.fieldOfStudy)}` : ""}
          </div>
          ${item.grade ? `<p>Grade: ${escapeHtml(item.grade)}</p>` : ""}
          ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
        </div>
      `
    )
    .join("");

  const projects = (resume.projects || [])
    .map(
      (item) => `
        <div class="item">
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.description)}</p>
          ${
            item.technologies?.length
              ? `<p><b>Technologies:</b> ${item.technologies
                  .map(escapeHtml)
                  .join(", ")}</p>`
              : ""
          }
          ${
            item.projectUrl
              ? `<p><b>Project:</b> ${escapeHtml(item.projectUrl)}</p>`
              : ""
          }
          ${
            item.githubUrl
              ? `<p><b>GitHub:</b> ${escapeHtml(item.githubUrl)}</p>`
              : ""
          }
        </div>
      `
    )
    .join("");

  const languages = (resume.languages || [])
    .map((language) => `<span class="skill">${escapeHtml(language)}</span>`)
    .join("");

  const themeStyles: Record<TemplateType, string> = {
    modern: `
      body { font-family: Arial, sans-serif; color: #27223a; }
      .header { background: #6d28d9; color: white; padding: 28px; }
      .header h1 { color: white; }
      .section-title { color: #6d28d9; border-bottom: 2px solid #ddd6fe; }
      .skill { background: #ede9fe; color: #5b21b6; }
    `,
    classic: `
      body { font-family: Georgia, serif; color: #222; }
      .header { text-align: center; border-bottom: 2px solid #222; padding: 25px 10px; }
      .section-title { color: #222; border-bottom: 1px solid #555; }
      .skill { background: #eee; color: #222; }
    `,
    creative: `
      body { font-family: Arial, sans-serif; color: #253047; }
      .header { background: #164e63; color: white; padding: 28px; }
      .header h1 { color: white; }
      .section-title { color: #0e7490; border-bottom: 2px solid #a5f3fc; }
      .skill { background: #cffafe; color: #155e75; }
    `,
    minimal: `
      body { font-family: Arial, sans-serif; color: #333; }
      .header { padding: 25px 0; border-bottom: 1px solid #ddd; }
      .section-title { color: #333; border-bottom: 1px solid #ddd; }
      .skill { background: #f1f1f1; color: #333; }
    `,
  };

  const sections = `
    ${
      summary
        ? `
          <section>
            <h2 class="section-title">Professional Summary</h2>
            <p>${summary}</p>
          </section>
        `
        : ""
    }

    ${
      skills
        ? `
          <section>
            <h2 class="section-title">Skills</h2>
            <div class="skills">${skills}</div>
          </section>
        `
        : ""
    }

    ${
      experience
        ? `
          <section>
            <h2 class="section-title">Work Experience</h2>
            ${experience}
          </section>
        `
        : ""
    }

    ${
      education
        ? `
          <section>
            <h2 class="section-title">Education</h2>
            ${education}
          </section>
        `
        : ""
    }

    ${
      projects
        ? `
          <section>
            <h2 class="section-title">Projects</h2>
            ${projects}
          </section>
        `
        : ""
    }

    ${
      languages
        ? `
          <section>
            <h2 class="section-title">Languages</h2>
            <div class="skills">${languages}</div>
          </section>
        `
        : ""
    }
  `;

  const creativeHeader = `
    <div class="header">
      <h1>${name}</h1>
      <div class="contact">${contact}</div>
      <div class="links">${links}</div>
    </div>
  `;

  const normalHeader = `
    <div class="header">
      <h1>${name}</h1>
      <div class="contact">${contact}</div>
      <div class="links">${links}</div>
    </div>
  `;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; padding: 30px; font-size: 12px; line-height: 1.6; }
          h1 { font-size: 27px; margin: 0 0 8px; }
          .header { margin-bottom: 22px; }
          .contact, .links { font-size: 10px; margin-top: 5px; }
          section { margin-top: 20px; }
          .section-title { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 5px; margin-bottom: 12px; }
          .item { margin-bottom: 14px; page-break-inside: avoid; }
          .item-heading { display: flex; justify-content: space-between; gap: 12px; }
          .item-heading span { font-size: 10px; white-space: nowrap; }
          .subheading { font-size: 11px; font-weight: bold; color: #666; }
          p { margin: 5px 0; white-space: pre-wrap; }
          .skills { display: flex; flex-wrap: wrap; gap: 7px; }
          .skill { display: inline-block; padding: 4px 9px; border-radius: 4px; margin: 2px; }
          ${themeStyles[template]}
          @media print {
            body { padding: 20px; }
            section, .item { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        ${template === "creative" ? creativeHeader : normalHeader}
        ${sections}
      </body>
    </html>
  `;
};

/* =========================================================
   SCREEN
========================================================= */

export default function ResumePreviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [resume, setResume] = useState<ResumeData | null>(null);
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateType>("modern");

  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const fetchResume = useCallback(async () => {
    try {
      setLoading(true);

      if (!id) {
        throw new Error("Resume ID is missing.");
      }

      const response = await getResumeById(id);

      if (!response?.resume) {
        throw new Error("Resume not found.");
      }

      setResume(response.resume);
      setSelectedTemplate(
        templates.some((item) => item.id === response.resume.template)
          ? (response.resume.template as TemplateType)
          : "modern"
      );
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Unable to load resume.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchResume();
  }, [fetchResume]);

  const html = useMemo(() => {
    if (!resume) return "";
    return generateResumeHTML(resume, selectedTemplate);
  }, [resume, selectedTemplate]);

  const handleDownload = async () => {
    if (!html || downloading) return;

    try {
      setDownloading(true);

      await Print.printAsync({
        html,
      });
    } catch (error: any) {
      console.error("Resume PDF Error:", error);

      Alert.alert(
        "PDF Error",
        error?.message || "Unable to open PDF print dialog."
      );
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <PageSkeleton cards={3} />;
  }

  if (!resume) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-50 px-6 dark:bg-[#08090d]">
        <FileText size={42} color="#8b5cf6" />
        <Text className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">
          Resume not found
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-5 rounded-xl bg-violet-600 px-5 py-3"
        >
          <Text className="font-semibold text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-[#08090d]">
      {/* HEADER */}
      <View className="bg-violet-600 px-5 pb-5 pt-14">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-white/15"
          >
            <ArrowLeft size={20} color="#ffffff" />
          </TouchableOpacity>

          <View className="flex-1">
            <Text className="text-xl font-bold text-white">Resume Preview</Text>
            <Text className="mt-1 text-xs text-violet-200">
              Preview and customize your resume.
            </Text>
          </View>

          <TouchableOpacity
            disabled={downloading}
            onPress={handleDownload}
            className="flex-row items-center rounded-xl bg-white px-3 py-2.5"
          >
            {downloading ? (
              <ActivityIndicator size="small" color="#7c3aed" />
            ) : (
              <>
                <Download size={16} color="#7c3aed" />
                <Text className="ml-2 text-xs font-bold text-violet-700">
                  PDF
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        {/* TEMPLATE SELECTOR */}
        <View className="px-5 pt-5">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-base font-bold text-zinc-900 dark:text-white">
              Choose Template
            </Text>
            <Text className="text-xs text-zinc-500 dark:text-zinc-400">
              {templates.length} Designs
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10 }}
          >
            {templates.map((template) => {
              const active = selectedTemplate === template.id;

              return (
                <TouchableOpacity
                  key={template.id}
                  onPress={() => setSelectedTemplate(template.id)}
                  className={`w-32 rounded-xl border p-3 ${
                    active
                      ? "border-violet-500 bg-violet-50 dark:bg-violet-500/10"
                      : "border-zinc-200 bg-white dark:border-white/10 dark:bg-[#11131a]"
                  }`}
                >
                  <View className="mb-2 h-20 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                    <FileText
                      size={32}
                      color={active ? "#8b5cf6" : "#a1a1aa"}
                    />
                  </View>

                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-bold text-zinc-900 dark:text-white">
                      {template.name}
                    </Text>

                    {active && <Check size={16} color="#8b5cf6" />}
                  </View>

                  <Text
                    className="mt-1 text-[10px] text-zinc-500 dark:text-zinc-400"
                    numberOfLines={2}
                  >
                    {template.description}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* PREVIEW HEADING */}
        <View className="mb-3 mt-6 flex-row items-center justify-between px-5">
          <View>
            <Text className="text-base font-bold text-zinc-900 dark:text-white">
              Live Preview
            </Text>
            <Text className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {resume.title || "Professional Resume"} · {selectedTemplate}
            </Text>
          </View>

          <Eye size={19} color="#8b5cf6" />
        </View>

        {/* RESUME DOCUMENT */}
        <View className="mx-3 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-white/10">
          <WebView
            key={selectedTemplate}
            originWhitelist={["*"]}
            source={{ html }}
            style={{ height: 850, backgroundColor: "#ffffff" }}
            scrollEnabled
            showsVerticalScrollIndicator={false}
            javaScriptEnabled={false}
          />
        </View>

        {/* BOTTOM ACTION */}
        <View className="mt-5 flex-row gap-3 px-5">
          <TouchableOpacity
            disabled={downloading}
            onPress={handleDownload}
            className="flex-1 flex-row items-center justify-center rounded-xl bg-violet-600 py-4"
          >
            {downloading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Download size={18} color="#ffffff" />
                <Text className="ml-2 text-sm font-bold text-white">
                  Download PDF
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDownload}
            disabled={downloading}
            className="h-14 w-14 items-center justify-center rounded-xl border border-violet-200 bg-violet-50 dark:border-violet-500/20 dark:bg-violet-500/10"
          >
            <Share2 size={20} color="#8b5cf6" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
