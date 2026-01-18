"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Send, Loader2, ArrowLeft } from "lucide-react";
import { UnifiedEditor } from "./unified-editor";
import { EmailPreview } from "./EmailPreview";
import { ModeToggle, EditorMode } from "./mode-toggle";
import { toast } from "sonner";
import Link from "next/link";
import { sendCustomBroadcast } from "@/app/actions/emails";
import { uploadFileToS3 } from "@/lib/uploadFileToS3";

export function EmailBuilder() {
  const [subject, setSubject] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [mode, setMode] = useState<EditorMode>("edit");
  const [sending, setSending] = useState(false);

  // Function to extract base64 images from HTML content
  const extractBase64Images = (html: string): string[] => {
    const base64Regex = /<img[^>]+src="(data:image\/[^;]+;base64[^"]+)"/g;
    const matches: string[] = [];
    let match;

    while ((match = base64Regex.exec(html)) !== null) {
      matches.push(match[1]);
    }

    return matches;
  };

  // Function to upload pending images and replace URLs in HTML
  const uploadPendingImages = async (html: string): Promise<string> => {
    const base64Images = extractBase64Images(html);

    if (base64Images.length === 0) {
      return html; // No images to upload
    }

    toast.info(`Uploading ${base64Images.length} image(s)...`);
    let updatedHtml = html;

    for (let i = 0; i < base64Images.length; i++) {
      const base64Url = base64Images[i];

      try {
        // Upload to S3
        const s3Url = await uploadFileToS3(
          base64Url,
          `email-image-${Date.now()}-${i}.jpg`,
        );

        // Replace base64 with S3 URL in HTML
        updatedHtml = updatedHtml.replace(base64Url, s3Url);

        toast.success(`Uploaded image ${i + 1}/${base64Images.length}`);
      } catch (error) {
        console.error(`Failed to upload image ${i + 1}:`, error);
        toast.error(`Failed to upload image ${i + 1}`);
        throw error; // Stop the send process if upload fails
      }
    }

    return updatedHtml;
  };

  const handleSend = async () => {
    if (!subject.trim()) {
      toast.error("Please add an email subject");
      return;
    }

    if (!htmlContent.trim() || htmlContent === "<p></p>") {
      toast.error("Please add some content to your email");
      return;
    }

    setSending(true);

    try {
      // Check if there are any pending images to upload
      const hasPendingImages = htmlContent.includes("data:image/");
      let finalHtmlContent = htmlContent;

      if (hasPendingImages) {
        toast.info("Uploading images before sending...");
        finalHtmlContent = await uploadPendingImages(htmlContent);

        // Update the local state with uploaded URLs
        setHtmlContent(finalHtmlContent);
      }

      // Send the email with uploaded image URLs
      const result = await sendCustomBroadcast(subject, finalHtmlContent);

      if (result.success) {
        toast.success(result.message);
        setSubject("");
        setHtmlContent("");
      } else {
        toast.error(result.message || "Failed to send email");
      }
    } catch (error) {
      console.error("Send error:", error);
      toast.error("Failed to send email broadcast");
    } finally {
      setSending(false);
    }
  };

  const canSend =
    subject.trim() && htmlContent.trim() && htmlContent !== "<p></p>";

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 grid-pattern opacity-20 pointer-events-none" />
      <div className="fixed top-0 right-0 w-150 h-150 bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-125 h-125 bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 glass backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Navigation & Title */}
            <div className="flex items-center gap-4">
              <Link href="/admin/emails">
                <Button size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-linear-to-br from-primary/20 to-secondary/20 glow-subtle">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-display font-bold">
                    <span className="text-gradient">Compose Broadcast</span>
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Create beautiful emails
                  </p>
                </div>
              </div>
            </div>

            {/* Center: Mode Toggle */}
            <ModeToggle mode={mode} onChange={setMode} />

            {/* Right: Send Button */}
            <Button
              onClick={handleSend}
              disabled={sending || !canSend}
              className="bg-linear-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity glow-primary"
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Send Broadcast</span>
                  <span className="sm:hidden">Send</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Subject Input */}
        <div className="mb-6">
          <div className="glass rounded-2xl p-4 md:p-6 border-glow">
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
              <Mail className="h-4 w-4 text-primary" />
              Email Subject
            </label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Weekly Newsletter - January 2026"
              className="bg-muted/50 text-foreground border-border/50 focus:border-primary text-base md:text-lg py-6"
            />
          </div>
        </div>

        {/* Editor - Always mounted, just hidden when in preview mode */}
        <div style={{ display: mode === "edit" ? "block" : "none" }}>
          <UnifiedEditor content={htmlContent} onChange={setHtmlContent} />
        </div>

        {/* Preview - Only shown when in preview mode */}
        {mode === "preview" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="glass rounded-2xl border-glow p-4 md:p-6 min-h-150"
          >
            <EmailPreview subject={subject} htmlContent={htmlContent} />
          </motion.div>
        )}
      </main>
    </div>
  );
}
