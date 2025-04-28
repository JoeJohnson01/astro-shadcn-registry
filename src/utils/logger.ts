import kleur from "kleur";

/**
 * Logger utility for the astro-shadcn-registry integration
 */
export class Logger {
  private prefix: string;

  constructor(prefix: string = "astro-shadcn-registry") {
    this.prefix = prefix;
  }

  /**
   * Log an informational message
   * @param message Message to log
   */
  info(message: string): void {
    console.log(`${kleur.blue(this.prefix)} ${message}`);
  }

  /**
   * Log a success message
   * @param message Message to log
   */
  success(message: string): void {
    console.log(`${kleur.green(this.prefix)} ${kleur.green("✓")} ${message}`);
  }

  /**
   * Log a warning message
   * @param message Message to log
   */
  warn(message: string): void {
    console.log(`${kleur.yellow(this.prefix)} ${kleur.yellow("⚠")} ${message}`);
  }

  /**
   * Log an error message
   * @param message Message to log
   */
  error(message: string): void {
    console.error(`${kleur.red(this.prefix)} ${kleur.red("✗")} ${message}`);
  }

  /**
   * Log a debug message (only in debug mode)
   * @param message Message to log
   */
  debug(message: string): void {
    if (process.env.DEBUG) {
      console.log(
        `${kleur.gray(this.prefix)} ${kleur.gray("🔍")} ${kleur.gray(message)}`
      );
    }
  }

  /**
   * Create a spinner for long-running tasks
   * @param message Initial message to display
   * @returns Object with update and complete methods
   */
  spinner(message: string) {
    process.stdout.write(`${kleur.blue(this.prefix)} ${message}...`);

    return {
      update: (newMessage: string) => {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.write(`${kleur.blue(this.prefix)} ${newMessage}...`);
      },
      complete: (finalMessage: string) => {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        console.log(
          `${kleur.blue(this.prefix)} ${kleur.green("✓")} ${finalMessage}`
        );
      },
      error: (errorMessage: string) => {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        console.error(
          `${kleur.red(this.prefix)} ${kleur.red("✗")} ${errorMessage}`
        );
      },
    };
  }
}

// Export a default logger instance
export const logger = new Logger();
