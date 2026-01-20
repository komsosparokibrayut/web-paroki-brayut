"use server";

import { getOctokit, getRepoConfig } from "@/lib/github/client";
import { z } from "zod";

const ContactFormSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name too long")
    .regex(/^[a-zA-Z\s'-]+$/, "Name contains invalid characters"),
  email: z.string()
    .email("Invalid email address")
    .max(254, "Email too long")
    .toLowerCase()
    .trim(),
  message: z.string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message too long"),
});

export async function submitContactForm(formData: {
  name: string;
  email: string;
  message: string;
}) {
  try {
    // Validate and sanitize input
    const validated = ContactFormSchema.parse(formData);

    // Additional sanitization
    const sanitizedName = validated.name.trim();
    const sanitizedMessage = validated.message
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
      .replace(/javascript:/gi, ""); // Remove javascript: protocol

    // Create GitHub issue (recommended free option)
    const octokit = await getOctokit();
    const { owner, repo } = getRepoConfig();

    const issueBody = `
**From:** ${sanitizedName}
**Email:** ${validated.email}

**Message:**
${sanitizedMessage}

---
*Submitted via contact form on ${new Date().toISOString()}*
    `.trim();

    await octokit.rest.issues.create({
      owner,
      repo,
      title: `Contact Form: ${sanitizedName.substring(0, 50)}`,
      body: issueBody,
      labels: ["contact-form"],
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error submitting contact form:", error);
    
    // Don't expose internal errors to client
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    
    return { success: false, error: "Failed to submit form. Please try again." };
  }
}
