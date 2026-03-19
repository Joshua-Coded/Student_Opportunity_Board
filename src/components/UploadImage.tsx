"use client";

import { Box, Button, Flex, Image, Progress, Text } from "@chakra-ui/react";
import { useRef, useState } from "react";

interface Props {
  onUpload: (url: string) => void;
  currentUrl?: string;
  label?: string;
  accept?: string;
  folder?: string;
}

export default function UploadImage({
  onUpload,
  currentUrl,
  label = "Upload Image",
  accept = "image/*",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    setError("");
    setProgress(0);

    try {
      // Get signed upload params from our API (uses Cloudinary MCP-backed lib)
      const sigRes = await fetch("/api/upload", { method: "POST" });
      if (!sigRes.ok) throw new Error("Failed to get upload signature");
      const { signature, timestamp, folder, transformation, cloudName, apiKey } = await sigRes.json();

      // Build multipart form for Cloudinary direct upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", folder);
      formData.append("transformation", transformation);

      // Use XHR so we can track upload progress
      const url = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100));
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            resolve(data.secure_url);
          } else {
            reject(new Error("Upload failed"));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(formData);
      });

      setProgress(100);
      onUpload(url);
    } catch (err: any) {
      setError(err.message || "Upload failed");
      setPreview(currentUrl || null);
    } finally {
      setUploading(false);
    }
  }

  return (
    <Box>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={handleFile}
      />

      {preview ? (
        <Box position="relative" borderRadius="xl" overflow="hidden" border="1px solid rgba(255,255,255,0.1)">
          <Image
            src={preview}
            alt="Uploaded"
            w="full"
            maxH="200px"
            objectFit="cover"
          />
          <Box
            position="absolute"
            inset={0}
            bg="blackAlpha.600"
            opacity={0}
            _hover={{ opacity: 1 }}
            transition="opacity 0.2s"
            display="flex"
            alignItems="center"
            justifyContent="center"
            cursor="pointer"
            onClick={() => inputRef.current?.click()}
          >
            <Text color="white" fontSize="sm" fontWeight="medium">Change image</Text>
          </Box>
        </Box>
      ) : (
        <Flex
          border="1px dashed rgba(255,255,255,0.15)"
          borderRadius="xl"
          p={8}
          align="center"
          justify="center"
          flexDir="column"
          gap={3}
          cursor="pointer"
          bg="rgba(255,255,255,0.02)"
          _hover={{ bg: "rgba(139,92,246,0.06)", borderColor: "purple.600" }}
          transition="all 0.2s"
          onClick={() => inputRef.current?.click()}
        >
          <Text fontSize="2xl">📷</Text>
          <Text color="gray.500" fontSize="sm">{label}</Text>
          <Text color="gray.700" fontSize="xs">PNG, JPG, WEBP up to 10MB</Text>
        </Flex>
      )}

      {uploading && (
        <Box mt={3}>
          <Flex justify="space-between" mb={1}>
            <Text color="gray.500" fontSize="xs">Uploading via Cloudinary…</Text>
            <Text color="purple.400" fontSize="xs">{progress}%</Text>
          </Flex>
          <Progress value={progress} size="xs" colorScheme="purple" borderRadius="full"
            bg="rgba(255,255,255,0.08)" />
        </Box>
      )}

      {!uploading && !preview && (
        <Button
          mt={3}
          size="sm"
          w="full"
          variant="outline"
          borderColor="rgba(255,255,255,0.1)"
          color="gray.400"
          _hover={{ bg: "rgba(139,92,246,0.1)", borderColor: "purple.600", color: "purple.300" }}
          borderRadius="xl"
          onClick={() => inputRef.current?.click()}
        >
          {label}
        </Button>
      )}

      {error && (
        <Text color="red.400" fontSize="xs" mt={2}>⚠ {error}</Text>
      )}
    </Box>
  );
}
