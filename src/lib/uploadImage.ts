import { File } from 'expo-file-system';

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME ?? 'duo61k04v';
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? 'eseller_mobile';

export async function uploadImageToCloudinary(localUri: string): Promise<string> {
  const file = new File(localUri);
  const base64 = await file.base64();

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file: `data:image/jpeg;base64,${base64}`,
        upload_preset: UPLOAD_PRESET,
        folder: 'eseller/products',
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`Зураг хуулахад алдаа гарлаа (${res.status})`);
  }

  const json = await res.json();
  return json.secure_url as string;
}

export async function uploadMultipleImages(localUris: string[]): Promise<string[]> {
  return Promise.all(localUris.map(uploadImageToCloudinary));
}
