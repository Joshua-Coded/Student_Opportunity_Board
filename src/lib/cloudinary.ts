import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export function generateSignedUploadParams(userId: string) {
  const timestamp = Math.round(Date.now() / 1000);
  const folder = `student-opportunities/${userId}`;
  const transformation = "c_limit,w_1200,h_800,q_auto";

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder, transformation },
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    folder,
    transformation,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  };
}

export { cloudinary };
