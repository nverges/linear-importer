import { detailedLogger } from "../logger/logger_instance.js";
import initializeLogger from "../logger/initialize.js";
import createStatuses from "./statuses/create.mjs";
import importLabels from "./prompts/import_labels.js";
import importComments from "./prompts/import_comments.js";
import updateIssueEstimationType from "./estimates/update_issue_estimation_type.js";
import importEstimates from "./estimates/import_estimates.js";
import importPriority from "./prompts/import_priority.js";
import selectTeam from "./teams/select.mjs";
import importFiles from "./prompts/import_files.js";
import proceedWithImport from "./prompts/proceed_with_import.js";
import selectImportSource from "./prompts/select_import_source.js";
import pivotalFormatter from "./import_sources/pivotal/formatter.js";
import createLabels from "./labels/create.js";
import createUserMapping from "./users/create_user_mapping.js";
import { PIVOTAL_DEFAULT_LABELS } from "./labels/pivotal/_constants.js";
import selectDirectory from "./prompts/select_csv_directory.js";
import createIssues from "./issues/create.js";
import createBlockers from "./issues/create_blockers.js";

//=============================================================================
// Select Import Source
//=============================================================================
const importSource = await selectImportSource();

//=============================================================================
// Select a Team
//=============================================================================
const team = await selectTeam();

//=============================================================================
// Initialize Logger
//=============================================================================
initializeLogger({ team });

//=============================================================================
// Select Directory
//=============================================================================
const directory = await selectDirectory();

//=============================================================================
// Build Import Options
//=============================================================================
const shouldImportFiles = await importFiles();
const shouldImportLabels = await importLabels();
const shouldImportComments = await importComments();
const shouldImportPriority = await importPriority();
const shouldImportEstimates = await importEstimates();
if (shouldImportEstimates) await updateIssueEstimationType({ team });

// Options get passed to createIssues
const options = {
  shouldImportFiles,
  shouldImportLabels,
  shouldImportComments,
  shouldImportPriority,
  shouldImportEstimates,
};

//=============================================================================
// Format Data for Import Type
//=============================================================================
// TODO: Modify to swap different data sources, based on importSource
const extractedPivotalData = await pivotalFormatter({
  team,
  directory,
});

//=============================================================================
// Create User Mapping
//=============================================================================
await createUserMapping({
  team,
  extractedUsernames: extractedPivotalData.csvData.aggregatedData.userNames,
});

detailedLogger.info(`Import Source: ${importSource}`);
detailedLogger.info(`Team: ${JSON.stringify(team, null, 2)}`);
detailedLogger.info(`Directory: ${directory}`);
detailedLogger.info(`Options: ${JSON.stringify(options, null, 2)}`);

//=============================================================================
// Confirm Proceed
//=============================================================================
await proceedWithImport({
  confirmationMessage: extractedPivotalData.confirmationMessage,
});

//=============================================================================
// Create Labels and Statuses
//=============================================================================
// Create Workspace statuses using Pivotal statuses
// TODO: Modify for other import sources
await createStatuses({ teamId: team.id });

// Create Workspace labels using Pivotal default labels
await createLabels({ teamId: team.id, labels: PIVOTAL_DEFAULT_LABELS });

// Create Workspace labels using extracted labels
if (shouldImportLabels) {
  await createLabels({
    teamId: team.id,
    labels: extractedPivotalData.csvData.aggregatedData.labels,
  });
}

const pivotalAndLinearIssues = [];
//=============================================================================
// Create Release Issues
//=============================================================================
// Create Release Issues first so that we can assign sub-issues
const releaseIssues = extractedPivotalData.formattedIssuePayload.filter(
  (issue) => issue.isRelease,
);
pivotalAndLinearIssues.push(
  ...(await createIssues({
    team,
    issuesPayload: releaseIssues,
    options,
    importSource,
    directory,
  })),
);

//=============================================================================
// Create Issues
//=============================================================================
// Create non-release issues after release issues have been created, so that
// a parentId can be assigned if necessary
const nonReleaseIssues = extractedPivotalData.formattedIssuePayload.filter(
  (issue) => !issue.isRelease,
);
pivotalAndLinearIssues.push(
  ...(await createIssues({
    team,
    issuesPayload: nonReleaseIssues,
    options,
    importSource,
    directory,
  })),
);

//=============================================================================
// Create Blockers
//=============================================================================

await createBlockers({ pivotalAndLinearIssues });

//=============================================================================
// Import complete
//=============================================================================

detailedLogger.importantSuccess("Import complete!");
