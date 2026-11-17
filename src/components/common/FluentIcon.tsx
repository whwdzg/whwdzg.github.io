/**
 * Fluent 图标映射 / Fluent icon registry.
 *
 * 只在这里 import 具体图标，Rollup 可以据此 tree-shake；不要用 `import * as icons`。
 * 图标全部来自微软 Fluent UI System Icons（@fluentui/react-icons，MIT）。
 */
import {
  ArrowClockwiseRegular,
  ArrowDownRegular,
  ArrowDownloadRegular,
  ArrowRightRegular,
  ArrowUpRegular,
  BranchRegular,
  CalendarLtrRegular,
  CheckmarkCircleRegular,
  CheckmarkRegular,
  ChevronDownRegular,
  ChevronLeftRegular,
  ChevronRightRegular,
  ClockRegular,
  CodeRegular,
  CubeRegular,
  ColorRegular,
  CommentRegular,
  CopyRegular,
  DatabaseRegular,
  DeleteRegular,
  DismissRegular,
  DocumentRegular,
  EyeRegular,
  FilterRegular,
  FullScreenMaximizeRegular,
  FullScreenMinimizeRegular,
  GlobeRegular,
  GridRegular,
  HeartRegular,
  HistoryRegular,
  HomeRegular,
  ImageRegular,
  InfoRegular,
  LayerRegular,
  LinkRegular,
  ListRegular,
  MailRegular,
  NavigationRegular,
  OpenRegular,
  PanelLeftRegular,
  PauseRegular,
  PersonRegular,
  PinRegular,
  PlayRegular,
  RocketRegular,
  SearchRegular,
  SettingsRegular,
  ShieldRegular,
  SparkleRegular,
  TvRegular,
  WarningRegular,
  WeatherMoonRegular,
  WeatherSunnyRegular,
} from '@fluentui/react-icons';
import type { ComponentType, SVGProps } from 'react';

type FluentComponent = ComponentType<SVGProps<SVGSVGElement>>;

const ICONS: Record<string, FluentComponent> = {
  home: HomeRegular,
  tv: TvRegular,
  comment: CommentRegular,
  info: InfoRegular,
  sparkle: SparkleRegular,
  glass: LayerRegular,
  panel: PanelLeftRegular,
  fullscreen: FullScreenMaximizeRegular,
  'fullscreen-exit': FullScreenMinimizeRegular,
  image: ImageRegular,
  rocket: RocketRegular,
  arrow: ArrowRightRegular,
  external: OpenRegular,
  search: SearchRegular,
  settings: SettingsRegular,
  sun: WeatherSunnyRegular,
  moon: WeatherMoonRegular,
  menu: NavigationRegular,
  close: DismissRegular,
  chevron: ChevronDownRegular,
  github: CodeRegular,
  bilibili: TvRegular,
  copy: CopyRegular,
  check: CheckmarkRegular,
  filter: FilterRegular,
  grid: GridRegular,
  list: ListRegular,
  calendar: CalendarLtrRegular,
  clock: ClockRegular,
  eye: EyeRegular,
  link: LinkRegular,
  mail: MailRegular,
  pin: PinRegular,
  heart: HeartRegular,
  up: ArrowUpRegular,
  down: ArrowDownRegular,
  left: ChevronLeftRegular,
  right: ChevronRightRegular,
  play: PlayRegular,
  pause: PauseRegular,
  refresh: ArrowClockwiseRegular,
  delete: DeleteRegular,
  download: ArrowDownloadRegular,
  code: CodeRegular,
  cube: CubeRegular,
  globe: GlobeRegular,
  shield: ShieldRegular,
  document: DocumentRegular,
  person: PersonRegular,
  color: ColorRegular,
  wallpaper: ImageRegular,
  motion: ArrowClockwiseRegular,
  storage: DatabaseRegular,
  install: ArrowDownloadRegular,
  warning: WarningRegular,
  history: HistoryRegular,
  branch: BranchRegular,
  commit: CheckmarkCircleRegular,
};

export interface FluentIconProps extends SVGProps<SVGSVGElement> {
  name: string;
  /** 像素尺寸；Fluent 图标默认 20–24。 */
  size?: number;
}

export function FluentIcon({ name, size = 20, ...props }: FluentIconProps) {
  const Icon = ICONS[name] ?? InfoRegular;
  return <Icon width={size} height={size} {...props} />;
}

export { ICONS };
