import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

type FooterProps = {
  logo: ReactNode;
  brandName: string;
  socialLinks: {
    href: string;
    label: string;
    icon: ReactNode;
  }[];
  mainLinks: {
    href: string;
    label: string;
  }[];
  legalLinks: {
    href: string;
    label: string;
  }[];
  copyright: {
    text: string;
    license?: string;
  };
};

export function Footer({
  logo,
  brandName,
  socialLinks,
  mainLinks,
  legalLinks,
  copyright,
}: FooterProps) {
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);

  return (
    <>
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 pt-10 pb-6 mt-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          {/* TOP */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8">
            {/* BRAND */}
            <div>
              <Link to="/" className="flex items-center gap-2" aria-label={brandName}>
                {logo}

                <span className="text-xl font-extrabold text-black dark:text-white tracking-tight">
                  {brandName}
                </span>
              </Link>

              <p className="mt-3 text-gray-500 dark:text-gray-400 leading-6 text-sm">
                Your all-in-one campus companion for events, clubs, facilities, navigation, and
                student life.
              </p>

              {/* SOCIALS */}
              <div className="flex items-center gap-2 mt-4">
                {socialLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className="w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-[#00C6A7] hover:text-white hover:border-[#00C6A7] transition-all duration-300"
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* QUICK LINKS */}
            <div>
              <h3 className="text-base font-bold text-black dark:text-white mb-4">Quick Links</h3>

              <ul className="space-y-3">
                {mainLinks.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.label.toLowerCase() === 'home' ? '/' : link.href}
                      className="text-gray-500 dark:text-gray-400 hover:text-[#00C6A7] transition-colors duration-300 text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* LEGAL */}
            <div>
              <h3 className="text-base font-bold text-black dark:text-white mb-4">Legal</h3>

              <ul className="space-y-3">
                {legalLinks.map((link, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveModal(
                          link.label.toLowerCase().includes('privacy') ? 'privacy' : 'terms'
                        )
                      }
                      className="text-gray-500 dark:text-gray-400 hover:text-[#00C6A7] transition-colors duration-300 text-sm"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* EXTRA */}
            <div>
              <h3 className="text-base font-bold text-black dark:text-white mb-4">KampusKart</h3>

              <p className="text-gray-500 dark:text-gray-400 text-sm leading-6">
                Simplifying campus life for students through smart navigation, clubs, events, and
                community features.
              </p>

              <div className="mt-4">
                <span className="inline-flex items-center rounded-full bg-[#00C6A7]/10 px-3 py-1.5 text-xs font-medium text-[#00C6A7]">
                  Built for Students
                </span>
              </div>
            </div>
          </div>

          {/* BOTTOM */}
          <div className="border-t border-gray-200 dark:border-gray-800 pt-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {copyright.text}
              {copyright.license && <span> {copyright.license}</span>}
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400">Made for students</div>
          </div>
        </div>
      </footer>

      {/* GLASSMORPHISM MODAL */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md px-4">
          <div className="relative max-w-2xl w-full rounded-3xl border border-white/30 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl p-6 sm:p-8">
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-5 text-gray-500 hover:text-black dark:hover:text-white text-2xl"
            >
              ×
            </button>

            {/* TITLE */}
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-3">
              {activeModal === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Last updated: May 24, 2026</p>

            {/* CONTENT */}
            {activeModal === 'privacy' ? (
              <div className="space-y-3 text-gray-600 dark:text-gray-300 leading-7 text-sm">
                <p>
                  We collect basic information such as your name, email address, and profile details
                  to improve your KampusKart experience.
                </p>

                <p>
                  Your data is used only to provide campus-related features like events, clubs,
                  facilities, and navigation.
                </p>

                <p>We do not sell your personal information to third parties.</p>
              </div>
            ) : (
              <div className="space-y-3 text-gray-600 dark:text-gray-300 leading-7 text-sm">
                <p>
                  By using KampusKart, you agree to use the platform responsibly and follow campus
                  community guidelines.
                </p>

                <p>
                  Users should not misuse the platform, post harmful content, or violate privacy of
                  other students.
                </p>

                <p>KampusKart may update these terms when needed.</p>
              </div>
            )}

            {/* BUTTON */}
            <button
              onClick={() => setActiveModal(null)}
              className="mt-6 rounded-xl bg-[#00C6A7] px-6 py-3 text-white font-semibold hover:bg-[#00b093] transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
