import React from "react";
import { ShieldCheck } from "lucide-react-native";
import LegalInfoScreen from "../components/LegalInfoScreen";

export default function PrivacyPolicyScreen() {
  return (
    <LegalInfoScreen
      title="Privacy Policy"
      subtitle="Your privacy and data protection matter to us"
      icon={ShieldCheck}
      sections={[
        {
          title: "Introduction",
          body:
            "This Privacy Policy explains how SkillPrep AI collects, uses, stores, and handles information when you use our mobile application and related services.",
        },
        {
          title: "Information We Collect",
          body:
            "Depending on the features you use, we may collect the following information:",
          bullets: [
            "Account information such as your name and email address.",
            "Google account information when you choose Google Sign-In.",
            "Profile information such as phone number, location, professional headline, skills, and work experience.",
            "Resume information, including uploaded resume files and the information you enter into the resume builder.",
            "Interview practice answers, assessment results, bookmarks, and learning progress.",
            "Messages and prompts submitted when using AI Mentor or other AI-powered features.",
            "Basic technical information required to operate and troubleshoot the application.",
          ],
        },
        {
          title: "How We Use Your Information",
          bullets: [
            "To create and manage your account.",
            "To provide resume creation and profile management features.",
            "To save your interview preparation progress and assessment results.",
            "To generate AI-powered responses and learning assistance when you use those features.",
            "To maintain, secure, and improve the application.",
            "To respond to support requests and important service communications.",
          ],
        },
        {
          title: "AI-Powered Features",
          body:
            "When you use AI Mentor, AI question generation, or other AI-powered features, the information you submit may be sent to an external AI service provider to generate a response. Do not submit passwords, financial information, or other sensitive information in AI prompts. Before publishing this policy, identify the actual AI providers used and review their data handling and retention terms.",
        },
        {
          title: "Storage and Security",
          body:
            "Account and application information may be stored on our backend servers and associated storage services. We use reasonable technical and organizational measures intended to protect information against unauthorized access, alteration, disclosure, or loss. No online service can guarantee absolute security.",
        },
        {
          title: "Sharing of Information",
          body:
            "Information may be processed by service providers that help us operate authentication, hosting, file storage, and AI features. We should identify these providers and the purposes for which they process information before this policy is published. We do not claim that no third-party processing occurs.",
        },
        {
          title: "Data Retention",
          body:
            "We retain information for as long as necessary to provide the services, maintain your account, meet applicable legal obligations, and resolve disputes. Actual retention periods for accounts, resumes, uploaded files, and AI conversations should be specified by the app operator.",
        },
        {
          title: "Your Privacy Choices and Rights",
          bullets: [
            "You can review and update supported profile information in the app.",
            "You can contact us to request access to, correction of, or deletion of your personal information, subject to applicable law.",
            "You may stop using AI features if you do not want to submit prompts to those services.",
            "You may request account deletion through the support contact once the account deletion process is available.",
          ],
        },
        {
          title: "Children's Privacy",
          body:
            "SkillPrep AI is not intentionally designed to collect personal information from children without the required consent or authorization. The app operator should define and enforce an appropriate minimum-age policy.",
        },
        {
          title: "Changes to This Policy",
          body:
            "We may update this Privacy Policy when our services, data practices, or legal requirements change. The latest version and its effective date will be made available in the application.",
        },
        {
          title: "Contact and Grievances",
          body:
            "For privacy questions, data requests, or complaints, contact: [YOUR SUPPORT EMAIL]. Replace this placeholder with an active support address and provide the appropriate grievance contact details before publishing.",
        },
      ]}
    />
  );
}