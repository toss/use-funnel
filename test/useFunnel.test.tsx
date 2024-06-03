import { afterEach, describe, expect, test } from "vitest";
import { act, renderHook } from "@testing-library/react-hooks";
import { render, screen, cleanup } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { BrowserRouter, useNavigate } from "react-router-dom";

import {
  FunnelAdapterProvider,
  FunnelRender,
  useFunnel,
  withEvents,
} from "../src/index.js";
import { stateAdapter } from "../src/adapters/state.js";
import { ReactRouterV6Adapter } from "../src/adapters/reactRouter6.js";

function exhaustiveCheck(value: never): never {
  throw new Error(`Unhandled value: ${value}`);
}

describe("useFunnel()", () => {
  afterEach(cleanup);

  test("should work only hook", () => {
    const { result } = renderHook(() =>
      useFunnel<{
        A: { id?: string };
        B: { id: string };
      }>({
        id: "vitest",
        initial: {
          step: "A",
          context: {},
        },
        adapter: stateAdapter,
      })
    );
    expect(result.current.step).toBe("A");
    expect(result.current.context).toEqual({});
    act(() => {
      if (result.current.step === "A") {
        result.current.history.push("B", { id: "1" });
      }
    });
    expect(result.current.step).toBe("B");
    expect(result.current.context).toEqual({ id: "1" });
  });

  test("should work useFunnel with FunnelAdapterProvider", () => {
    const { result } = renderHook(
      () =>
        useFunnel<{
          A: { id?: string };
          B: { id: string };
        }>({
          id: "vitest",
          initial: {
            step: "A",
            context: {},
          },
        }),
      {
        wrapper: ({ children }: React.PropsWithChildren) => (
          <FunnelAdapterProvider adapter={stateAdapter}>
            {children}
          </FunnelAdapterProvider>
        ),
      }
    );
    expect(result.current.step).toBe("A");
    expect(result.current.context).toEqual({});
    act(() => {
      if (result.current.step === "A") {
        result.current.history.push("B", { id: "1" });
      }
    });
    expect(result.current.step).toBe("B");
    expect(result.current.context).toEqual({ id: "1" });
  });

  test("should work useFunnel with component render", async () => {
    function FunnelTest() {
      const funnel = useFunnel<{
        A: { id?: string };
        B: { id: string };
      }>({
        id: "vitest",
        initial: {
          step: "A",
          context: {},
        },
        adapter: stateAdapter,
      });

      switch (funnel.step) {
        case "A": {
          return (
            <button onClick={() => funnel.history.push("B", { id: "vitest" })}>
              Go B
            </button>
          );
        }
        case "B": {
          return <div>{funnel.context.id}</div>;
        }
        default: {
          exhaustiveCheck(funnel);
        }
      }
    }

    render(<FunnelTest />);

    expect(screen.queryByText("Go B")).not.toBeNull();

    const user = userEvent.setup();
    await user.click(screen.getByText("Go B"));

    expect(screen.queryByText("vitest")).not.toBeNull();
  });

  test("should work funnel.Render", async () => {
    function FunnelRenderTest() {
      const funnel = useFunnel<{
        A: { id?: string };
        B: { id: string };
      }>({
        id: "vitest",
        initial: {
          step: "A",
          context: {},
        },
        adapter: stateAdapter,
      });
      return (
        <funnel.Render
          A={({ history }) => (
            <button onClick={() => history.push("B", { id: "vitest" })}>
              Go B
            </button>
          )}
          B={({ context }) => <div>{context.id}</div>}
        />
      );
    }

    render(<FunnelRenderTest />);

    expect(screen.queryByText("Go B")).not.toBeNull();

    const user = userEvent.setup();
    await user.click(screen.getByText("Go B"));

    expect(screen.queryByText("vitest")).not.toBeNull();
  });

  test("should work funnel.Render", async () => {
    function FunnelRenderTest() {
      const funnel = useFunnel<{
        A: { id?: string };
        B: { id: string };
      }>({
        id: "vitest",
        initial: {
          step: "A",
          context: {},
        },
        adapter: stateAdapter,
      });
      return (
        <FunnelRender
          funnel={funnel}
          steps={{
            A: ({ history }) => (
              <button onClick={() => history.push("B", { id: "vitest" })}>
                Go B
              </button>
            ),
            B: ({ context }) => <div>{context.id}</div>,
          }}
        />
      );
    }

    render(<FunnelRenderTest />);

    expect(screen.queryByText("Go B")).not.toBeNull();

    const user = userEvent.setup();
    await user.click(screen.getByText("Go B"));

    expect(screen.queryByText("vitest")).not.toBeNull();
  });

  test("should work funnel.withEvents", async () => {
    function FunnelWithEventsTest() {
      const funnel = useFunnel<{
        A: { id?: string };
        B: { id: string };
      }>({
        id: "vitest",
        initial: {
          step: "A",
          context: {},
        },
        adapter: stateAdapter,
      });
      return (
        <funnel.Render
          A={withEvents({
            events: {
              GoB: (payload: { id: string }, { history }) => {
                return history.push("B", { id: payload.id });
              },
            },
            render({ dispatch }) {
              return (
                <button
                  onClick={() =>
                    dispatch({ type: "GoB", payload: { id: "vitest" } })
                  }
                >
                  Go B
                </button>
              );
            },
          })}
          B={({ context }) => <div>{context.id}</div>}
        />
      );
    }

    render(<FunnelWithEventsTest />);

    expect(screen.queryByText("Go B")).not.toBeNull();

    const user = userEvent.setup();
    await user.click(screen.getByText("Go B"));

    expect(screen.queryByText("vitest")).not.toBeNull();
  });

  test("should work reactRouterAdater", async () => {
    function FunnelTest() {
      const funnel = useFunnel<{
        A: { id?: string };
        B: { id: string };
      }>({
        id: "vitest",
        initial: {
          step: "A",
          context: {},
        },
        adapter: ReactRouterV6Adapter,
      });
      const navigate = useNavigate();

      switch (funnel.step) {
        case "A": {
          return (
            <button onClick={() => funnel.history.push("B", { id: "vitest" })}>
              Go B
            </button>
          );
        }
        case "B": {
          return (
            <div>
              <button onClick={() => navigate(-1)}>Go Back</button>
              <div>{funnel.context.id}</div>
            </div>
          );
        }
        default: {
          exhaustiveCheck(funnel);
        }
      }
    }

    render(<FunnelTest />, { wrapper: BrowserRouter });

    expect(screen.queryByText("Go B")).not.toBeNull();

    const user = userEvent.setup();
    await user.click(screen.getByText("Go B"));

    expect(screen.queryByText("vitest")).not.toBeNull();

    // check history states
    expect(new URLSearchParams(location.search).get("vitest.step")).toBe("B");
    expect(history.state["usr"]).toHaveProperty("vitest.context", {
      id: "vitest",
    });

    await user.click(screen.getByText("Go Back"));

    expect(screen.queryByText("vitest")).toBeNull();
    expect(screen.queryByText("Go B")).not.toBeNull();
  });

  test("should work FunnelRender overlay", async () => {
    function FunnelRenderTest() {
      const funnel = useFunnel<{
        A: { id?: string };
        B: { id: string };
      }>({
        id: "vitest",
        initial: {
          step: "A",
          context: {},
        },
        adapter: stateAdapter,
      });
      return (
        <FunnelRender
          funnel={funnel}
          steps={{
            A: ({ history }) => (
              <button onClick={() => history.push("B", { id: "vitest" })}>
                Go B
              </button>
            ),
            B: {
              type: "overlay",
              render: ({ context }) => <div>{context.id}</div>,
            },
          }}
        />
      );
    }

    render(<FunnelRenderTest />);

    expect(screen.queryByText("Go B")).not.toBeNull();

    const user = userEvent.setup();
    await user.click(screen.getByText("Go B"));

    expect(screen.queryByText("Go B")).not.toBeNull();
    expect(screen.queryByText("vitest")).not.toBeNull();
  });
});
