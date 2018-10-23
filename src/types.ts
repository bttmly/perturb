import * as ESTree from "estree";

export type PluginType = "reporter" | "runner" | "matcher" | "mutator";

export interface BasePlugin {
  readonly name: string;
  readonly type: PluginType;
}

export interface ReporterPlugin extends BasePlugin {
  readonly onResult: ResultReporter;
  readonly onFinish: AggregateReporter;
}

export interface MutatorPlugin extends BasePlugin {
  readonly nodeTypes: string[];
  readonly mutator: NodeMutator;
  readonly filter?: NodeFilter;
}

export interface RunnerPluginConstructor {
  new (m: Mutant): RunnerPlugin;
}

export interface RunnerPlugin extends BasePlugin {
  setup(): Promise<void>;
  run(): Promise<RunnerResult>;
  cleanup(): Promise<void>;
}

export interface SkipperPlugin extends BasePlugin {
  skipper: Skipper;
}

export interface MatcherPlugin extends BasePlugin {
  readonly matchType: "generative" | "comparative";
  makeMatcher: (c: PerturbConfig) => GenerativeMatcher | ComparativeMatcher;
}

export interface GenerativeMatcherPlugin extends MatcherPlugin {
  readonly matchType: "generative";
  makeMatcher: (c: PerturbConfig) => GenerativeMatcher;
}

export interface ComparativeMatcherPlugin extends MatcherPlugin {
  readonly matchType: "comparative";
  makeMatcher: (c: PerturbConfig) => ComparativeMatcher;
}

export type ResultReporter = (r: RunnerResult) => void;

export type AggregateReporter = (
  rs: RunnerResult[],
  cfg: PerturbConfig,
  m?: PerturbMetadata,
) => void;

export type NodeMutator = (n: ESTree.Node) => ESTree.Node | ESTree.Node[];
export type NodeFilter = (n: ESTree.Node) => boolean;

export type Skipper = (node: ESTree.Node, path: string[]) => boolean;

export type ComparativeMatcher = (
  sourceFile: string,
  testFile: string,
) => boolean;

export type GenerativeMatcher = (sourceFile: string) => string;

export type MutatorFinder = (n: ESTree.Node) => MutatorPlugin[];

export type PluginLocator<T extends BasePlugin> = (name: string) => T;

export interface PerturbConfig {
  testCmd: string;

  mutators: string[]; // names of mutator plugins to apply
  skippers: string[]; // names of skipper plugins to apply

  reporter: string; // name of reporter plugin
  matcher: string; // name of matcher plugin
  runner: string; // name of runner plugin

  projectRoot: string;
  perturbDir: string;
  sourceDir: string;
  testDir: string;

  sourceGlob: string;
  testGlob: string;

  killRateMin: number;
}

export type OptionalPerturbConfig = Partial<PerturbConfig>;

export interface Mutant {
  readonly mutatorName: string; // name of mutator plugin
  readonly sourceFile: string;
  readonly testFiles: string[];
  readonly path: string[]; // path to AST node under mutation
  readonly astBefore: ESTree.Node;
  readonly astAfter: ESTree.Node;
  readonly loc: ESTree.SourceLocation; // line of code where mutation occurred
  readonly originalSourceCode: string;
  readonly mutatedSourceCode: string;
}

export interface RunnerResult extends Mutant {
  error?: any;
}

export interface Match {
  source: string;
  tests: string[];
  sourceCode: string;
}

export interface ParsedMatch extends Match {
  ast: ESTree.Node;
  code: string; // TODO rename this. This is rengenerated source code from AST.
  locations: MutantLocation[];
}

export interface MutantLocation {
  mutator: MutatorPlugin;
  path: string[];
  node: ESTree.Node;
}

export interface PerturbMetadata {
  duration: number;
}
