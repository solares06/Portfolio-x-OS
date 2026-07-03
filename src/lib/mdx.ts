import fs from "fs";
import path from "path";
import matter from "gray-matter";

const contentDirectory = path.join(process.cwd(), "content");

export function getMdxFiles(dir: string) {
  const fullPath = path.join(contentDirectory, dir);
  if (!fs.existsSync(fullPath)) return [];
  return fs.readdirSync(fullPath).filter((file) => file.endsWith(".mdx"));
}

export function getPostBySlug(dir: string, slug: string) {
  const realSlug = slug.replace(/\.mdx$/, "");
  const fullPath = path.join(contentDirectory, dir, `${realSlug}.mdx`);
  if (!fs.existsSync(fullPath)) return null;
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    slug: realSlug,
    meta: data,
    content,
  };
}

export function getAllPosts(dir: string) {
  const files = getMdxFiles(dir);
  const posts = files
    .map((file) => getPostBySlug(dir, file))
    .filter((post): post is NonNullable<ReturnType<typeof getPostBySlug>> => post !== null)
    .sort((post1, post2) => {
      const d1 = new Date(post1.meta.date).getTime();
      const d2 = new Date(post2.meta.date).getTime();
      return d1 > d2 ? -1 : 1;
    });
  return posts;
}
