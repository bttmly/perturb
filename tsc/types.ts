export interface PerturbConfig {
  originalSourceDir: string;
  originalTestDir: string;
  perturbRoot: string;
  perturbSourceDir: string;
  perturbTestDir: string;
  runner: string;
}

export interface PerturbNode {

}

export interface MutationDescriptor {

}

export interface MutationResult {

}

export interface Skipper {
  (n: PerturbNode): boolean;
}

export interface MutatorDescriptor {
  name: string;
  type: string | Array<string>; // TODO -- Enum!
  mutator(n: PerturbNode): PerturbNode;
}

export interface Reporter {
  run();
  aggregate();
}

export interface Runner {
  before(m: MutationDescriptor): Promise<any>;
  run(m: MutationDescriptor): Promise<MutationResult>;
  after(m: MutationDescriptor, before: any): Promise<void>;
}