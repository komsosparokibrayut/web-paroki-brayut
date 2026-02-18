
import fs from 'fs';
import path from 'path';
import { listPosts, getPostFile } from "../src/services/github/news";
import { parseContent } from "../src/lib/content/parser";

// Load environment variables manually
function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envConfig = fs.readFileSync(envPath, 'utf-8');
      envConfig.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim().replace(/^['"]|['"]$/g, '');
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      });
      console.log("Loaded .env.local");
    } else {
      console.warn(".env.local not found");
    }
  } catch (e) {
    console.error("Error loading .env.local:", e);
  }
}

loadEnv();

async function main() {
  console.log("Listing posts...");
  const posts = await listPosts();
  console.log(`Found ${posts.length} posts.`);

  if (posts.length === 0) {
    console.log("No posts found.");
    return;
  }

  // Find a post with a banner
  for (const post of posts) {
    if (!post.path.endsWith(".json")) continue;
    
    console.log(`Checking post: ${post.path}`);
    const content = await getPostFile(post.path);
    if (!content) continue;

    try {
      const { frontmatter } = parseContent(content, post.path);
      if (frontmatter.banner) {
        console.log(`Found banner in post ${post.path}: ${frontmatter.banner}`);
        // Verification URL
        const url = `http://localhost:3000${frontmatter.banner}`;
        console.log(`Test URL: ${url}`);
        
        // Try to fetch it
        console.log("Attempting to fetch image...");
        const res = await fetch(url, { method: 'HEAD' });
        console.log(`Status: ${res.status} ${res.statusText}`);
        
        if (res.ok) {
            console.log("SUCCESS: Image is accessible!");
        } else {
            console.log("FAILURE: Image is not accessible.");
        }
        return;
      }
    } catch (e) {
      console.error("Error parsing post:", e);
    }
  }
  
  console.log("No posts with banners found.");
}

main().catch(console.error);
