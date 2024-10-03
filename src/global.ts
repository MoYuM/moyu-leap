import { ExtensionContext } from "vscode";
import { MOYU_STORE_KEY } from "./constant";
import { MoyuStore } from "./interface";

export class Global {
  static context: ExtensionContext;

  static set = (store: Partial<MoyuStore>) => {
    const currentStore = this.get();
    this.context.workspaceState.update(MOYU_STORE_KEY, {
      ...currentStore,
      ...store,
    });
  };

  static get = () => {
    return this.context.workspaceState.get<MoyuStore>(MOYU_STORE_KEY);
  };
}
