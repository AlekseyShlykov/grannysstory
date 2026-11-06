import { describe, expect, it, vi } from "vitest";
import { recordEventVote, syncEventFeedback } from "../src/app/eventFeedback";

describe("event feedback queue", () => {
  it("drains votes added while an earlier request is still in flight", async () => {
    let releaseFirst: (() => void) | undefined;
    const firstRequest = new Promise<void>((resolve) => { releaseFirst = resolve; });
    const fetchMock = vi.fn()
      .mockImplementationOnce(async () => {
        await firstRequest;
        return new Response(null, { status: 204 });
      })
      .mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    recordEventVote("event:first", 1, "test");
    const syncing = syncEventFeedback();
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    recordEventVote("event:second", -1, "test");
    void syncEventFeedback();
    releaseFirst?.();
    await syncing;

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls.map((call) => JSON.parse(String(call[1]?.body)).eventId)).toEqual(["event:first", "event:second"]);
    expect(localStorage.getItem("babushka-event-feedback-queue-v1")).toBe("{}");
  });

  it("sends the newest vote when the same event changes during a request", async () => {
    let releaseFirst: (() => void) | undefined;
    const firstRequest = new Promise<void>((resolve) => { releaseFirst = resolve; });
    const fetchMock = vi.fn()
      .mockImplementationOnce(async () => {
        await firstRequest;
        return new Response(null, { status: 204 });
      })
      .mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    recordEventVote("event:changed", 1, "test");
    const syncing = syncEventFeedback();
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    recordEventVote("event:changed", -1, "test");
    void syncEventFeedback();
    releaseFirst?.();
    await syncing;

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const sentVotes = fetchMock.mock.calls.map((call) => JSON.parse(String(call[1]?.body)).vote);
    expect(sentVotes).toEqual([1, -1]);
    expect(localStorage.getItem("babushka-event-feedback-queue-v1")).toBe("{}");
  });

  it("sends a vote cast while an empty sync is still finishing", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    // The final screen starts a sync with an empty queue; a vote lands before that sync has settled.
    const opening = syncEventFeedback();
    recordEventVote("event:quick", 1, "test");
    void syncEventFeedback();
    await opening;

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)).eventId).toBe("event:quick");
    await vi.waitFor(() => expect(localStorage.getItem("babushka-event-feedback-queue-v1")).toBe("{}"));
  });
});
