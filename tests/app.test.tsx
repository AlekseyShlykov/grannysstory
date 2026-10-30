import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../src/app/App";
import leningradPack from "../content/historical/leningrad.json";
import moscowPack from "../content/historical/moscow.json";
import novgorodPack from "../content/historical/novgorod.json";
import smolenskPack from "../content/historical/smolensk.json";
import tverPack from "../content/historical/tver.json";

const packs: Record<string, unknown> = {
  leningrad: leningradPack,
  moscow: moscowPack,
  novgorod: novgorodPack,
  smolensk: smolenskPack,
  tver: tverPack
};

/** The start screen opens on a random place and year; tests that need Tver choose it like a player would. */
function renderInTver() {
  render(<App />);
  fireEvent.change(screen.getByLabelText("Где она родилась?"), { target: { value: "tver" } });
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
    const regionId = url.match(/regions\/(\w+)\.json/)?.[1] ?? "";
    const pack = packs[regionId];
    return pack
      ? new Response(JSON.stringify(pack), { status: 200, headers: { "Content-Type": "application/json" } })
      : new Response("missing", { status: 404 });
  }));
});

describe("accessible vertical slice", () => {
  it("opens with manual birthplace and year controls plus a random option", () => {
    renderInTver();
    expect(screen.getByRole("heading", { name: "История бабушки" })).toBeInTheDocument();
    expect(screen.queryByText("короткая история о долгой жизни")).not.toBeInTheDocument();
    expect(screen.getByText(/Посмотрите на историю глазами простых людей\. Каждая история генерируется случайным образом\. Исторический фон и события опираются на архивные данные\./)).toBeInTheDocument();
    expect(screen.getByText("Выберите место и год рождения или доверьте выбор случаю.")).toBeInTheDocument();
    expect(screen.getByLabelText("Где она родилась?")).toBeInTheDocument();
    expect(screen.getByLabelText("В каком году?")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "1900" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Лион" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Начать с выбранными данными" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Случайная история" })).toBeInTheDocument();
    expect(screen.getByText("История создается на основании архивов")).toBeInTheDocument();
    expect(screen.queryByText(/История хранится только в этом браузере/)).not.toBeInTheDocument();
    const archiveDisclosure = screen.getByText("Архивы и официальные источники: Россия").closest("details");
    expect(archiveDisclosure).not.toHaveAttribute("open");
    fireEvent.click(screen.getByText("Архивы и официальные источники: Россия"));
    expect(archiveDisclosure).toHaveAttribute("open");
    expect(screen.getByRole("link", { name: /Боевое донесение штаба Калининского фронта/ })).toHaveAttribute("href", "https://www.prlib.ru/item/1864605");
  });

  it("lists the sources behind the memories in a closed disclosure", () => {
    render(<App />);
    expect(screen.getByText("Вдохновлено настоящими жизнями")).toBeInTheDocument();
    const disclosure = screen.getByText("Откуда берутся воспоминания").closest("details");
    expect(disclosure).not.toHaveAttribute("open");
    fireEvent.click(screen.getByText("Откуда берутся воспоминания"));
    expect(disclosure).toHaveAttribute("open");
    expect(screen.getByRole("link", { name: /^SHARELIFE,/ })).toHaveAttribute("href", "https://share-eric.eu/data/data-documentation/waves-overview/wave-3");
    expect(screen.getByRole("link", { name: /^StoryCorps,/ })).toBeInTheDocument();
    expect(screen.getByText(/Сама бабушка вымышлена/)).toBeInTheDocument();
    // Prozhito has not been researched (docs/DATA_SOURCES.md), so it is not claimed as a source.
    expect(screen.queryByText(/Прожито|Prozhito/)).not.toBeInTheDocument();
  });

  it("changes the archive list with the selected location", () => {
    render(<App />);
    const location = screen.getByLabelText("Где она родилась?");

    fireEvent.change(location, { target: { value: "moscow" } });
    expect(screen.getByRole("link", { name: /Сводка штаба МПВО г\. Москвы/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /День полного освобождения Ленинграда/ })).not.toBeInTheDocument();

    fireEvent.change(location, { target: { value: "leningrad" } });
    expect(screen.getByRole("link", { name: /День полного освобождения Ленинграда/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /История административно-территориального деления/ })).toHaveAttribute("href", "https://spbarchives.ru/infres/-/archive/cga/guide/187");
    expect(screen.queryByRole("link", { name: /Сводка штаба МПВО г\. Москвы/ })).not.toBeInTheDocument();

    fireEvent.change(location, { target: { value: "fr-lyon" } });
    expect(screen.getByText("Архивы и официальные источники: Франция")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Archives nationales/ })).toHaveAttribute("href", "https://www.archives-nationales.culture.gouv.fr/");
    expect(screen.queryByRole("link", { name: /Боевое донесение штаба Калининского фронта/ })).not.toBeInTheDocument();
  });

  it("uses the selected place and caps a 1927 interview at the current year", async () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText("Где она родилась?"), { target: { value: "moscow" } });
    fireEvent.change(screen.getByLabelText("В каком году?"), { target: { value: "1927" } });
    expect(screen.getByText(/Год разговора: 2026\. Бабушке 99 лет/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Начать с выбранными данными" }));
    const group = await screen.findByRole("group", { name: "Что спросить" });
    expect(fetch).toHaveBeenCalledWith("/data/regions/moscow.json");
    expect(group.textContent).toContain("Где и когда ты родилась?");
    fireEvent.click(screen.getByRole("button", { name: "Где и когда ты родилась?" }));
    expect(screen.getByLabelText("Последний вопрос и ответ").textContent).toMatch(/1927/);
  });

  it("can start a fully random supported story", async () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Случайная история" }));
    await screen.findByRole("group", { name: "Что спросить" });
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/^\/data\/(regions\/\w+|world\/packs\/[\w-]+)\.json$/));
  });

  it("opens on a random place and year on each load", () => {
    const random = vi.spyOn(crypto, "getRandomValues");
    const pick = (values: number[]) => {
      random.mockImplementationOnce(((array: Uint32Array) => { array[0] = values[0]!; return array; }) as never);
      random.mockImplementationOnce(((array: Uint32Array) => { array[0] = values[1]!; return array; }) as never);
    };
    pick([0, 0]);
    const first = render(<App />);
    const firstPlace = (screen.getByLabelText("Где она родилась?") as HTMLSelectElement).value;
    expect(screen.getByLabelText("В каком году?")).toHaveValue("1900");
    first.unmount();
    pick([1, 7]);
    render(<App />);
    expect((screen.getByLabelText("Где она родилась?") as HTMLSelectElement).value).not.toBe(firstPlace);
    expect(screen.getByLabelText("В каком году?")).toHaveValue("1907");
    random.mockRestore();
  });

  it("can be completed using buttons only", async () => {
    renderInTver();
    fireEvent.click(screen.getByRole("button", { name: "Начать с выбранными данными" }));
    await screen.findByRole("group", { name: "Что спросить" });
    const exchange = screen.getByLabelText("Последний вопрос и ответ");
    expect(exchange.querySelectorAll("p")).toHaveLength(1);
    expect(document.querySelector(".scene-text, .scene-eyebrow, .thread")).toBeNull();
    let turns = 0;
    while (screen.queryByRole("group", { name: "Что спросить" }) && turns < 30) {
      const group = screen.getByRole("group", { name: "Что спросить" });
      const first = group.querySelector("button");
      expect(first).not.toBeNull();
      fireEvent.click(first!);
      turns += 1;
      if (screen.queryByRole("group", { name: "Что спросить" })) {
        const answer = screen.getByLabelText("Последний вопрос и ответ").textContent ?? "";
        expect(screen.getByLabelText("Последний вопрос и ответ").querySelectorAll("p")).toHaveLength(2);
        expect(answer).not.toContain("происходило вот что");
      }
    }
    expect(turns).toBeGreaterThan(12);
    expect(screen.getByRole("heading", { name: "Её жизнь" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Хронология" })).toBeInTheDocument();
  });

  it("keeps the start screen usable when a regional pack is missing", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("missing", { status: 404 })));
    renderInTver();
    fireEvent.click(screen.getByRole("button", { name: "Начать с выбранными данными" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Не удалось загрузить локальный пакет региона");
    expect(screen.getByRole("button", { name: "Начать с выбранными данными" })).toBeInTheDocument();
  });
});
