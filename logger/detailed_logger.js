import { ENABLE_DETAILED_LOGGING } from "../config/config.js";
import chalk from "chalk";

class DetailedLogger {
  constructor(prefix = "") {
    this.prefix = prefix;
  }

  info(message) {
    if (ENABLE_DETAILED_LOGGING === false) return;
    console.log(chalk.dim.yellowBright(`🔸 ${message}`));
  }

  loading(message) {
    if (ENABLE_DETAILED_LOGGING === false) return;
    console.log(chalk.dim.yellowBright(`⏳ ${message}...`));
  }

  success(message) {
    if (ENABLE_DETAILED_LOGGING === false) return;
    console.log(chalk.green(`✅ ${message}`));
  }

  warning(message) {
    if (ENABLE_DETAILED_LOGGING === false) return;
    console.warn(chalk.dim.yellow(`⚠️ ${message}`));
  }

  result(message) {
    if (ENABLE_DETAILED_LOGGING === false) return;
    console.log(chalk.green(`📊 ${message}`));
  }

  created({ attribute, originalId, createdId, message }) {
    console.log(
      `✅ ${chalk.green(`${attribute} created`)} ${chalk.cyan(originalId)} => ${chalk.cyan(createdId)} - ${chalk.magenta(message)}`,
    );
  }

  createdSecondary(attribute, id, message = "") {
    console.log(
      `✅ ${chalk.yellow(`${attribute} created`)} ${chalk.cyan(id)} => ${chalk.dim(message)}`,
    );
  }

  error(message, error) {
    const errorMessage = error ? `${message} ${error}` : message;
    console.error(chalk.red(`❌ ${errorMessage}`));
  }

  importantInfo(message) {
    if (ENABLE_DETAILED_LOGGING === false) return;
    console.log("\n" + chalk.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
    console.log(chalk.bold.cyan(`  ✨ ${message}`));
    console.log(chalk.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"));
  }

  importantLoading(message) {
    // if (ENABLE_DETAILED_LOGGING === false) return;
    console.log("\n" + chalk.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
    console.log(chalk.bold.cyan(`  ⏳ ${message}...`));
    console.log(chalk.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"));
  }

  importantSuccess(message) {
    // if (ENABLE_DETAILED_LOGGING === false) return;
    console.log("\n" + chalk.green("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
    console.log(chalk.bold.green(`  ✨ ${message}`));
    console.log(chalk.green("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"));
  }

  importantError(message) {
    // if (ENABLE_DETAILED_LOGGING === false) return;
    console.error("\n" + chalk.red("▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓"));
    console.error(chalk.bold.red(`  ⚠️  ${message}`));
    console.error(chalk.red("▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓\n"));
  }

  importantSummary(message) {
    // if (ENABLE_DETAILED_LOGGING === false) return;
    console.log("\n" + chalk.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
    console.log(chalk.bold.cyan(`  📊 ${message}`));
    console.log(chalk.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"));
  }
}

export default DetailedLogger;

// Example Usage:
/*
import Logger from './detailed_logger.mjs';

// Create a logger instance with a prefix
const apiLogger = new Logger('API');
apiLogger.info('Server started on port 3000');    // [2024-03-20T15:30:45.123Z] [API] Server started on port 3000
apiLogger.warning('High memory usage');           // [2024-03-20T15:30:45.124Z] [API] High memory usage
apiLogger.error('Database connection failed');     // [2024-03-20T15:30:45.125Z] [API] Database connection failed

// Create a logger instance without a prefix
const generalLogger = new Logger();
generalLogger.info('Application initialized');     // [2024-03-20T15:30:45.126Z] Application initialized
*/
