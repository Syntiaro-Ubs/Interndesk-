import React, { useState } from "react";
import { X, Shield, FileText, Lock, CheckCircle2 } from "lucide-react";
import logoUrl from "../../../assets/interndesknewlogos.png";

function LegalModal({ activeTab, setActiveTab, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-[#e0dfdc] overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e0dfdc] flex items-center justify-between bg-[#f8fafc]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0a66c2]/10 text-[#0a66c2] flex items-center justify-center">
              {activeTab === "privacy" ? <Lock className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                {activeTab === "privacy" ? "Privacy Policy" : "Terms & Conditions"}
              </h3>
              <p className="text-[11px] text-muted-foreground">InternDesk Corporation • Last updated October 2026</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[#e0dfdc] px-6 bg-white gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("privacy")}
            className={`py-3 border-b-2 -mb-px transition-colors cursor-pointer ${
              activeTab === "privacy"
                ? "border-[#0a66c2] text-[#0a66c2]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab("terms")}
            className={`py-3 border-b-2 -mb-px transition-colors cursor-pointer ${
              activeTab === "terms"
                ? "border-[#0a66c2] text-[#0a66c2]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Terms & Conditions
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-black/80 leading-relaxed font-sans">
          {activeTab === "privacy" ? (
            <>
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1.5">1. Overview & Commitment</h4>
                <p>
                  At InternDesk, we prioritize the privacy and security of students, educators, and hiring partners.
                  This Privacy Policy outlines how your personal data is collected, stored, and protected when you use our platform.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-foreground mb-1.5">2. Information We Collect</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Account Credentials:</strong> Full name, verified email address, role, and encrypted passwords.</li>
                  <li><strong>Student Profile Data:</strong> Educational background, university degree, GPA, technical skills, and resume assets.</li>
                  <li><strong>Employer & Corporate Data:</strong> Company name, registered domain, recruiter designation, and internship details.</li>
                  <li><strong>Application Records:</strong> Internship applications, screening statuses, and messaging exchanges.</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-bold text-foreground mb-1.5">3. How Information is Used</h4>
                <p>
                  Data is processed exclusively to connect students with verified employers, power intelligent internship recommendations,
                  deliver status notifications, and enable real-time recruiter-candidate messaging. We do not sell user data to third parties.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-foreground mb-1.5">4. Data Security & Storage</h4>
                <p>
                  All database transactions and file uploads are secured using industry-standard TLS encryption, strict password hashing,
                  and role-based authorization controls.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-foreground mb-1.5">5. Your Rights</h4>
                <p>
                  You retain complete ownership of your personal data. You can inspect, update, or remove your profile information and resume
                  at any time from your Account Settings.
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1.5">1. Acceptance of Terms</h4>
                <p>
                  By registering or using the InternDesk platform, you agree to comply with and be bound by these Terms and Conditions.
                  If you disagree with any part of these terms, you must not use our services.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-foreground mb-1.5">2. User Verification & Accounts</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Students:</strong> Must submit accurate educational credentials, skills, and genuine application materials.</li>
                  <li><strong>Employers:</strong> Must register using legitimate corporate domains and offer genuine internship positions with transparent stipends.</li>
                  <li>Fraudulent accounts or deceptive listings are subject to immediate suspension by platform administrators.</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-bold text-foreground mb-1.5">3. Platform Rules & Conduct</h4>
                <p>
                  Users agree not to upload harmful content, harvest candidate information without authorization, or circumvent the platform&apos;s
                  fair recruitment workflows. All communication in candidate messaging must remain professional and respectful.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-foreground mb-1.5">4. Limitation of Liability</h4>
                <p>
                  InternDesk functions as a career matching and discovery platform. While we rigorously verify hiring companies and listings,
                  we are not a party to direct employment agreements between candidates and hiring organizations.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-foreground mb-1.5">5. Termination & Modifications</h4>
                <p>
                  InternDesk reserves the right to amend these terms to reflect new regulatory requirements or platform features. Continued use
                  constitutes agreement to the latest terms.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#e0dfdc] bg-[#f8fafc] flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Legally Binding Agreement
          </span>
          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-[#0a66c2] text-white rounded-full text-xs font-semibold hover:bg-[#004182] transition-colors cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}

function Footer({
  setView,
  setAuthParams,
  userRole
}) {
  const [legalModal, setLegalModal] = useState(null);

  const handlePostInternship = () => {
    if (userRole === "company") {
      setView("company-portal");
    } else {
      setAuthParams?.({ mode: "register", role: "company" });
      setView("auth");
    }
  };

  const handleSignIn = () => {
    setAuthParams?.({ mode: "login", role: "student" });
    setView("auth");
  };

  const handleJoinNow = () => {
    setAuthParams?.({ mode: "register", role: "student" });
    setView("auth");
  };

  const handleAdminLogin = () => {
    setAuthParams?.({ mode: "login", role: "admin" });
    setView("auth");
  };

  return (
    <>
      {legalModal && (
        <LegalModal
          activeTab={legalModal}
          setActiveTab={setLegalModal}
          onClose={() => setLegalModal(null)}
        />
      )}

      <footer className="hidden md:block bg-white border-t border-[#e0dfdc] py-6 text-xs text-black/60 font-sans">
        <div className="max-w-[1128px] mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-6">
            <img src={logoUrl} alt="InternDesk" className="h-6" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-6">
            <div>
              <h4 className="font-semibold text-black/80 text-xs mb-3">General</h4>
              <ul className="space-y-2">
                <li>
                  <button type="button" onClick={handleJoinNow} className="hover:text-[#0a66c2] hover:underline cursor-pointer">
                    Join Now
                  </button>
                </li>
                <li>
                  <button type="button" onClick={handleSignIn} className="hover:text-[#0a66c2] hover:underline cursor-pointer">
                    Sign In
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setView("landing")} className="hover:text-[#0a66c2] hover:underline cursor-pointer">
                    About InternDesk
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setView("career-resources")} className="hover:text-[#0a66c2] hover:underline cursor-pointer">
                    Career Articles
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setView("help")} className="hover:text-[#0a66c2] hover:underline cursor-pointer">
                    Help Center
                  </button>
                </li>
                <li>
                  <button type="button" onClick={handleAdminLogin} className="hover:text-[#0a66c2] hover:underline cursor-pointer font-medium text-black/70">
                    Admin Portal
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-black/80 text-xs mb-3">Browse InternDesk</h4>
              <ul className="space-y-2">
                <li>
                  <button type="button" onClick={() => setView("search")} className="hover:text-[#0a66c2] hover:underline cursor-pointer">
                    Browse Internships
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setView("companies")} className="hover:text-[#0a66c2] hover:underline cursor-pointer">
                    Explore Companies
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setView("search")} className="hover:text-[#0a66c2] hover:underline cursor-pointer">
                    Remote Opportunities
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setView("search")} className="hover:text-[#0a66c2] hover:underline cursor-pointer">
                    Engineering & Tech
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setView("search")} className="hover:text-[#0a66c2] hover:underline cursor-pointer">
                    Business & Finance
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-black/80 text-xs mb-3">Business Solutions</h4>
              <ul className="space-y-2">
                <li>
                  <button type="button" onClick={handlePostInternship} className="hover:text-[#0a66c2] hover:underline cursor-pointer">
                    Post an Internship
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setView("companies")} className="hover:text-[#0a66c2] hover:underline cursor-pointer">
                    Employer Directory
                  </button>
                </li>
                <li>
                  <button type="button" onClick={handlePostInternship} className="hover:text-[#0a66c2] hover:underline cursor-pointer">
                    Campus Recruitment
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-black/80 text-xs mb-3">Student Resources</h4>
              <ul className="space-y-2">
                <li>
                  <button type="button" onClick={() => setView("resume-builder")} className="hover:text-[#0a66c2] hover:underline cursor-pointer">
                    Free ATS Resume Builder
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setView("career-resources")} className="hover:text-[#0a66c2] hover:underline cursor-pointer">
                    Interview Prep
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setView("career-resources")} className="hover:text-[#0a66c2] hover:underline cursor-pointer">
                    Career Advice & Roadmaps
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-black/80 text-xs mb-3">Legal & Safety</h4>
              <ul className="space-y-2">
                <li>
                  <button type="button" onClick={() => setLegalModal("privacy")} className="hover:text-[#0a66c2] hover:underline cursor-pointer font-medium text-black/80">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setLegalModal("terms")} className="hover:text-[#0a66c2] hover:underline cursor-pointer font-medium text-black/80">
                    Terms &amp; Conditions
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setLegalModal("terms")} className="hover:text-[#0a66c2] hover:underline cursor-pointer">
                    User Agreement
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setLegalModal("privacy")} className="hover:text-[#0a66c2] hover:underline cursor-pointer">
                    Cookie Policy
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setView("help")} className="hover:text-[#0a66c2] hover:underline cursor-pointer">
                    Copyright &amp; Safety
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar with direct Privacy Policy & Terms Links */}
          <div className="pt-6 border-t border-[#e0dfdc] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start text-[11px] text-black/70">
              <span className="font-semibold text-black/80">© 2026 InternDesk Corporation</span>
              <span>•</span>
              <button
                type="button"
                onClick={() => setLegalModal("privacy")}
                className="hover:text-[#0a66c2] hover:underline cursor-pointer font-semibold text-black/80"
              >
                Privacy Policy
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setLegalModal("terms")}
                className="hover:text-[#0a66c2] hover:underline cursor-pointer font-semibold text-black/80"
              >
                Terms &amp; Conditions
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setLegalModal("terms")}
                className="hover:text-[#0a66c2] hover:underline cursor-pointer"
              >
                User Agreement
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setLegalModal("privacy")}
                className="hover:text-[#0a66c2] hover:underline cursor-pointer"
              >
                Cookie Policy
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setView("help")}
                className="hover:text-[#0a66c2] hover:underline cursor-pointer"
              >
                Help Center
              </button>
            </div>
            <p className="text-black/60 text-xs font-semibold tracking-wide">
              Design &amp; Developed by{" "}
              <a
                href="https://www.syntiaro.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#0a66c2] hover:underline cursor-pointer text-[#0a66c2] font-bold"
              >
                SYNTIARO
              </a>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

export { Footer };
