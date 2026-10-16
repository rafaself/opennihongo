import { KanjiSetupPage } from "../pages/practice/kanji/KanjiSetupPage";
import { KanjiPracticePage } from "../pages/practice/kanji/KanjiPracticePage";
import {
  getKanjiSummary,
  normalizeKanjiSearch,
} from "../features/kanji/session/options";
import {
  getParticleLesson,
  getKanjiTheoryCharacter,
  getWritingHistoryChapter,
  type KanaPracticeGame,
} from "@opennihongo/content";
import { CardStackPage } from "../pages/practice/CardStackPage";
import { KanaPracticeSetupPage } from "../pages/practice/setup/KanaPracticeSetupPage";
import { getKanaPracticeSummary } from "../views/practice/session/kanaPracticeContent";
import {
  createRootRoute,
  createRoute,
  createRouter,
  createHashHistory,
  createBrowserHistory,
  redirect,
  notFound,
} from "@tanstack/react-router";
import { AppLayout } from "../layouts/AppLayout";
import { AcknowledgementsPage } from "../pages/AcknowledgementsPage";
import { KanaChartPage } from "../pages/KanaChartPage";
import { HomePage } from "../pages/HomePage";
import { KanaVowelsPage } from "../pages/practice/KanaVowelsPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { SettingsPage } from "../pages/settings/SettingsPage";
import { UpcomingSectionPage } from "../pages/UpcomingSectionPage";
import { VocabularyPage } from "../pages/practice/words/VocabularyPage";
import { PracticePage } from "../pages/practice/PracticePage";
import { KanaPracticePage } from "../pages/practice/KanaPracticePage";
import { WordsPracticeView } from "../views/practice/words/WordsPracticeView";
import { appSections } from "./sections";
import {
  KanjiSectionPage,
  KanjiOverviewPage,
  KanjiCharacterPage,
} from "../pages/kanji/KanjiTheoryPages";
import { validatePracticeSearch, type PracticeSearch } from "./practiceSearch";
import {
  WritingHistorySectionPage,
  WritingHistoryOverviewPage,
  WritingHistoryChapterPage,
} from "../pages/writing-history/WritingHistoryPages";
import {
  ParticlesSectionPage,
  ParticlesOverviewPage,
  ParticleLessonPage,
} from "../pages/particles/ParticlesPages";

const rootRoute = createRootRoute({
  component: AppLayout,
  notFoundComponent: NotFoundPage,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: appSections.home.path,
  component: HomePage,
});

const writingHistoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: appSections.writingHistory.path,
  component: WritingHistorySectionPage,
  notFoundComponent: NotFoundPage,
});
const writingHistoryOverviewRoute = createRoute({
  getParentRoute: () => writingHistoryRoute,
  path: "/",
  component: WritingHistoryOverviewPage,
});
const writingHistoryChapterRoute = createRoute({
  getParentRoute: () => writingHistoryRoute,
  path: "$chapterId",
  beforeLoad: ({ params }) => {
    if (!getWritingHistoryChapter(params.chapterId)) notFound({ throw: true });
  },
  component: WritingHistoryChapterPage,
});

const kanaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: appSections.kana.path,
  component: KanaChartPage,
});

const particlesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: appSections.particles.path,
  component: ParticlesSectionPage,
  notFoundComponent: NotFoundPage,
});

const kanjiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: appSections.kanji.path,
  component: KanjiSectionPage,
  notFoundComponent: NotFoundPage,
});
const kanjiOverviewRoute = createRoute({
  getParentRoute: () => kanjiRoute,
  path: "/",
  component: KanjiOverviewPage,
});
const kanjiCharacterRoute = createRoute({
  getParentRoute: () => kanjiRoute,
  path: "$kanjiId",
  beforeLoad: ({ params }) => {
    if (!getKanjiTheoryCharacter(params.kanjiId)) notFound({ throw: true });
  },
  component: KanjiCharacterPage,
});
const particlesOverviewRoute = createRoute({
  getParentRoute: () => particlesRoute,
  path: "/",
  component: ParticlesOverviewPage,
});
const particleLessonRoute = createRoute({
  getParentRoute: () => particlesRoute,
  path: "$particleId",
  beforeLoad: ({ params }) => {
    if (!getParticleLesson(params.particleId)) notFound({ throw: true });
  },
  component: ParticleLessonPage,
});

const kanaVowelsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/practice/kana/vowels",
  component: KanaVowelsPage,
});

const vocabularyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/practice/words/vocabulary",
  component: VocabularyPage,
  validateSearch: validatePracticeSearch,
});

const wordsPracticeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/words/practice",
  beforeLoad: (): void => {
    redirect({ to: "/practice/words/matching", replace: true, throw: true });
  },
});

const practiceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: appSections.practice.path,
  component: PracticePage,
  validateSearch: validatePracticeSearch,
});

