import {Command} from './command.interface.js';
import chalk from 'chalk';

export class HelpCommand implements Command {
  public getName(): string {
    return '--help';
  }

  public async execute(..._parameters: string[]): Promise<void> {
    console.info(
      chalk.blue('Программа для подготовки данных для REST API сервера.\n\n') +
      chalk.green('Пример: cli.js --<command> [--arguments]\n\n') +
      chalk.blue('Команды:\n') +
      chalk.green('--version:                   # выводит номер версии\n') +
      chalk.green('--help:                      # печатает этот текст\n') +
      chalk.green('--import <path>:             # импортирует данные из TSV\n') +
      chalk.green('--generate <n> <path> <url>  # генерирует произвольное количество тестовых данных\n')
    );
  }
}
