import React from "react";
import { Sparkles } from "lucide-react-native";
import LegalInfoScreen from "../components/LegalInfoScreen";

export default function AboutScreen() {
  return (
    <LegalInfoScreen
      title="About SkillPrep AI"
      subtitle="Your AI-powered career preparation companion"
      icon={Sparkles}
      sections={[
        {
          title: "Welcome to SkillPrep AI",
          body:
            "SkillPrep AI is designed to help developers and job seekers prepare for technical interviews, improve their skills, and build professional resumes. Our goal is to make career preparation more organized, accessible, and effective.",
        },
        {
          title: "Interview Preparation",
          body:
            "Practice technical interview questions and improve your understanding of different technologies.",
          bullets: [
            "Technology-wise interview questions",
            "Topic and difficulty-based filtering",
            "Save questions and track completed questions",
          ],
        },
        {
          title: "AI Mock Interviews",
          body:
            "Practice interview sessions and receive feedback to help identify areas where you can improve.",
        },
        {
          title: "Resume Builder",
          body:
            "Create, customize, preview, and manage professional resumes with structured personal, education, experience, and project information.",
        },
        {
          title: "Skill Assessment",
          body:
            "Evaluate your technical knowledge, understand your strengths, and identify topics that need more practice.",
        },
        {
          title: "Personalized Learning Roadmap",
          body:
            "Organize your learning journey with technology-based roadmaps, topics, progress tracking, and schedules.",
        },
        {
          title: "AI Mentor",
          body:
            "Get assistance with programming concepts, interview preparation, technical questions, and career learning guidance.",
        },
        {
          title: "Our Mission",
          body:
            "We want to help learners become more confident, improve their technical knowledge, and prepare for better career opportunities.",
        },
        {
          title: "App Information",
          bullets: [
            "Application: SkillPrep AI",
            "Category: Education and Career Development",
            "Version: 1.0.0 (update this to your actual app version)",
          ],
        },
      ]}
    />
  );
}