import linearClient from "../../config/client.mjs";

import { detailedLogger } from "../../logger/logger_instance.js";

async function createComment({ issueId, body, createdAt }) {
  try {
    const response = await linearClient.createComment({
      issueId,
      body,
      createdAt,
      // createAsUser, TODO: Won't work unless we use OAUTH Application token
    });

    if (response.success) {
      detailedLogger.createdSecondary(
        `Comment`,
        response._comment.id,
        `${body.slice(0, 30)}...`,
      );
    } else {
      detailedLogger.error(`Error creating comment: ${response.errors}`);
    }
  } catch (error) {
    detailedLogger.error("Error creating comment:", error.message);
  }
}

export default createComment;