function ensureKanaSession(game: KanaPracticeGame, search: PracticeSearch) {
  if (!getKanaPracticeSummary(game, search).canStart) {
    redirect({
      throw: true,
      to: "/practice/kana/$game/setup",
      params: { game },
      search,
      replace: true,
    });
  }
}

const kanaSetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/practice/kana/$game/setup",
  validateSearch: validatePracticeSearch,
  component: KanaPracticeSetupPage,
});

const kanaReadingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/practice/kana/reading",
  validateSearch: validatePracticeSearch,
  beforeLoad: ({ search }) => {
    ensureKanaSession("reading", search);
  },
  component: () => <KanaPracticePage mode="reading" />,
});

const kanaMatchingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/practice/kana/matching",
  validateSearch: validatePracticeSearch,
  beforeLoad: ({ search }) => {
    ensureKanaSession("matching", search);
  },
  component: () => <KanaPracticePage mode="matching" />,
});

const kanaQuizRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/practice/kana/quiz",
  validateSearch: validatePracticeSearch,
  beforeLoad: ({ search }) => {
    ensureKanaSession("quiz", search);
  },
  component: () => <KanaPracticePage mode="quiz" />,
});

const kanaCardsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/practice/kana/cards",
  validateSearch: validatePracticeSearch,
  beforeLoad: ({ search }) => {
    ensureKanaSession("cards", search);
  },
  component: () => <CardStackPage subject="kana" />,
});
const wordCardsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/practice/words/cards",
  validateSearch: validatePracticeSearch,
  component: () => <CardStackPage subject="words" />,
});

const wordMatchingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/practice/words/matching",
  component: WordsPracticeView,
});

const kanjiSetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/practice/kanji/$game/setup",
  validateSearch: validatePracticeSearch,
  component: KanjiSetupPage,
});
function ensureKanjiSession(
  game: "reading" | "matching" | "quiz" | "cards",
  search: PracticeSearch,
) {
  if (!getKanjiSummary(game, normalizeKanjiSearch(search.kanji)).canStart)
    redirect({
      throw: true,
      to: "/practice/kanji/$game/setup",
      params: { game },
      search,
      replace: true,
    });
}
const kanjiReadingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/practice/kanji/reading",
  validateSearch: validatePracticeSearch,
  beforeLoad: ({ search }) => {
    ensureKanjiSession("reading", search);
  },
  component: () => <KanjiPracticePage game="reading" />,
});
const kanjiMatchingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/practice/kanji/matching",
  validateSearch: validatePracticeSearch,
  beforeLoad: ({ search }) => {
    ensureKanjiSession("matching", search);
  },
  component: () => <KanjiPracticePage game="matching" />,
});
const kanjiQuizRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/practice/kanji/quiz",
  validateSearch: validatePracticeSearch,
  beforeLoad: ({ search }) => {
    ensureKanjiSession("quiz", search);
  },
  component: () => <KanjiPracticePage game="quiz" />,
});
const kanjiCardsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/practice/kanji/cards",
  validateSearch: validatePracticeSearch,
  beforeLoad: ({ search }) => {
    ensureKanjiSession("cards", search);
  },
  component: () => <KanjiPracticePage game="cards" />,
});

const progressRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: appSections.progress.path,
  component: () => <UpcomingSectionPage {...appSections.progress} />,
});

const questsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: appSections.quests.path,
  component: () => <UpcomingSectionPage {...appSections.quests} />,
});

const libraryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: appSections.library.path,
  component: () => <UpcomingSectionPage {...appSections.library} />,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: appSections.settings.path,
  component: SettingsPage,
});

const acknowledgementsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/acknowledgements",
  component: AcknowledgementsPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  writingHistoryRoute.addChildren([
    writingHistoryOverviewRoute,
    writingHistoryChapterRoute,
  ]),
  kanaRoute,
  kanjiRoute.addChildren([kanjiOverviewRoute, kanjiCharacterRoute]),
  particlesRoute.addChildren([particlesOverviewRoute, particleLessonRoute]),
  kanaVowelsRoute,
  vocabularyRoute,
  wordsPracticeRoute,
  practiceRoute,
  kanaSetupRoute,
  kanaReadingRoute,
  kanaMatchingRoute,
  kanaQuizRoute,
  wordMatchingRoute,
  kanaCardsRoute,
  wordCardsRoute,
  kanjiSetupRoute,
  kanjiReadingRoute,
  kanjiMatchingRoute,
  kanjiQuizRoute,
  kanjiCardsRoute,
  progressRoute,
  questsRoute,
  libraryRoute,
  settingsRoute,
  acknowledgementsRoute,
]);

export const router = createRouter({
  routeTree,
  history: import.meta.env.PROD ? createHashHistory() : createBrowserHistory(),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
