import linearClient from "../../config/client.mjs";
import { detailedLogger } from "../../logger/logger_instance.js";
import { REQUEST_DELAY_MS } from "../../config/config.js";
import createComment from "../comments/create.js";

const PIVOTAL_ID_REGEX = /^#\d+$/;

async function createBlockers({ pivotalAndLinearIssues }) {
  for (const { pivotalIssue, linearIssue } of pivotalAndLinearIssues) {
    if (pivotalIssue.blockers.length === 0) {
      detailedLogger.importantInfo(
        `No blockers found for story ${pivotalIssue.id}.`,
      );
      continue;
    }
    if (pivotalIssue.blockers.length !== pivotalIssue.blockerStatuses.length) {
      detailedLogger.importantError(
        `Found a different number of blockers and blocker statuses for story ${pivotalIssue.id}.`,
      );
      continue;
    }

    for (var i = 0; i < pivotalIssue.blockers.length; i++) {
      const blocker = pivotalIssue.blockers[i];
      const blockerStatus = pivotalIssue.blockerStatuses[i];

      if (!blocker.trim()) {
        detailedLogger.importantInfo(
          `Skipping blank blocker for story ${pivotalIssue.id}`,
        );
        continue;
      }

      detailedLogger.importantInfo(
        `Creating blocker ${blocker} for story ${pivotalIssue.id}`,
      );

      if (PIVOTAL_ID_REGEX.test(blocker)) {
        const blockingIssueId = pivotalAndLinearIssues.find(
          ({ pivotalIssue: issue }) => issue.id === blocker.replace("#", ""),
        )?.linearIssue?.id;

        if (!blockingIssueId) {
          detailedLogger.importantError(
            `Failed to find the issue blocking story ${pivotalIssue.id}. Blocker ${blocker} skipped.`,
          );
          continue;
        }

        try {
          await linearClient.createIssueRelation({
            issueId: blockingIssueId,
            relatedIssueId: linearIssue.id,
            type: blockerStatus === "resolved" ? "related" : "blocks",
          });
        } catch (error) {
          detailedLogger.importantError(
            `Failed to create the blocker ${blocker} for story ${pivotalIssue.id}: ${error.message}`,
          );
          continue;
        }
      } else {
        try {
          await createComment({
            issueId: linearIssue.id,
            body: `Blocker: ${blocker}${blockerStatus === "resolved" ? " - resolved" : ""}`,
          });
        } catch (error) {
          detailedLogger.importantError(
            `Failed to create the blocker ${blocker} for story ${pivotalIssue.id}: ${error.message}`,
          );
          continue;
        }
      }

      detailedLogger.importantSuccess(
        `Successfully imported blocker ${blocker} for story ${pivotalIssue.id}.`,
      );
      await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY_MS));
    }
  }
}

export default createBlockers;
