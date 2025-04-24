import { uploadFileToLinear } from "./import.js";
import fs from "fs/promises";
import path from "path";

import { detailedLogger } from "../../logger/logger_instance.js";

async function upload(filePath, issueId) {
  try {
    // Read the file from the provided path
    const fileBuffer = await fs.readFile(filePath);
    const fileName = path.basename(filePath);
    const fileType = getFileType(fileName);

    // Create a file-like object
    const file = {
      name: fileName,
      type: fileType,
      size: fileBuffer.length,
      arrayBuffer: async () => fileBuffer,
    };

    // Upload the file and attach it to the issue
    const assetUrl = await uploadFileToLinear(file, issueId);

    detailedLogger.result(
      `File Attachment uploaded successfully! Issue ID: ${issueId}, Asset URL: ${assetUrl}`,
    );
  } catch (error) {
    detailedLogger.error(`Failed to upload uploading file for issue ${issueId}`, error.message);
  }
}

function getFileType(fileName) {
  const extension = path.extname(fileName).toLowerCase();
  switch (extension) {
    case ".pdf":
      return "application/pdf";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
}

export default upload;
