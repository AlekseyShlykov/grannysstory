import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../src/app/App";
import { storyAudio } from "../src/app/audio";
import { I18nProvider } from "../src/i18n";
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
  storyAudio.setEnabled(true);
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
    const regionId = url.match(/regions\/(\w+)\.json/)?.[1] ?? "";
    const pack = packs[regionId];
    return pack
      ? new Response(JSON.stringify(pack), { status: 200, headers: { "Content-Type": "application/json" } })
      : new Response("missing", { status: 404 });
  }));
});

describe("accessible vertical slice", () => {
  it("switches between Russian and English from the fixed menu and remembers the choice", () => {
    const view = render(<I18nProvider><App /></I18nProvider>);
    const english = screen.getByRole("button", { name: "EN" });
    expect(english).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("heading", { name: "Granny's Story" })).toBeInTheDocument();
    expect(screen.getByLabelText("Where was she born?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start with these details" })).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("en");
    expect(localStorage.getItem("babushka.locale")).toBe("en");

    fireEvent.click(screen.getByRole("button", { name: "RU" }));
    expect(screen.getByRole("heading", { name: "История бабушки" })).toBeInTheDocument();
    expect(localStorage.getItem("babushka.locale")).toBe("ru");

    view.unmount();
    render(<I18nProvider><App /></I18nProvider>);
    expect(screen.getByRole("heading", { name: "История бабушки" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "EN" }));
    expect(screen.getByRole("heading", { name: "Granny's Story" })).toBeInTheDocument();
  });

  it("switches an active conversation to English without starting it again", async () => {
    localStorage.setItem("babushka.locale", "ru");
    render(<I18nProvider><App /></I18nProvider>);
    fireEvent.change(screen.getByLabelText("Где она родилась?"), { target: { value: "tver" } });
    fireEvent.change(screen.getByLabelText("В каком году?"), { target: { value: "1932" } });
    fireEvent.click(screen.getByRole("button", { name: "Начать с выбранными данными" }));
    await waitFor(() => expect(screen.getByRole("group", { name: "Что спросить" })).toBeInTheDocument());

    const firstQuestion = screen.getByRole("group", { name: "Что спросить" }).querySelector("button")?.textContent ?? "";
    fireEvent.click(screen.getByRole("button", { name: "EN" }));
    const translatedGroup = screen.getByRole("group", { name: "What to ask" });
    expect(translatedGroup).toBeInTheDocument();
    expect(translatedGroup.textContent).not.toContain(firstQuestion);
    expect(translatedGroup.textContent).not.toMatch(/[А-Яа-яЁё]/u);
    expect(screen.getByRole("button", { name: "Another story" })).toBeInTheDocument();
  });

  it("opens with manual birthplace and year controls plus a random option", () => {
    renderInTver();
    expect(screen.getByRole("heading", { name: "История бабушки" })).toBeInTheDocument();
    expect(screen.queryByText("короткая история о долгой жизни")).not.toBeInTheDocument();
    expect(screen.getByText("Посмотрите на историю глазами простых людей. Каждая история генерируется случайным образом. Исторический фон и события опираются на архивные данные и воспоминания людей.")).toBeInTheDocument();
    expect(screen.getByText("Выберите место и год рождения или доверьте выбор случаю.")).toBeInTheDocument();
    expect(screen.getByLabelText("Где она родилась?")).toBeInTheDocument();
    expect(screen.getByLabelText("В каком году?")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "1900" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Лион" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Начать с выбранными данными" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Случайная история" })).toBeInTheDocument();
    expect(document.querySelector(".coverage-note, .interview-note")).toBeNull();
    expect(document.querySelector(".site-header")).toHaveTextContent("История бабушки");
    expect(screen.getByRole("link", { name: "Created by Alex Shlykov" })).toHaveAttribute("href", "https://buildtounderstand.dev/");
    expect(screen.getByRole("link", { name: "Написать Алексу Шлыкову" })).toHaveAttribute("href", "mailto:buildtounderstand@gmail.com");
    fireEvent.click(screen.getByRole("button", { name: "Выключить звук" }));
    expect(screen.getByRole("button", { name: "Включить звук" })).toBeInTheDocument();
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

  it("uses the selected place and caps a 1927 interview at 2020", async () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText("Где она родилась?"), { target: { value: "moscow" } });
    fireEvent.change(screen.getByLabelText("В каком году?"), { target: { value: "1927" } });
    expect(screen.queryByText(/Год разговора: 2020/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Начать с выбранными данными" }));
    const group = await screen.findByRole("group", { name: "Что спросить" });
    expect(screen.getByRole("link", { name: "Created by Alex Shlykov" })).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith("/data/regions/moscow.json");
    expect(group.textContent).toContain("Где и когда ты родилась?");
    const viewport = document.querySelector<HTMLElement>(".app-screen")!;
    viewport.scrollTop = 240;
    fireEvent.click(screen.getByRole("button", { name: "Где и когда ты родилась?" }));
    expect(viewport.scrollTop).toBe(0);
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
    expect(screen.getByRole("heading", { name: "История бабушки" })).toBeInTheDocument();
    expect(screen.getByText("Вы можете помочь и улучшить эту игру. Если какое-то событие вам сильно запомнилось, поставьте палец вверх, а если какое-то показалось лишним, поставьте палец вниз.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Хронология" })).toBeInTheDocument();
    expect(screen.queryByText("после разговора")).not.toBeInTheDocument();
    expect(screen.queryByText("Кем вы друг другу")).not.toBeInTheDocument();
    expect(screen.queryByText("О чём она сегодня не рассказала")).not.toBeInTheDocument();
    expect(screen.queryByText("Даже между названными датами осталось многое, чего нет на этой странице.")).not.toBeInTheDocument();
    expect(screen.queryByText("На кухне щёлкает выключатель чайника. Разговор можно было продолжить, но на сегодня достаточно.")).not.toBeInTheDocument();
    expect(screen.queryByText("Почему-то именно это она вспомнила без подсказки.")).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("Это проверенный исторический фон, а не утверждение о её личном опыте.");
    expect(screen.getByRole("heading", { name: "Самое сильное воспоминание бабушки" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Другие мои игры" })).toHaveAttribute("href", "https://buildtounderstand.dev/");
    expect(screen.getByRole("link", { name: "Подписаться на мои обновления" })).toHaveAttribute("href", "https://buildtounderstand.substack.com/");
    expect(screen.getByRole("link", { name: "buildtounderstand@gmail.com" })).toHaveAttribute("href", "mailto:buildtounderstand@gmail.com");
    expect(screen.getByText(/оставить фидбек или обратить внимание на неточность/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Поделиться игрой" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Послушать другую жизнь" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Посмотреть жизнь снова" })).toBeInTheDocument();
    const replay = screen.getByRole("button", { name: "Play" });
    fireEvent.click(replay);
    expect(screen.getByRole("button", { name: "Пауза" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("heading", { name: "Как могла повернуть жизнь" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Дерево всех возможных дорог жизни" })).toBeInTheDocument();
    expect(document.querySelectorAll(".final-actions > *")).toHaveLength(4);
    expect(document.querySelector(".life-path-node[role='button']")).toBeNull();
    expect(document.querySelector(".life-path-popover")).toBeNull();
    expect(screen.queryByText("Наведите на точку или нажмите на неё, чтобы прочитать, что происходило в этот момент.")).not.toBeInTheDocument();

    const quietMemory = document.querySelector(".quiet-memory")!;
    const atlasHeading = screen.getByRole("heading", { name: "История бабушки" });
    expect(quietMemory.compareDocumentPosition(atlasHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(document.querySelector(".atlas-map")).toBeNull();
    const eventKinds = [...document.querySelectorAll(".event-kind")].map((node) => node.textContent ?? "");
    expect(eventKinds.length).toBeGreaterThan(0);
    expect(eventKinds.every((kind) => /^(Личная жизнь|Исторический контекст) · .+/.test(kind))).toBe(true);
    const timelineRows = [...document.querySelectorAll(".timeline li")];
    expect(timelineRows.every((row) => row.querySelectorAll(".event-vote button").length === 2)).toBe(true);
    const liked = screen.getAllByRole("button", { name: /^Понравилось событие/ })[0]!;
    fireEvent.click(liked);
    expect(liked).toHaveAttribute("aria-pressed", "true");
    expect(localStorage.getItem("babushka-event-votes-v1")).toContain(":1");

    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: vi.fn(async () => undefined) } });
    fireEvent.click(screen.getByRole("button", { name: "Поделиться игрой" }));
    expect(await screen.findByText("ссылка на игру добавлена в буфер обмена.")).toBeInTheDocument();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining("/"));
  });

  it("can be completed in English without Russian text leaking into the conversation or atlas", async () => {
    render(<I18nProvider><App /></I18nProvider>);
    fireEvent.change(screen.getByLabelText("Where was she born?"), { target: { value: "tver" } });
    fireEvent.change(screen.getByLabelText("What year?"), { target: { value: "1932" } });
    fireEvent.click(screen.getByRole("button", { name: "Start with these details" }));
    await screen.findByRole("group", { name: "What to ask" });

    let turns = 0;
    while (screen.queryByRole("group", { name: "What to ask" }) && turns < 30) {
      const group = screen.getByRole("group", { name: "What to ask" });
      expect(group.textContent).not.toMatch(/[А-Яа-яЁё]/u);
      const first = group.querySelector("button");
      expect(first).not.toBeNull();
      fireEvent.click(first!);
      turns += 1;
      const exchange = screen.queryByLabelText("Latest question and answer");
      if (exchange) expect(exchange.textContent).not.toMatch(/[А-Яа-яЁё]/u);
    }

    expect(turns).toBeGreaterThan(12);
    expect(screen.getByRole("heading", { name: "Granny's Story" })).toBeInTheDocument();
    expect(document.querySelector(".atlas-shell")?.textContent).not.toMatch(/[А-Яа-яЁё]/u);
  });

  it("keeps the start screen usable when a regional pack is missing", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("missing", { status: 404 })));
    renderInTver();
    fireEvent.click(screen.getByRole("button", { name: "Начать с выбранными данными" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Не удалось загрузить локальный пакет региона");
    expect(screen.getByRole("button", { name: "Начать с выбранными данными" })).toBeInTheDocument();
  });
});
