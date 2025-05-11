import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateUniqueFilename, uploadToBunnyStorage } from '@/lib/bunny-storage';

export async function POST(request: NextRequest) {
  try {
    // Ensure the user is authenticated
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the FormData from the request
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as 'avatar' | 'banner' | null;

    // Validate the file and type
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    
    if (!type || (type !== 'avatar' && type !== 'banner')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Generate a unique filename
    const filename = generateUniqueFilename(file.name, userId, type);

    // Read the file as an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Upload the file to Bunny Storage
    const url = await uploadToBunnyStorage(arrayBuffer, filename);

    // Return the URL
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// Increase the maximum request size to allow for larger file uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}; 