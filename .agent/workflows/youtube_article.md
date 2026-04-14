---
name: youtube_article
description: Convert a YouTube video into a fully formatted, deeply detailed JC Trompette blog post using the article_generator skill.
---

# YouTube to Article Workflow

This workflow automatically downloads a YouTube video transcript, generates a relevant image, and formats the output into a highly styled Next.js Markdown article.

**Trigger**: The user calls `/youtube_article <youtube_url>`.

## Step 1: Extract the Transcript
// turbo
Use the Python launcher `py` directly on the user's system to retrieve the transcript using `youtube_transcript_api`.
Run the already existing script in the `.agent/scripts` folder using the `run_command` tool:
```bash
py .agent/scripts/get_transcript.py <VIDEO_ID>
```
Remember to use `SafeToAutoRun: true`.

## Step 2: Generate Cover Image
// turbo
1. Read the transcript to grasp the essence of the video.
2. Use your `generate_image` tool to create a sleek, cinematic, high-end commercial quality image (no human faces) matching the JC Trompette aesthetic.
3. Automatically move the generated image to `public/blog/` using `run_command` with PowerShell (`Copy-Item -Path "..." -Destination "public/blog/..."`)

## Step 3: Write the Article
Apply the exact layout and rules defined in `[SKILL](file:///c:/Users/jean-/Desktop/Trompette/courstrompette/.agent/skills/article_generator/SKILL.md)`.
- Make it extremely detailed. Do not skip content.
- Ensure the frontmatter includes the `niveau` key (ask the user if unsure, or deduce it).
- Save the file directly to `src/content/posts/guide-apprentissage/<slug>.md` (or the appropriate directory, verify first).

## Step 4: Verification
Confirm to the user that the image is placed, the article is written, and provide a direct link for preview.
