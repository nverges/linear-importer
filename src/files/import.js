import linearClient from "../../config/client.mjs";
import chalk from "chalk";
import { ENABLE_DETAILED_LOGGING } from "../../config/config.js";
import { detailedLogger } from "../../logger/logger_instance.js";

async function uploadFileToLinear(file, issueId) {
  if (ENABLE_DETAILED_LOGGING) {
    console.log(chalk.magenta("Input file object:"), file);
    console.log(chalk.magenta("Type of file:"), typeof file);
    console.log(chalk.magenta("Is File?"), file instanceof File);
    console.log(chalk.magenta("Is Blob?"), file instanceof Blob);
  }

  let fileName = file.name;
  let fileType = file.type;
  let fileSize = file.size;

  if (!(file instanceof File) && !(file instanceof Blob)) {
    if (
      typeof file === "object" &&
      file !== null &&
      "name" in file &&
      "type" in file &&
      "size" in file
    ) {
      if (file.arrayBuffer) {
        const buffer = await file.arrayBuffer();
        file = new Blob([buffer], { type: file.type });
      } else {
        file = new Blob([file], { type: file.type });
      }
    } else {
      throw new Error(
        "Invalid file object. Expected File or Blob, or an object with name, type, and size properties.",
      );
    }
  }

  if (ENABLE_DETAILED_LOGGING) {
    console.log(chalk.magenta("File details:"), {
      name: fileName,
      type: fileType,
      size: fileSize,
    });
  }

  const uploadPayload = await linearClient.fileUpload(
    fileType,
    fileName,
    fileSize,
  );

  if (!uploadPayload.success || !uploadPayload.uploadFile) {
    detailedLogger.error(`Failed to request upload URL for file: ${fileName}`);
    process.exit(0);
  }

  const uploadUrl = uploadPayload.uploadFile.uploadUrl;
  const assetUrl = uploadPayload.uploadFile.assetUrl;

  if (ENABLE_DETAILED_LOGGING) {
    console.log(chalk.magenta("Upload URL:", uploadUrl));
  }

  detailedLogger.createdSecondary("File Attachment", issueId, assetUrl);

  const headers = new Headers();
  headers.set("Content-Type", fileType);
  headers.set("Cache-Control", "public, max-age=31536000");
  uploadPayload.uploadFile.headers.forEach(({ key, value }) =>
    headers.set(key, value),
  );

  if (ENABLE_DETAILED_LOGGING) {
    console.log(
      chalk.magenta("Request headers:"),
      chalk.magenta(
        JSON.stringify(Object.fromEntries(headers.entries()), null, 2),
      ),
    );
  }

  try {
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers,
      body: file,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.log(chalk.red("Error details:"), chalk.red(errorText));
      console.error(
        `Failed to upload file: ${uploadResponse.status} ${uploadResponse.statusText}\nError details: ${errorText}`,
      );
      process.exit(0);
    }

    const attachmentResponse = await linearClient.createAttachment({
      issueId: issueId,
      url: assetUrl,
      title: fileName,
      subtitle: `${fileSize} bytes`,
    });

    if (ENABLE_DETAILED_LOGGING) {
      console.log(
        chalk.magenta("Attachment response:"),
        chalk.magenta(JSON.stringify(attachmentResponse, null, 2)),
      );
    }

    detailedLogger.result(
      `File Attachment uploaded successfully! Issue ID: ${issueId}, Asset URL: ${assetUrl}`,
    );

    return assetUrl;
  } catch (e) {
    console.error("Failed to upload file or attach it to the Linear issue", e);
    process.exit(0);
  }
}

export { uploadFileToLinear };
