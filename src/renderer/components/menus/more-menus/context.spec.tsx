import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import React from "react";
import {
  DialogMenuProvider,
  DialogContainer,
  useDialogState,
  useDialogActions,
} from "./context";

const TestConsumer: React.FC<{
  action?: (actions: ReturnType<typeof useDialogActions>) => void;
}> = ({ action }) => {
  const { activeDialogKey } = useDialogState();
  const actions = useDialogActions();

  if (action) {
    action(actions);
  }

  return <div data-testid="active-key">{activeDialogKey ?? "null"}</div>;
};

describe("DialogMenu Context and Container", () => {
  it("should throw error when useDialogState is used outside provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      "useDialogState must be used within a DialogMenuProvider",
    );
    spy.mockRestore();
  });

  it("should throw error when useDialogActions is used outside provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      "useDialogActions must be used within a DialogMenuProvider",
    );
    spy.mockRestore();
  });

  it("should initialize with null active dialog key", () => {
    render(
      <DialogMenuProvider>
        <TestConsumer />
      </DialogMenuProvider>,
    );

    expect(screen.getByTestId("active-key").textContent).toBe("null");
  });

  it("should update active dialog key when showDialog is called", () => {
    let capturedActions: ReturnType<typeof useDialogActions> | null = null;

    render(
      <DialogMenuProvider>
        <TestConsumer
          action={(actions) => {
            capturedActions = actions;
          }}
        />
      </DialogMenuProvider>,
    );

    act(() => {
      capturedActions?.showDialog("test-dialog");
    });

    expect(screen.getByTestId("active-key").textContent).toBe("test-dialog");
  });

  it("should reset active dialog key when closeDialog is called", () => {
    let capturedActions: ReturnType<typeof useDialogActions> | null = null;

    render(
      <DialogMenuProvider>
        <TestConsumer
          action={(actions) => {
            capturedActions = actions;
          }}
        />
      </DialogMenuProvider>,
    );

    act(() => {
      capturedActions?.showDialog("test-dialog");
    });
    expect(screen.getByTestId("active-key").textContent).toBe("test-dialog");

    act(() => {
      capturedActions?.closeDialog();
    });
    expect(screen.getByTestId("active-key").textContent).toBe("null");
  });

  it("should close dialog via handleOpenChange when open is false", () => {
    let capturedActions: ReturnType<typeof useDialogActions> | null = null;

    render(
      <DialogMenuProvider>
        <TestConsumer
          action={(actions) => {
            capturedActions = actions;
          }}
        />
      </DialogMenuProvider>,
    );

    act(() => {
      capturedActions?.showDialog("test-dialog");
    });
    expect(screen.getByTestId("active-key").textContent).toBe("test-dialog");

    act(() => {
      capturedActions?.handleOpenChange(false);
    });
    expect(screen.getByTestId("active-key").textContent).toBe("null");
  });

  it("should not close dialog via handleOpenChange when open is true", () => {
    let capturedActions: ReturnType<typeof useDialogActions> | null = null;

    render(
      <DialogMenuProvider>
        <TestConsumer
          action={(actions) => {
            capturedActions = actions;
          }}
        />
      </DialogMenuProvider>,
    );

    act(() => {
      capturedActions?.showDialog("test-dialog");
    });

    act(() => {
      capturedActions?.handleOpenChange(true);
    });
    expect(screen.getByTestId("active-key").textContent).toBe("test-dialog");
  });

  describe("DialogContainer", () => {
    it("should return null when activeDialogKey is null or items is undefined", () => {
      const { container } = render(
        <DialogMenuProvider>
          <DialogContainer contextProps={{}} items={undefined} />
        </DialogMenuProvider>,
      );
      expect(container.firstChild).toBeNull();
    });

    it("should render the correct dialog when activeDialogKey matches item map", () => {
      const renderFn = vi.fn((opts) => (
        <div data-testid="dialog-content">Dialog: {opts.props.name}</div>
      ));
      const itemsMap = new Map([["my-dialog", renderFn]]);

      let capturedActions: ReturnType<typeof useDialogActions> | null = null;

      render(
        <DialogMenuProvider>
          <TestConsumer
            action={(actions) => {
              capturedActions = actions;
            }}
          />
          <DialogContainer contextProps={{ name: "Admin" }} items={itemsMap} />
        </DialogMenuProvider>,
      );

      act(() => {
        capturedActions?.showDialog("my-dialog");
      });

      expect(screen.getByTestId("dialog-content").textContent).toBe(
        "Dialog: Admin",
      );
      expect(renderFn).toHaveBeenCalledWith(
        expect.objectContaining({
          props: { name: "Admin" },
          open: true,
          close: expect.any(Function),
          onOpenChange: expect.any(Function),
        }),
      );
    });

    it("should return null when activeDialogKey does not exist in items map", () => {
      const itemsMap = new Map([["other-dialog", () => <div>Other</div>]]);

      let capturedActions: ReturnType<typeof useDialogActions> | null = null;

      const { container } = render(
        <DialogMenuProvider>
          <TestConsumer
            action={(actions) => {
              capturedActions = actions;
            }}
          />
          <DialogContainer contextProps={{}} items={itemsMap} />
        </DialogMenuProvider>,
      );

      act(() => {
        capturedActions?.showDialog("missing-dialog");
      });

      expect(
        container.querySelector('[data-testid="dialog-content"]'),
      ).toBeNull();
    });
  });
});
