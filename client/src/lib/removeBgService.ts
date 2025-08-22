// Remove.bg API Service
const REMOVEBG_API_KEY = "bKZ6EwELL1SKNETuhufqP53V";
const REMOVEBG_API_URL = "https://api.remove.bg/v1.0/removebg";

export interface RemoveBgResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export async function removeBackground(file: File): Promise<RemoveBgResponse> {
  try {
    console.log("Starting background removal with remove.bg API");
    
    // Validate file
    if (!file.type.match(/^image\/(png|jpe?g)$/i)) {
      return { success: false, error: "Only PNG and JPG images are supported" };
    }
    
    if (file.size > 12 * 1024 * 1024) { // 12MB limit for remove.bg
      return { success: false, error: "File too large. Maximum size is 12MB" };
    }

    // Prepare form data
    const formData = new FormData();
    formData.append("image_file", file);
    formData.append("size", "auto");

    // Make request to remove.bg API
    const response = await fetch(REMOVEBG_API_URL, {
      method: "POST",
      headers: {
        "X-Api-Key": REMOVEBG_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      // Handle specific error cases
      if (response.status === 402) {
        return { success: false, error: "API quota exceeded. Please try again later." };
      }
      if (response.status === 400) {
        return { success: false, error: "Invalid image format or corrupted file" };
      }
      if (response.status === 403) {
        return { success: false, error: "API key invalid or expired" };
      }
      
      return { 
        success: false, 
        error: `Remove.bg API error (${response.status}): ${errorText}` 
      };
    }

    // Convert response to blob and create object URL
    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);

    console.log("Background removal successful");
    return { success: true, imageUrl };

  } catch (error) {
    console.error("Remove.bg service error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Network error occurred" 
    };
  }
}

// Helper function to download the processed image
export function downloadProcessedImage(imageUrl: string, filename = "removed-bg.png") {
  const link = document.createElement("a");
  link.href = imageUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Helper function to convert image URL to File
export async function urlToFile(url: string, filename: string, mimeType = "image/png"): Promise<File> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new File([blob], filename, { type: mimeType });
}