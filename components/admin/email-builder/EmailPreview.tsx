"use client";

import { motion } from "framer-motion";
import { Monitor, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface EmailPreviewProps {
  subject: string;
  htmlContent: string;
}

type DeviceType = "desktop" | "mobile";

export function EmailPreview({ subject, htmlContent }: EmailPreviewProps) {
  const [device, setDevice] = useState<DeviceType>("desktop");

  const logoUrl = "/email-logo.png";

  // Memoize styles to prevent unnecessary recalculations
  const emailStyles = useMemo(() => {
    const isMobile = device === "mobile";

    return `
      <style>
        * { 
          box-sizing: border-box; 
          margin: 0; 
          padding: 0; 
        }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.7;
          color: #e2e8f0;
          background: linear-gradient(135deg, #0a0f1a 0%, #151c2c 100%);
          padding: ${isMobile ? "12px" : "32px"};
          min-height: 100%;
        }
        .email-wrapper {
          max-width: 640px;
          margin: 0 auto;
          padding: 3px;
          border-radius: ${isMobile ? "16px" : "24px"};
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.4), rgba(234, 179, 8, 0.3), rgba(34, 197, 94, 0.2));
        }
        .email-container {
          background: #151c2c;
          border-radius: ${isMobile ? "14px" : "22px"};
          padding: ${isMobile ? "24px 20px" : "48px 40px"};
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        .logo-section {
          text-align: center;
          margin-bottom: ${isMobile ? "28px" : "36px"};
          padding-bottom: ${isMobile ? "20px" : "28px"};
          border-bottom: 1px solid rgba(34, 197, 94, 0.15);
        }
        .logo-section img {
          width: ${isMobile ? "120px" : "160px"};
          height: auto;
          margin: 0 auto;
          display: block;
        }
        .content-section {
          padding: 0;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        h1 {
          font-family: 'Orbitron', 'Inter', sans-serif;
          font-size: ${isMobile ? "36px" : "48px"};
          font-weight: 800;
          color: #f8fafc;
          margin-bottom: 20px;
          line-height: 1.2;
          letter-spacing: -0.02em;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        h2 {
          font-family: 'Orbitron', 'Inter', sans-serif;
          font-size: ${isMobile ? "28px" : "36px"};
          font-weight: 700;
          color: #f8fafc;
          margin-bottom: 16px;
          line-height: 1.3;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        h3 {
          font-family: 'Orbitron', 'Inter', sans-serif;
          font-size: ${isMobile ? "24px" : "28px"};
          font-weight: 600;
          color: #f8fafc;
          margin-bottom: 12px;
          line-height: 1.4;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        p {
          font-size: ${isMobile ? "18px" : "20px"};
          color: #e2e8f0;
          margin-bottom: 20px;
          line-height: 1.8;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        
        /* Regular links */
        a {
          color: #22c55e;
          text-decoration: underline;
          text-underline-offset: 3px;
          font-weight: 500;
          word-break: break-word;
        }
        
        /* Table-based button styling */
        table[role="presentation"] {
          margin: 0 auto !important;
          border-collapse: separate !important;
        }
        
        table[role="presentation"] td {
          border-radius: 10px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        }
        
        table[role="presentation"] a {
          text-decoration: none !important;
          display: inline-block !important;
          font-weight: 700 !important;
          font-size: 18px !important;
          line-height: 54px !important;
          text-align: center !important;
          padding: 0 36px !important;
          min-width: 180px !important;
          border-radius: 10px !important;
          border: 2px solid !important;
        }
        
        /* Button container */
        div[style*="text-align: center"] {
          margin: 32px 0 !important;
        }
        
        /* Image size constraints */
        .content-section img {
          max-width: ${isMobile ? "100%" : "400px"} !important;
          max-height: 300px !important;
          width: auto !important;
          height: auto !important;
          border-radius: 14px;
          display: inline-block;
        }
        
        /* Image alignment support */
        p[style*="text-align: left"] img,
        p[style*="text-align:left"] img {
          display: inline-block !important;
        }
        
        p[style*="text-align: center"] img,
        p[style*="text-align:center"] img {
          display: inline-block !important;
        }
        
        p[style*="text-align: right"] img,
        p[style*="text-align:right"] img {
          display: inline-block !important;
        }
        
        hr {
          border: none;
          border-top: 1px solid rgba(148, 163, 184, 0.15);
          margin: 28px 0;
        }
        blockquote {
          border-left: 4px solid rgba(34, 197, 94, 0.6);
          padding: 16px 20px;
          margin: 20px 0;
          background: rgba(34, 197, 94, 0.05);
          border-radius: 0 12px 12px 0;
          font-style: italic;
          color: #94a3b8;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        ul, ol {
          padding-left: 28px;
          margin: 20px 0;
        }
        li {
          margin-bottom: 12px;
          font-size: ${isMobile ? "18px" : "20px"};
          line-height: 1.7;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        .footer {
          margin-top: 40px;
          padding-top: 28px;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
          text-align: center;
        }
        .footer p {
          font-size: ${isMobile ? "14px" : "15px"};
          color: #64748b;
          margin: 0 0 12px 0;
        }
        .footer a {
          color: #22c55e;
          text-decoration: none;
          font-weight: 600;
          font-size: ${isMobile ? "15px" : "16px"};
        }
        .footer .copyright {
          margin-top: 20px;
          font-size: 13px;
          color: #475569;
        }
      </style>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800&display=swap" rel="stylesheet">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    `;
  }, [device]);

  // Memoize full HTML to prevent unnecessary recalculations
  const fullHtml = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const emptyContent =
      '<p style="text-align: center; color: #64748b;">Start writing to see the preview...</p>';

    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${emailStyles}
        </head>
        <body>
          <div class="email-wrapper">
            <div class="email-container">
              <!-- Logo Header -->
              <div class="logo-section">
                <img src="${logoUrl}" alt="COOU Techies Logo" />
              </div>

              <!-- Main Content -->
              <div class="content-section">
                ${htmlContent || emptyContent}
              </div>

              ${
                htmlContent
                  ? `
                <!-- Footer -->
                <div class="footer">
                  <p>Questions? Reach out anytime</p>
                  <a href="mailto:cooutechies@gmail.com">cooutechies@gmail.com</a>
                  <p class="copyright">© ${currentYear} COOU Techies. Empowering the tech community.</p>
                </div>
              `
                  : ""
              }
            </div>
          </div>
        </body>
      </html>
    `;
  }, [htmlContent, emailStyles, logoUrl]);

  return (
    <div className="h-full flex flex-col">
      {/* Device Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10">
            {device === "desktop" ? (
              <Monitor className="h-5 w-5 text-primary" />
            ) : (
              <Smartphone className="h-5 w-5 text-primary" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Email Preview
            </h3>
            <p className="text-xs text-muted-foreground">
              {device === "desktop" ? "Desktop" : "Mobile"} view
            </p>
          </div>
        </div>

        <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDevice("desktop")}
            className={cn(
              "h-8 px-3 gap-2",
              device === "desktop" && "bg-primary/20 text-primary",
            )}
          >
            <Monitor className="h-4 w-4" />
            Desktop
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDevice("mobile")}
            className={cn(
              "h-8 px-3 gap-2",
              device === "mobile" && "bg-primary/20 text-primary",
            )}
          >
            <Smartphone className="h-4 w-4" />
            Mobile
          </Button>
        </div>
      </div>

      {/* Subject Line */}
      <div className="mb-4 p-4 glass rounded-xl">
        <p className="text-xs text-muted-foreground mb-1">Subject:</p>
        <p className="text-sm font-semibold text-foreground wrap-break-word">
          {subject || "(No subject)"}
        </p>
      </div>

      {/* Preview Frame */}
      <div className="flex-1 overflow-auto">
        <motion.div
          key={device}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "mx-auto transition-all duration-300",
            device === "mobile" ? "max-w-93.75" : "max-w-170",
          )}
        >
          <div
            className={cn(
              "bg-[#0a0f1a] overflow-hidden",
              device === "mobile"
                ? "rounded-[40px] p-2 border-4 border-border shadow-2xl"
                : "rounded-xl border border-border shadow-xl",
            )}
          >
            {/* Phone notch for mobile */}
            {device === "mobile" && (
              <div className="flex justify-center py-2">
                <div className="w-24 h-6 bg-background rounded-full" />
              </div>
            )}

            <iframe
              srcDoc={fullHtml}
              className={cn(
                "w-full border-0 bg-transparent",
                device === "mobile" ? "h-150 rounded-b-4xl" : "h-175",
              )}
              title="Email Preview"
              sandbox="allow-same-origin"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
