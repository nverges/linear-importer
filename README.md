# Linear Importer

CLI tool for migrating a Pivotal Tracker CSV export into Linear

- Pivotal Stories → Linear Issues
- Pivotal Releases → Linear Parent Issues (with sub-issues)
- Preserves attachments, comments, labels, statuses, priorities, estimates, assignees, subscribers, dates

### For Developers

- Currently built for for Pivotal Tracker. However, you could alter your own CSV to adhere to the accepted format. See [Generic CSV](./CONTRIBUTING.md#generic-csv)
- See [Contributing Guide](./CONTRIBUTING.md) for instructions on adding support for other platforms (e.g., Trello)

Built with [Linear SDK](https://github.com/linear/linear/tree/master/packages/sdk)

**Disclaimer**: This is a community-maintained tool and is not officially associated with either Linear or Pivotal Tracker

## Key Features

- [File Attachments](#file-attachments) (optional)
- [Comments](#comments) (optional)
- [Labels](#labels) (optional)
- [Priority](#priority) (optional)
- [Estimate](#estimate) (optional)
- [Assignee](#assignee) (Automatically matches Pivotal Users to Linear Member accounts)
- [Releases](#releases) (Pivotal Releases → Linear parent issues with associated stories as sub-issues)
- [Statuses](#statuses)
- [Story Types](#story-types)
- [Subscribers](#subscribers)
- [Created Date](#created-date)
- [Due Date](#due-date)
- [Safe Retries](#safe-retries)
- [Logs](#logs)

#### Other

- [Notes](#notes)
- [ENV Options](#env-options)
- [API Rate Limits](#api-rate-limits)
- [TODO](#todo)

## Setup

Requires Node version: 20.0.0 or higher

### Installation

1. Create a Team and add Members in Linear
2. Create a Personal API key in Linear under Settings -> API
3. Create a `.env` file and and populate `API_KEY`
4. `yarn install` or `npm install`
5. Unzip Pivotal Tracker export zip file into `assets` folder

### Usage

1. `npm run import`

![alt text](image.png)

## Details

#### File Attachments

- `ENABLE_DETAILED_LOGGING` to view debug output

#### Comments

- Comments are imported with original metadata (author, timestamp) and content preserved. Each issue also includes a `Raw Pivotal Tracker Data` comment containing the complete CSV data

#### Statuses

- The following Workflow Statuses will be created in the selected Team. This allows each Team to modify statuses at their own pace without affecting other Teams, and will avoid any naming conflicts with existing statuses
  - `pivotal - accepted`
  - `pivotal - unscheduled`
  - `pivotal - finished`
  - `pivotal - planned`
  - `pivotal - started`

#### Labels

- The following Labels will be created in the selected Team. This allows each Team to modify labels at their own pace without affecting other Teams, and will avoid any naming conflicts with existing labels

  - `pivotal-epic`
  - `pivotal-release`
  - `pivotal-feature`
  - `pivotal-bug`
  - `pivotal-chore`

#### Story Types

- Configure your import by selecting specific story types via the CLI prompt

Linear Issues will be assigned a label with the corresponding Story Type (See [Labels](#labels))

**NOTE**: Rejected and Delivered stories are not imported, make sure any stories you want to import have been set to 'Unstarted' or "Finished" in Pivotal Tracker *before* you do the Pivotal export.

#### Releases

- Pivotal Releases → Linear parent issues with:
  - Label: `pivotal-release`
  - Associated stories as sub-issues

#### Priority

- Priority levels are mapped from Pivotal to Linear as follows:
  - P1 (Pivotal) → High (Linear)
  - P2 → Medium
  - P3 → Low

#### Estimate

- Prompts user to choose a new Estimate Scale
- Rounds pivotal estimate to nearest Linear value

#### Assignee

- Automatically matches Pivotal users to Linear team members by comparing names and emails
  - Prompts for manual matching when automatic matching fails
- For stories with multiple owners:

  - First owner becomes the assignee
  - Other owners become subscribers

  ![alt text](image-2.png)

- For stories without owners:
  - Story creator becomes the assignee
  - User Map data is stored in `log/<team>/user_mapping.json` (See [Logs](#logs)):

#### Subscribers

- Pivotal story owners become Linear subscribers
- Pivotal `Requested By` -> Linear `Creator` is not possible because the Linear API prevents this value from being changed
  - `Requested By` becomes either the owner (based on ABC order) or a subscriber
  - `Creator` will be set to the user who created the Personal API Key
  - See **Raw Pivotal Tracker Data** comment for original value

#### Created Date

- ⏰ Created Date of Pivotal Story will be preserved on the imported Linear Issue
- 📅 Original timestamps are maintained for historical accuracy

#### Due Date

- ✅ Due dates from Pivotal are copied exactly to Linear
- ❌ Stories without due dates in Pivotal will have no due date in Linear

#### Safe Retries

- Skips already imported stories to prevent duplicates

#### Logs

- All import data is stored in team-specific folders at `log/<team-name>/`, containing:

  - `output_<timestamp>.txt`

    - Complete console output from each import attempt
    - Useful for debugging and auditing imports
    - New file created for each import run

  - `user_mapping.json`

    - Maps Pivotal Tracker usernames to Linear user accounts
    - Used for automatic user matching in future imports
      ```json
      {
        "generated": "2024-01-01T00:00:00.000Z",
        "mapping": {
          "johndoe42": {
            "linearId": "a1b2c3d4-e5f6-4321-9876-543210fedcba",
            "linearName": "John Doe",
            "linearEmail": "john.doe@acme.com"
          },
          "robotcoder99": {
            "linearId": null,
            "linearName": null,
            "linearEmail": null,
            "note": "No matching Linear user found (manual skip)"
          }
        }
      }
      ```

  - `successful_imports.csv`
    - Tracks successfully imported Pivotal story IDs
    - Prevents duplicate imports on subsequent runs
    - Simple CSV format: one story ID per line

> ⚠️ **Important**  
> The `successful_imports.csv` file is critical for preventing duplicates. Only delete it if you intend to restart the import process from scratch.

> If you do want to start over completely, move the entire `log/<team-name>` folder to a backup location for history purposes. This is your record of all API activity and mapped users. Or delete it.

## Other

#### Notes

- Add Team Members in Linear before beginning import to take advantage of Automatic User mapping. However, users can be manually mapped.
- As the creator of every imported issue (via your API key), you will receive notifications for all created issues. Consider adjusting your notification settings in Linear before starting a large import. You may also consider unsubscribing right away from those issues that you are not interested in.
- Be mindful of notification preferences for your team members. This can get noisy while importing 😬

#### ENV Options

- `API_KEY` = ""
- `ENABLE_IMPORTING` = true
  - `false` to halt execution before any requests; allows testing CLI
- `ENABLE_DETAILED_LOGGING` = false
  - `true` to log all output. Enable this while developing or to see detailed messages
- `REQUEST_DELAY_MS` = 1
  - Increase if reaching API rate limits

#### API Rate Limits

- Linear sets rate limits on their API usage, which you will probably reach. The Linear team was helpful in increasing my rate limits temporarily. https://developers.linear.app/docs/graphql/working-with-the-graphql-api/rate-limiting.
- The `REQUEST_DELAY_MS` ENV var can be adjusted to throttle request frequency

## TODO

[Contributing Guide](./CONTRIBUTING.md)

- Importers
  - Generic CSV
  - Generic JSON
  - Trello
