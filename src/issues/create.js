import linearClient from "../../config/client.mjs";
import { detailedLogger } from "../../logger/logger_instance.js";
import logSuccessfulImport from "../../logger/log_successful_import.js";
import fetchLabels from "../labels/list.js";
import fetchStatuses from "../statuses/list.mjs";
import fetchIssueEstimationSettings from "../estimates/list.mjs";
import { REQUEST_DELAY_MS } from "../../config/config.js";
import buildIssueParams from "./build_issue_params.js";
import createComments from "./create_comments.js";
import createFileAttachments from "./create_file_attachments.js";
import { RELEASE_LABEL_NAME } from "../labels/pivotal/_constants.js";
import fetchIssuesForTeam from "./list.mjs";

async function create({
  team,
  issuesPayload,
  options,
  importSource,
  directory,
}) {
  // Keep outside of loop to only fetch these values once
  const teamStatuses = await fetchStatuses(team.id);
  const teamLabels = await fetchLabels(team.id);
  const { scale } = await fetchIssueEstimationSettings(team.id);
  // Fetch release issues to set parentId
  const releaseIssues = await fetchIssuesForTeam({
    teamId: team.id,
    filters: {
      labels: { some: { name: { eq: RELEASE_LABEL_NAME } } },
    },
  });

  for (const [index, issue] of issuesPayload.entries()) {
    try {
      const issueParams = await buildIssueParams({
        team,
        issue,
        options,
        importSource,
        teamStatuses,
        teamLabels,
        scale,
        index,
        releaseIssues,
      });

      // Create Issue
      const newIssue = await linearClient.createIssue(issueParams);

      // Write successful import to log
      await logSuccessfulImport({
        team,
        issue,
        newIssue,
        importNumber: index + 1,
      });

      // Create Comments
      if (options.shouldImportComments)
        await createComments({ issue, newIssue, team });

      // Create File Attachments
      if (options.shouldImportFiles)
        await createFileAttachments({ issue, newIssue, directory });

      await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY_MS));
    } catch (error) {
      detailedLogger.importantError(`Failed to create issue: ${error.message}`);
      process.exit(0);
    }
  }
}

export default create;
