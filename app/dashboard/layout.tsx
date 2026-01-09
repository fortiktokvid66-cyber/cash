"use client";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useState, useEffect } from "react";
import Script from "next/script";

const NAV_ITEMS = [
  { label: "Freeplay", path: "/dashboard/freeplay" },
  { label: "Deposit", path: "/dashboard/deposit" },
  { label: "Accounts", path: "/dashboard/accounts" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);

  // Track window width for responsive nav
  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <>
      {/* LiveChat Script */}
      <Script
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.__lc = window.__lc || {};
            window.__lc.license = 19444721;
            window.__lc.integration_name = "manual_channels";
            window.__lc.product_name = "livechat";
            ;(function(n,t,c){function i(n){return e._h?e._h.apply(null,n):e._q.push(n)}var e={_q:[],_h:null,_v:"2.0",on:function(){i(["on",c.call(arguments)])},once:function(){i(["once",c.call(arguments)])},off:function(){i(["off",c.call(arguments)])},get:function(){if(!e._h)throw new Error("[LiveChatWidget] You can't use getters before load.");return i(["get",c.call(arguments)])},call:function(){i(["call",c.call(arguments)])},init:function(){var n=t.createElement("script");n.async=!0;n.type="text/javascript";n.src="https://cdn.livechatinc.com/tracking.js";t.head.appendChild(n)}};!n.__lc.asyncInit&&e.init(),n.LiveChatWidget=n.LiveChatWidget||e}(window,document,[].slice))
          `,
        }}
      />
      <noscript>
        <a href="https://www.livechat.com/chat-with/19444721/" rel="nofollow">
          Chat with us
        </a>, powered by{" "}
        <a
          href="https://www.livechat.com/?welcome"
          rel="noopener nofollow"
          target="_blank"
        >
          LiveChat
        </a>
      </noscript>

      {/* Dashboard Navigation */}
      <nav className="dashboard-nav" style={{ position: "relative", zIndex: 10 }}>
        <button
          className="nav-toggle"
          style={{
            display: "none",
            background: "#22c55e",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "8px 14px",
            fontSize: 18,
            marginRight: 12,
          }}
          onClick={() => setNavOpen((v) => !v)}
        >
          {navOpen ? "✕" : "☰"}
        </button>
        <div
          className="nav-links"
          style={{
            display:
              windowWidth <= 600 ? (navOpen ? "flex" : "none") : "flex",
            gap: 12,
            flex: 1,
            flexDirection: windowWidth <= 600 ? "column" : "row",
          }}
        >
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                router.push(item.path);
                setNavOpen(false);
              }}
              className={pathname === item.path ? "nav-active" : ""}
              style={{
                fontWeight: pathname === item.path ? 700 : 500,
                color: pathname === item.path ? "#22c55e" : undefined,
                borderBottom:
                  pathname === item.path ? "2px solid #22c55e" : "none",
                background: "none",
                marginRight: 4,
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button
          onClick={async () => {
            await logout();
            setNavOpen(false);
          }}
          style={{
            marginLeft: "auto",
            background: "#ef4444",
            color: "#fff",
            fontWeight: 600,
            borderRadius: 6,
            padding: "8px 18px",
            border: "none",
          }}
        >
          Logout
        </button>
      </nav>

      <main>{children}</main>

      {/* Global Styles */}
      <style jsx global>{`
        .dashboard-nav {
          display: flex;
          align-items: center;
          background: #020617;
          padding: 14px 24px;
          border-bottom: 1px solid #1e293b;
        }
        .nav-links button {
          background: none;
          color: #f1f5f9;
          border: none;
          font-size: 1rem;
          font-weight: 500;
          padding: 8px 16px;
          border-radius: 6px;
          transition: background 0.2s, color 0.2s;
        }
        .nav-links button.nav-active {
          color: #22c55e;
          border-bottom: 2px solid #22c55e;
        }
        .nav-links button:hover {
          background: #334155;
          color: #22c55e;
        }
        @media (max-width: 600px) {
          .dashboard-nav {
            flex-direction: column;
            align-items: flex-start;
            padding: 10px 8px;
          }
          .nav-toggle {
            display: block !important;
          }
          .nav-links {
            display: ${navOpen ? "flex" : "none"};
            flex-direction: column;
            width: 100%;
            gap: 0;
          }
          .nav-links button {
            width: 100%;
            text-align: left;
            margin-bottom: 6px;
          }
        }
      `}</style>
    </>
  );
}
