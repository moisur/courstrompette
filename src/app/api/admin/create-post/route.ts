import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { title, slug, category, date, image, author, description, content } = data;

        // Basic validation
        if (!title || !slug || !category || !content) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Prepare content for the markdown file
        const fileContent = matter.stringify(content, {
            title,
            date: date || new Date().toISOString().split('T')[0],
            image: image || '/placeholder.jpg',
            author: author || 'JC Trompette',
            slug,
            description: description || '',
        });

        // Determine the directory path
        const postsDirectory = path.join(process.cwd(), 'src/content/posts', category);

        // Create directory if it doesn't exist
        if (!fs.existsSync(postsDirectory)) {
            fs.mkdirSync(postsDirectory, { recursive: true });
        }

        // File path
        const filePath = path.join(postsDirectory, `${slug}.md`);

        // Check if file already exists
        if (fs.existsSync(filePath)) {
            // Optional: Return an error or Append -1, etc.
            return NextResponse.json(
                { message: 'A post with this slug already exists in this category.' },
                { status: 409 }
            );
        }

        // Write file
        fs.writeFileSync(filePath, fileContent, 'utf8');

        return NextResponse.json({ message: 'Post created successfully', path: filePath }, { status: 200 });

    } catch (error) {
        console.error('Error creating post:', error);
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
