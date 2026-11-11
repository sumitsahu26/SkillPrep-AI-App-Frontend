import React from "react";
import { FileCheck } from "lucide-react-native";
import LegalInfoScreen from "../components/LegalInfoScreen";

export default function TermsAndConditionsScreen() {
  return (
    <LegalInfoScreen
      title="Terms & Conditions"
      subtitle="Please read these terms before using SkillPrep AI"
      icon={FileCheck}
      sections={[
        {
          title: "Acceptance of Terms",
          body:
            "By accessing or using SkillPrep AI, you agree to these Terms and Conditions. If you do not agree, please discontinue using the application.",
        },
        {
          title: "About the Service",
          body:
            "SkillPrep AI provides tools for interview preparation, resume creation, skill assessments, personalized learning roadmaps, and AI-assisted career guidance.",
        },
        {
          title: "User Accounts",
          bullets: [
            "You are responsible for providing accurate account information.",
            "You must keep your login credentials secure.",
            "You are responsible for activities performed through your account.",
            "You should notify us if you suspect unauthorized access to your account.",
          ],
        },
        {
          title: "Acceptable Use",
          body:
            "You agree to use SkillPrep AI only for lawful purposes. You must not:",
          bullets: [
            "Attempt to access another user's account or private information.",
            "Upload malicious files or harmful content.",
            "Interfere with the application's operation or security.",
            "Use the service for unlawful, fraudulent, or abusive activities.",
            "Copy, resell, or exploit the application without authorization.",
          ],
        },
        {
          title: "Resumes and User Content",
          body:
            "You retain responsibility for the information, resumes, documents, answers, and other content you submit. You must have the necessary rights to upload and use that content. You are responsible for reviewing generated resumes before sharing or submitting them to employers.",
        },
        {
          title: "AI-Generated Content",
          body:
            "AI-generated interview questions, answers, feedback, and career suggestions are provided for educational and informational purposes. AI responses may be inaccurate, incomplete, or outdated. You should independently verify important information and must not treat AI output as a guarantee of employment, interview success, or professional qualification.",
        },
        {
          title: "No Employment Guarantee",
          body:
            "SkillPrep AI is a preparation and learning tool. We do not guarantee job placement, interview selection, salary increases, or any particular career outcome.",
        },
        {
          title: "Intellectual Property",
          body:
            "The application's branding, design, software, and original content are owned by or licensed to the app operator. You may not reproduce or commercially exploit these materials without permission. Ownership of user-submitted content remains subject to applicable rights.",
        },
        {
          title: "Availability and Changes",
          body:
            "We may update, modify, suspend, or discontinue features to maintain or improve the service. We will make reasonable efforts to communicate significant service changes where appropriate.",
        },
        {
          title: "Account Suspension or Termination",
          body:
            "We may restrict or suspend access where reasonably necessary to protect the service, users, or comply with applicable law. The app operator should establish a fair process for account termination and handling user data.",
        },
        {
          title: "Limitation of Liability",
          body:
            "To the extent permitted by applicable law, the app operator is not responsible for losses resulting from reliance on unverified AI-generated content, user-provided information, or temporary service interruptions. Nothing in these terms excludes liability that cannot legally be excluded.",
        },
        {
          title: "Changes to These Terms",
          body:
            "We may revise these Terms and Conditions from time to time. Updated terms will be published in the application with a revised effective date.",
        },
        {
          title: "Governing Law and Contact",
          body:
            "These terms should be reviewed and finalized for the app operator's legal identity and applicable jurisdiction before publication. For questions, contact: [YOUR SUPPORT EMAIL].",
        },
      ]}
    />
  );
}