import createComment from "../comments/create.js";
import { REQUEST_DELAY_MS } from "../../config/config.js";
import { detailedLogger } from "../../logger/logger_instance.js";
import getUserMapping from "../users/get_user_mapping.js";

async function createComments({ issue, newIssue, team }) {
  const userMapping = await getUserMapping(team.name);
  detailedLogger.loading(`Finding comments for story ${issue.id}`);

  if (issue.comments.length === 0) {
    detailedLogger.info(`No comments found for story ${issue.id}.`);
    return;
  }

  // Create comments
  for (let body of issue.comments) {
    const [fullMatch, userName, dateString] = body.match(/ \((.+) - (.+, [0-9]{4})\)$/) || [];
    const createdAt = dateString ? new Date(dateString).toISOString() : undefined;
    const createAsUser = userMapping[userName]?.linearName || userName;
    if (createdAt && createAsUser) body = `${createAsUser} wrote:\n\n${body.slice(0, body.indexOf(fullMatch))}`;
    await createComment({
      issueId: newIssue._issue.id,
      createAsUser,
      createdAt,
      body,
    });

    await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY_MS));
  }
}

export default createComments;
