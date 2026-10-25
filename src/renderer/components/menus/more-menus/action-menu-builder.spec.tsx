import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MenuItemBuilder, createMenuBuilder } from "./index";

describe("MenuItemBuilder and ActionMenu", () => {
  it("should build a valid item configuration via fluent builder", () => {
    const builder = new MenuItemBuilder<{ id: string }>("Test Label");
    builder
      .action(async () => "result")
      .shortcut("Ctrl+T")
      .destructive();

    const config = builder.build();
    expect(config.label).toBe("Test Label");
    expect(config.type).toBe("action");
    expect(config.shortcut).toBe("Ctrl+T");
    expect(config.variant).toBe("destructive");
    expect(typeof config.onAction).toBe("function");
  });

  it("should evaluate dynamic properties correctly during render", async () => {
    interface Context {
      userRole: string;
    }

    const Menu = createMenuBuilder<Context, "actionKey">().build({
      actionKey: new MenuItemBuilder<Context>()
        .label((ctx) => `Role: ${ctx.userRole}`)
        .action(async () => "success"),
    });

    const onSuccessMock = vi.fn();

    render(
      <Menu userRole="Administrator" onSuccess={onSuccessMock}>
        <button data-testid="trigger">Open</button>
      </Menu>,
    );

    const trigger = screen.getByTestId("trigger");
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Role: Administrator")).toBeDefined();
    });
  });

  it("should handle asynchronous action execution and trigger onSuccess", async () => {
    interface Context {
      id: string;
    }

    const actionFn = vi.fn().mockResolvedValue({ status: "ok" });
    const onSuccessMock = vi.fn();

    const Menu = createMenuBuilder<Context, "asyncAction">().build([
      {
        key: "asyncAction",
        type: "action",
        label: "Run Async",
        onAction: actionFn,
      },
    ]);

    render(
      <Menu id="123" onSuccess={onSuccessMock}>
        <button data-testid="trigger">Open</button>
      </Menu>,
    );

    fireEvent.click(screen.getByTestId("trigger"));

    const menuItem = await screen.findByText("Run Async");
    fireEvent.click(menuItem);

    await waitFor(() => {
      expect(actionFn).toHaveBeenCalledOnce();
      expect(onSuccessMock).toHaveBeenCalledWith("asyncAction", {
        status: "ok",
      });
    });
  });

  it("should respect disabled and hidden item keys", async () => {
    const Menu = createMenuBuilder<{}, "disabledKey" | "hiddenKey">().build([
      { key: "disabledKey", type: "action", label: "Disabled Item" },
      { key: "hiddenKey", type: "action", label: "Hidden Item" },
    ]);

    render(
      <Menu disabled={["disabledKey"]} hidden={["hiddenKey"]}>
        <button data-testid="trigger">Open</button>
      </Menu>,
    );

    fireEvent.click(screen.getByTestId("trigger"));

    await waitFor(() => {
      const disabledItem = screen.queryByText("Disabled Item");
      const hiddenItem = screen.queryByText("Hidden Item");

      expect(disabledItem).toBeDefined();
      expect(disabledItem?.closest('[aria-disabled="true"]')).not.toBeNull();
      expect(hiddenItem).toBeNull();
    });
  });
});
