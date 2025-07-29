export class TableActionHandler<T> {
  private actions: Record<string, (value: T) => void> = {};

  /**
   * Registers a callback for a specific action name.
   * @param name The action identifier.
   * @param callback The function to execute when the action is triggered.
   */
  on(name: string, callback: (value: T) => void): void {
    this.actions[name] = callback;
  }

  /**
   * Triggers the callback associated with the given action name.
   * @param name The action identifier.
   * @param value The value to pass to the callback.
   */
  trigger(name: string, value: T): void {
    const callback = this.actions[name];
    if (callback) {
      callback(value);
    }
  }
}
